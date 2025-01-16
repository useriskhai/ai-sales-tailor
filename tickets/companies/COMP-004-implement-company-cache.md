# 企業情報キャッシュシステムの実装

## 目的
企業情報の取得を効率化し、パフォーマンスを向上させるためのキャッシュシステムを実装します。

## 技術的要件

### 1. キャッシュシステムの実装
```typescript
// src/utils/cache/companyCache.ts
export class CompanyCache {
  private cache: Map<string, CacheEntry>;
  private readonly TTL = 24 * 60 * 60 * 1000;  // 24時間
  
  async get(url: string): Promise<CompanyInfo | null> {
    const entry = this.cache.get(url);
    if (!entry) return null;
    
    if (this.isExpired(entry)) {
      this.cache.delete(url);
      return null;
    }
    
    return entry.data;
  }
  
  async set(url: string, data: CompanyInfo): Promise<void> {
    this.cache.set(url, {
      data,
      timestamp: Date.now()
    });
  }
  
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.TTL;
  }
}

interface CacheEntry {
  data: CompanyInfo;
  timestamp: number;
}
```

### 2. キャッシュ戦略
- メモリキャッシュ
  - TTL: 24時間
  - LRU（Least Recently Used）
  - 最大エントリ数制限
- Supabaseキャッシュ
  - 永続化ストレージ
  - バックグラウンド更新
  - 分散環境対応

### 3. キャッシュ管理
- 自動期限切れ
- 手動無効化
- バックグラウンド更新
- メモリ使用量監視

## テスト項目
1. 正常系テスト
   - キャッシュの保存
   - キャッシュの取得
   - TTLの確認
   - LRUの動作確認

2. 異常系テスト
   - キャッシュミス
   - 期限切れデータ
   - メモリ制限超過
   - 無効なデータ

## 実装手順
1. キャッシュクラスの実装
2. TTL管理の実装
3. LRU機能の実装
4. Supabase連携の実装
5. メモリ管理の実装
6. テストコードの作成
7. パフォーマンス検証

## 完了条件
- [x] メモリキャッシュが正常に動作する
- [x] Supabaseキャッシュが正常に動作する
- [x] TTLが適切に機能する
- [x] メモリ使用量が適切に管理されている
- [x] テストが全て成功する
- [x] パフォーマンス要件を満たしている 