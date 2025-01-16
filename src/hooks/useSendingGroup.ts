import { useState, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useToast } from '@/components/ui/use-toast';
import { Company } from '@/types/company';
import { SendingGroup } from '@/types/sendingGroup';
import { useAuth } from '@/contexts/AuthContext';

interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: string | null;
    status: number;
  }
}

interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
}

export function useSendingGroup() {
  const [sendingGroups, setSendingGroups] = useState<SendingGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [totalCount, setTotalCount] = useState(0);
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSendingGroups = useCallback(async (page: number, itemsPerPage: number) => {
    if (!user || !user.id) {
      console.error('User is not authenticated or user ID is missing');
      toast({
        title: 'エラー',
        description: 'ユーザー認証が必要です。',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('sending-group-operations', {
        body: JSON.stringify({
          action: 'fetchSendingGroups',
          data: { 
            userId: user.id, 
            searchTerm, 
            sortField, 
            sortOrder,
            page,
            itemsPerPage
          }
        }),
      });

      if (error) throw error;

      console.log('Fetched sending groups:', response);

      if (response?.data && Array.isArray(response.data)) {
        setSendingGroups(response.data);
        setTotalCount(response.count ?? 0);
      } else {
        console.error('Unexpected response format:', response);
        setSendingGroups([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching sending groups:', error);
      toast({
        title: 'エラー',
        description: '送信グループの取得に失敗しました。',
        variant: 'destructive',
      });
      setSendingGroups([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [supabase, toast, user, searchTerm, sortField, sortOrder]);

  const createSendingGroup = useCallback(async (name: string, description: string): Promise<SendingGroup> => {
    if (!user) throw new Error('User not authenticated');
    setLoading(true);
    try {
      const requestBody = { 
        action: 'createSendingGroup', 
        data: { 
          name: name.trim(), 
          description: description?.trim() || null, 
          userId: user.id 
        } 
      };

      const response = await supabase.functions.invoke('sending-group-operations', {
        body: JSON.stringify(requestBody),
      });

      console.log('Response from createSendingGroup:', response);

      if (response.error) {
        let errorMessage = '送信グループの作成に失敗しました。';
        
        try {
          const responseData = await response.error.context?.json();
          console.log('Error response data:', responseData);

          if (responseData?.error) {
            errorMessage = responseData.error.details || responseData.error.message;
          }
        } catch (e) {
          console.error('Error parsing response:', e);
          if (response.error.message.includes('duplicate')) {
            errorMessage = `グループ名「${name}」は既に使用されています。`;
          }
        }

        toast({
          title: 'エラー',
          description: errorMessage,
          variant: 'destructive',
        });
        
        throw new Error(errorMessage);
      }

      if (!response.data || typeof response.data.id !== 'string') {
        throw new Error('Invalid response format from server');
      }

      setSendingGroups(prev => [...prev, response.data]);
      
      toast({
        title: 'グループを作成しました',
        description: `「${name}」グループを作成しました。企業を追加してください。`,
        duration: 5000,
      });
      
      return response.data;
    } catch (error) {
      const err = error as Error | SupabaseError;
      console.error('Error creating sending group:', {
        message: err.message,
        ...(err as SupabaseError).code && { code: (err as SupabaseError).code },
        ...(err as SupabaseError).details && { details: (err as SupabaseError).details },
        stack: (err as Error).stack
      });

      if (err instanceof Error && err.message === 'Invalid response format from server') {
        toast({
          title: 'エラー',
          description: '送信グループの作成に失敗しました。もう一度お試しください。',
          variant: 'destructive',
        });
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase, toast, user]);

  const updateSendingGroup = useCallback(async (id: string, name: string, description: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('sending-group-operations', {
        body: JSON.stringify({ action: 'updateSendingGroup', data: { userId: user.id, id, name, description } }),
      });

      if (error) throw error;
      setSendingGroups(prev => prev.map(group => group.id === id ? data : group));
      toast({
        title: '成功',
        description: '送信グループを更新しました。',
      });
    } catch (error) {
      console.error('Error updating sending group:', error);
      toast({
        title: 'エラー',
        description: '送信グループの更新に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast, user]);

  const deleteSendingGroup = useCallback(async (id: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('sending-group-operations', {
        body: JSON.stringify({ action: 'deleteSendingGroup', data: { userId: user.id, id } }),
      });

      if (error) throw error;
      setSendingGroups(prev => prev.filter(group => group.id !== id));
      toast({
        title: '成功',
        description: '送信グループを削除しました。',
      });
    } catch (error) {
      console.error('Error deleting sending group:', error);
      toast({
        title: 'エラー',
        description: '送信グループの削除に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast, user]);

  const addCompaniesToGroup = useCallback(async (groupId: string, companies: Company[]) => {
    if (!user) {
      console.log('User not authenticated');
      return;
    }
    setLoading(true);
    try {
      console.log('addCompaniesToGroup called with:', { groupId, companies });
      const companyIds = companies.map(company => company.id);
      console.log('Company IDs:', companyIds);
      const { data, error } = await supabase.functions.invoke('sending-group-operations', {
        body: JSON.stringify({ 
          action: 'addCompaniesToGroup', 
          data: { 
            userId: user.id, 
            groupId, 
            companyIds
          } 
        }),
      });
  
      if (error) {
        console.error('Error from supabase function:', error);
        throw error;
      }
      console.log('Response from supabase function:', data);
      toast({
        title: '成功',
        description: `${companies.length}社を送信グループに追加しました。`,
      });
    } catch (error) {
      console.error('Error adding companies to group:', error);
      toast({
        title: 'エラー',
        description: '企業の追加に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast, user]);

  const removeCompaniesFromGroup = useCallback(async (groupId: string, companyIds: string[]) => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('sending-group-operations', {
        body: JSON.stringify({ action: 'removeCompaniesFromGroup', data: { userId: user.id, groupId, companyIds } }),
      });

      if (error) throw error;
      toast({
        title: '成功',
        description: `${companyIds.length}社を送信グループから削除しました。`,
      });
    } catch (error) {
      console.error('Error removing companies from group:', error);
      toast({
        title: 'エラー',
        description: '企業の削除に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast, user]);

  const fetchCompaniesInGroup = async (
    groupId: string,
    page: number,
    itemsPerPage: number,
    searchTerm: string = '',
    sortField: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('sending-group-operations', {
        body: JSON.stringify({
          action: 'fetchCompaniesInGroup',
          data: { groupId, page, itemsPerPage, searchTerm, sortField, sortOrder }
        })
      });
  
      if (error) throw error;
  
      return {
        companies: data.companies,
        totalCount: data.totalCount,
        groupName: data.groupName,
        groupDescription: data.groupDescription
      };
    } catch (error) {
      console.error('Error fetching companies in group:', error);
      throw error;
    }
  };
  
  return {
    sendingGroups,
    loading,
    searchTerm,
    setSearchTerm,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    fetchSendingGroups,
    createSendingGroup,
    updateSendingGroup,
    deleteSendingGroup,
    addCompaniesToGroup,
    removeCompaniesFromGroup,
    fetchCompaniesInGroup,
    totalCount,    
  };
}
