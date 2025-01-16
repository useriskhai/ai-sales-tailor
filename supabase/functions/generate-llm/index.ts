import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { AI_MODELS, MAX_TOKENS } from '../utils/constants.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabase } from '../_shared/supabase-client.ts'
import {
  PromptType,
  Strategy,
  Tone,
  STRATEGY_INSTRUCTIONS,
  TONE_INSTRUCTIONS,
  PROMPT_TEMPLATES
} from './prompts.ts'

// 従来のリクエスト形式
interface LegacyRequest {
  prompt: string;
  userId: string;
  model?: string;
  strategy?: Strategy;
  tone?: Tone;
}

interface GenerateLLMRequest {
  type: PromptType;
  content: string;
  metadata?: Record<string, any>;
  strategy?: Strategy;
  tone?: Tone;
}

// プロンプトの内容からタイプを推論する関数
function inferPromptType(prompt: string): PromptType {
  if (prompt.includes('PDFテキストから製品情報を抽出')) {
    return 'product_analysis';
  } else if (prompt.includes('営業メッセージ') || prompt.includes('営業メール')) {
    return 'email_generation';
  } else if (prompt.includes('フォームデータ')) {
    return 'form_analysis';
  }
  // デフォルトはメール生成
  return 'email_generation';
}

// APIキー関連のエラー型を定義
class APIKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIKeyError';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // リクエストボディの生データを確認
    const rawBody = await req.text();
    console.log('生のリクエストボディ:', rawBody);

    // JSONパースを別ステップで実行
    let requestData;
    try {
      requestData = JSON.parse(rawBody);
      console.log('パース後のリクエストデータ:', requestData);
    } catch (parseError) {
      console.error('JSONパースエラー:', parseError);
      throw new Error('リクエストボディのJSONパースに失敗しました');
    }

    // 従来形式のリクエストを新形式に変換
    let type: PromptType;
    let content: string;
    let metadata: Record<string, any> = {};
    let strategy: Strategy = 'default';
    let tone: Tone = 'default';
    let userId: string;

    if ('prompt' in requestData) {
      // 従来形式のリクエスト
      const legacyRequest = requestData as LegacyRequest;
      type = inferPromptType(legacyRequest.prompt);
      content = legacyRequest.prompt;
      userId = legacyRequest.userId;
      strategy = legacyRequest.strategy || 'default';
      tone = legacyRequest.tone || 'default';
      metadata = {
        model: legacyRequest.model,
        userId: legacyRequest.userId
      };
    } else {
      // 新形式のリクエスト
      const newRequest = requestData as GenerateLLMRequest & { userId: string };
      type = newRequest.type;
      content = newRequest.content;
      metadata = newRequest.metadata || {};
      strategy = newRequest.strategy || 'default';
      tone = newRequest.tone || 'default';
      userId = newRequest.userId;
    }
    
    console.log('リクエストパラメータの詳細:', {
      type,
      contentLength: content?.length,
      metadata,
      strategy,
      tone,
      userId,
      requestType: typeof type,
      contentType: typeof content,
      userIdType: typeof userId
    });

    if (!content || !userId) {
      console.error('必須パラメータ不足:', {
        hasContent: !!content,
        hasUserId: !!userId
      });
      throw new Error('必要なパラメータが不足しています: content, userId');
    }

    const result = await generateContent({ type, content, metadata, strategy, tone, userId });
    console.log('生成結果:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('エラーの詳細:', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    // APIキーエラーの場合は401を返す
    if (error instanceof APIKeyError) {
      return new Response(
        JSON.stringify({ 
          error: error.message,
          type: 'api_key_error',
          action_required: 'settings_update'
        }),
        { 
          status: 401, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // その他のエラー
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : '不明なエラーが発生しました',
        type: 'general_error'
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function generateContent(params: GenerateLLMRequest & { userId: string }): Promise<{ content: string }> {
  const { type, content, metadata = {}, strategy = 'default', tone = 'default', userId } = params;

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

  const { anthropic_api_key: anthropicApiKey, openai_api_key: openaiApiKey, selected_model: defaultModel } = userSettings;
  const model = defaultModel;

  // プロンプトの生成
  const basePrompt = PROMPT_TEMPLATES[type](content, metadata);
  const enhancedPrompt = `
${STRATEGY_INSTRUCTIONS[strategy]}
${TONE_INSTRUCTIONS[tone]}

${basePrompt}
`;

  // AIモデルの選択と実行
  let generatedContent: string;
  if (model.startsWith('claude')) {
    if (!anthropicApiKey) {
      throw new APIKeyError('Anthropic APIキーが設定されていません。設定画面でAPIキーを設定してください。');
    }
    generatedContent = await generateWithAnthropic(enhancedPrompt, model, anthropicApiKey);
  } else if (model.startsWith('gpt')) {
    if (!openaiApiKey) {
      throw new APIKeyError('OpenAI APIキーが設定されていません。設定画面でAPIキーを設定してください。');
    }
    generatedContent = await generateWithOpenAI(enhancedPrompt, model, openaiApiKey);
  } else {
    throw new Error(`未サポートのモデル: ${model}`);
  }

  // product_analysisタイプの場合、JSON部分のみを抽出
  if (type === 'product_analysis') {
    try {
      // JSON部分を抽出
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON形式のデータが見つかりませんでした');
      }
      
      // 抽出したJSONが有効かチェック
      const jsonContent = JSON.parse(jsonMatch[0]);
      
      // 必要なフィールドが含まれているかチェック
      if (!jsonContent.description || !jsonContent.price_range || 
          !jsonContent.challenges || !jsonContent.solutions || 
          !jsonContent.benefits || !jsonContent.usp ||
          !jsonContent.case_studies) {
        throw new Error('必要なフィールドが含まれていません');
      }

      // descriptionが文字列であることを確認
      if (typeof jsonContent.description !== 'string' || 
          jsonContent.description.trim().length === 0) {
        throw new Error('descriptionは空でない文字列である必要があります');
      }

      // price_rangeが文字列であることを確認
      if (typeof jsonContent.price_range !== 'string' || 
          jsonContent.price_range.trim().length === 0) {
        throw new Error('price_rangeは空でない文字列である必要があります');
      }

      // benefitsが文字列の場合は配列に変換
      if (typeof jsonContent.benefits === 'string') {
        jsonContent.benefits = [jsonContent.benefits];
      } else if (!Array.isArray(jsonContent.benefits)) {
        throw new Error('benefitsは文字列または配列である必要があります');
      }

      // solutionsが文字列の場合は配列に変換
      if (typeof jsonContent.solutions === 'string') {
        jsonContent.solutions = [jsonContent.solutions];
      } else if (!Array.isArray(jsonContent.solutions)) {
        throw new Error('solutionsは文字列または配列である必要があります');
      }

      // case_studiesが文字列の場合は配列に変換
      if (typeof jsonContent.case_studies === 'string') {
        jsonContent.case_studies = [jsonContent.case_studies];
      } else if (!Array.isArray(jsonContent.case_studies)) {
        throw new Error('case_studiesは文字列または配列である必要があります');
      }

      // case_studiesの各要素を文字列として処理
      jsonContent.case_studies = jsonContent.case_studies
        .map((caseStudy: any) => {
          if (typeof caseStudy === 'string') {
            return caseStudy.trim();
          }
          // オブジェクトの場合は文字列に変換
          if (typeof caseStudy === 'object') {
            return Object.values(caseStudy)
              .filter(value => value && typeof value === 'string')
              .join('\n');
          }
          return String(caseStudy).trim();
        })
        .filter((caseStudy: string) => caseStudy.length > 0);

      // 各配列の要素をトリムして空の要素を除外
      jsonContent.benefits = jsonContent.benefits
        .map((benefit: string) => benefit.trim())
        .filter((benefit: string) => benefit.length > 0);
      
      jsonContent.solutions = jsonContent.solutions
        .map((solution: string) => solution.trim())
        .filter((solution: string) => solution.length > 0);

      // 検証済みのJSONを文字列として返す
      generatedContent = JSON.stringify(jsonContent);
    } catch (error) {
      console.error('JSON抽出エラー:', error);
      throw new Error('AIモデルの出力から有効なJSONを抽出できませんでした');
    }
  }

  return { content: generatedContent };
}

async function generateWithAnthropic(prompt: string, model: string, apiKey: string): Promise<string> {
  if (!apiKey) throw new Error('Anthropic APIキーが設定されていません')

  // プロンプトから戦略とトーンを抽出
  const strategyMatch = prompt.match(/戦略:\s*([\w-]+)/);
  const toneMatch = prompt.match(/トーン:\s*([\w-]+)/);
  
  const strategy = strategyMatch?.[1] || '';
  const tone = toneMatch?.[1] || '';

  // 戦略に応じたプロンプト指示を生成
  let strategyInstructions = '';
  switch (strategy) {
    case 'story-telling':
      strategyInstructions = `
1. ストーリーテリング形式で展開：
- 具体的なシーンや体験から始める
- 感情に訴えかける要素を含める
- 起承転結のある展開を心がける`;
      break;
    case 'problem-solution':
      strategyInstructions = `
1. 問題解決型の展開：
- 具体的な課題を明確に提示
- その課題に対する解決策を提案
- 解決後のメリットを具体的に説明`;
      break;
    case 'benefit-first':
      strategyInstructions = `
1. メリット重視の展開：
- 主要なベネフィットを冒頭で提示
- 具体的な数値や事例を交えて説明
- 即効性のある価値提案を心がける`;
      break;
    default:
      strategyInstructions = `
1. 基本的な展開：
- 明確な価値提案
- 具体的な提案内容
- 期待される効果`;
  }

  // トーンに応じたプロンプト指示を生成
  let toneInstructions = '';
  switch (tone) {
    case 'friendly':
      toneInstructions = `
2. フレンドリーなトーン：
- 硬すぎる敬語は避ける
- 親しみやすい表現を使用
- 温かみのある言葉選びを心がける
- 「拝啓」「敬具」などの形式的な表現は使用しない`;
      break;
    case 'professional':
      toneInstructions = `
2. プロフェッショナルなトーン：
- 適切な敬語を使用
- 簡潔で明確な表現
- 信頼感のある言葉選び
- ビジネスライクな文体を維持`;
      break;
    case 'casual':
      toneInstructions = `
2. カジュアルなトーン：
- 日常的な表現を使用
- 堅苦しさを排除
- 読みやすい文体
- 親近感のある言葉選び`;
      break;
    default:
      toneInstructions = `
2. 標準的なトーン：
- 適切な敬語を使用
- 明確な表現
- バランスの取れた文体`;
  }

  const enhancedPrompt = `
以下の点に特に注意してメッセージを生成してください：
${strategyInstructions}
${toneInstructions}

${prompt}
`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: enhancedPrompt }],
      max_tokens: MAX_TOKENS.DEFAULT
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    const errorMessage = errorData?.error?.message || await response.text()
    throw new Error(`Anthropic APIエラー: ${response.status} ${errorMessage}`)
  }

  const data = await response.json()
  return data.content[0].text
}

async function generateWithOpenAI(prompt: string, model: string, apiKey: string): Promise<string> {
  if (!apiKey) throw new Error('OpenAI APIキーが設定されていません')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    const errorMessage = errorData?.error?.message || await response.text()
    throw new Error(`OpenAI APIエラー: ${response.status} ${errorMessage}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}
