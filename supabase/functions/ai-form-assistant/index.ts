import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  CustomFormData,
  FormSendRequest,
  FormSendResponse,
  findContactFormLink,
  extractFormFields,
  isValidFormData,
} from '../utils/form-detection-utils.ts';
import { AI_MODELS } from '../utils/constants.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase-client.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, ...data } = await req.json();
    let responseData;

    switch (action) {
      case 'sendForm':
        responseData = await handleSendForm(data);
        break;
      case 'autoFill':
        responseData = await handleAutoFill(data);
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

async function handleSendForm(data: { url: string; companyName: string; content: string; userId: string }) {
  const { url, companyName, content, userId } = data;

  const html = await fetchWebpage(url); // URLからHTMLを取得
  const formData = await extractFormFields(html, userId, url); // urlを追加

  if (!isValidFormData(formData)) {
    throw new Error('無効なフォームデータです');
  }

  const filledFormData = await generateFormContent(formData, companyName, content, userId);
  const response = await sendForm(filledFormData);

  return { message: 'フォームが正常に送信されました', response };
}

async function handleAutoFill(data: { url: string; companyName: string; content: string; userId: string }) {
  const { url, companyName, content, userId } = data;

  if (!url) {
    throw new Error('URLが指定されていません');
  }
  const html_content = await fetchWebpage(url);  
  const baseUrl = new URL(url).origin  
  const form_url = await findContactFormLink(html_content, userId, baseUrl);
  console.log('Found form URL:', form_url);

  if (!form_url) {
    throw new Error('フォームが見つかりませんでした');
  }

  const html = await fetchWebpage(url); // URLからHTMLを取得
  const formData = await extractFormFields(html, userId, url); // urlを追加
  console.log('Extracted form data:', JSON.stringify(formData, null, 2));

  if (!isValidFormData(formData)) {
    throw new Error('無効なフォームデータです');
  }

  const filledFormData = await generateFormContent(formData, companyName, content, userId);
  const absoluteFormUrl = new URL(form_url, new URL(url).origin).toString();
  console.log('Absolute form URL:', absoluteFormUrl);

  const redirectUrl = new URL(absoluteFormUrl);
  redirectUrl.searchParams.append('autoFill', 'true');

  return {
    status: 'success',
    formUrl: redirectUrl.toString(),
    formData: filledFormData,
  };
}

async function fetchWebpage(url: string): Promise<string> {
  const response = await fetch(url);
  return await response.text();
}

async function sendForm(filledFormData: CustomFormData): Promise<string> {
  const formBody = new FormData();
  for (const field of filledFormData.fields) {
    if (field.value) {
      formBody.append(field.name, field.value);
    }
  }

  const response = await fetch(filledFormData.action, {
    method: filledFormData.method,
    body: formBody,
  });

  if (!response.ok) {
    throw new Error(`フォーム送信エラー: ${response.statusText}`);
  }

  return await response.text();
}

async function generateFormContent(formData: CustomFormData, companyName: string, content: string, userId: string): Promise<CustomFormData> {
  const filledFormData = { ...formData };

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

  // プロフィール情報とフォームフィールドのマッピング
  const profileMapping = {
    name: userProfile.name,
    name_kana: userProfile.name_kana,
    email: userProfile.email,
    phone: userProfile.phone,
    company: userProfile.company,
    company_description: userProfile.company_description,
    department: userProfile.department,
    job_title: userProfile.job_title,
    address: userProfile.address,
    postal_code: userProfile.postal_code,
    prefecture: userProfile.prefecture,
    city: userProfile.city,
    gender: userProfile.gender,
    birth_date: userProfile.birth_date,
  };

  const prompts = filledFormData.fields.map(field => {
    return {
      name: field.name,
      label: field.label || field.name,
    };
  });
  
  const promptTemplate = `
  フォーム送信先会社名: ${companyName}
  事前に作成済みのフォーム送信内容: ${content}
  
  以下のフォームフィールドに適切な内容を生成してください。ユーザーのプロフィール情報が利用可能な場合は、それを参考にしてください。
  事前に作成済みのフォーム送信内容は、長さに関わらず必ずそのままの形で使用し、要約や変更を行わないでください。
  
  ユーザープロフィール情報:
  ${Object.entries(profileMapping).map(([key, value]) => `${key}: ${value || '情報なし'}`).join('\n')}
  
  フォームフィールド:
  ${prompts.map(p => `
  フィールド名: ${p.name}
  ラベル: ${p.label}
  `).join('\n')}
  
  各フィールドに対して、適切で個人化された回答を生成してください。ユーザープロフィール情報を参考にし、フィールド名やラベルに最も適した情報を選択して使用してください。プロフィール情報が直接マッチしない場合でも、関連する情報があれば適切に活用してください。情報がない場合は、与えられたフォーム送信先会社情報とフォーム送信内容を考慮して、適切な回答を生成してください。事前に作成済みのフォーム送信内容は、該当するフィールドがある場合、必ずそのまま使用してください。
  
  回答は以下の形式でJSON形式で提供してください:
  [
    {"name": "フィールド名", "value": "生成された値"},
    ...
  ]
  `;

  // ユーザー設定を取得
  const { data: userSettings, error: settingsError } = await supabase.functions.invoke('user-operations', {
    body: JSON.stringify({
      action: 'getUserSettings',
      data: { userId }
    })
  });

  if (settingsError) {
    console.error('ユーザー設定の取得エラー:', settingsError);
    throw new Error(`ユーザー設定の取得に失敗しました: ${settingsError.message}`);
  }

  const { selected_model: model } = userSettings;

  const { data, error } = await supabase.functions.invoke('generate-llm', {
    body: JSON.stringify({
      prompt: promptTemplate,
      userId,
      model, // ユーザー設定のモデルを使用
    }),
  });

  if (error) throw error;

  // 生成された内容の解析と適用
  try {
    const startIndex = data.content.indexOf('[');
    const endIndex = data.content.lastIndexOf(']') + 1;
    const cleanedContent = data.content.substring(startIndex, endIndex).trim();
    const responses = JSON.parse(cleanedContent);

    for (const field of filledFormData.fields) {
      const response = responses.find((r: { name: string; value: string; }) => r.name === field.name); // rの型を明示的に指定
      field.value = response ? response.value : '';
    }
  } catch (parseError) {
    console.error('生成された内容の解析に失敗しました:', parseError);
    throw new Error('フォーム内容の生成に失敗しました');
  }

  return filledFormData;
}

export async function sendViaForm(formData: CustomFormData, companyName: string, content: string, userId: string) {
  return await handleSendForm({ url: formData.action, companyName, content, userId });
}