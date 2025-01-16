import React from 'react';
import { useRouter } from 'next/router';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/utils/date';
import { Search } from 'lucide-react';

export default function Products() {
  const router = useRouter();
  const { products, isLoading } = useProducts();

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">プロダクト管理</h1>
          <p className="text-sm text-gray-500">プロダクト情報の管理ができます</p>
        </div>
        <Button
          onClick={() => router.push('/products/new')}
          className="bg-black hover:bg-gray-800"
        >
          新規プロダクト登録
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          className="pl-10 bg-gray-50 border-gray-200"
          placeholder="プロダクト名で検索..."
        />
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        ) : products?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            プロダクトが登録されていません
          </div>
        ) : (
          products?.map((product) => (
            <div
              key={product.id}
              onClick={() => router.push(`/products/${product.id}`)}
              className="group cursor-pointer"
            >
              <div className="p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h2>
                    {product.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    最終更新: {formatDate(product.updated_at)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}