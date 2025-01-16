import * as pdfjs from 'pdfjs-dist';

// PDFのワーカーを設定
let isWorkerInitialized = false;

async function initializeWorker() {
  if (!isWorkerInitialized) {
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    isWorkerInitialized = true;
  }
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    await initializeWorker();

    // FileをArrayBufferに変換
    const arrayBuffer = await file.arrayBuffer();
    
    // PDFドキュメントをロード
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // 全ページのテキストを抽出
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }

    // テキストの前処理
    const processedText = fullText
      .replace(/\s+/g, ' ')  // 連続する空白を1つに
      .trim();               // 前後の空白を削除

    if (!processedText) {
      throw new Error('PDFからテキストを抽出できませんでした');
    }

    return processedText;
  } catch (error) {
    console.error('PDFテキスト抽出エラー:', error);
    throw new Error('PDFの読み込み中にエラーが発生しました');
  }
} 