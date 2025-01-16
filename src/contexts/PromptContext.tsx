import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { User } from '@supabase/supabase-js';
import type { Prompt } from '@/types/prompt';

interface PromptContextType {
  prompts: Prompt[];
  loading: boolean;
  error: Error | null;
  fetchPrompts: () => Promise<void>;
  createPrompt: (prompt: Omit<Prompt, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePrompt: (id: string, prompt: Partial<Omit<Prompt, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
}

const PromptContext = createContext<PromptContextType | null>(null);

const DEFAULT_PROMPT = `以下の情報を基に、効果的な営業メールを作成し、JSON形式で出力してください：

- 企業特有の情報を含めて、可能な限りパーソナライズしてください
- このガイドラインに従って、説得力があり、相手の興味を引く簡潔な営業メールを作成してください。

下記の製品資料の内容を簡潔に要約し、重要なポイントのみを抽出して活用してください。`;

export const PromptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const supabase = useSupabaseClient();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  const updateCustomPrompt = (prompt: string) => {
    setCustomPrompt(prompt);
    localStorage.setItem('customPrompt', prompt);
  };

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('user-operations', {
        body: JSON.stringify({
          action: 'getPrompts',
          userId: user?.id
        })
      });

      if (error) {
        setError(new Error(error.message));
      } else {
        setPrompts(data as Prompt[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const createPrompt = async (prompt: Omit<Prompt, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('user-operations', {
        body: JSON.stringify({
          action: 'createPrompt',
          userId: user?.id,
          prompt
        })
      });

      if (error) {
        setError(new Error(error.message));
      } else {
        setPrompts(prevPrompts => [...prevPrompts, data as Prompt]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const updatePrompt = async (id: string, prompt: Partial<Omit<Prompt, 'id' | 'created_at' | 'updated_at'>>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('user-operations', {
        body: JSON.stringify({
          action: 'updatePrompt',
          userId: user?.id,
          promptId: id,
          prompt
        })
      });

      if (error) {
        setError(new Error(error.message));
      } else {
        setPrompts(prevPrompts => prevPrompts.map(p => p.id === id ? (data as Prompt) : p));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const deletePrompt = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('user-operations', {
        body: JSON.stringify({
          action: 'deletePrompt',
          userId: user?.id,
          promptId: id
        })
      });

      if (error) {
        setError(new Error(error.message));
      } else {
        setPrompts(prevPrompts => prevPrompts.filter(p => p.id !== id));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PromptContext.Provider value={{
      prompts,
      loading,
      error,
      fetchPrompts,
      createPrompt,
      updatePrompt,
      deletePrompt
    }}>
      {children}
    </PromptContext.Provider>
  );
};

export const usePrompt = () => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePrompt must be used within a PromptProvider');
  }
  return context;
};
