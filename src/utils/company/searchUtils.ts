import { normalizeUrl, normalizeCompanyName } from '../../../supabase/functions/_shared/domain/normalizer';

export interface SearchResult {
  id: string;
  name: string;
  url: string;
  description: string;
}

/**
 * 検索クエリを最適化するためのオプション
 */
export interface QueryOptimizationOptions {
  includeCompanyKeywords?: boolean;  // 企業関連キーワードを含めるか
  includeIndustryKeywords?: boolean; // 業界特有のキーワードを含めるか
  customKeywords?: string[];         // カスタムキーワード
}

/**
 * 検索クエリを最適化します
 */
export function buildOptimizedQuery(
  keyword: string,
  options: QueryOptimizationOptions = {}
): string {
  const {
    includeCompanyKeywords = true,
    includeIndustryKeywords = true,
    customKeywords = []
  } = options;

  const keywords = keyword.split(',').map(k => k.trim());
  
  // 各キーワードに対して修飾子を追加
  const enhancedKeywords = keywords.map(k => {
    const combinations: string[] = [];
    
    // 基本的な企業関連キーワード
    if (includeCompanyKeywords) {
      const companyKeywords = ['企業', '会社', 'corporation', 'company'];
      combinations.push(...companyKeywords.map(ck => `(${k} ${ck})`));
    }
    
    // 業界特有のキーワード
    if (includeIndustryKeywords) {
      const industryKeywords = ['株式会社', '有限会社', '合同会社', '事業'];
      combinations.push(...industryKeywords.map(ik => `(${k} ${ik})`));
    }
    
    // カスタムキーワード
    if (customKeywords.length > 0) {
      combinations.push(...customKeywords.map(ck => `(${k} ${ck})`));
    }
    
    return combinations.length > 0 
      ? `(${combinations.join(' OR ')})`
      : k;
  });
  
  return enhancedKeywords.join(' OR ');
}

/**
 * 検索結果を正規化します
 */
export function normalizeSearchResults(items: any[]): SearchResult[] {
  if (!items || !Array.isArray(items)) return [];

  const results: SearchResult[] = [];

  for (const item of items) {
    if (!item.link || !item.title) continue;

    const normalizedUrl = normalizeUrl(item.link);
    if (!normalizedUrl) continue;

    results.push({
      id: crypto.randomUUID(),
      name: normalizeCompanyName(item.title),
      url: normalizedUrl,
      description: item.snippet || ''
    });
  }

  return results;
}

/**
 * 検索結果の重複を除外します
 */
export function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return results.filter(result => {
    const key = `${result.url}|${result.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * 検索結果をスコアリングします
 * スコアが高いほど関連性が高いと判断されます
 */
export function scoreSearchResult(
  result: SearchResult,
  keyword: string
): number {
  let score = 0;
  const lowerKeyword = keyword.toLowerCase();
  const lowerName = result.name.toLowerCase();
  const lowerDescription = result.description.toLowerCase();

  // 企業名にキーワードが含まれる場合
  if (lowerName.includes(lowerKeyword)) {
    score += 10;
    // 完全一致の場合はさらにボーナス
    if (lowerName === lowerKeyword) {
      score += 5;
    }
  }

  // 説明文にキーワードが含まれる場合
  if (lowerDescription.includes(lowerKeyword)) {
    score += 5;
  }

  // URLにキーワードが含まれる場合
  if (result.url.toLowerCase().includes(lowerKeyword)) {
    score += 3;
  }

  return score;
}

/**
 * 検索結果を関連性でソートします
 */
export function sortResultsByRelevance(
  results: SearchResult[],
  keyword: string
): SearchResult[] {
  return [...results].sort((a, b) => 
    scoreSearchResult(b, keyword) - scoreSearchResult(a, keyword)
  );
} 