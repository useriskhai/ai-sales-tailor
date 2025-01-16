import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase-client.ts';

interface UserSettings {
  [key: string]: any;
}

interface UserProfile {
  name: string;
  company: string;
  name_kana: string;
  email: string;
  phone: string;
  address: string;
  birth_date: string;
  gender: string;
  postal_code: string;
  prefecture: string;
  city: string;
  company_description: string;
  department: string;
  job_title: string;
  avatar_url: string;
  updated_at: string;
}

interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: string | null;
    status: number;
  }
}

// デフォルト設定の定義
const DEFAULT_USER_SETTINGS: UserSettings = {
  selected_model: 'claude-3-haiku-20240307',
  domain_restriction: '',
  custom_prompt: '',
  company_limit: 5,
  footer_text: '',
  use_footer: false,
  anthropic_api_key: '',
  openai_api_key: ''
};

export async function handleUserAction(action: string, data: any) {
  switch (action) {
    case 'updateUserSettings':
      return await updateUserSettings(data.userId, data.settings);
    case 'getUserSettings':
      return await getUserSettings(data.userId);
    case 'updateUserProfile':
      return await updateUserProfile(data.userId, data.profileData);
    case 'upsertUserSettings':
      return await upsertUserSettings(data.userId, data.settings);
    case 'getCustomPrompt':
      return await getCustomPrompt(data.userId);
    case 'getUserProfile':
      return await getUserProfile(data.userId);
    default:
      throw new Error(`不明なユーザーアクション: ${action}`);
  }
}

export async function updateUserSettings(userId: string, settings: UserSettings): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      ...settings,
    });

  if (error) throw error;
  return { success: true };
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  // データが見つからない場合はデフォルト値を返す
  if (error?.code === 'PGRST116') {
    console.log('ユーザー設定が見つかりません。デフォルト値を使用します。');
    return DEFAULT_USER_SETTINGS;
  }

  if (error) {
    console.error('ユーザー設定の取得中にエラーが発生しました:', error);
    throw error;
  }

  // データが存在する場合は、不足している項目にデフォルト値を設定
  return {
    ...DEFAULT_USER_SETTINGS,
    ...data
  };
}

export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select();

  if (error) throw error;
  return data[0];
}

export async function upsertUserSettings(userId: string, settings: UserSettings): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert(
      { user_id: userId, ...settings },
      { 
        onConflict: 'user_id'
      }
    )
    .select();

  if (error) throw error;
  return data[0];
}

export async function getCustomPrompt(userId: string): Promise<{ customPrompt: string | null }> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('custom_prompt')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return { customPrompt: data?.custom_prompt || null };
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
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

      const result = await handleUserAction(action, data);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ 
        error: {
          message: error.message || 'ユーザー操作に失敗しました',
          code: error.code || 'USER_OPERATION_ERROR',
          details: error.details || null,
          status: 400
        }
      }), {
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