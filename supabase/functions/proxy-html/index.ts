import { serve as httpServe } from 'https://deno.land/std@0.168.0/http/server.ts'
import * as cheerio from 'npm:cheerio@1.0.0-rc.12'

interface HtmlContent {
  title: string;
  content: string;
  meta: Record<string, string>;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

async function getHtmlContent(url: string): Promise<HtmlContent> {
  console.log('HTMLコンテンツ取得開始:', url);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log('fetch タイムアウト:', url);
    }, 5000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3'
      },
      redirect: 'follow',
      signal: controller.signal
    }).finally(() => {
      clearTimeout(timeoutId);
      console.log('fetch 完了:', url);
    });

    console.log('レスポンスステータス:', response.status, url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    console.log('Content-Type:', contentType, url);

    if (!contentType.includes('text/html')) {
      throw new Error('HTMLコンテンツではありません');
    }

    // レスポンスをArrayBufferとして取得
    const buffer = await response.arrayBuffer();

    // 文字エンコーディングの取得と正規化
    let charset = contentType.match(/charset=([^;]+)/i)?.[1]?.toLowerCase() || '';
    charset = normalizeCharset(charset);
    console.log('Content-Typeからの文字エンコーディング:', charset);

    // 最初のデコード試行
    let text: string;
    try {
      const decoder = new TextDecoder(charset || 'utf-8');
      text = decoder.decode(buffer);
    } catch (e) {
      console.warn('最初のデコードに失敗:', e);
      text = new TextDecoder('utf-8').decode(buffer);
    }

    let $ = cheerio.load(text);

    // メタタグからcharsetを再確認
    const metaCharset = normalizeCharset($('meta[charset]').attr('charset')?.toLowerCase());
    const metaContentType = $('meta[http-equiv="Content-Type"]').attr('content');
    const metaContentCharset = normalizeCharset(metaContentType?.match(/charset=([^;]+)/i)?.[1]?.toLowerCase());
    
    // 文字エンコーディングの優先順位: メタcharset > メタContent-Type > レスポンスヘッダー > デフォルト
    const finalCharset = metaCharset || metaContentCharset || charset || 'utf-8';
    console.log('最終文字エンコーディング:', finalCharset);
    
    // 必要に応じて再デコード
    if (finalCharset !== charset) {
      try {
        const finalDecoder = new TextDecoder(finalCharset);
        const finalText = finalDecoder.decode(buffer);
        $ = cheerio.load(finalText);
      } catch (e) {
        console.warn('再デコードに失敗:', e);
      }
    }

    // メタ情報の取得
    const metaTags = $('meta').toArray();
    const meta: Record<string, string> = {};
    
    metaTags.forEach((tag: cheerio.Element) => {
      const name = $(tag).attr('name') || $(tag).attr('property');
      const content = $(tag).attr('content');
      if (name && content) {
        meta[name] = content;
      }
    });

    // タイトルの取得
    const title = $('title').first().text().trim() ||
                 meta['og:title'] ||
                 meta['twitter:title'] ||
                 '';

    // 本文の取得
    const mainContent = $('main, article, .main, #main, .content, #content').first();
    const textContent = mainContent.length > 0 
      ? mainContent.text()
      : $('body').text();

    const cleanedContent = textContent
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1000);

    console.log('HTMLコンテンツ取得成功:', url);
    
    return {
      title,
      content: cleanedContent,
      meta
    };

  } catch (error) {
    console.error('HTMLコンテンツ取得エラー:', url, error);
    
    // エラーの種類に応じて適切なメッセージを返す
    if (error instanceof TypeError && error.message.includes('abort')) {
      throw new Error(`タイムアウト: ${url}`);
    }
    
    if (error instanceof Error) {
      // エラーの詳細情報を含める
      const errorDetails = {
        message: error.message,
        name: error.name,
        url: url,
        timestamp: new Date().toISOString()
      };
      console.error('エラー詳細:', errorDetails);
      throw new Error(`error sending request for url (${url}): ${JSON.stringify(errorDetails)}`);
    }
    
    throw error;
  }
}

// 文字エンコーディングを正規化する関数
function normalizeCharset(charset: string | undefined): string {
  if (!charset) return '';
  
  // 一般的な文字エンコーディングの別名を正規化
  const charsetMap: Record<string, string> = {
    'shift-jis': 'shift_jis',
    'sjis': 'shift_jis',
    'x-sjis': 'shift_jis',
    'euc-jp': 'euc-jp',
    'eucjp': 'euc-jp',
    'x-euc-jp': 'euc-jp',
  };

  return charsetMap[charset.toLowerCase()] || charset.toLowerCase();
}

export const serve = async (req: Request): Promise<Response> => {
  try {
    console.log('proxy-html - リクエストメソッド:', req.method);
    console.log('proxy-html - リクエストヘッダー:', Object.fromEntries(req.headers));

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const body = await req.json();
    console.log('proxy-html - リクエストボディ:', body);

    const { url } = body;
    if (!url || typeof url !== 'string' || !isValidUrl(url)) {
      return new Response('Invalid URL', { status: 400 });
    }

    const content = await getHtmlContent(url);
    console.log('proxy-html - コンテンツ取得成功:', { title: content.title });
    
    return new Response(JSON.stringify(content), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    console.error('proxy-html - エラー:', error);
    
    // エラーの種類に応じて適切なステータスコードを返す
    let statusCode = 500;
    let errorMessage = '不明なエラーが発生しました';
    
    if (error instanceof Error) {
      if (error.message.includes('タイムアウト')) {
        statusCode = 504;  // Gateway Timeout
      } else if (error.message.includes('HTTP 404')) {
        statusCode = 404;  // Not Found
      } else if (error.message.includes('Invalid URL')) {
        statusCode = 400;  // Bad Request
      }
      errorMessage = error.message;
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { 'Content-Type': 'application/json' },
      status: statusCode,
    });
  }
};

// Deno Deploy用のハンドラー
httpServe(serve) 