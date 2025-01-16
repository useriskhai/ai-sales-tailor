import { useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useSession } from '@/hooks/useSession';
import { Template } from '@/types/template';

export function useTemplates() {
  const supabase = useSupabaseClient();
  const { session } = useSession();

  const fetchTemplates = useCallback(async () => {
    if (!session?.user?.id) {
      throw new Error('認証が必要です');
    }

    const { data: response, error } = await supabase.functions.invoke('template-operations', {
      body: {
        action: 'fetchTemplates',
        data: {
          userId: session.user.id
        }
      }
    });

    if (error) {
      throw error;
    }

    return response.data;
  }, [supabase, session]);

  return { fetchTemplates };
} 