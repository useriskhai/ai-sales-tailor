import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase-client.ts';

export async function insertGeneratedContent(data: any) {
  try {
    const { error } = await supabase
      .from('generated_content')
      .insert({
        user_id: data.userId,
        company_id: data.companyId,
        batch_job_id: data.batchJobId,
        product_id: data.productId,
        content: data.content,
        subject: data.subject,
        status: data.status,
        preferred_method: data.preferredMethod,
      });

    if (error) {
      console.error('insertGeneratedContent: エラー', error);
      throw new Error(`データ挿入エラー: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('insertGeneratedContent: 予期せぬエラー', error);
    throw new Error(`予期せぬエラー: ${error.message}`);
  }
}

export async function deleteUserContent(contentId: string, userId: string) {
  const { data, error } = await supabase
    .from('generated_content')
    .delete()
    .match({ id: contentId, user_id: userId })
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('削除するコンテンツが見つかりませんでした');
  }
  return { message: 'コンテンツを削除しました' };
}

export async function updateUserContent(contentId: string, userId: string, updatedContent: any) {
  const { data, error } = await supabase
    .from('generated_content')
    .update(updatedContent)
    .match({ id: contentId, user_id: userId })
    .select();

  if (error) throw error;
  return data[0];
}

export async function getUserContentsWithCompanyInfo(userId: string) {
  const { data, error } = await supabase
    .from('generated_content')
    .select(`
      *,
      companies!fk_generated_content_company (
        id,
        name,
        description,
        url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(item => ({
    ...item,
    company_name: item.companies?.name,
    company_description: item.companies?.description,
    company_url: item.companies?.url,
    company_id: item.companies?.id
  }));
}

export async function updateGeneratedContentStatus(generatedContentId: string, status: string, errorMessage?: string) {
  const updateData: any = {
    status: status,
    updated_at: new Date().toISOString()
  };

  if (errorMessage !== undefined) {
    updateData.error_message = errorMessage;
  }

  const { data: result, error } = await supabase
    .from('generated_content')
    .update(updateData)
    .eq('id', generatedContentId)
    .select();

  if (error) throw error;
  return result;
}

export async function getUserContents(userId: string) {
  const { data, error } = await supabase
    .from('generated_content')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function handleContentAction(action: string, data: any) {
  switch (action) {
    case 'insertGeneratedContent':
      return await insertGeneratedContent(data);
    case 'getUserContents':
      return await getUserContents(data.userId);
    case 'deleteUserContent':
      return await deleteUserContent(data.contentId, data.userId);
    case 'updateUserContent':
      return await updateUserContent(data.contentId, data.userId, data.updatedContent);
    case 'getUserContentsWithCompanyInfo':
      return await getUserContentsWithCompanyInfo(data.userId);
    case 'updateGeneratedContentStatus':
      return await updateGeneratedContentStatus(data.generatedContentId, data.status, data.errorMessage);
    default:
      throw new Error(`不明なコンテンツアクション: ${action}`);
  }
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

      const result = await handleContentAction(action, data);

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