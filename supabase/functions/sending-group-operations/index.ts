import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase-client.ts';
import { getUserFromToken } from '../utils/auth.ts';

// リクエストの検証用関数
function validateRequest(action: string, data: any) {
  if (!action) throw new Error('Action is required');
  if (!data) throw new Error('Data is required');

  switch (action) {
    case 'createSendingGroup':
      if (!data.name?.trim()) throw new Error('Group name is required');
      if (!data.userId) throw new Error('User ID is required');
      break;
    case 'addCompaniesToGroup':
      if (!data.groupId) throw new Error('Group ID is required');
      if (!Array.isArray(data.companyIds) || data.companyIds.length === 0) {
        throw new Error('Company IDs array is required');
      }
      break;
    // 他のアクションの検証も追加...
  }
}

async function handleSendingGroupAction(action: string, data: any, user: any) {
  console.log(`Handling action: ${action}`, { data, userId: user.id });
  
  try {
    validateRequest(action, data);

    switch (action) {
      case 'createSendingGroup':
        return await createSendingGroup(data.name, data.description, user.id);
      case 'fetchSendingGroups':
        return await fetchSendingGroups(
          user.id,
          data.searchTerm,
          data.sortField,
          data.sortOrder,
          data.page,
          data.itemsPerPage
        );
      case 'updateSendingGroup':
        return await updateSendingGroup(data.id, data.name, data.description, user.id);
      case 'deleteSendingGroup':
        return await deleteSendingGroup(data.id, user.id);
      case 'addCompaniesToGroup':
        return await addCompaniesToGroup(data.groupId, data.companyIds, user.id);
      case 'removeCompaniesFromGroup':
        return await removeCompaniesFromGroup(data.groupId, data.companyIds, user.id);
      case 'fetchCompaniesInGroup':
        return await fetchCompaniesInGroup(
          data.groupId,
          data.page,
          data.itemsPerPage,
          data.searchTerm,
          data.sortField,
          data.sortOrder
        );
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`Error in ${action}:`, error);
    throw error;
  }
}

// エラーレスポンスの形式を統一
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: string | null;
    status: number;
  }
}

async function createSendingGroup(name: string, description: string | null, userId: string) {
  console.log('Creating sending group with params:', { name, description, userId });

  try {
    if (!name?.trim()) {
      throw new Error('Group name is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }

    // 既存のグループ名をチェック
    const { data: existingGroup, error: checkError } = await supabase
      .from('sending_groups')
      .select('name')
      .eq('user_id', userId)
      .eq('name', name.trim())
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing group:', checkError);
      throw checkError;
    }

    if (existingGroup) {
      const error: ErrorResponse = {
        error: {
          message: 'グループ名が既に使用されています',
          code: 'DUPLICATE_GROUP_NAME',
          details: `グループ名「${name}」は既に存在します`,
          status: 400
        }
      };
      throw error;
    }

    const insertData = {
      name: name.trim(),
      description: description?.trim() || null,
      user_id: userId
    };

    console.log('Attempting to insert group with data:', insertData);

    const { data, error } = await supabase
      .from('sending_groups')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Database error in createSendingGroup:', error);
      throw {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      };
    }

    if (!data) {
      throw new Error('No data returned from database');
    }

    console.log('Successfully created sending group:', data);
    return data;
  } catch (error) {
    console.error('Error in createSendingGroup:', error);
    
    // エラーレスポンスの形式を統一
    const errorResponse: ErrorResponse = {
      error: {
        message: error.message || 'グループの作成に失敗しました',
        code: error.code || 'UNKNOWN_ERROR',
        details: error.details || null,
        status: error.status || 400
      }
    };
    
    throw errorResponse;
  }
}

