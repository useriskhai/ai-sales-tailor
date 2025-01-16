"use client";

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Company } from '@/types/company';
import { SendingGroup } from '@/types/sendingGroup';
import { mockCompanies } from '@/data/mockData';
import { useMockData } from '@/utils/env';
import { isApiError } from '@/types/error';

export function useTarget() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const shouldUseMockData = useMockData();

  const fetchTargets = useCallback(async () => {
    if (shouldUseMockData) {
      return { companies: mockCompanies };
    }
    
    setIsLoading(true);
    try {
      // ... 本番環境の実装
    } catch (error: unknown) {
      console.error('Target fetch error:', error);
      const errorMessage = isApiError(error) 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'ターゲットの取得に失敗しました';

      toast({
        title: "ターゲット取得エラー",
        description: errorMessage,
        variant: "destructive",
      });
      return { companies: [] };
    } finally {
      setIsLoading(false);
    }
  }, [shouldUseMockData, toast]);

  return {
    fetchTargets,
    isLoading
  };
} 