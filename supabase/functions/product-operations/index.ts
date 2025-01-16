import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase-client.ts';

export async function handleProductAction(action: string, data: any) {
  switch (action) {
    case 'fetchProducts':
      return await fetchProducts(data.searchTerm, data.page, data.itemsPerPage);
    case 'fetchSendingGroups':
      return await fetchSendingGroups(data.page, data.itemsPerPage, data.userId);
    case 'saveProduct':
      return await saveProduct(data);
    case 'deleteProduct':
      return await deleteProduct(data.id);
    case 'insertUploadedFile':
      return await insertUploadedFile(data.fileName, data.productId, data.fileUrl, data.content, data.userId);
    case 'uploadFileAndSaveProduct':
      return await uploadFileAndSaveProduct(data);
    case 'fetchPdfContent':
      return await fetchPdfContent(data.productId);
    default:
      throw new Error(`不明なプロダクトアクション: ${action}`);
  }
}

export async function fetchProducts(searchTerm: string, page: number, itemsPerPage: number) {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });
  
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }
  
    const { data, error, count } = await query
      .order('name')
      .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);
  
    if (error) throw error;
    return { data, count };
}

export async function insertUploadedFile(fileName: string, productId: string, fileUrl: string, content: string, userId: string) {
  const { data, error } = await supabase
    .from('uploaded_files')
    .insert({
      product_id: productId,
      file_name: fileName,
      content: content,
      file_url: fileUrl,
      user_id: userId,
      created_at: new Date().toISOString()
    })
    .select();

  if (error) {
    console.error('ファイルの挿入エラー:', error);
    throw error;
  }
  
  console.log('挿入されたファイルデータ:', data);
  return { success: true, data };
}

export async function uploadFileAndSaveProduct(data: { fileName: string; userId: string; fileUrl: string; productData: any; content: string }) {
    const { fileName, userId, fileUrl, productData, content } = data;
    console.log('uploadFileAndSaveProduct received data:', { fileName, userId, fileUrl, productData, contentLength: content?.length });
  
    // プロダクトを保存または更新
    const productResult = await saveProduct({ ...productData, user_id: userId });
    console.log('Product save result:', productResult);
  
    // 新しく作成されたプロダクトのIDを取得
    const productId = productResult.id;
  
    // ファイル情報をデータベースに保存
    const fileResult = await insertUploadedFile(fileName, productId, fileUrl, content, userId);
    console.log('File insert result:', fileResult);
  
    return { fileResult, productResult };
}

export async function saveProduct(productData: any) {
  const { id, user_id, name, description } = productData;
  const product = {
    user_id,
    name,
    description,
  };

  if (id) {
    // 既存のプロダクトを更新
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, id: data.id, data };
  } else {
    // 新しいプロダクトを作成
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return { success: true, id: data.id, data };
  }
}

export async function deleteProduct(id: string) {
  // 削除前にプロダクトの所有者を確認
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('user_id')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;
  if (!product) throw new Error('プロダクトが見つかりません');

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
}

export async function fetchSendingGroups(page: number, itemsPerPage: number, userId: string) {
  const { data, error, count } = await supabase
    .from('sending_groups')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

  if (error) {
    console.error('送信グループ取得エラー:', error);
    throw error;
  }

  return { data, count };
}

export async function fetchPdfContent(productId: string) {
  const { data: fileData, error: fileError } = await supabase
    .from('uploaded_files')
    .select('content')
    .eq('product_id', productId)
    .single();

  if (fileError) throw fileError;
  return fileData;
}

// HTTP サーバーを設定
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method === 'POST') {
    try {
      const bodyText = await req.text();
      const parsedData = JSON.parse(bodyText);
      const { action, data } = parsedData;

      const result = await handleProductAction(action, data);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 405,
  });
});