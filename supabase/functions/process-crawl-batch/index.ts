import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseClient } from '../_shared/supabase-client.ts'

interface CrawlQueueItem {
  id: string
  company_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  retry_count: number
  error_message?: string
  batch_id: string
  created_at: string
  updated_at: string
}

interface ProcessError extends Error {
  error?: {
    message?: string
    code?: string
    details?: string | null
    status?: number
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createSupabaseClient()
    console.log('バッチ処理開始')

    // バッチIDの取得
    const { batch_id } = await req.json()
    if (!batch_id) {
      throw new Error('バッチIDが指定されていません')
    }
    console.log('バッチID:', batch_id)

    // バッチに関連付けられたキューアイテムの取得
    const { data: queueItems, error: queueError } = await supabase
      .from('crawl_queue')
      .select('*')
      .eq('batch_id', batch_id)
      .eq('status', 'pending')
    
    if (queueError) {
      throw queueError
    }

    console.log('処理対象キューアイテム:', queueItems?.length || 0)

    // 各キューアイテムの処理
    const results = await Promise.all((queueItems || []).map(async (item: CrawlQueueItem) => {
      try {
        // 処理中に更新
        await supabase
          .from('crawl_queue')
          .update({
            status: 'processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)

        // 会社情報の取得
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('url')
          .eq('id', item.company_id)
          .single()

        if (companyError || !company) {
          throw new Error(`会社情報の取得に失敗: ${companyError?.message || 'データなし'}`)
        }

        // HTMLコンテンツの取得
        const proxyResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/proxy-html`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({ url: company.url })
        })

        if (!proxyResponse.ok) {
          throw new Error(`HTMLの取得に失敗: ${proxyResponse.statusText}`)
        }

        const content = await proxyResponse.json()

        // クロール結果の保存
        const { error: resultError } = await supabase
          .from('crawl_results')
          .insert({
            company_id: item.company_id,
            content,
            crawled_at: new Date().toISOString()
          })

        if (resultError) {
          throw resultError
        }

        // キューアイテムを完了に更新
        await supabase
          .from('crawl_queue')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)

        return { success: true, item_id: item.id }

      } catch (error) {
        console.error('キューアイテム処理エラー:', error)

        // キューアイテムをエラー状態に更新
        await supabase
          .from('crawl_queue')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            retry_count: item.retry_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)

        return { success: false, item_id: item.id, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }))

    console.log('バッチ処理完了:', results)

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('バッチ処理エラー:', error)

    const processError = error as ProcessError
    return new Response(
      JSON.stringify({
        success: false,
        error: processError.message || 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
}) 