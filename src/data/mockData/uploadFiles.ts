import { UploadFileData } from '@/types/uploadFile';

export const mockUploadFiles: UploadFileData[] = [
  {
    id: 'file-1',
    fileName: '製品資料.pdf',
    content: '製品資料のサンプルコンテンツ',
    userId: 'user-1',
    productId: 'product-1',
    fileUrl: 'https://example.com/files/product-doc.pdf',
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-02-15T10:00:00Z'
  },
  {
    id: 'file-2',
    fileName: '提案書.pdf',
    content: '提案書のサンプルコンテンツ',
    userId: 'user-1',
    productId: 'product-2',
    fileUrl: 'https://example.com/files/proposal.pdf',
    created_at: '2024-02-15T11:00:00Z',
    updated_at: '2024-02-15T11:00:00Z'
  }
]; 