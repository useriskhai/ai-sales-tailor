import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase-client.ts';
import { generateContent } from '../generate-content/index.ts';
import { sendViaForm } from '../ai-form-assistant/index.ts';
import { sendViaDM } from '../dm-sender/index.ts';
import { recordTaskExecutionTime, recordErrorCount } from '../utils/metrics-collector.ts';
import { Task } from '../_shared/types.ts'; // Taskインターフェースをインポート
import { getCompanyById } from '../company-operations/index.ts'; // 新しい関数をインポート

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ message: `メソッド ${req.method} は許可されていません` }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const task: Task = await req.json(); // Taskインターフェースを使用
    const { 
      id, 
      userId, 
      product, 
      company_id, // companyをcompany_idに変更
      selectedModel, 
      fileContent, 
      customPrompt, 
      senderName, 
      senderCompany, 
      sendMethod, 
      created_at, 
      main_status, // main_statusを追加
      sub_status, // sub_statusを追加
      detailed_status // detailed_statusを追加
  } = task;

    // Update task status to "processing"
    await updateTaskStatus(id, 'processing');
    
    // 企業情報を取得
    const companyInfo = await getCompanyById(company_id);
    if (!companyInfo) {
        throw new Error(`企業情報が見つかりません: company_id = ${company_id}`);
    }

    // Generate content
    const contentResponse = await generateContent(
      userId, 
      product, 
      company_id, 
      selectedModel, 
      fileContent, 
      customPrompt, 
      senderName, 
      senderCompany,
      main_status, // 追加
      sub_status, // 追加
      detailed_status // 追加
    );
    const content = await contentResponse.json(); // ここでResponseをJSONに変換

    // Determine send method
    let sendResult;
    if (sendMethod === 'form') {
        sendResult = await sendViaForm(content, companyInfo.name, customPrompt, userId); // Ensure company has a name property
    } else if (sendMethod === 'dm') {
        sendResult = await sendViaDM({ userId, senderName, senderCompany }, content);
    } else {
        throw new Error('Unknown send method');
    }

    // Update task status to "completed"
    await updateTaskStatus(id, 'completed');

    // Record metrics
    recordTaskExecutionTime(id, Date.now() - new Date(created_at).getTime());

    return new Response(
      JSON.stringify({ message: 'Task processed successfully', sendResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);

    // Update task status to "failed"
    await updateTaskStatus((await req.json()).id, 'failed'); // ここでtaskを使用

    // Record error message
    recordErrorCount((await req.json()).id);

    return new Response(
      JSON.stringify({ message: 'Task processing failed', error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function updateTaskStatus(taskId: string, status: 'processing' | 'completed' | 'failed') {
  const { error } = await supabase.functions.invoke('task-operations', {
    body: JSON.stringify({
      action: 'updateTaskStatus',
      data: { taskId, status }
    })
  });

  if (error) throw error;
}

async function updateJobStatus(jobId: string, status: 'processing' | 'completed' | 'failed') {
  const { error } = await supabase.functions.invoke('job-operations', {
    body: JSON.stringify({
      action: 'updateJobStatus',
      data: { jobId, status }
    })
  });

  if (error) throw error;
}

export async function determineSendMethod(userId: string): Promise<'form' | 'dm'> {
  const { data, error } = await supabase.functions.invoke('user-operations', {
    body: JSON.stringify({
      action: 'getUserSettings',
      data: { userId }
    })
  });

  if (error) throw error;
  return data.send_method;
}