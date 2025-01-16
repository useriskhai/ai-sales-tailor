# 企業管理APIの改良

## 概要
企業情報の管理機能を拡充し、より効率的な企業データの操作と管理を実現します。

## 現状
- 基本的な企業情報管理は実装済み
- 一括操作機能が不足
- 除外企業管理機能が未実装

## タスク

### 1. 除外企業管理機能の実装
- `insertExcludedCompanies`APIの実装
  - 除外企業の一括登録
  - 重複チェック
  - 除外理由の管理
- `getExcludedCompanies`APIの実装
  - 除外企業の一覧取得
  - フィルタリング機能
  - ページネーション対応

### 2. 企業情報の一括操作機能の実装
- CSVインポート機能
  - ファイルアップロード
  - データバリデーション
  - エラーハンドリング
- CSVエクスポート機能
  - データ形式の定義
  - 大規模データの分割処理
  - 進捗管理

### 3. 企業情報検索機能の強化
- 高度な検索条件
- フィルタリングの拡充
- ソート機能の追加

## 技術仕様

### データモデル
```typescript
interface ExcludedCompany {
  id: string;
  company_id: string;
  reason: string;
  excluded_at: string;
  excluded_by: string;
  notes?: string;
}

interface CompanyImportResult {
  total: number;
  success: number;
  failed: number;
  errors: {
    row: number;
    message: string;
    data: Record<string, unknown>;
  }[];
}

interface CompanySearchFilters {
  industry?: string[];
  employee_size?: string[];
  location?: string[];
  keywords?: string[];
  excluded?: boolean;
}
```

### API仕様

#### insertExcludedCompanies
- メソッド: POST
- エンドポイント: `/company-operations`
- リクエストボディ:
```typescript
{
  action: 'insertExcludedCompanies',
  data: {
    companies: {
      company_id: string;
      reason: string;
      notes?: string;
    }[];
  }
}
```

#### getExcludedCompanies
- メソッド: POST
- エンドポイント: `/company-operations`
- リクエストボディ:
```typescript
{
  action: 'getExcludedCompanies',
  data: {
    filters?: {
      reason?: string[];
      date_range?: {
        start: string;
        end: string;
      };
    };
    pagination?: {
      page: number;
      per_page: number;
    };
    sort?: {
      field: string;
      order: 'asc' | 'desc';
    };
  }
}
```

#### importCompaniesFromCSV
- メソッド: POST
- エンドポイント: `/company-operations`
- リクエス��ボディ:
```typescript
{
  action: 'importCompaniesFromCSV',
  data: {
    file_url: string;
    options?: {
      update_existing?: boolean;
      skip_validation?: boolean;
      batch_size?: number;
    };
  }
}
```

#### exportCompaniesToCSV
- メソッド: POST
- エンドポイント: `/company-operations`
- リクエストボディ:
```typescript
{
  action: 'exportCompaniesToCSV',
  data: {
    filters?: CompanySearchFilters;
    fields?: string[];
    format?: 'csv' | 'xlsx';
  }
}
```

## 関連ファイル
- `supabase/functions/company-operations/index.ts`
- `supabase/functions/_shared/types.ts`
- `supabase/functions/utils/csv-processor.ts`

## 優先度
中

## 担当
バックエンドエンジニア

## 見積もり工数
4人日

## テスト要件
1. ユニットテスト
   - 除外企業管理のテスト
   - CSVインポート/エクスポートのテスト
   - バリデーション機能のテスト
   - エラーハンドリングのテスト

2. 統合テスト
   - 大規模データでのパフォーマンステスト
   - ファイル処理の信頼性テスト
   - 並行処理のテスト

## 注意事項
- データの整合性確保
- 大規模データの効率的な処理
- メモリ使用量の最適化
- エラー時のロールバック
- 監査ログの記��� 