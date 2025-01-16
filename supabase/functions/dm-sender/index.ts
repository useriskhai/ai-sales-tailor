import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase-client.ts';

// sendViaDM関数をエクスポート
export async function sendViaDM(userProfile: any, message: string): Promise<string> {
  return await sendDM(userProfile, message);
}

export async function sendDM(userProfile: any, message: string): Promise<string> {
  // ここにDM送信のロジックを実装
  // 例: 外部APIを呼び出してDMを送信する
  try {
    const response = await fetch('https://api.example.com/send-dm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userProfile,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error(`DM送信エラー: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error('DM送信に失敗しました:', error);
    throw new Error('DM送信に失敗しました');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, ...data } = await req.json();
    let responseData;

    switch (action) {
      case 'sendDM':
        responseData = await handleSendDM(data);
        break;
      default:
        throw new Error('不明なアクション');
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('エラー:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleSendDM(data: { userId: string; message: string }) {
  const { userId, message } = data;

  // ユーザープロフィールの取得
  let userProfile;
  try {
    const { data: profileData, error } = await supabase.functions.invoke('user-operations', {
      body: { action: 'getUserProfile', data: { userId } }
    });
    if (error) throw error;
    userProfile = profileData;
  } catch (error) {
    console.error('ユーザープロフィールの取得に失敗しました:', error);
    userProfile = {};
  }

  // DM送信処理
  const response = await sendDM(userProfile, message);

  return { message: 'DMが正常に送信されました', response };
}