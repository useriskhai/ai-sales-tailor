import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name');

        if (error) throw error;

        setProducts(data || []);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('プロダクトの取得に失敗しました'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [supabase]);

  return { products, isLoading, error };
} 