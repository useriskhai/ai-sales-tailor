import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchResultCache } from './cacheUtils';
import type { SearchResult } from './searchUtils';

describe('SearchResultCache', () => {
  let cache: SearchResultCache;
  const testResults: SearchResult[] = [
    {
      id: '1',
      name: 'テスト企業1',
      url: 'https://example1.com',
      description: '説明1'
    },
    {
      id: '2',
      name: 'テスト企業2',
      url: 'https://example2.com',
      description: '説明2'
    }
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new SearchResultCache({ ttl: 1000 }); // 1秒
  });

  it('キャッシュの基本的な設定と取得', () => {
    cache.set('テスト', testResults);
    const results = cache.get('テスト');
    expect(results).toEqual(testResults);
  });

  it('キャッシュの有効期限切れ', () => {
    cache.set('テスト', testResults);
    
    // 有効期限を超過
    vi.advanceTimersByTime(1500);
    
    const results = cache.get('テスト');
    expect(results).toBeNull();
  });

  it('オプション付きのキャッシュキー', () => {
    const options = { limit: 10, offset: 0 };
    cache.set('テスト', testResults, options);
    
    // 同じオプションで取得
    const results1 = cache.get('テスト', options);
    expect(results1).toEqual(testResults);
    
    // 異なるオプションで取得
    const results2 = cache.get('テスト', { limit: 20, offset: 0 });
    expect(results2).toBeNull();
  });

  it('キャッシュの削除', () => {
    cache.set('テスト', testResults);
    cache.delete('テスト');
    const results = cache.get('テスト');
    expect(results).toBeNull();
  });

  it('キャッシュのクリア', () => {
    cache.set('テスト1', testResults);
    cache.set('テスト2', testResults);
    cache.clear();
    
    expect(cache.get('テスト1')).toBeNull();
    expect(cache.get('テスト2')).toBeNull();
  });

  it('キャッシュサイズの制限', () => {
    const smallCache = new SearchResultCache({ 
      ttl: 1000,
      maxSize: 2
    });

    // 最大サイズを超えるエントリを追加
    smallCache.set('テスト1', testResults);
    smallCache.set('テスト2', testResults);
    smallCache.set('テスト3', testResults);

    // 最も古いエントリが削除されているはず
    expect(smallCache.get('テスト1')).toBeNull();
    expect(smallCache.get('テスト2')).not.toBeNull();
    expect(smallCache.get('テスト3')).not.toBeNull();
  });

  it('統計情報の取得', () => {
    cache.set('テスト1', testResults);
    cache.set('テスト2', testResults);
    
    // 1つのエントリを期限切れにする
    vi.advanceTimersByTime(1500);
    cache.set('テスト3', testResults);
    
    const stats = cache.getStats();
    expect(stats.size).toBe(3);
    expect(stats.validEntries).toBe(1);
    expect(stats.expiredEntries).toBe(2);
  });
}); 