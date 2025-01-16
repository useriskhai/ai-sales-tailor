# テンプレート詳細画面のUI改善

## 概要
テンプレート詳細画面のUIをNotionライクな使いやすいデザインに改善する。
現状の完成度60%から100%に引き上げることを目標とする。

## 現状分析

### コンポーネント構造の詳細
1. ページ構成
   - `src/pages/templates/[id].tsx`: テンプレート詳細ページ
     - ルーティングとデータフェッチの責務
     - エラーハンドリングとローディング状態の管理
   - `src/components/templates/pages/TemplateDetails.tsx`: 詳細表示コンポーネント
     - タブベースのナビゲーション
     - 各セクションの表示ロジック
     - データの整形と表示

2. データ構造
   ```typescript
   interface Template {
     id: string;
     name: string;
     category: Category;
     content: string; // JSON文字列
   }

   interface TemplateContent {
     basicInfo: {
       description?: string;
       tags?: string[];
       target_industry?: string;
     };
     strategy: {
       mode: 'ai_auto' | 'manual';
       strategy?: Strategy;
       toneOfVoice?: ToneOfVoice;
       maxLength?: number;
       useEmoji?: boolean;
       contentFocus?: ContentFocus;
       customInstructions?: string;
       messageTemplate?: string;
     };
     execution: {
       execution_priority: 'speed' | 'balanced' | 'quality';
     };
   }
   ```

### UI/UXの詳細な課題

1. ページヘッダー
   - 戻るボタンのデザインが簡素で、インタラクションが不足
   - アクションボタンの配置が不自然で、重要度が視覚的に表現されていない
   - ページタイトルとメタ情報の階層が不明確で、情報の関連性が伝わりにくい
   - 編集モードへの切り替えUIが不足

2. タブナビゲーション
   - タブのデザインが平面的で、階層構造が分かりにくい
   - アクティブ状態の視覚的フィードバックが弱く、現在位置が把握しづらい
   - タブ切り替え時のアニメーションがなく、状態変化が唐突
   - タブ内のコンテンツ量に応じたスクロール挙動の最適化が不足

3. 基本情報セクション
   - 情報の階層構造が不明確で、関連情報のグルーピングが不十分
   - ラベルと値のコントラストが弱く、可読性が低い
   - 編集可能な項目の視認性が低く、インタラクションの余地が分かりにくい
   - タグの表示が簡素で、管理機能が不足
   - メタ情報（作成日時、更新日時など）の表示が不十分

4. メッセージ戦略セクション
   - 設定項目の関連性が視覚的に表現されておらず、設定の意図が伝わりにくい
   - モード切替の視覚的フィードバックが不十分で、現在の状態が分かりにくい
   - 条件付き表示の遷移がぎこちなく、ユーザーの混乱を招く可能性
   - プレビュー機能の不足
   - 設定変更時のリアルタイムフィードバックが不足

5. 実行設定セクション
   - 設定値の視覚的表現が不足し、影響度が分かりにくい
   - 数値入力のUXが不十分で、直感的な操作が困難
   - 設定項目間の関係性が不明確で、設定の意図が伝わりにくい
   - 設定変更時の影響範囲の表示が不足

6. KPI設定セクション
   - メトリクスの視覚化が不足し、達成状況が把握しづらい
   - 目標値と現在値の比較が分かりにくく、進捗管理が困難
   - 評価期間の設定UIが直感的でなく、期間の調整が煩雑
   - データの時系列表示が不足

## 改善計画

### 1. 高優先度タスク（3日）

