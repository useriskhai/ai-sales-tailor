import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollResult<T> {
  items: T[];
  hasMore: boolean;
  loadMore: () => void;
  isLoading: boolean;
}

export function useInfiniteScroll<T>(
  fetchItems: (page: number) => Promise<T[]>,
  initialPage = 1,
  itemsPerPage = 10
): UseInfiniteScrollResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);

  const loadItems = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newItems = await fetchItems(page);
      if (newItems.length < itemsPerPage) {
        setHasMore(false);
      }
      setItems((prevItems) => [...prevItems, ...newItems]);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems, page, isLoading, hasMore, itemsPerPage]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadMore = useCallback(() => {
    loadItems();
  }, [loadItems]);

  return { items, hasMore, loadMore, isLoading };
}