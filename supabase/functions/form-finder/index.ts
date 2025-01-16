import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import {
  findContactFormLink,
  extractFormFields,
  FormData
} from '../utils/form-detection-utils.ts'
import { AI_MODELS, MAX_TOKENS } from '../utils/constants.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabase } from '../_shared/supabase-client.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, userId } = await req.json()
    if (!url || !userId) {
      throw new Error('URLとuserIdが必要です')
    }

    const baseUrl = new URL(url).origin

    console.log(`リクエストされたURL: ${url}`)

    const html = await fetchWebpage(url)
    console.log(`取得したHTMLの長さ: ${html.length}`)

    const contactFormLink = await findContactFormLink(html, userId, baseUrl)
    if (!contactFormLink) {
      throw new Error('問い合わせフォームが見つかりませんでした')
    }

    // フラグメント識別子を含むURLを正しく処理
    const formUrl = new URL(contactFormLink, url)
    formUrl.hash = contactFormLink.split('#')[1] || ''

    return new Response(
      JSON.stringify({ formUrl: formUrl.href }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error(`エラーが発生しました: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})

async function fetchWebpage(url: string): Promise<string> {
  const response = await fetch(url);
  return await response.text();
}