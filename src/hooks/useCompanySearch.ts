"use client";

import { useState } from "react";
import { Company } from "@/types/company";

interface UseCompanySearchReturn {
  searchCompanies: (query: string) => Promise<Company[]>;
  isLoading: boolean;
  error: Error | null;
}

export function useCompanySearch(): UseCompanySearchReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const searchCompanies = async (query: string): Promise<Company[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 実際のAPIコールをここに実装
      // モック用のデータを返す
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        { id: "1", name: "株式会社A", industry: "IT" },
        { id: "2", name: "株式会社B", industry: "製造" },
      ] as Company[];
    } catch (err) {
      setError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchCompanies,
    isLoading,
    error
  };
} 