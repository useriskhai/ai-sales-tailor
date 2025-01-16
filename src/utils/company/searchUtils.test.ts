import { describe, it, expect } from 'vitest';
import {
  buildOptimizedQuery,
  normalizeSearchResults,
  deduplicateResults,
  scoreSearchResult,
  sortResultsByRelevance,
  type SearchResult
} from './searchUtils';

describe('buildOptimizedQuery', () => {
  it('基本的なキーワードの最適化', () => {
    const result = buildOptimizedQuery('小売');
    expect(result).toContain('(小売 企業)');
    expect(result).toContain('(小売 会社)');
    expect(result).toContain('(小売 株式会社)');
  });

  it('カスタムキーワードの追加', () => {
    const result = buildOptimizedQuery('小売', {
      customKeywords: ['店舗', 'チェーン']
    });
    expect(result).toContain('(小売 店舗)');
    expect(result).toContain('(小売 チェーン)');
  });

  it('企業キーワードの除外', () => {
    const result = buildOptimizedQuery('小売', {
      includeCompanyKeywords: false
    });
    expect(result).not.toContain('(小売 企業)');
    expect(result).not.toContain('(小売 会社)');
  });
});

describe('normalizeSearchResults', () => {
  it('有効な検索結果の正規化', () => {
    const input = [{
      link: 'http://www.example.com',
      title: '株式会社テスト',
      snippet: 'テスト企業の説明'
    }];
    
    const results = normalizeSearchResults(input);
    expect(results[0]).toMatchObject({
      url: 'https://example.com',
      name: '(株)テスト',
      description: 'テスト企業の説明'
    });
  });

  it('無効なデータのフィルタリング', () => {
    const input = [
      { link: 'invalid-url', title: 'テスト' },
      { link: 'http://example.com' }, // タイトルなし
      {} // リンクとタイトルなし
    ];
    
    const results = normalizeSearchResults(input);
    expect(results).toHaveLength(0);
  });
});

describe('deduplicateResults', () => {
  it('重複する検索結果の除外', () => {
    const input: SearchResult[] = [
      {
        id: '1',
        name: 'テスト企業',
        url: 'https://example.com',
        description: '説明1'
      },
      {
        id: '2',
        name: 'テスト企業',
        url: 'https://example.com',
        description: '説明2'
      }
    ];
    
    const results = deduplicateResults(input);
    expect(results).toHaveLength(1);
  });
});

describe('scoreSearchResult', () => {
  const testResult: SearchResult = {
    id: '1',
    name: 'テスト株式会社',
    url: 'https://test-company.com',
    description: 'テスト企業の説明文'
  };

  it('企業名の完全一致で高スコア', () => {
    const score = scoreSearchResult(testResult, 'テスト株式会社');
    expect(score).toBeGreaterThan(10);
  });

  it('説明文のキーワードマッチ', () => {
    const score = scoreSearchResult(testResult, 'テスト企業');
    expect(score).toBeGreaterThan(0);
  });

  it('URLのキーワードマッチ', () => {
    const score = scoreSearchResult(testResult, 'test');
    expect(score).toBeGreaterThan(0);
  });
});

describe('sortResultsByRelevance', () => {
  const results: SearchResult[] = [
    {
      id: '1',
      name: 'ABC株式会社',
      url: 'https://abc.com',
      description: 'テストとは関係ない説明'
    },
    {
      id: '2',
      name: 'テスト株式会社',
      url: 'https://test.com',
      description: 'テスト関連の説明'
    }
  ];

  it('関連性の高い結果が先頭に来る', () => {
    const sorted = sortResultsByRelevance(results, 'テスト');
    expect(sorted[0].name).toBe('テスト株式会社');
  });
}); 