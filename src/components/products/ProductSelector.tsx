import { useState } from 'react';
import { Product } from '@/types/product';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProducts } from '@/hooks/useProducts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
  selectedProduct: Product | null;
  onSelect: (product: Product | null) => void;
}

export function ProductSelector({ selectedProduct, onSelect }: Props) {
  const { products, isLoading, error } = useProducts();

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          プロダクトの取得に失敗しました
        </AlertDescription>
      </Alert>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Alert variant="destructive" className="bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>プロダクトが登録されていません。</span>
          <Link href="/products/manage" passHref>
            <Button variant="outline" size="sm">
              プロダクト管理へ
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Select
      value={selectedProduct?.id}
      onValueChange={(value) => {
        const product = products?.find((p) => p.id === value) ?? null;
        onSelect(product);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="プロダクトを選択" />
      </SelectTrigger>
      <SelectContent>
        {products?.map((product) => (
          <SelectItem key={product.id} value={product.id}>
            {product.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 