# テンプレート一覧画面のUI改善

## 概要
テンプレート一覧画面のUIをNotionライクな使いやすいデザインに改善する。
現状の完成度60%から100%に引き上げることを目標とする。

## 現状分析

### コンポーネント構造
1. ページ構成
   - `src/pages/templates/index.tsx`: テンプレート一覧ページ
     - ページレベルのレイアウトとメタ情報
     - `PageHeader`コンポーネントの使用
     - `TemplateManager`の配置

   - `src/components/templates/pages/TemplateManager.tsx`: テンプレート管理コンポーネント
     - テンプレート一覧の表示ロジック
     - 新規作成ダイアログの制御
     - shadcn/uiベースのデザインシステム
     - グリッドベースのレイアウト

2. 主要コンポーネント
   - `TemplateManager`: テンプレート一覧と作成機能
     - `useTemplates`フックによるデータフェッチ
     - `useSession`による認証状態管理
     - `useToast`によるトースト通知

   - `CreateTemplateDialog`: テンプレート作成ダイアログ
     - ウィザード形式のフォーム
     - 段階的な入力プロセス

3. 使用中のUI要素
   - shadcn/ui:
     - `Card`, `CardContent`: テンプレートカード
     - `Badge`: カテゴリーとモードの表示
     - `Button`: アクション要素
     - `Dialog`: モーダル表示
     - `Skeleton`: ローディング状態

### UI/UXの課題

1. デザインの一貫性
   - ✅ shadcn/uiへの完全移行完了
   - スペーシングの最適化が必要
   - アニメーションの追加検討

2. ヘッダー部分
   - タイトルと説明が簡素
   - アクションボタンの配置が不自然
   - 補助的な操作（フィルター、ソート等）の欠如

3. テンプレートカード
   - 情報の階層が不明確
   - バッジのデザインが簡素
   - ホバー効果が最小限
   - アクションメニューの欠如
   - メタ情報の表示が不十分

4. レイアウト
   - グリッドレイアウトが基本的
   - スペーシングが不十分
   - 視覚的な区切りが弱い

5. インタラクション
   - ホバー状態の視覚的フィードバックが弱い
   - ✅ ローディング状態の表示を改善
   - バルク操作の機能がない

## 改善計画

### 1. 高優先度タスク（完了）

1. ✅ デザインシステムの統一
   - Material-UIの依存を削除
   - shadcn/uiへの完全移行
   - 共通のスタイリングトークンの定義

### 2. 中優先度タスク（進行中）

1. テンプレートカードの改善
   ```tsx
   <Card className="group relative hover:shadow-lg transition-all duration-200 border border-border/50">
     <CardHeader className="pb-2">
       <div className="flex items-start justify-between">
         <div className="flex items-center space-x-2">
           <FileText className="w-4 h-4 text-primary" />
           <CardTitle className="text-lg font-medium">{template.name}</CardTitle>
         </div>
         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
               <MoreHorizontal className="w-4 h-4" />
             </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent>
             <DropdownMenuItem>編集</DropdownMenuItem>
             <DropdownMenuItem>複製</DropdownMenuItem>
             <DropdownMenuItem>アーカイブ</DropdownMenuItem>
             <DropdownMenuSeparator />
             <DropdownMenuItem className="text-destructive">削除</DropdownMenuItem>
           </DropdownMenuContent>
         </DropdownMenu>
       </div>
     </CardHeader>
     <CardContent>
       <div className="space-y-4">
         <div className="flex flex-wrap gap-2">
           <Badge variant="outline" className="bg-primary/5">
             {CATEGORY_LABELS[template.category]}
           </Badge>
           <Badge variant="outline" className="bg-secondary/5">
             {template.mode === 'ai_auto' ? 'AI自動生成' : '手動'}
           </Badge>
         </div>
         <div className="text-sm text-muted-foreground space-y-1">
           <p>作成日: {template.created_at ? new Date(template.created_at).toLocaleDateString() : '未設定'}</p>
           <p>更新日: {template.updated_at ? new Date(template.updated_at).toLocaleDateString() : '未設定'}</p>
         </div>
       </div>
     </CardContent>
   </Card>
   ```

2. ヘッダーのリデザイン
   ```tsx
   <div className="flex flex-col space-y-4 mb-6">
     <div className="flex items-center justify-between">
       <div className="flex items-center space-x-4">
         <FileText className="w-8 h-8 text-primary" />
         <div>
           <h1 className="text-2xl font-bold">テンプレート管理</h1>
           <p className="text-muted-foreground">営業メッセージのテンプレートを管理・カスタマイズできます</p>
         </div>
       </div>
       <div className="flex items-center space-x-2">
         <Button>
           <Plus className="w-4 h-4 mr-2" />
           新規作成
         </Button>
       </div>
     </div>
   </div>
   ```

### 3. 低優先度タスク（未着手）

1. フィルターとソート機能の追加
   - カテゴリーによるフィルタリング
   - 作成日/更新日でのソート
   - ステータスによるフィルタリング

2. バルク操作の実装
   - 複数選択機能
   - 一括アーカイブ
   - 一括削除

3. パフォーマンス指標の表示
   - 応答率
   - 品質スコア
   - 成功率

## タイムライン

1. フェーズ1（完了）: デザインシステムの統一（2日）
   - ✅ Material-UIの削除
   - ✅ shadcn/uiへの移行
   - ✅ スタイリングの統一

2. フェーズ2（進行中）: 基本UI改善（3日）
   - テンプレートカードのリデザイン
   - ヘッダーの改善
   - レイアウトの最適化

3. フェーズ3（未着手）: 機能拡張（3日）
   - フィルター/ソート機能
   - バルク操作
   - パフォーマンス指標

## 注意事項
- デザインの一貫性を保つ
- アクセシビリティを考慮
- パフォーマンスへの影響を最小限に
- 既存機能の互換性を維持 