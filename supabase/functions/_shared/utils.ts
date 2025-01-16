/**
 * URLを正規化する関数
 * - プロトコル（http/https）を保持
 * - ホスト名を小文字に変換
 * - 末尾のスラッシュを削除
 * - クエリパラメータを削除
 */
export function normalizeUrl(url: string): string {
  try {
    // URLオブジェクトを作成
    const parsedUrl = new URL(url);
    
    // 企業概要ページのパスパターン
    const corporatePatterns = [
      '/corporate/outline',
      '/company/outline',
      '/corporate/profile',
      '/company/profile',
      '/corporate/about',
      '/company/about',
      '/about',
      '/corporate',
      '/company'
    ];

    // パスを確認し、企業概要ページの場合はルートパスに変更
    if (corporatePatterns.some(pattern => parsedUrl.pathname.toLowerCase().includes(pattern))) {
      parsedUrl.pathname = '/';
    }

    // プロトコルとホスト名のみを返す（クエリパラメータとハッシュを除去）
    return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
  } catch (error) {
    console.error('URL正規化エラー:', error);
    return url;
  }
}

/**
 * URLの有効性を確認し、アクセス可能なURLを返す
 * @param url 確認するURL
 * @returns アクセス可能なURL、または空文字列
 */
export async function getAccessibleUrl(url: string): Promise<string> {
  if (!url) return '';

  const urls = new Set<string>();
  
  // 正規化されたURLを取得
  const normalizedUrl = normalizeUrl(url);
  if (!normalizedUrl) return '';
  
  // 元のURLを追加
  urls.add(normalizedUrl);
  
  // wwwありバージョンを追加
  const parsedUrl = new URL(normalizedUrl);
  if (!parsedUrl.hostname.startsWith('www.')) {
    const wwwUrl = `https://www.${parsedUrl.hostname}${parsedUrl.pathname}`;
    urls.add(wwwUrl);
  }
  
  // wwwなしバージョンを追加
  if (parsedUrl.hostname.startsWith('www.')) {
    const noWwwUrl = `https://${parsedUrl.hostname.replace('www.', '')}${parsedUrl.pathname}`;
    urls.add(noWwwUrl);
  }
  
  console.log('URLバリエーション:', Array.from(urls));
  
  // 各URLを試行
  for (const testUrl of urls) {
    try {
      const response = await fetch(testUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('アクセス可能なURL:', testUrl);
        return testUrl;
      }
    } catch (error) {
      console.log('URLアクセスエラー:', { url: testUrl, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
  
  // どのURLもアクセスできない場合は元のURLを返す
  return normalizedUrl;
}

// 型ガード関数
export function isValidUrl(url: string): boolean {
  try {
    if (!url) return false;
    
    // URLオブジェクトの作成を試みる
    const parsedUrl = new URL(url);
    
    // プロトコルチェック
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      console.log('無効なプロトコル:', { url, protocol: parsedUrl.protocol });
      return false;
    }
    
    // ホスト名チェック
    if (!parsedUrl.hostname) {
      console.log('ホスト名なし:', { url });
      return false;
    }
    
    console.log('URL検証成功:', {
      url,
      parsed: {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        pathname: parsedUrl.pathname
      }
    });
    
    return true;
  } catch (error) {
    console.log('URL検証エラー:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
} 