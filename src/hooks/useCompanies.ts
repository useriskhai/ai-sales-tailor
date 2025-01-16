import { useEffect, useState } from 'react';
import { Company } from '@/types/company';
import { supabase } from '@/lib/supabase';

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, url, industry, contact_email, contact_form_url, phone, address, employee_count, business_description, description, founded_year, notes, website_content, website_display_name, last_crawled_at, created_at, updated_at, user_id')
          .order('name');

        if (error) throw error;

        setCompanies(data);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('会社データの取得に失敗しました'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  return { companies, isLoading, error };
} 