1. ページヘッダーの改善
   ```tsx
   <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
     <div className="flex flex-col space-y-4 border-b pb-4">
       <div className="flex items-center justify-between px-6">
         <div className="flex items-center space-x-4">
           <Button
             variant="ghost"
             size="sm"
             onClick={() => router.back()}
             className="hover:bg-background transition-colors"
           >
             <ArrowLeft className="w-4 h-4 mr-2" />
             一覧に戻る
           </Button>
           <div>
             <h1 className="text-2xl font-bold">{template.name}</h1>
             <div className="flex items-center space-x-2 text-sm text-muted-foreground">
               <Badge variant="outline">{CATEGORY_LABELS[template.category]}</Badge>
               <span>•</span>
               <span>作成日: {new Date(template.created_at).toLocaleDateString()}</span>
               <span>•</span>
               <span>更新日: {new Date(template.updated_at).toLocaleDateString()}</span>
             </div>
           </div>
         </div>
         <div className="flex items-center space-x-2">
           <Button variant="outline" size="sm">
             <Pencil className="w-4 h-4 mr-2" />
             編集
           </Button>
           <Button variant="outline" size="sm">
             <Copy className="w-4 h-4 mr-2" />
             複製
           </Button>
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="outline" size="sm">
                 <MoreHorizontal className="w-4 h-4" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               <DropdownMenuItem>
                 <Archive className="w-4 h-4 mr-2" />
                 アーカイブ
               </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem className="text-destructive">
                 <Trash className="w-4 h-4 mr-2" />
                 削除
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
         </div>
       </div>
     </div>
   </div>
   ```

2. タブナビゲーションの改善
   ```tsx
   <Tabs defaultValue="basic-info" className="w-full">
     <TabsList className="w-full border-b p-0 mb-6">
       <div className="flex items-center space-x-6 px-6">
         <TabsTrigger
           value="basic-info"
           className="relative px-4 py-2 -mb-px data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors"
         >
           <div className="flex items-center space-x-2">
             <FileText className="w-4 h-4" />
             <span>基本情報</span>
           </div>
         </TabsTrigger>
         {/* 他のタブも同様 */}
       </div>
     </TabsList>
     <ScrollArea className="h-[calc(100vh-12rem)]">
       <TabsContent value="basic-info" className="mt-0 px-6">
         {/* タブコンテンツ */}
       </TabsContent>
     </ScrollArea>
   </Tabs>
   ```

### 2. 中優先度タスク（3日）

1. 基本情報セクションの改善
   - 情報の階層構造を明確化するためのカード分割
   - インライン編集機能の実装
   - タグ管理UIの改善（追加、削除、編集）
   - メタ情報の視覚化（作成者、更新履歴など）

2. メッセージ戦略セクションの改善
   - モード切替UIの改善（ラジオボタン → セグメントコントロール）
   - 設定項目のグループ化とカード分割
   - 条件付き表示のアニメーション追加
   - プレビュー機能の実装

3. 実行設定セクションの改善
   - 数値入力UIの改善（スライダー、ステッパー）
   - 設定値の視覚化（アイコン、カラーコード）
   - 関連設定のグループ化
   - 設定変更時のフィードバック強化

### 3. 低優先度タスク（2日）

1. KPI設定セクションの改善
   - メトリクスの視覚化（グラフ、チャート）
   - 目標値と現在値の比較UI
   - 評価期間設定の改善
   - データの時系列表示

2. アニメーションとトランジション
   - タブ切り替えアニメーション
   - 編集モード切替アニメーション
   - ホバーエフェクトの追加
   - スクロールアニメーション

3. レスポンシブ対応
   - モバイル表示の最適化
   - タブレット表示の調整
   - 大画面表示の改善

## タイムライン

1. フェーズ1: 高優先度タスク（3日）
   - ページヘッダーの改善
   - タブナビゲーションの改善
   - 基本的なレイアウト調整

2. フェーズ2: 中優先度タスク（3日）
   - 各セクションのUI改善
   - インタラクションの改善
   - フィードバックの強化

3. フェーズ3: 低優先度タスク（2日）
   - アニメーションの追加
   - レスポンシブ対応
   - 最終調整

## 注意事項
- デザインの一貫性を保つ
- アクセシビリティを考慮
- パフォーマンスへの影響を最小限に
- 既存機能の互換性を維持 