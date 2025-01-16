import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js'
import { Database } from '../_shared/database.types.ts'
import { LogLevel, logProcess, logAndNotifyError } from '../_shared/utils/monitoring.ts'
import { recordMetrics } from '../_shared/utils/metrics.ts'
import { corsHeaders } from '../_shared/cors.ts'

const BATCH_SIZE = 10
const MAX_RETRIES = 3
const ERROR_RATE_THRESHOLD = 0.2

interface CrawlQueueItem {
  id: string
  company_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  retry_count: number
  error_message?: string
  next_retry_at?: string
  processing_started_at?: string
  processing_duration?: number
  created_at: string
  updated_at: string
}

interface ProcessingResult {
  success: boolean
  company_id: string
  error?: string
  processing_time?: number
}

function getRetryDelay(retryCount: number): number {
  // 指数バックオフ: 5分、15分、45分
  return 5 * Math.pow(3, retryCount) * 60 * 1000
}

function isRetryableError(error: Error): boolean {
  // ネットワークエラーやタイムアウトなど、一時的なエラーを識別
  const retryableErrors = [
    'ETIMEDOUT',
    'ECONNRESET',
    'ECONNREFUSED',
    'ENOTFOUND',
    'socket hang up',
    'network error',
    'Failed to fetch'
  ]
  return retryableErrors.some(e => error.message.includes(e))
}

function getTopPageUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // プロトコルとホスト名のみを返す（パスを除く）
    return `${urlObj.protocol}//${urlObj.hostname}/`;
  } catch (error) {
    console.error(`URL解析エラー: ${url}`, error);
    return url;
  }
}

