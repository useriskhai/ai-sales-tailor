import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, ChevronRight, Upload as UploadIcon } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

// PDFワーカーのパスを設定
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface UploadProps {
  onFileUploaded: (content: string) => void;
  setProduct: (product: string) => void;
}

export function Upload({ onFileUploaded, setProduct }: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [product, setProductState] = useState('');
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const supabase = useSupabaseClient();

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setFile(file);
      console.log('ファイルが選択されました:', file.name);
      try {
        const text = await extractTextFromPdf(file);
        onFileUploaded(text); // テキスト抽出後に親コンポーネントに通知
        setAlertMessage('PDFからテキストが正常に抽出されました。');
        setIsFileUploaded(true);
      } catch (error) {
        console.error('PDFテキスト抽出エラー:', error);
        setAlertMessage('PDFからのテキスト抽出に失敗しました。');
        setIsFileUploaded(false);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !product) {
      setAlertMessage('ファイルと製品名を入力してください。');
      return;
    }

    setIsLoading(true);

    try {
      const text = await extractTextFromPdf(file);
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('認証セッションが見つかりません')
      }
      
      console.log('認証トークン:', session.access_token); // デバッグ用（本番環境では削除してください）

      const { data, error } = await supabase.functions.invoke('upload', {
        body: JSON.stringify({
          fileName: file.name,
          text: text,
          product: product
        }),
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      console.log('アップロード成功:', data);
      setAlertMessage('ファイルが正常にアップロードされました。');
      setIsFileUploaded(true);
      onFileUploaded(text);
    } catch (error) {
      console.error('アップロードエラー:', error);
      setAlertMessage('ファイルのアップロードに失敗しました。');
      setIsFileUploaded(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg mt-8 w-full max-w-2xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex items-center">
          <UploadIcon className="w-5 h-5 mr-2" />
          ステップ1: PDFアップロード
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-6">
        <div className="space-y-4">
          <Input type="file" onChange={handleFileChange} accept=".pdf" />
          <Input
            type="text"
            placeholder="製品名"
            value={product}
            onChange={(e) => {
              setProductState(e.target.value);
              setProduct(e.target.value);
            }}
          />
          <Button 
            onClick={handleUpload} 
            disabled={!file || !product || isLoading}
            className="w-full"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronRight className="mr-2 h-4 w-4" />}
            アップロード
          </Button>
          <AnimatePresence>
            {alertMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant={isFileUploaded ? "default" : "destructive"}>
                  <AlertDescription>{alertMessage}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}