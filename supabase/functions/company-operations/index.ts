import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase-client.ts';
import { Company, SearchCompanyResult } from '../_shared/types.ts';
import { normalizeDomain, normalizeCompanyName } from '../_shared/domain/normalizer.ts';

interface SearchCompaniesParams {
  keyword?: string;
  userId: string;
  page?: number;
  itemsPerPage?: number;
  domainRestriction?: string;
  searchType?: 'default' | 'external';
}

interface SearchCompaniesResponse {
  companies: SearchCompanyResult[];
  totalCount: number;
}

interface DuplicateCheckResult {
  duplicates: Company[];
  newCompanies: Company[];
}

/**
 * URLからトップページのURLを取得します
 */
function getTopPageUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}/`;
  } catch (error) {
    console.error(`URL解析エラー: ${url}`, error);
    return url;
  }
}

/**
 * 企業の重複をチェックします
 */
async function checkDuplicates(companies: Company[]): Promise<DuplicateCheckResult> {
  try {
    // ドメインと企業名の正規化
    const normalizedCompanies = companies.map(company => ({
      ...company,
      domain_for_check: company.url ? normalizeDomain(company.url) : null,
      normalized_name: normalizeCompanyName(company.name)
    }));

    // 重複チェック用のドメイン一覧
    const domains = normalizedCompanies
      .map(c => c.domain_for_check)
      .filter((domain): domain is string => domain !== null);

    // 重複チェック用の正規化された企業名一覧
    const names = normalizedCompanies
      .map(c => c.normalized_name)
      .filter(name => name !== '');

    // データベースで重複チェック
    const { data: existingCompanies, error } = await supabase
      .from('companies')
      .select('*')
      .or(`domain_for_check.in.(${domains.map(d => `'${d}'`).join(',')}),normalized_name.in.(${names.map(n => `'${n}'`).join(',')})`);

    if (error) {
      console.error('重複チェックエラー:', error);
      throw error;
    }

    // 重複企業と新規企業の振り分け
    const duplicates: Company[] = [];
    const newCompanies: Company[] = [];

    normalizedCompanies.forEach(company => {
      const isDuplicate = existingCompanies?.some((existing: Company) => 
        (company.domain_for_check && existing.domain_for_check === company.domain_for_check) ||
        (company.normalized_name && existing.normalized_name === company.normalized_name)
      );

      if (isDuplicate) {
        duplicates.push(company);
      } else {
        newCompanies.push(company);
      }
    });

    return { duplicates, newCompanies };
  } catch (error) {
    console.error('重複チェック処理エラー:', error);
    throw error;
  }
}

/**
 * 企業を登録します
 */
async function registerCompanies(
  companies: Company[],
  userId: string
): Promise<{ success: Company[]; errors: { company: Company; reason: string }[] }> {
  const errors: { company: Company; reason: string }[] = [];
  const success: Company[] = [];

  // 重複チェック
  const { duplicates, newCompanies } = await checkDuplicates(companies);

  // 重複企業をエラーリストに追加
  duplicates.forEach(company => {
    errors.push({
      company,
      reason: '同一ドメインまたは類似の企業名が既に登録されています'
    });
  });

  // 新規企業の登録
  for (const company of newCompanies) {
    try {
      const { data: insertedCompany, error } = await supabase
        .from('companies')
        .insert({
          ...company,
          user_id: userId,
          domain_for_check: company.url ? normalizeDomain(company.url) : null,
          normalized_name: normalizeCompanyName(company.name)
        })
        .select()
        .single();

      if (error) {
        errors.push({
          company,
          reason: `登録エラー: ${error.message}`
        });
        continue;
      }

      // URLが設定されている場合、クロールキューに追加
      if (insertedCompany.url) {
        try {
          const { error: queueError } = await supabase
            .from('crawl_queue')
            .insert({
              company_id: insertedCompany.id,
              status: 'pending',
              retry_count: 0
            });

          if (queueError) {
            console.error(`クロールキュー追加エラー: ${insertedCompany.url}`, queueError);
          } else {
            console.log(`クロールキューに追加: ${insertedCompany.url}`);
          }
        } catch (queueError) {
          console.error(`クロールキュー追加エラー: ${insertedCompany.url}`, queueError);
        }
      }

      success.push(insertedCompany);
    } catch (error) {
      errors.push({
        company,
        reason: `予期せぬエラー: ${error instanceof Error ? error.message : '不明なエラー'}`
      });
    }
  }

  return { success, errors };
}

async function searchCompanies({
  keyword,
  userId,
  page = 1,
  itemsPerPage = 50,
  domainRestriction,
  searchType = 'default'
}: SearchCompaniesParams): Promise<SearchCompaniesResponse> {
  if (!userId) {
    throw new Error('ユーザーIDは必須です');
  }

  console.log('企業検索開始:', { keyword, userId, page, itemsPerPage, domainRestriction, searchType });

  try {
    if (searchType === 'external') {
      // 外部検索（SearchCompany.tsxから呼び出される）
      const host = Deno.env.get('SUPABASE_URL') || 'http://localhost:54321';
      const anon_key = Deno.env.get('SUPABASE_ANON_KEY') || '';

      const response = await fetch(`${host}/functions/v1/search-company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anon_key}`,
        },
        body: JSON.stringify({
          keyword,
          limit: itemsPerPage,
          domainRestriction
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('外部検索エラー:', { 
          status: response.status, 
          data: errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`外部検索エラー: ${response.status}`);
      }

      const companies = await response.json();
      console.log('外部検索結果:', companies);
      
      return {
        companies: companies || [],
        totalCount: companies?.length || 0
      };
    } else {
      // 内部検索（CompanyManager.tsxから呼び出される）
      let query = supabase
        .from('companies')
        .select('id, name, url, description, website_content, website_display_name, last_crawled_at', { count: 'exact' })
        .eq('user_id', userId);

      if (keyword) {
        query = query.ilike('name', `%${keyword}%`);
      }

      if (domainRestriction) {
        query = query.ilike('url', `%${domainRestriction}%`);
      }

      const { data: companies, error: searchError, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      if (searchError) {
        console.error('検索エラー:', JSON.stringify(searchError, null, 2));
        throw new Error(`データベース検索エラー: ${searchError.message}`);
      }

      console.log('検索結果:', { companiesCount: companies?.length, totalCount: count });

      return {
        companies: (companies || []).map((company: Company) => ({
          id: company.id,
          name: company.name,
          url: company.url,
          description: company.description,
          website_content: company.website_content,
          website_display_name: company.website_display_name,
          last_crawled_at: company.last_crawled_at
        } as SearchCompanyResult)),
        totalCount: count || 0
      };
    }
  } catch (error) {
    console.error('企業検索エラー:', error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    } : error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('企業検索中に予期せぬエラーが発生しました');
    }
  }
}

// 企業を削除する関数
async function deleteCompany(supabase: any, id: string): Promise<void> {
  try {
    // まず、crawl_queueから関連レコードを削除
    const { error: queueError } = await supabase
      .from('crawl_queue')
      .delete()
      .eq('company_id', id);

    if (queueError) {
      console.error('クロールキューの削除に失敗:', queueError);
      throw queueError;
    }

    // 次に、companiesから削除
    const { error: companyError } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (companyError) {
      console.error('企業の削除に失敗:', companyError);
      throw companyError;
    }
  } catch (error) {
    console.error('企業の削除処理でエラーが発生:', error);
    throw error;
  }
}

// 検索結果からの一括登録用の関数
async function addMultipleCompanies(
  companies: Company[],
  userId: string
): Promise<{ success: Company[]; errors: { company: Company; reason: string }[] }> {
  const errors: { company: Company; reason: string }[] = [];
  const success: Company[] = [];

  // 各企業データを処理
  for (const company of companies) {
    try {
      // 企業データの登録
      const { data: insertedCompany, error } = await supabase
        .from('companies')
        .insert({
          ...company,
          user_id: userId,
          domain_for_check: company.url ? normalizeDomain(company.url) : null,
          normalized_name: normalizeCompanyName(company.name)
        })
        .select()
        .single();

      if (error) {
        errors.push({
          company,
          reason: `登録エラー: ${error.message}`
        });
        continue;
      }

      // URLが設定されている場合、クロールキューに追加
      if (insertedCompany.url) {
        try {
          const { error: queueError } = await supabase
            .from('crawl_queue')
            .insert({
              company_id: insertedCompany.id,
              status: 'pending',
              retry_count: 0
            });

          if (queueError) {
            console.error(`クロールキュー追加エラー: ${insertedCompany.url}`, queueError);
          } else {
            console.log(`クロールキューに追加: ${insertedCompany.url}`);
          }
        } catch (queueError) {
          console.error(`クロールキュー追加エラー: ${insertedCompany.url}`, queueError);
        }
      }

      success.push(insertedCompany);
    } catch (error) {
      errors.push({
        company,
        reason: `予期せぬエラー: ${error instanceof Error ? error.message : '不明なエラー'}`
      });
    }
  }

  return { success, errors };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    
    if (!action) {
      throw new Error('アクションが指定されていません');
    }

    console.log('リクエスト受信:', { action, data });

    let result;
    switch (action) {
      case 'searchCompanies':
        result = await searchCompanies(data);
        break;
      case 'insertCompanies':
        result = await registerCompanies(data.companies, data.userId);
        break;
      case 'addMultipleCompanies': {
        const { companies } = data;
        if (!companies) {
          throw new Error('企業データは必須です');
        }
        // companies.successが存在する場合はそれを使用し、
        // そうでない場合は companies をそのまま使用する
        const companiesArray = Array.isArray(companies) ? companies : 
          (companies.success && Array.isArray(companies.success)) ? companies.success : null;
        
        if (!companiesArray) {
          throw new Error('有効な企業データ配列が提供されていません');
        }
        
        result = await addMultipleCompanies(companiesArray, data.userId);
        break;
      }
      case 'deleteCompany': {
        const { id } = data;
        if (!id) {
          throw new Error('企業IDは必須です');
        }
        await deleteCompany(supabase, id);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }
      default:
        throw new Error(`不明なアクション: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('リクエスト処理エラー:', error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    } : error);
    
    const errorResponse = {
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
      details: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

// ... rest of the code ...