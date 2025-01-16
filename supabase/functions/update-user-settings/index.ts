import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { supabase } from '../_shared/supabase-client.ts'

const functionsUrl = `${Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') as string}`;

serve(async (req) => {
  console.log('リクエストメソッド:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

  console.log('Supabase URL:', supabaseUrl);

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log('リクエストボディ:', body);

      const { userId } = body;

      console.log('ユーザーID:', userId);

      const response = await fetch(`${functionsUrl}/user-operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-functions-key': supabaseServiceRoleKey
        },
        body: JSON.stringify({
          action: 'getUserSettings',
          data: {
            userId: userId
          }
        })
      });

      const { data, error } = await response.json();

      if (error) {
        console.error('Supabaseエラー:', error);
        console.error('エラーの詳細:', error.details);
        return new Response(JSON.stringify({ 
          error: {
            message: error.message || 'ユーザー設定の取得に失敗しました',
            code: error.code || 'SETTINGS_ERROR',
            details: error.details || null,
            status: 409
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409,
        })
      }

      console.log('取得されたユーザー情報:', data);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } catch (error) {
      console.error('エラー:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
  }

  console.log('不正なメソッド:', req.method);
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 405,
  })
})