import { Product } from '@/types/product';
import { Company } from '@/types/company';
import { Template, TemplateContent } from '@/types/template';
import { supabase } from '@/lib/supabase';

interface GenerateMessageParams {
  template: Template;
  product: Product;
  company: Company;
}

interface GenerateMessageResponse {
  message: string;
}

function validateTemplateContent(content: any): content is TemplateContent {
  if (!content || typeof content !== 'object') return false;
  
  // 必須フィールドの存在チェック
  if (!content.strategy || !content.execution || !content.kpi) return false;
  
  // strategy フィールドの検証
  const strategy = content.strategy;
  if (
    typeof strategy.mode !== 'string' ||
    !['ai_auto', 'manual'].includes(strategy.mode) ||
    typeof strategy.strategy !== 'string' ||
    typeof strategy.toneOfVoice !== 'string' ||
    typeof strategy.maxLength !== 'number' ||
    typeof strategy.useEmoji !== 'boolean'
  ) return false;

  // execution フィールドの検証
  const execution = content.execution;
  if (
    typeof execution.execution_priority !== 'string' ||
    !['speed', 'balanced', 'quality'].includes(execution.execution_priority)
  ) return false;

  // kpi フィールドの検証
  const kpi = content.kpi;
  if (
    !Array.isArray(kpi.metrics) ||
    typeof kpi.evaluationPeriod !== 'number'
  ) return false;

  return true;
}

function generatePrompt(template: Template, product: Product, company: Company): string {
  let templateContent: TemplateContent;
  try {
    const parsedContent = JSON.parse(template.content);
    if (!validateTemplateContent(parsedContent)) {
      throw new Error('テンプレートの形式が不正です');
    }
    templateContent = parsedContent;
  } catch (error) {
    console.error('テンプレートのcontentのパースに失敗:', error);
    throw new Error('テンプレートの形式が不正です');
  }

  // 戦略設定の取得
  const { mode, strategy, toneOfVoice, maxLength, useEmoji, contentFocus, customInstructions, messageTemplate } = templateContent.strategy;

  // 戦略に基づいたプロンプトの構築
  const strategyInstructions = mode === 'ai_auto' 
    ? `
【生成モード】
- AI自動生成モード
- 戦略: ${strategy}
- トーン: ${toneOfVoice}
- 最大文字数: ${maxLength}文字
- 絵文字: ${useEmoji ? '使用する' : '使用しない'}`
    : `
【生成モード】
- カスタマイズモード
- 戦略: ${strategy}
- トーン: ${toneOfVoice}
- 最大文字数: ${maxLength}文字
- 絵文字: ${useEmoji ? '使用する' : '使用しない'}
- コンテンツフォーカス: ${contentFocus || '未設定'}
${customInstructions ? `- カスタム指示:\n${customInstructions}` : ''}`;

  const prompt = `
以下の情報を元に、${company.name}向けの営業メッセージを生成してください。

【製品情報】
- 製品名: ${product.name}
- USP（独自の強み）: ${product.usp}
- 製品概要: ${product.description}
- メリット:
${product.benefits.map(benefit => `  - ${benefit}`).join('\n')}
- 解決策:
${product.solutions.map(solution => `  - ${solution}`).join('\n')}
- 価格帯: ${product.price_range}
${product.case_studies && product.case_studies.length > 0 ? `
- 導入事例:
${product.case_studies.map((caseStudy, index) => {
  if (typeof caseStudy === 'string') {
    return `  ${index + 1}. ${caseStudy}`;
  } else {
    return `  ${index + 1}. ${caseStudy.industry}の${caseStudy.companySize}企業：${caseStudy.challenge} → ${caseStudy.result}`;
  }
}).join('\n')}` : ''}

【企業情報】
- 企業名: ${company.name}
- 業界: ${company.industry}
- 従業員数: ${company.employee_count}
- 事業内容: ${company.business_description}
- 企業概要: ${company.description}
${company.website_content ? `- Webサイトコンテンツ: ${company.website_content}` : ''}

${strategyInstructions}

上記の情報を元に、以下の点に注意して営業メッセージを生成してください：
1. 企業の特性や課題に合わせた具体的な提案
2. 製品の特徴と企業のニーズの関連付け
3. 明確な価値提案と具体的なメリットの提示
4. 導入事例を活用した信頼性の向上
5. 自然な文章の流れと適切な敬語の使用

${messageTemplate ? `メッセージテンプレート：\n${messageTemplate}` : ''}`;

  return prompt;
}

export async function generateMessage({
  template,
  product,
  company,
}: GenerateMessageParams): Promise<GenerateMessageResponse> {
  console.log('メッセージ生成開始:', {
    templateId: template.id,
    productId: product.id,
    companyId: company.id,
  });

  try {
    // ユーザー設定を取得
    const { data: userSettings, error: settingsError } = await supabase.functions.invoke('user-operations', {
      body: JSON.stringify({
        action: 'getUserSettings',
        data: { userId: template.user_id }
      })
    });

    if (settingsError) {
      console.error('ユーザー設定の取得エラー:', settingsError);
      throw new Error(`ユーザー設定の取得に失敗しました: ${settingsError.message}`);
    }

    const { selected_model: model } = userSettings;
    const prompt = generatePrompt(template, product, company);

    console.log('APIリクエスト:', {
      endpoint: 'generate-llm',
      method: 'POST',
      prompt: `${prompt.slice(0, 100)}...`, // プロンプトの先頭100文字のみログ出力
      model, // 使用するモデルをログ出力
    });

    const { data, error } = await supabase.functions.invoke('generate-llm', {
      body: {
        prompt,
        userId: template.user_id,
        model, // ユーザー設定のモデルを使用
      }
    });

    if (error) {
      console.error('APIエラー詳細:', {
        error
      });
      throw new Error(`メッセージの生成に失敗しました: ${error.message}`);
    }

    if (!data?.content) {
      throw new Error('メッセージの生成に失敗しました: レスポンスが不正です');
    }

    console.log('メッセージ生成完了:', { message: data.content });
    return { message: data.content };
  } catch (error) {
    console.error('メッセージ生成エラー:', {
      error,
      template: template.id,
      product: product.id,
      company: company.id,
    });
    throw error;
  }
} 