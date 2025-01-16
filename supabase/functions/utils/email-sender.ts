import { supabase } from '../_shared/supabase-client.ts';

export async function sendEmail(userId: string, message: string): Promise<void> {
  // ユーザープロフィールの取得
  const { data: userProfile, error } = await supabase.functions.invoke('user-operations', {
    body: JSON.stringify({
      action: 'getUserProfile',
      data: { userId }
    })
  });

  if (error) {
    console.error('ユーザープロフィールの取得に失敗しました:', error);
    throw new Error('ユーザープロフィールの取得に失敗しました');
  }

  const email = userProfile.email;

  // メール送信処理
  try {
    const response = await fetch('https://api.example.com/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'ジョブ通知',
        text: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`メール送信エラー: ${response.statusText}`);
    }

    console.log('メールが正常に送信されました');
  } catch (error) {
    console.error('メール送信に失敗しました:', error);
    throw new Error('メール送信に失敗しました');
  }
}