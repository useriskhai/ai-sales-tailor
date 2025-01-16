import { supabase } from '@/lib/supabase';
import { AnalysisResult } from '@/types/analysis';

export interface AnalyzeProductParams {
  pdfText: string;
  fileName: string;
  userId: string;
}

export async function analyzePDF(params: AnalyzeProductParams): Promise<AnalysisResult> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-llm', {
      body: {
        type: 'product_analysis',
        content: params.pdfText,
        metadata: {
          fileName: params.fileName
        },
        userId: params.userId
      }
    });

    if (error) {
      console.error('PDF分析エラー:', error);
      throw new Error('PDF分析に失敗しました');
    }

    if (!data || !data.content) {
      throw new Error('PDF分析の結果が不正です');
    }

    // JSONレスポンスをパース
    let parsedContent;
    try {
      parsedContent = JSON.parse(data.content);
    } catch (e) {
      console.error('レスポンスのパースエラー:', e);
      throw new Error('分析結果の形式が不正です');
    }

    // 必要なプロパティの存在チェック
    if (!parsedContent.description || !parsedContent.price_range || 
        !parsedContent.challenges || !parsedContent.solutions || 
        !parsedContent.benefits || !parsedContent.usp) {
      throw new Error('分析結果に必要な情報が含まれていません');
    }

    // case_studiesのデフォルト値を設定
    const caseStudies = Array.isArray(parsedContent.case_studies) 
      ? parsedContent.case_studies 
      : [];

    // 共通の型定義に合わせて変換
    return {
      description: parsedContent.description,
      priceRange: parsedContent.price_range,
      challenges: parsedContent.challenges,
      solutions: parsedContent.solutions,
      benefits: parsedContent.benefits,
      usp: parsedContent.usp,
      case_studies: caseStudies
    };
  } catch (error) {
    console.error('PDF分析エラー:', error);
    throw new Error('PDFの分析中にエラーが発生しました');
  }
} 