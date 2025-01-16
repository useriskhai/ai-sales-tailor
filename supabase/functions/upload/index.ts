import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase-client.ts';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadRequest {
  file?: {
    name: string;
    content: string;
    size: number;
  };
  product: string;
  description: string;
  id?: string;
}

interface UploadResponse {
  success: boolean;
  productId: string;
  pdfUrl?: string;
  error?: string;
}

// ファイル名の処理を改善
const generateSafeFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop()?.toLowerCase() || 'pdf';
  // ファイル名から非ASCII文字を除去し、安全な文字列に変換
  const safeName = originalName
    .split('.')[0]
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50); // 長すぎるファイル名を防ぐ
  return `${timestamp}_${safeName}.${extension}`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // リクエストサイズの確認
    const contentLength = parseInt(req.headers.get('content-length') || '0');
    if (contentLength > MAX_FILE_SIZE) {
      throw new Error(`ファイルサイズが大きすぎます。上限は${MAX_FILE_SIZE / (1024 * 1024)}MBです。`);
    }

    // リクエストデータの型安全な解析
    const requestData = await req.json() as UploadRequest;
    const { file, product: name, description, id } = requestData;

    if (!name || name.trim() === '') {
      throw new Error('プロダクト名は必須です');
    }

    // ファイルの検証
    if (file) {
      if (!file.name || !file.content) {
        throw new Error('ファイル情報が不正です');
      }
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('PDFファイルのみアップロード可能です');
      }
      // Base64デコード後のサイズを確認
      const decodedSize = Math.ceil(file.content.length * 3 / 4);
      if (decodedSize > MAX_FILE_SIZE) {
        throw new Error(`ファイルサイズが大きすぎます。上限は${MAX_FILE_SIZE / (1024 * 1024)}MBです。`);
      }
    }

    // ユーザーIDの取得と検証を強化
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('認証が必要です');
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('ユーザーの取得に失敗しました');
    }

    // プロダクト名の重複チェック
    if (!id) {  // 新規作成時のみチェック
      const { data: existingProduct, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', name)
        .single();

      if (existingProduct) {
        throw new Error('同じ名前のプロダクトが既に存在します');
      }
    }

    let productId = id;
    let filePath: string | null = null;
    let publicUrl: string | null = null;

    try {
      // プロダクトの保存または更新
      if (id) {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .update({
            name,
            description,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (productError) throw new Error('プロダクトの更新に失敗しました');
        productId = productData.id;
      } else {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .insert({
            name,
            description,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (productError) throw new Error('プロダクトの作成に失敗しました');
        productId = productData.id;
      }

      // PDFファイルの処理
      if (file && productId) {
        const safeFileName = generateSafeFileName(file.name);
        filePath = `${user.id}/${productId}/${safeFileName}`;

        try {
          // Base64デコード
          const binaryContent = Uint8Array.from(atob(file.content), c => c.charCodeAt(0));

          // ストレージにファイルをアップロード
          const { error: storageError } = await supabase
            .storage
            .from('product-pdfs')
            .upload(filePath, binaryContent, {
              contentType: 'application/pdf',
              upsert: true
            });

          if (storageError) throw storageError;

          // 公開URLを取得
          const { data: publicUrlData } = await supabase
            .storage
            .from('product-pdfs')
            .getPublicUrl(filePath);

          publicUrl = publicUrlData.publicUrl;

          // アップロードされたファイル情報を保存
          const { error: fileError } = await supabase
            .from('uploaded_files')
            .upsert({
              product_id: productId,
              file_name: file.name,
              file_path: filePath,
              file_url: publicUrl,
              user_id: user.id,
              created_at: new Date().toISOString()
            });

          if (fileError) throw new Error('ファイル情報の保存に失敗しました');
        } catch (error) {
          // ファイルアップロードに失敗した場合、プロダクトも削除
          if (!id) {
            await supabase
              .from('products')
              .delete()
              .eq('id', productId);
          }
          throw error;
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          productId,
          pdfUrl: publicUrl
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } catch (error) {
      console.error('Operation error:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'アップロード処理中にエラーが発生しました'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