export function cleanHtmlContent(content: string): string {
  // 1. インラインJavaScript関数を削除
  let cleaned = content.replace(/function\s+\w+\s*\([^)]*\)\s*{[^}]*}/g, '');
  
  // 2. 即時実行関数（IIFE）を削除
  cleaned = cleaned.replace(/\(function\s*\([^)]*\)\s*{[\s\S]*?}\s*\)\s*\([^)]*\)\s*;?/g, '');
  cleaned = cleaned.replace(/\(\(\)\s*=>\s*{[\s\S]*?}\)\(\);?/g, '');
  
  // 3. Google Tag Manager関連のコードを削除
  cleaned = cleaned.replace(/\(function\s*\(w,d,s,l,i\)[\s\S]*?GTM-[A-Z0-9]+[\s\S]*?\)\s*\([^)]*\);?/g, '');
  
  // 4. スクリプトタグとその中身を削除
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // 5. コメントを削除
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  
  // 6. noscriptタグの中身を取り出し
  cleaned = cleaned.replace(/<noscript>([\s\S]*?)<\/noscript>/gi, '$1');
  
  // 7. SyncSearch関連の設定を削除
  cleaned = cleaned.replace(/SYNCSEARCH_[A-Z0-9_]+=.*?;/g, '');
  
  // 8. 特定のJavaScriptパターンを削除
  cleaned = cleaned.replace(/if\s*\(location\.protocol[\s\S]*?document\.write\(.*?\);/g, '');
  cleaned = cleaned.replace(/if\s*\(value\s*==\s*['"].*?['"][\s\S]*?submit\(\);?\s*}/g, '');
  
  // 9. クラス操作やDOM操作のコードを削除
  cleaned = cleaned.replace(/document\.(?:getElementById|documentElement|getElementsByTagName).*?;/g, '');
  cleaned = cleaned.replace(/\w+\.classList\.(?:add|remove|toggle)\(.*?\);/g, '');
  
  // 10. 空の要素や不要な属性を削除
  cleaned = cleaned.replace(/<div[^>]*>\s*<\/div>/g, '');
  cleaned = cleaned.replace(/\s+class="[^"]*"/g, '');
  cleaned = cleaned.replace(/\s+id="[^"]*"/g, '');
  
  // 11. 連続する空白行を1行に
  cleaned = cleaned.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
  
  // 12. 連続する空白を1つに
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // 13. HTMLエンティティのデコード
  cleaned = cleaned.replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  
  // 14. 残った不要なJavaScriptキーワードや構文を削除
  cleaned = cleaned.replace(/'use strict';?/g, '');
  cleaned = cleaned.replace(/var\s+\w+\s*=\s*.*?;/g, '');
  cleaned = cleaned.replace(/const\s+\w+\s*=\s*.*?;/g, '');
  cleaned = cleaned.replace(/let\s+\w+\s*=\s*.*?;/g, '');
  
  // 15. 空の括弧や中括弧を削除
  cleaned = cleaned.replace(/\(\s*\)/g, '');
  cleaned = cleaned.replace(/{\s*}/g, '');
  
  // 16. 最終的なトリミング
  cleaned = cleaned.trim();
  
  return cleaned;
}

export async function fetchHtml(url: string): Promise<string> {
  try {
    const response = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/proxy-html`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({ url })
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch HTML: ${response.statusText}`)
    }

    const data = await response.json()
    if (!data || !data.content) {
      throw new Error('No HTML content received')
    }

    // titleタグを含むHTMLを構築
    return `<title>${data.title}</title>\n${data.content}`
  } catch (error) {
    console.error('HTML取得エラー:', error);
    throw error;
  }
}

async function logProcessingMetrics(results: ProcessingResult[], startTime: number) {
  const supabase = createClient<Database>(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  const processingTime = Date.now() - startTime
  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length
  
  // process_metricsテーブルに記録
  await recordMetrics(supabase, {
    timestamp: new Date(),
    batch_size: results.length,
    success_count: successCount,
    failure_count: failureCount,
    processing_time: processingTime
  })

  // process_logsテーブルに記録
  await logProcess(supabase, {
    timestamp: new Date(),
    level: failureCount > 0 ? LogLevel.WARN : LogLevel.INFO,
    message: `Processed ${results.length} items (${successCount} succeeded, ${failureCount} failed)`,
    metadata: {
      processing_time: processingTime,
      errors: results.filter(r => r.error).map(r => ({
        company_id: r.company_id,
        error: r.error
      }))
    }
  })

  // エラー率が閾値を超えた場合はSlack通知
  if (failureCount / results.length >= ERROR_RATE_THRESHOLD) {
    await logAndNotifyError(
      supabase,
      {
        webhookUrl: Deno.env.get('SLACK_WEBHOOK_URL') ?? '',
        channel: '#alerts'
      },
      new Error(`High error rate detected: ${failureCount}/${results.length} failures`),
      {
        errors: results.filter(r => r.error).map(r => ({
          company_id: r.company_id,
          error: r.error
        }))
      }
    )
  }
}

export function extractCompanyName(content: string): string | null {
  try {
    let candidates: string[] = [];
    
    // 1. titleタグから候補を抽出
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      candidates.push(titleMatch[1].trim());
    }
    
    // 2. og:titleから候補を抽出
    const ogTitleMatch = content.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    if (ogTitleMatch) {
      candidates.push(ogTitleMatch[1].trim());
    }
    
    // 3. og:site_nameから候補を抽出
    const ogSiteNameMatch = content.match(/<meta\s+property="og:site_name"\s+content="([^"]+)"/i);
    if (ogSiteNameMatch) {
      candidates.push(ogSiteNameMatch[1].trim());
    }
    
    // 4. h1タグから候補を抽出
    const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) {
      candidates.push(h1Match[1].trim());
    }
    
    // 各候補から企業名を抽出
    const extractedNames = candidates.map(candidate => {
      // 1. 区切り文字で分割して最も短い部分を取得
      let name = candidate.split(/[｜|\-／/・:：]/)
        .map(part => part.trim())
        .filter(part => part.length > 0)
        .reduce((shortest, current) => {
          // 株式会社を含む部分を優先
          if (current.includes('株式会社')) return current;
          return shortest.length === 0 || (current.length < shortest.length && current.length > 2) ? current : shortest;
        }, '');
      
      // 2. 一般的な修飾語を削除
      const modifiers = [
        '企業情報',
        'コーポレートサイト',
        '公式サイト',
        'オフィシャルサイト',
        'トップページ',
        'TOP',
        'ホーム',
        'HOME',
        '会社概要',
        '会社案内',
        '製品情報',
        'サービス',
        'サービス一覧',
        'について',
        'の特長'
      ];
      
      for (const modifier of modifiers) {
        name = name.replace(new RegExp(`\\s*${modifier}\\s*`, 'g'), ' ');
      }
      
      // 3. 括弧と内容を削除
      name = name.replace(/[（(][^）)]*[）)]/g, '');
      
      // 4. 株式会社の表記を統一
      name = name.replace(/（株）|\(株\)|㈱/, '株式会社');
      
      // 5. 株式会社を後ろに移動（前にある場合）
      if (name.startsWith('株式会社')) {
        name = name.replace(/^株式会社\s*/, '') + ' 株式会社';
      }
      
      // 6. 連続する空白を1つに
      name = name.replace(/\s+/g, ' ').trim();
      
      return name;
    });
    
    // 最も信頼できる候補を選択
    const validNames = extractedNames
      .filter(name => name && name.length >= 2 && name.length <= 50)
      .sort((a, b) => {
        const aHasKaisha = a.includes('株式会社');
        const bHasKaisha = b.includes('株式会社');
        if (aHasKaisha && !bHasKaisha) return -1;
        if (!aHasKaisha && bHasKaisha) return 1;
        return a.length - b.length; // より短い名前を優先
      });
    
    return validNames[0] || null;
  } catch (error) {
    console.error('企業名抽出エラー:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()
  const results: ProcessingResult[] = []

  try {
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 処理開始をログに記録
    await logProcess(supabase, {
      timestamp: new Date(),
      level: LogLevel.INFO,
      message: 'Starting crawl-company batch process',
      metadata: { batch_size: BATCH_SIZE }
    })

    // 処理対象のキューアイテムを取得
    const { data: queueItems, error: queueError } = await supabase
      .from('crawl_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('retry_count', MAX_RETRIES)
      .or(`next_retry_at.is.null,next_retry_at.lte.${new Date().toISOString()}`)
      .order('created_at', { ascending: true })
      .limit(BATCH_SIZE)

    if (queueError) {
      throw queueError
    }

    if (!queueItems || queueItems.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No items to process' }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 各アイテムを処理
    for (const item of queueItems) {
      const itemStartTime = Date.now()
      try {
        // ステータスを処理中に更新
        await supabase
          .from('crawl_queue')
          .update({
            status: 'processing',
            processing_started_at: new Date().toISOString()
          })
          .eq('id', item.id)

        // 会社情報を取得
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('url')
          .eq('id', item.company_id)
          .single()

        if (companyError || !company?.url) {
          throw new Error(companyError?.message || 'Company URL not found')
        }

        // トップページのURLを取得
        const topPageUrl = getTopPageUrl(company.url)
        
        // HTMLを取得
        const content = await fetchHtml(topPageUrl)
        const extractedName = extractCompanyName(content);

        // HTMLコンテンツを保存
        const updateData: any = {
          website_content: content,
          last_crawled_at: new Date().toISOString()
        };

        // 企業名が抽出できた場合のみ更新
        if (extractedName) {
          updateData.website_display_name = extractedName;
        }

        const { error: updateError } = await supabase
          .from('companies')
          .update(updateData)
          .eq('id', item.company_id)

        if (updateError) {
          throw updateError
        }

        const processingTime = Date.now() - itemStartTime

        // 処理成功を記録
        results.push({
          success: true,
          company_id: item.company_id,
          processing_time: processingTime
        })

        // キューのステータスを更新
        await supabase
          .from('crawl_queue')
          .update({
            status: 'completed',
            processing_duration: processingTime,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)

      } catch (error: unknown) {
        console.error(`Error processing company ${item.company_id}:`, error)
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const shouldRetry = error instanceof Error && isRetryableError(error) && item.retry_count < MAX_RETRIES
        const processingTime = Date.now() - itemStartTime

        results.push({
          success: false,
          company_id: item.company_id,
          error: errorMessage,
          processing_time: processingTime
        })

        // エラー時の処理
        await supabase
          .from('crawl_queue')
          .update({
            status: shouldRetry ? 'pending' : 'failed',
            error_message: errorMessage,
            retry_count: item.retry_count + 1,
            next_retry_at: shouldRetry ? new Date(Date.now() + getRetryDelay(item.retry_count)).toISOString() : null,
            processing_duration: processingTime,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)
      }
    }

    // 処理メトリクスを記録
    await logProcessingMetrics(results, startTime)

    return new Response(
      JSON.stringify({
        success: true,
        processed_items: results.length,
        results,
        total_processing_time: Date.now() - startTime
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Batch processing error:', errorMessage)
    
    // エラー時もメトリクスを記録
    await logProcessingMetrics(results, startTime)

    // エラーログを記録してSlack通知
    await logAndNotifyError(
      createClient<Database>(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      ),
      {
        webhookUrl: Deno.env.get('SLACK_WEBHOOK_URL') ?? '',
        channel: '#alerts'
      },
      error instanceof Error ? error : new Error(errorMessage),
      { results }
    )
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        results,
        total_processing_time: Date.now() - startTime
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  }
}) 