import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { supabase } from '../_shared/supabase-client.ts'
import { TaskStatus, TaskSubStatus, TaskDetailedStatus } from '../_shared/types.ts'; // Taskインターフェースをインポート
import { getCompanyById } from '../company-operations/index.ts'; // 企業情報を取得する関数をインポート

// generateContent関数をエクスポート
export async function generateContent(
  userId: string, 
  product: string, 
  company_id: string, 
  selectedModel: string, 
  fileContent: string, 
  customPrompt: string, 
  senderName: string, 
  senderCompany: string,
  main_status: TaskStatus, 
  sub_status: TaskSubStatus, 
  detailed_status: TaskDetailedStatus 
) {
  try {
    // 企業名と説明を取得
    const companyInfo = await getCompanyById(company_id);
    const companyName = companyInfo?.name || ''; // 企業名を取得
    const companyDescription = companyInfo?.description || ''; // 企業の詳細情報を取得

    console.log('受信したパラメータ:', {
      userId,
      product,
      company_id,
      selectedModel,
      fileContent: fileContent ? `${fileContent.length}文字` : '未設定',
      customPrompt: customPrompt ? `${customPrompt.length}文字` : '未設定',
      senderName,
      senderCompany,
      main_status,
      sub_status,
      detailed_status
    });

    if (!userId || !product || !company_id || !selectedModel || !fileContent || !customPrompt || !senderName || !senderCompany) {
      const missingParams = [
        !userId && 'userId',
        !product && 'product',
        !company_id && 'company_id',
        !selectedModel && 'selectedModel',
        !fileContent && 'fileContent',
        !customPrompt && 'customPrompt',
        !senderName && 'senderName',
        !senderCompany && 'senderCompany'
      ].filter(Boolean).join(', ');
      throw new Error(`必要なパラメータが不足しています: ${missingParams}`);
    }

    const filledPrompt = customPrompt
      .replace(/{product}/g, product)
      .replace(/{company}/g, companyName) // 企業名で置き換え
      .replace(/{description}/g, companyDescription) // 企業の詳細情報で置き換え
      .replace(/{fileContent}/g, fileContent)
      .replace(/{senderName}/g, senderName)
      .replace(/{senderCompany}/g, senderCompany);

    console.log('生成コンテンツリクエスト内容:', { filledPrompt, selectedModel });

    const { data: content, error } = await supabase.functions.invoke('generate-llm', {
      body: JSON.stringify({
        prompt: filledPrompt,
        userId,
        model: selectedModel
      })
    });

    if (error) {
      console.error('コンテンツ生成エラー:', error);
      throw new Error(`コンテンツ生成に失敗しました: ${error.message}`);
    }
    console.log('generate-llmからの生データ:', content);

    // contentの形式を確認し、適切に処理
    let parsedContent = '';
    if (typeof content === 'string') {
      parsedContent = content;
    } else if (typeof content === 'object' && content !== null && 'content' in content) {
      parsedContent = content.content;
    } else {
      console.error('予期しないコンテンツ形式:', content);
      throw new Error('予期しないコンテンツ形式が返されました');
    }

    // 改行文字の処理
    parsedContent = parsedContent.replace(/\\n/g, '\n');

    console.log('処理後のコンテンツ:', parsedContent);

    // データベース操作をcontent-operations関数に移動
    const { data: insertedData, error: dbError } = await supabase.functions.invoke('content-operations', {
      body: JSON.stringify({
        action: 'insertGeneratedContent',
        data: {
          userId,
          content: parsedContent, // パースされたコンテンツを使用
          product,
          company_id, 
          main_status, 
          sub_status,
          detailed_status
        }
      })
    });

    if (dbError) {
      console.error('データベース操作エラー:', dbError);
      throw new Error(`データベース操作エラー: ${JSON.stringify(dbError, null, 2)}`);
    }

    console.log('生成されたコンテンツの保存完了:', insertedData);

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('詳細なエラー情報:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { supabase } from '../_shared/supabase-client.ts'
import { TaskStatus, TaskSubStatus, TaskDetailedStatus } from '../_shared/types.ts'; // Taskインターフェースをインポート
import { getCompanyById } from '../company-operations/index.ts'; // 企業情報を取得する関数をインポート

// generateContent関数をエクスポート
export async function generateContent(
  userId: string, 
  product: string, 
  company_id: string, 
  selectedModel: string, 
  fileContent: string, 
  customPrompt: string, 
  senderName: string, 
  senderCompany: string,
  main_status: TaskStatus, 
  sub_status: TaskSubStatus, 
  detailed_status: TaskDetailedStatus 
) {
  try {
    // 企業名と説明を取得
    const companyInfo = await getCompanyById(company_id);
    const companyName = companyInfo?.name || ''; // 企業名を取得
    const companyDescription = companyInfo?.description || ''; // 企業の詳細情報を取得

    console.log('受信したパラメータ:', {
      userId,
      product,
      company_id,
      selectedModel,
      fileContent: fileContent ? `${fileContent.length}文字` : '未設定',
      customPrompt: customPrompt ? `${customPrompt.length}文字` : '未設定',
      senderName,
      senderCompany,
      main_status,
      sub_status,
      detailed_status
    });

    if (!userId || !product || !company_id || !selectedModel || !fileContent || !customPrompt || !senderName || !senderCompany) {
      const missingParams = [
        !userId && 'userId',
        !product && 'product',
        !company_id && 'company_id',
        !selectedModel && 'selectedModel',
        !fileContent && 'fileContent',
        !customPrompt && 'customPrompt',
        !senderName && 'senderName',
        !senderCompany && 'senderCompany'
      ].filter(Boolean).join(', ');
      throw new Error(`必要なパラメータが不足しています: ${missingParams}`);
    }

    const filledPrompt = customPrompt
      .replace(/{product}/g, product)
      .replace(/{company}/g, companyName) // 企業名で置き換え
      .replace(/{description}/g, companyDescription) // 企業の詳細情報で置き換え
      .replace(/{fileContent}/g, fileContent)
      .replace(/{senderName}/g, senderName)
      .replace(/{senderCompany}/g, senderCompany);

    console.log('生成コンテンツリクエスト内容:', { filledPrompt, selectedModel });

    const { data: content, error } = await supabase.functions.invoke('generate-llm', {
      body: JSON.stringify({
        prompt: filledPrompt,
        userId,
        model: selectedModel
      })
    });

    if (error) {
      console.error('コンテンツ生成エラー:', error);
      throw new Error(`コンテンツ生成に失敗しました: ${error.message}`);
    }
    console.log('generate-llmからの生データ:', content);

    // contentの形式を確認し、適切に処理
    let parsedContent = '';
    if (typeof content === 'string') {
      parsedContent = content;
    } else if (typeof content === 'object' && content !== null && 'content' in content) {
      parsedContent = content.content;
    } else {
      console.error('予期しないコンテンツ形式:', content);
      throw new Error('予期しないコンテンツ形式が返されました');
    }

    // 改行文字の処理
    parsedContent = parsedContent.replace(/\\n/g, '\n');

    console.log('処理後のコンテンツ:', parsedContent);

    // データベース操作をcontent-operations関数に移動
    const { data: insertedData, error: dbError } = await supabase.functions.invoke('content-operations', {
      body: JSON.stringify({
        action: 'insertGeneratedContent',
        data: {
          userId,
          content: parsedContent, // パースされたコンテンツを使用
          product,
          company_id, 
          main_status, 
          sub_status,
          detailed_status
        }
      })
    });

    if (dbError) {
      console.error('データベース操作エラー:', dbError);
      throw new Error(`データベース操作エラー: ${JSON.stringify(dbError, null, 2)}`);
    }

// 企業情報の取得と更新
async function processCompany(company_id: string, userId: string) {
  try {
    // 企業情報の取得
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', company_id)
      .single();

    if (companyError) {
      console.error('企業情報の取得エラー:', companyError);
      throw companyError;
    }

    if (!company) {
      console.error('企業が見つかりません:', company_id);
      throw new Error('企業が見つかりません');
    }

    // 企業情報の更新
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        last_crawled_at: new Date().toISOString()
      })
      .eq('id', company_id);

    if (updateError) {
      console.error('企業情報の更新エラー:', updateError);
      throw updateError;
    }

    return company;
  } catch (error) {
    console.error('企業情報の処理エラー:', error);
    throw error;
  }
}

    console.log('生成されたコンテンツの保存完了:', insertedData);

    // excluded_companiesへの挿入
    const { data: excludedData, error: excludedError } = await supabase.functions.invoke('company-operations', {
      body: JSON.stringify({
        action: 'insertExcludedCompanies',
        data: {
          userId,
          excludedCompanies: [company_id] 
        }
      })
    });

    if (excludedError) {
      console.error('除外企業の挿入エラー:', excludedError);
      // エラーをスローせず、ログに記録するだけにする
      console.error(`除外企業の挿入エラー: ${JSON.stringify(excludedError)}`);
    } else {
      console.log('除外企業の挿入完了:', excludedData);
    }

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('詳細なエラー情報:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    const errorStack = error instanceof Error ? error.stack : '不明';
    return new Response(
      JSON.stringify({ 
        message: 'コンテンツ生成に失敗しました', 
        error: errorMessage,
        stack: errorStack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

interface CompanyInfo {
  name: string;
  industry: string | null;
  employees: number | null;
  business_description: string | null;
}

async function generatePrompt(
  userId: string,
  product: string,
  companyInfo: CompanyInfo,
  selectedModel: string,
  fileContent: string,
  customPrompt: string,
  senderName: string,
  senderCompany: string,
  main_status: string,
  sub_status: string,
  detailed_status: string
): Promise<string> {
  const filledPrompt = customPrompt
    .replace(/{product}/g, product)
    .replace(/{company}/g, companyInfo.name)
    .replace(/{description}/g, companyInfo.business_description || '')
    .replace(/{fileContent}/g, fileContent)
    .replace(/{senderName}/g, senderName)
    .replace(/{senderCompany}/g, senderCompany);

  console.log('生成コンテンツリクエスト内容:', { filledPrompt, selectedModel });

  const { data: content, error } = await supabase.functions.invoke('generate-llm', {
    body: JSON.stringify({
      prompt: filledPrompt,
      userId,
      model: selectedModel
    })
  });

  if (error) {
    console.error('コンテンツ生成エラー:', error);
    throw new Error(`コンテンツ生成に失敗しました: ${error.message}`);
  }

  let parsedContent = '';
  if (typeof content === 'string') {
    parsedContent = content;
  } else if (typeof content === 'object' && content !== null && 'content' in content) {
    parsedContent = content.content;
  } else {
    console.error('予期しないコンテンツ形式:', content);
    throw new Error('予期しないコンテンツ形式が返されました');
  }

  parsedContent = parsedContent.replace(/\\n/g, '\n');

  const { error: dbError } = await supabase.functions.invoke('content-operations', {
    body: JSON.stringify({
      action: 'insertGeneratedContent',
      data: {
        userId,
        content: parsedContent,
        product,
        company_id: companyInfo.name,
        main_status,
        sub_status,
        detailed_status
      }
    })
  });

  if (dbError) {
    console.error('データベース操作エラー:', dbError);
    throw new Error(`データベース操作エラー: ${JSON.stringify(dbError, null, 2)}`);
  }

  return parsedContent;
}

// サーバー関数はそのまま
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
    const { userId, product, company_id, selectedModel, fileContent, customPrompt, senderName, senderCompany, main_status, sub_status, detailed_status } = await req.json(); 

    // 必須パラメータのチェック
    const requiredParams = {
      userId,
      product,
      company_id,
      selectedModel,
      fileContent,
      customPrompt,
      senderName,
      senderCompany
    };

    const missingParams = Object.entries(requiredParams)
      .filter(([_, value]) => !value)
      .map(([key]) => key)
      .join(', ');

    if (missingParams) {
      throw new Error(`必要なパラメータが不足しています: ${missingParams}`);
    }

    // 企業情報の取得
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', company_id)
      .single();

    if (companyError) {
      console.error('企業情報取得エラー:', companyError);
      throw new Error(`企業情報の取得に失敗しました: ${companyError.message}`);
    }

    // 企業情報の不完全さをチェックするが、エラーとはしない
    const companyInfo = {
      name: companyData?.name || '企業名不明',
      industry: companyData?.industry || null,
      employees: companyData?.employees || null,
      business_description: companyData?.business_description || null
    };

    console.log('企業情報:', companyInfo);

    // コンテンツ生成
    const content = await generatePrompt(
      userId,
      product,
      companyInfo,
      selectedModel,
      fileContent,
      customPrompt,
      senderName,
      senderCompany,
      main_status,
      sub_status,
      detailed_status
    );

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('詳細なエラー情報:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    const errorStack = error instanceof Error ? error.stack : '不明';
    return new Response(
      JSON.stringify({ 
        message: 'コンテンツ生成に失敗しました', 
        error: errorMessage,
        stack: errorStack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});