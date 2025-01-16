import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const missingVars = {
  url: !supabaseUrl,
  serviceRoleKey: !supabaseServiceRoleKey
}

if (missingVars.url || missingVars.serviceRoleKey) {
  console.error('Missing environment variables:', { hasUrl: !!supabaseUrl, hasServiceRoleKey: !!supabaseServiceRoleKey })
  throw new Error('データベース接続設定が不正です')
}

export function createSupabaseClient(options = {}) {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      ...options
    }
  })
}

// 認証検証用の共通関数
export async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    console.error('Missing or invalid Authorization header')
    throw new Error('認証トークンが必要です')
  }

  const token = authHeader.split(' ')[1]
  const supabase = createSupabaseClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession(token)
    
    if (error || !session?.user) {
      console.error('Auth verification failed:', {
        error,
        tokenPreview: token.slice(0, 10) + '...',
        hasSession: !!session,
        hasUser: !!session?.user
      })
      throw new Error('認証に失敗しました')
    }

    return session.user
  } catch (error) {
    console.error('Auth verification error:', {
      error: error.message,
      stack: error.stack,
      tokenPreview: token.slice(0, 10) + '...'
    })
    throw error
  }
}

export const supabase = createSupabaseClient()