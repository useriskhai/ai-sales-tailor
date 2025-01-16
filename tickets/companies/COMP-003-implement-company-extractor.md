# 企業情報抽出ロジックの実装

## 目的
Webサイトから企業名や関連情報を正確に抽出するロジックを実装します。

## 技術的要件

### 1. 抽出ロジックの実装
```typescript
// src/utils/company/companyExtractor.ts
export class CompanyExtractor {
  async extract(url: string): Promise<CompanyInfo> {
    const html = await this.fetchWithProxy(url);
    
    // メタデータからの抽出
    const metaInfo = this.extractFromMeta(html);
    if (metaInfo.confidence > 0.9) return metaInfo;
    
    // タイトルからの抽出
    const titleInfo = this.extractFromTitle(html);
    if (titleInfo.confidence > 0.8) return titleInfo;
    
    // コンテンツからの抽出
    return this.extractFromContent(html);
  }
  
  private extractFromMeta(html: string): Partial<CompanyInfo> {
    // og:site_name, organization-name などから抽出
  }
  
  private extractFromTitle(html: string): Partial<CompanyInfo> {
    // title タグから抽出、パターンマッチングで整形
  }
  
  private extractFromContent(html: string): Partial<CompanyInfo> {
    // h1, 特定のクラス名、構造化データなどから抽出
  }
}
```

### 2. 抽出ルール
- メタデータ優先
  - og:site_name
  - organization-name
  - application-name
- タイトル解析
  - 「株式会社」などの法人形式
  - 「企業情報」「会社概要」などの一般的な文字列の除去
- コンテンツ解析
  - h1タグの内容
  - 構造化データ（JSON-LD, microdata）
  - 特定のクラス名やID

### 3. 信頼度スコアリング
- メタデータ: 0.9-1.0
- タイトル: 0.7-0.9
- コンテンツ: 0.5-0.7

## テスト項目
1. 正常系テスト
   - メタデータからの抽出
   - タイトルからの抽出
   - コンテンツからの抽出
   - 複数の情報源からの統合

2. 異常系テスト
   - メタデータ不在
   - 不適切なHTML構造
   - 文字化けデータ
   - 空のHTML

## 実装手順
1. 基本クラス構造の実装
2. メタデータ抽出の実装
3. タイトル抽出の実装
4. コンテンツ抽出の実装
5. 信頼度スコアリングの実装
6. テストコードの作成
7. エラーハンドリングの実装

## 完了条件
- [x] 各抽出メソッドが正常に動作する
- [x] 信頼度スコアリングが適切に機能する
- [x] エラーハンドリングが実装されている
- [x] テストが全て成功する
- [x] 実際のWebサイトでの検証が完了している 