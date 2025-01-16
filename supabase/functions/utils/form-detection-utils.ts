import { supabase } from '../_shared/supabase-client.ts'
import { AI_MODELS, MAX_TOKENS } from './constants.ts'
import { FormField, CustomFormData } from './types.ts'

// フォームフィールドの検証
function isValidFormData(formData: CustomFormData): boolean {
  if (!formData || !formData.fields || formData.fields.length === 0) {
    console.log('無効なフォームデータ: フィールドが空です');
    return false;
  }

  const validFieldTypes = ['text', 'email', 'tel', 'textarea', 'select'];
  for (const field of formData.fields) {
    if (field.type && !validFieldTypes.includes(field.type)) {
      console.log(`無効なフォームデータ: 無効なフィールドタイプ "${field.type}"`);
      return false;
    }
  }

  return true;
}

// フォームフィールドの抽出
async function extractFormFields(html: string, userId: string, url: string): Promise<CustomFormData> {
  const prompt = `
    HTMLからフォームのフィールド情報のみを抽出し、以下のJSONフォーマットで出力してください。
    JSONのみを出力し、説明文は含めないでください。
    ���ークン制限により出力が途中で切れる場合は、次の呼び出しで続きを生成します。
    JSONが不完全な場合は、閉じられていない括弧やカンマで終わっても構いません。

    {
      "action": "フォームのaction属性の値",
      "method": "フォームのmethod属性の値（GET/POST）",
      "fields": [
        {
          "name": "フィールドのname属性",
          "type": "フィールドのtype属性",
          "label": "フィールドのラベルテキスト",
          "options": ["selectやradioの場合の選択肢"]
        }
      ]
    }

    HTML:
    ${html}
  `;

  let accumulatedJSON = '';
  let result: CustomFormData = {
    action: url,
    method: 'POST',
    fields: []
  };

  try {
    const { data, error } = await supabase.functions.invoke('generate-llm', {
      body: JSON.stringify({
        prompt,
        userId,
        model: AI_MODELS.GPT_4o,
        max_tokens: MAX_TOKENS.EXTRACT_FORM_FIELDS,
      }),
    });

    if (error) throw error;

    accumulatedJSON += data.content;

    // JSONの解析
    const fieldsMatch = accumulatedJSON.match(/\{[\s\S]*\}/);
    if (fieldsMatch) {
      try {
        const parsedData = JSON.parse(fieldsMatch[0]);
        result = {
          action: parsedData.action || url,
          method: parsedData.method || 'POST',
          fields: parsedData.fields || []
        };
      } catch (error) {
        console.error('フィールド解析エラー:', error);
        result.fields = [];
      }
    }
  } catch (error) {
    console.error('フォーム解析エラー:', error);
    throw new Error('フォームの解析に失敗しました');
  }

  return result;
}

// 問い合わせフォームのリンクを検索
async function findContactFormLink(html: string, userId: string, baseUrl: string): Promise<string | null> {
  const prompt = `
    以下のHTMLから問い合わせフォームへのリンクを探してください。
    リンクが見つかった場合は、そのhref属性の値のみを返してください。
    見つからない場合は、"null"（引用符なし）と返してください。
    説明や追加のテキストは不要です。リンクまたは"null"のみを返してください。

    HTML:
    ${html}
  `;

  try {
    const { data, error } = await supabase.functions.invoke('generate-llm', {
      body: JSON.stringify({
        prompt,
        userId,
        model: AI_MODELS.GPT_4o,
        max_tokens: MAX_TOKENS.FIND_CONTACT_FORM,
      }),
    });

    if (error) throw error;

    const link = data.content.trim();
    if (link === 'null') return null;

    // 相対パスを絶対パスに変換
    try {
      return new URL(link, baseUrl).toString();
    } catch (e) {
      console.error('URL変換エラー:', e);
      return null;
    }
  } catch (error) {
    console.error('リンク検索エラー:', error);
    return null;
  }
}

export { findContactFormLink, extractFormFields, isValidFormData };
