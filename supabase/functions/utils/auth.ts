import { supabase } from '../_shared/supabase-client.ts'

export async function getUserFromToken(req: Request): Promise<any> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('認証ヘッダーが見つかりません')
  }
  const token = authHeader.split('Bearer ')[1]
  console.log('トークン:', token)

  const { data, error: userError } = await supabase.auth.getUser(token)
  if (userError) {
    console.error('ユーザー情報取得エラー:', userError)
    throw new Error(`ユーザー情報の取得に失敗しました: ${userError.message}`)
  }
  if (!data.user) {
    throw new Error('ユーザーが見つかりません')
  }

  console.log('取得したユーザー情報:', data.user)
  return data.user
}