async function fetchSendingGroups(
  userId: string,
  searchTerm: string,
  sortField: string,
  sortOrder: 'asc' | 'desc',
  page: number,
  itemsPerPage: number
) {
  let query = supabase
    .from('sending_groups')
    .select(`
      *,
      company_count:sending_group_companies(count)
    `, { count: 'exact' })
    .eq('user_id', userId);

  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }

  if (sortField) {
    query = query.order(sortField, { ascending: sortOrder === 'asc' });
  }

  const startRow = (page - 1) * itemsPerPage;
  const endRow = startRow + itemsPerPage - 1;

  const { data, error, count } = await query
    .range(startRow, endRow);

  if (error) throw error;

  const transformedData = data?.map(group => ({
    ...group,
    company_count: group.company_count?.[0]?.count || 0
  }));

  return {
    data: transformedData,
    count
  };
}

async function updateSendingGroup(id: string, name: string, description: string, userId: string) {
  const { data, error } = await supabase
    .from('sending_groups')
    .update({ name, description })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteSendingGroup(id: string, userId: string) {
  const { error } = await supabase
    .from('sending_groups')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return { success: true };
}

async function addCompaniesToGroup(groupId: string, companyIds: string[], userId: string) {
  const { error } = await supabase
    .from('sending_group_companies')
    .insert(
      companyIds.map(companyId => ({
        sending_group_id: groupId,
        company_id: companyId
      }))
    );

  if (error) throw error;
  return { success: true };
}

async function removeCompaniesFromGroup(groupId: string, companyIds: string[], userId: string) {
  const { error } = await supabase
    .from('sending_group_companies')
    .delete()
    .eq('sending_group_id', groupId)
    .in('company_id', companyIds);

  if (error) throw error;
  return { success: true };
}

async function fetchCompaniesInGroup(
  groupId: string,
  page: number,
  itemsPerPage: number,
  searchTerm?: string,
  sortField?: string,
  sortOrder?: 'asc' | 'desc'
) {
  console.log('Fetching companies in group:', { groupId, page, itemsPerPage, searchTerm, sortField, sortOrder });
  
  try {
    const { data: groupData, error: groupError } = await supabase
      .from('sending_groups')
      .select('name, description')
      .eq('id', groupId)
      .single();

    if (groupError) {
      console.error('グループ詳細取得エラー:', groupError);
      throw groupError;
    }

    const startRow = (page - 1) * itemsPerPage;
    const endRow = startRow + itemsPerPage - 1;

    let query = supabase
      .from('sending_group_companies')
      .select(`
        company:companies (
          id,
          name,
          url,
          description,
          industry,
          contact_email,
          contact_form_url
        )
      `, { count: 'exact' })
      .eq('sending_group_id', groupId);

    if (searchTerm) {
      query = query.ilike('companies.name', `%${searchTerm}%`);
    }

    if (sortField && sortOrder) {
      query = query.order('company(name)', { ascending: sortOrder === 'asc' });
    }

    const { data: companiesData, error: companiesError, count } = await query
      .range(startRow, endRow);

    if (companiesError) {
      console.error('企業データ取得エラー:', companiesError);
      throw companiesError;
    }

    const companies = companiesData
      ?.map(item => item.company)
      .filter(company => company !== null);

    return {
      companies,
      totalCount: count || 0,
      groupName: groupData?.name || '',
      groupDescription: groupData?.description || ''
    };
  } catch (error) {
    console.error('fetchCompaniesInGroup エラー:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const user = await getUserFromToken(req);
    if (!user || !user.id) {
      return new Response(
        JSON.stringify({
          error: {
            message: 'Unauthorized: User not authenticated',
            code: 'AUTH_ERROR',
            status: 401
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const body = await req.json();
    console.log('Received request:', { method: req.method, body, userId: user.id });

    if (!body.action || !body.data) {
      return new Response(
        JSON.stringify({
          error: {
            message: 'Invalid request: action and data are required',
            code: 'INVALID_REQUEST',
            status: 400
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const result = await handleSendingGroupAction(body.action, body.data, user);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    
    // エラーレスポンスの形式を統一
    const errorResponse: ErrorResponse = {
      error: {
        message: error.error?.message || error.message || 'An unexpected error occurred',
        code: error.error?.code || error.code || 'UNKNOWN_ERROR',
        details: error.error?.details || error.details || null,
        status: error.error?.status || error.status || 500
      }
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: errorResponse.error.status,
      }
    );
  }
});