// プロンプトのタイプ定義
export type PromptType = 
  | 'product_analysis'
  | 'email_generation'
  | 'form_analysis';

// 戦略の定義
export type Strategy = 
  | 'story-telling'
  | 'problem-solution'
  | 'benefit-first'
  | 'default';

// トーンの定義
export type Tone = 
  | 'friendly'
  | 'professional'
  | 'casual'
  | 'default';

// 戦略ごとの指示テンプレート
export const STRATEGY_INSTRUCTIONS: Record<Strategy, string> = {
  'story-telling': `
1. ストーリーテリング形式で展開：
- 具体的なシーンや体験から始める
- 感情に訴えかける要素を含める
- 起承転結のある展開を心がける`,

  'problem-solution': `
1. 問題解決型の展開：
- 具体的な課題を明確に提示
- その課題に対する解決策を提案
- 解決後のメリットを具体的に説明`,

  'benefit-first': `
1. メリット重視の展開：
- 主要なベネフィットを冒頭で提示
- 具体的な数値や事例を交えて説明
- 即効性のある価値提案を心がける`,

  'default': `
1. 基本的な展開：
- 明確な価値提案
- 具体的な提案内容
- 期待される効果`
};

// トーンごとの指示テンプレート
export const TONE_INSTRUCTIONS: Record<Tone, string> = {
  'friendly': `
2. フレンドリーなトーン：
- 硬すぎる敬語は避ける
- 親しみやすい表現を使用
- 温かみのある言葉選びを心がける
- 「拝啓」「敬具」などの形式的な表現は使用しない`,

  'professional': `
2. プロフェッショナルなトーン：
- 適切な敬語を使用
- 簡潔で明確な表現
- 信頼感のある言葉選び
- ビジネスライクな文体を維持`,

  'casual': `
2. カジュアルなトーン：
- 日常的な表現を使用
- 堅苦しさを排除
- 読みやすい文体
- 親近感のある言葉選び`,

  'default': `
2. 標準的なトーン：
- 適切な敬語を使用
- 明確な表現
- バランスの取れた文体`
};

// タイプごとのプロンプトテンプレート
export const PROMPT_TEMPLATES = {
  product_analysis: (content: string) => `
以下のPDFテキストから製品情報を抽出してください：

${content}

以下の7つの項目を抽出し、それぞれの要件に従って出力してください：

1. 製品概要（description）：
   - 製品の主な機能と特徴
   - 2-3文で簡潔に説明
   - ターゲットユーザーや用途を含める

2. 価格帯（price_range）：
   - 製品の価格設定
   - 初期費用と月額費用を分けて記載
   - 具体的な数値がない場合は想定される価格帯

3. 課題（challenges）：
   - 製品が解決する顧客の具体的な課題
   - 簡潔で明確な文章で記述

4. 解決策（solutions）：
   - 課題に対する製品の具体的な解決方法
   - 3-5個の箇条書きで記載
   - 各項目は具体的で実践的な内容

5. メリット（benefits）：
   - 製品導入による具体的なメリット
   - 3-5個の箇条書きで記載
   - 可能な限り定量的な効果を含める

6. USP（独自の強み）：
   - 競合製品と比較した際の独自の価値提案
   - 1-2文で簡潔に記述
   - 最も重要な差別化要因を強調

7. 導入事例（case_studies）：
   - 2-3個の具体的な導入事例を記載
   - 各事例は以下の要素を含めて自由な形式で記載：
     - 導入企業の業界や規模
     - 導入前の課題
     - 導入後の具体的な成果や改善点

出力は以下のJSON形式で行い、solutions、benefitsは配列形式で出力してください：

{
  "description": "製品概要（2-3文）",
  "price_range": "価格帯の説明",
  "challenges": "課題の内容（文章形式）",
  "solutions": [
    "具体的な解決策1",
    "具体的な解決策2",
    "具体的な解決策3"
  ],
  "benefits": [
    "具体的なメリット1",
    "具体的なメリット2",
    "具体的なメリット3"
  ],
  "usp": "USPの内容（1-2文）",
  "case_studies": [
    "導入事例1の説明",
    "導入事例2の説明",
    "導入事例3の説明"
  ]
}

注意事項：
- description は製品の全体像が分かる簡潔な説明
- solutions、benefits、case_studies は必ず配列形式で出力
- 各項目は具体的で実用的な内容を含める
- 抽象的な表現は避け、具体的な表現を使用
- 出力は必ず上記のJSON形式を厳守

必ず上記のJSON形式で出力し、solutions、benefits、case_studies は配列形式を維持してください。`,

  email_generation: (content: string, metadata: Record<string, any>) => `
以下の情報を基に、効果的な営業メールを作成してください：

製品情報：
${content}

会社情報：
${metadata.company}

送信者情報：
- 名前：${metadata.senderName}
- 会社：${metadata.senderCompany}`,

  form_analysis: (content: string) => `
以下のフォームデータを分析し、最適な回答を提案してください：

${content}

以下の点に注意して分析を行ってください：
- 入力内容の適切性
- 必要な情報の過不足
- 表現の改善点`
}; 