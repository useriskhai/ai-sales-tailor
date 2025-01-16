import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { FileIcon, DownloadIcon, EyeIcon, Trash2Icon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductFile {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
  file_type: string;
  status: string;
  user_id: string;
  product_id: string;
}

interface ProductFileListProps {
  productId: string;
  files: ProductFile[];
  onFileUpdate: () => void;
}

export function ProductFileList({ productId, files, onFileUpdate }: ProductFileListProps) {
  const [selectedFile, setSelectedFile] = useState<ProductFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<ProductFile | null>(null);
  const supabase = useSupabaseClient();

  const checkStorageConfig = async () => {
    try {
      console.log('Checking storage configuration...');
      const { data: bucketInfo, error: bucketError } = await supabase
        .storage
        .getBucket('product-pdfs');

      if (bucketError) {
        console.error('Bucket info error:', bucketError);
        return;
      }

      console.log('Bucket configuration:', bucketInfo);
    } catch (error) {
      console.error('Storage config check error:', error);
    }
  };

  useEffect(() => {
    checkStorageConfig();
  }, []);

  const handleDownload = async (file: ProductFile) => {
    try {
      const isLegacyPath = !file.file_path.includes('/');
      const filePath = isLegacyPath 
        ? `${file.user_id}/${file.product_id}.pdf`
        : file.file_path;

      console.log('Download - Using file path:', filePath);
      
      const { data, error } = await supabase.storage
        .from('product-pdfs')
        .download(filePath);

      if (error) {
        console.error('Download error details:', error);
        throw error;
      }

      console.log('Download successful');
      const blob = new Blob([data], { type: file.file_type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error && error.message ? error.message : 'ファイルのダウンロードに失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handlePreview = (file: ProductFile) => {
    console.log('Preview - Selected file:', file);
    setSelectedFile(file);
  };

  const getFileUrl = (file: ProductFile) => {
    console.log('GetFileUrl - File details:', {
      originalPath: file.file_path,
      fileType: file.file_type,
      fileName: file.file_name,
      fileId: file.id
    });
    
    try {
      const isLegacyPath = !file.file_path.includes('/');
      const filePath = isLegacyPath 
        ? `${file.user_id}/${file.product_id}.pdf`
        : file.file_path;

      console.log('GetFileUrl - Using file path:', filePath);

      const { data: { publicUrl } } = supabase.storage
        .from('product-pdfs')
        .getPublicUrl(filePath);
      
      console.log('GetFileUrl - Storage response:', {
        publicUrl,
        bucket: 'product-pdfs',
        path: filePath
      });

      supabase.storage
        .from('product-pdfs')
        .download(filePath)
        .then(({ data, error }) => {
          if (error) {
            console.error('File existence check error:', error);
            setFileError(`ファイルの存在確認エラー: ${error.message}`);
          } else {
            console.log('File exists and is accessible');
            setFileError(null);
          }
        });

      return publicUrl;
    } catch (error) {
      console.error('GetFileUrl - Error details:', {
        error,
        file
      });
      setFileError('URLの生成に失敗しました');
      return '';
    }
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    try {
      console.log('Deleting file:', fileToDelete);

      // ストレージからファイルを削除
      const { error: storageError } = await supabase.storage
        .from('product-pdfs')
        .remove([fileToDelete.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        throw storageError;
      }

      // データベースのステータスを更新
      const { error: dbError } = await supabase
        .from('product_files')
        .update({ status: 'deleted' })
        .eq('id', fileToDelete.id);

      if (dbError) {
        console.error('Database update error:', dbError);
        throw dbError;
      }

      toast({
        title: '成功',
        description: 'ファイルを削除しました',
      });

      // 親コンポーネントに変更を通知
      onFileUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'エラー',
        description: 'ファイルの削除に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setFileToDelete(null);
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        アップロードされた資料はありません
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {files.map(file => (
          <div
            key={file.id}
            className="bg-white rounded-lg p-4 border border-gray-100 transition-all hover:border-gray-200"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <FileIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{file.file_name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(file.created_at).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  Path: {file.file_path}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 hover:bg-gray-100"
                  onClick={() => handlePreview(file)}
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 hover:bg-gray-100"
                  onClick={() => handleDownload(file)}
                >
                  <DownloadIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 hover:bg-gray-100 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setFileToDelete(file)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={selectedFile !== null} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedFile?.file_name}</DialogTitle>
            {fileError && (
              <DialogDescription className="text-red-500">
                {fileError}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedFile && !fileError && (
            <div className="flex-1 w-full h-full min-h-0">
              <iframe
                src={`${getFileUrl(selectedFile)}#toolbar=0`}
                className="w-full h-[calc(90vh-8rem)] rounded-lg"
                title={selectedFile.file_name}
                onError={(e) => {
                  console.error('IFrame load error:', e);
                  setFileError('ファイルの読み込みに失敗しました');
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={fileToDelete !== null} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ファイルを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。本当に「{fileToDelete?.file_name}」を削除しますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 