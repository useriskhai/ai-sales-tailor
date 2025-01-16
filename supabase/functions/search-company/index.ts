import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { SearchCompanyResult } from '../_shared/types.ts';

// 組織を示すキーワード（教育・行政機関を除外）
const organizationKeywords = [
  '株式会社',
  '有限会社',
  '合同会社',
  '社団法人',
  '財団法人',
  'NPO法人',
  '協同組合',
  '商工会議所',
  '組合',
  '連合会'
];

// 組織のコンテンツを示すキーワード
const organizationContentKeywords = [
  '会社概要',
  '企業情報',
  '事業案内',
  '事業内容',
  '企業案内',
  '会社案内',
  'コーポレート',
  'corporate',
  'company',
  'about us'
];

// 除外するパターン
const excludePatterns = [
  '-filetype:pdf',
  '-filetype:doc',
  '-filetype:xls',
  '-inurl:news',     // ニュース
  '-inurl:/news/',   // ニュースディレクトリ
  '-inurl:newsrelease', // ニュースリリース
  '-inurl:press',    // プレスリリース
  '-inurl:/press/',  // プレスディレクトリ
  '-inurl:release',  // リリース
  '-inurl:/release/', // リリースディレクトリ
  '-inurl:law',
  '-inurl:rule',
  '-inurl:edu',      // 教育機関を除外
  '-inurl:ac.jp',    // 学術機関を除外
  '-inurl:go.jp',    // 政府機関を除外
  '-inurl:lg.jp',    // 地方自治体を除外
  '-inurl:error',    // エラーページを除外
  '-inurl:undefined', // undefinedを含むURLを除外
  '-inurl:kumiai',   // 組合のURLを除外
  '-inurl:union',    // 組合のURLを除外
  '-inurl:kyokai',   // 協会のURLを除外
  '-inurl:association', // 協会のURLを除外
  '-inurl:article',  // 記事ページを除外
  '-inurl:blog',     // ブログを除外
  '-inurl:topics',   // トピックスを除外
  '-inurl:newsroom', // ニュースルームを除外
  '-inurl:ir/',      // IRニュースを除外
  '-inurl:information', // お知らせを除外
  '-inurl:recruit',  // 採用情報を除外
  '-inurl:career',   // 採用情報を除外
  '-inurl:whatsnew', // 新着情報を除外
  '-inurl:updates',  // 更新情報を除外
  '-inurl:media',    // メディア掲載を除外
  '-inurl:notice',   // お知らせを除外
  '-inurl:announce', // アナウンスを除外
  '-inurl:publicity', // 広報を除外
  '-inurl:/ja/news/', // 日本語ニュース
  '-inurl:/en/news/', // 英語ニュース
  '-inurl:/jp/news/'  // 日本語ニュース（別パターン）
];

interface SearchParams {
  keyword: string;
  limit?: number;
  domainRestriction?: string;
}

function buildSearchQuery(keyword: string): string {
  // メインキーワードを最優先
  const mainQuery = `"${keyword}"`;
  
  // 業界・事業に関連するフレーズ（優先順位付き）
  const businessPhrases = [
    // 大手企業を示すフレーズを優先
    `${keyword} (グループ OR ホールディングス OR HD)`,
    `${keyword} (企業 OR 会社)`,
    `${keyword} (事業 OR 産業)`,
    `${keyword} (チェーン OR 店舗)`,
    `${keyword} (メーカー OR サービス)`
  ];

  // 企業情報を示すフレーズ（優先順位付き）
  const companyInfoPhrases = [
    'IR情報',
    '企業情報',
    '会社概要',
    '事業内容',
    'コーポレート'
  ];

  // 企業の公式サイトを示すパターン
  const officialSitePatterns = [
    'inurl:corporate',
    'inurl:company',
    'inurl:about',
    'inurl:profile',
    'inurl:ci/',
    'inurl:corp'
  ];

  // 検索クエリの構築（優先順位を考慮）
  return `
    (${mainQuery} AND (${businessPhrases.join(' OR ')}))
    AND (${organizationKeywords.slice(0, 3).join(' OR ')})
    AND (${companyInfoPhrases.join(' OR ')})
    AND (${officialSitePatterns.join(' OR ')})
    ${excludePatterns.join(' ')}
  `.replace(/\s+/g, ' ').trim();
}

async function searchCompanies({ keyword, limit = 10, domainRestriction = '' }: SearchParams): Promise<SearchCompanyResult[]> {
  console.log('検索開始:', { keyword, limit, domainRestriction });

  const apiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
  const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');

  console.log('環境変数:', {
    hasApiKey: !!apiKey,
    hasSearchEngineId: !!searchEngineId
  });

  if (!apiKey || !searchEngineId) {
    throw new Error('Google Custom Search APIの設定が不足しています');
  }

  if (!keyword) {
    throw new Error('検索キーワードは必須です');
  }

  // 検索クエリの最適化
  let finalQuery = buildSearchQuery(keyword);
  if (domainRestriction) {
    finalQuery += ` site:${domainRestriction}`;
  }

  console.log('最適化されたクエリ:', finalQuery);

  const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
  searchUrl.searchParams.append('key', apiKey);
  searchUrl.searchParams.append('cx', searchEngineId);
  searchUrl.searchParams.append('q', finalQuery);
  searchUrl.searchParams.append('num', limit.toString());
  searchUrl.searchParams.append('lr', 'lang_ja');

  console.log('検索URL:', searchUrl.toString());

  try {
    const response = await fetch(searchUrl.toString());
    console.log('検索レスポンスステータス:', response.status);

    if (!response.ok) {
      throw new Error(`Google検索APIエラー: ${response.status}`);
    }

    const data = await response.json();
    console.log('検索レスポンス:', {
      searchTime: data.searchInformation?.searchTime,
      totalResults: data.searchInformation?.totalResults,
      itemCount: data.items?.length
    });

    if (!data.items) {
      return [];
    }

    // 検索結果の正規化
    const results: SearchCompanyResult[] = data.items.map((item: any) => ({
      id: crypto.randomUUID(),
      name: item.title,
      url: item.link,
      description: item.snippet
    }));

    console.log('正規化された結果:', results);
    return results;

  } catch (error) {
    console.error('検索エラー:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { keyword, limit, domainRestriction } = await req.json();
    const results = await searchCompanies({ keyword, limit, domainRestriction });

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('リクエスト処理エラー:', error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
