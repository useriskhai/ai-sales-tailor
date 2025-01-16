import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase-client.ts';

export async function handleNotificationAction(action: string, data: any) {
  switch (action) {
    case 'insertNotification':
      return await insertNotification(data.userId, data.message, data.jobId, data.status);
    case 'createNotification':
      return await createNotification(data.userId, data.message, data.type);
    case 'markNotificationAsRead':
      return await markNotificationAsRead(data.notificationId);
    case 'getUserNotifications':
      return await getUserNotifications(data.userId);
    default:
      throw new Error(`不明な通知アクション: ${action}`);
  }
}

export async function createNotification(userId: string, message: string, type: string) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      message: message,
      type: type,
      read: false
    });

  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
  return { success: true };
}

export async function getUserNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function insertNotification(userId: string, message: string, jobId: string, status: string) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      message: message,
      job_id: jobId,
      status: status
    });

  if (error) throw new Error(`通知挿入エラー: ${error.message}`);
  return { success: true };
}

// HTTP サーバーを設定
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method === 'POST') {
    try {
      const bodyText = await req.text();
      const parsedData = JSON.parse(bodyText);
      const { action, data } = parsedData;

      const result = await handleNotificationAction(action, data);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 405,
  });
});