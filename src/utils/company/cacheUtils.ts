import type { SearchResult } from './searchUtils';

interface CacheEntry {
  results: SearchResult[];
  timestamp: number;
  options?: Record<string, any>;
}

interface CacheOptions {
  ttl: number;
  maxSize?: number;
}

interface CacheStats {
  size: number;
  validEntries: number;
  expiredEntries: number;
}

export class SearchResultCache {
  private cache: Map<string, CacheEntry>;
  private ttl: number;
  private maxSize?: number;

  constructor(options: CacheOptions) {
    this.cache = new Map();
    this.ttl = options.ttl;
    this.maxSize = options.maxSize;
  }

  private generateKey(keyword: string, options?: Record<string, any>): string {
    if (!options) return keyword;
    return `${keyword}:${JSON.stringify(options)}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.ttl;
  }

  private enforceMaxSize(): void {
    if (!this.maxSize || this.cache.size <= this.maxSize) return;

    // 最も古いエントリを削除
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const entriesToRemove = this.cache.size - this.maxSize;
    for (let i = 0; i < entriesToRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  set(keyword: string, results: SearchResult[], options?: Record<string, any>): void {
    const key = this.generateKey(keyword, options);
    this.cache.set(key, {
      results,
      timestamp: Date.now(),
      options
    });

    this.enforceMaxSize();
  }

  get(keyword: string, options?: Record<string, any>): SearchResult[] | null {
    const key = this.generateKey(keyword, options);
    const entry = this.cache.get(key);

    if (!entry) return null;
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.results;
  }

  delete(keyword: string, options?: Record<string, any>): void {
    const key = this.generateKey(keyword, options);
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): CacheStats {
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      if (this.isExpired(entry)) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      size: this.cache.size,
      validEntries,
      expiredEntries
    };
  }
} 