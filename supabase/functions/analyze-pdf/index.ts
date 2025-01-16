import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4.24.1';

interface AnalysisResult {
  usp: string;
  description: string;
  benefits: string[];
  solutions: string[];
  priceRange: string;
  caseStudies: Array<{
    industry: string;
    companySize: string;
    challenge: string;
    result: string;
  }>;
}

serve(async (req) => {
  try {
    const { fileId, productId } = await req.json();
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: '認証が必要です' }),
        { status: 401 }
      );
    }

    // Supabaseクライアントの初期化
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('環境変数が設定されていません');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ファイル情報の取得
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError || !fileData) {
      throw new Error('ファイルが見つかりません');
    }

    // PDFファイルのダウンロード
    const { data: pdfData, error: pdfError } = await supabase.storage
      .from('products-pdf')
      .download(fileData.file_path);

    if (pdfError || !pdfData) {
      throw new Error('PDFファイルの取得に失敗しました');
    }

    // PDFのテキスト抽出
    const pdfText = await extractTextFromPDF(pdfData);

    // OpenAI APIの初期化
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI APIキーが設定されていません');
    }

    const configuration = new Configuration({
      apiKey: openaiApiKey
    });
    const openai = new OpenAIApi(configuration);

    // プロンプトの作成
    const prompt = `
以下のPDF文書から製品情報を抽出し、指定された形式でJSONとして出力してください：

${pdfText}

以下の形式で出力してください：
{
  "usp": "主要な価値提案（100文字以内）",
  "description": "製品概要（300文字以内）",
  "benefits": ["導入効果1", "導入効果2", ...],  // 最大5つ
  "solutions": ["課題解決策1", "課題解決策2", ...],  // 最大5つ
  "priceRange": "価格帯（例：¥10,000-¥50,000/月）",
  "caseStudies": [{
    "industry": "業界",
    "companySize": "企業規模",
    "challenge": "課題（100文字以内）",
    "result": "効果（100文字以内）"
  }]  // 最大2件
}

注意事項：
- USPは製品の最も重要な価値提案を簡潔に表現してください
- benefitsは具体的な導入効果や顧客メリットを箇条書きで記載してください
- solutionsは製品が解決する具体的な課題と解決方法を記載してください
- 価格帯は見つかった場合のみ記載してください
- 導入事例は見つかった場合のみ記載してください
`;

    // OpenAI APIを使用して解析
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'あなたはPDF文書から製品情報を抽出する専門家です。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const result = completion.data.choices[0]?.message?.content;
    if (!result) {
      throw new Error('解析結果の取得に失敗しました');
    }

    // 解析結果のパース
    const analysisResult = JSON.parse(result) as AnalysisResult;

    // 解析結果の保存
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({
        analysis_status: 'completed',
        analysis_result: analysisResult
      })
      .eq('id', fileId);

    if (updateError) {
      throw new Error('解析結果の保存に失敗しました');
    }

    // 製品情報の更新
    const { error: productError } = await supabase
      .from('products')
      .update({
        usp: analysisResult.usp,
        description: analysisResult.description,
        benefits: analysisResult.benefits,
        solutions: analysisResult.solutions,
        price_range: analysisResult.priceRange,
        case_studies: analysisResult.caseStudies
      })
      .eq('id', productId);

    if (productError) {
      throw new Error('製品情報の更新に失敗しました');
    }

    return new Response(
      JSON.stringify({ success: true, result: analysisResult }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : '予期せぬエラーが発生しました'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

async function extractTextFromPDF(pdfBlob: Blob): Promise<string> {
  // PDFからのテキスト抽出処理を実装
  // 注: 実際の実装ではPDF.jsやpdfparseなどのライブラリを使用する
  return 'PDFのテキスト内容';
} 