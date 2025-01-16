import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase-client.ts';

async function handleTargetAction(action: string, data: any) {
  switch (action) {
    case 'fetchTargets': {
      // 企業データの取得
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (companiesError) throw companiesError;

      // 送信グループの取得
      const { data: groups, error: groupsError } = await supabase
        .from('sending_groups')
        .select(`
          *,
          companies:sending_group_companies(count)
        `);

      if (groupsError) throw groupsError;

      // グループデータの整形
      const formattedGroups = groups.map(group => ({
        ...group,
        company_count: group.companies?.[0]?.count || 0
      }));

      return {
        companies,
        groups: formattedGroups
      };
    }

    default:
      throw new Error(`不明なターゲットアクション: ${action}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    const result = await handleTargetAction(action, data);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Target operation error:', error);

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.details || null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 