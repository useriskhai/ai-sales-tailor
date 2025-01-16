"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Template,
  TemplateContent,
  CATEGORY_LABELS,
  Category,
  Strategy,
  ToneOfVoice,
  ContentFocus,
  PreferredMethod,
  MessageStrategyConfig
} from "@/types/template";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  FileText,
  MessageSquare,
  Settings2,
  Target,
  ArrowLeft,
  Pencil,
  Copy,
  MoreHorizontal,
  Archive,
  Trash,
  PlayCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TemplateDetailsProps {
  template: Template;
}

// 優先メソッドの日本語表示
const PREFERRED_METHOD_LABELS: Record<PreferredMethod, string> = {
  'FORM': 'フォーム',
  'EMAIL': 'メール',
  'HYBRID': 'ハイブリッド',
};

export function TemplateDetails({ template }: TemplateDetailsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic-info");
  const [parsedSettings, setParsedSettings] = useState<TemplateSettings | null>(null);

  useEffect(() => {
    try {
      const settings = JSON.parse(template.template_settings) as TemplateSettings;
      console.log('パースされた設定:', {
        rawSettings: template.template_settings,
        parsedSettings: settings,
        hasBasicInfo: !!settings.basicInfo,
        strategyInfo: {
          mode: settings.strategy.mode,
          isManual: settings.strategy.mode === 'manual',
          hasContentFocus: !!settings.strategy.contentFocus,
          hasCustomInstructions: !!settings.strategy.customInstructions,
          hasMessageTemplate: !!settings.strategy.messageTemplate,
        },
        basicInfoFields: settings.basicInfo ? {
          hasDescription: !!settings.basicInfo.description,
          hasTags: !!settings.basicInfo.tags,
          tagCount: settings.basicInfo.tags?.length || 0,
          tags: settings.basicInfo.tags,
          hasTargetIndustry: !!settings.basicInfo.target_industry,
        } : null,
      });
      setParsedSettings(settings);
    } catch (error) {
      console.error('テンプレート設定のパースに失敗:', error);
    }
  }, [template.template_settings]);

  console.log('テンプレート詳細データ:', {
    template,
    parsedSettings,
    hasName: !!template?.name,
    hasCategory: !!template?.category,
    hasSettings: !!parsedSettings,
  });

  if (!template || !parsedSettings) {
    return (
      <div className="p-4">
        <p>テンプレートの読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col space-y-4 border-b pb-4">
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold">{template.name}</h1>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{CATEGORY_LABELS[template.category as Category]}</Badge>
                  <span>•</span>
                  <span>作成日: {template.created_at ? new Date(template.created_at).toLocaleDateString() : '未設定'}</span>
                  <span>•</span>
                  <span>更新日: {template.updated_at ? new Date(template.updated_at).toLocaleDateString() : '未設定'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => router.push(`/templates/${template.id}/edit`)}>
                <Pencil className="w-4 h-4 mr-2" />
                編集
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                複製
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/templates/${template.id}/test`)}>
                <PlayCircle className="w-4 h-4 mr-2" />
                テスト実行
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
            <TabsTrigger
              value="strategy"
              className="relative px-4 py-2 -mb-px data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors"
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>メッセージ戦略</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="execution"
              className="relative px-4 py-2 -mb-px data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Settings2 className="w-4 h-4" />
                <span>実行設定</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="kpi"
              className="relative px-4 py-2 -mb-px data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>KPI設定</span>
              </div>
            </TabsTrigger>
          </div>
        </TabsList>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <TabsContent value="basic-info" className="mt-0 px-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">基本情報</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-muted-foreground">テンプレート名</label>
                        <p className="text-base">{template.name || '未設定'}</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-muted-foreground">カテゴリー</label>
                        <p className="text-base">{template.category ? CATEGORY_LABELS[template.category as Category] : '未設定'}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">説明</label>
                      <p className="text-base whitespace-pre-wrap">{parsedSettings?.basicInfo?.description || '未設定'}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">ターゲット業界</label>
                      <p className="text-base">{parsedSettings?.basicInfo?.target_industry || '未設定'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">タグ</CardTitle>
                </CardHeader>
                <CardContent>
                  {parsedSettings?.basicInfo?.tags && parsedSettings.basicInfo.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {parsedSettings.basicInfo.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">タグが設定されていません</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">メタ情報</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">作成日時</label>
                      <p className="text-base">
                        {template.created_at ? 
                          new Date(template.created_at as string | number | Date).toLocaleString() : 
                          '未設定'}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">更新日時</label>
                      <p className="text-base">
                        {template.updated_at ? 
                          new Date(template.updated_at as string | number | Date).toLocaleString() : 
                          '未設定'}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">作成者</label>
                      <p className="text-base">未実装</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">最終更新者</label>
                      <p className="text-base">未実装</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="strategy" className="mt-0 px-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">メッセージ戦略</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">モード</div>
                        <div>{parsedSettings?.strategy.mode === 'manual' ? '手動選択' : 'AI自動選択'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">戦略</div>
                        <div>{MessageStrategyConfig.strategy[parsedSettings?.strategy.strategy as Strategy]}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">トーン</div>
                        <div>{MessageStrategyConfig.tone[parsedSettings?.strategy.toneOfVoice as ToneOfVoice]}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">最大文字数</div>
                        <div>{parsedSettings?.strategy.maxLength}文字</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">絵文字</div>
                        <div>{parsedSettings?.strategy.useEmoji ? '使用する' : '使用しない'}</div>
                      </div>
                      {parsedSettings?.strategy.mode === 'manual' && (
                        <>
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">コンテンツフォーカス</div>
                            <div>{parsedSettings?.strategy.contentFocus && MessageStrategyConfig.focus[parsedSettings.strategy.contentFocus as ContentFocus]}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">カスタム指示</div>
                            <div className="text-sm text-gray-600">{parsedSettings?.strategy.customInstructions || '設定なし'}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="execution" className="mt-0 px-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">実行設定</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">実行優先度</label>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {parsedSettings.execution.execution_priority === 'speed' ? '速度優先' :
                         parsedSettings.execution.execution_priority === 'balanced' ? 'バランス' :
                         parsedSettings.execution.execution_priority === 'quality' ? '品質優先' : '未設定'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">実行履歴</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    実行履歴は現在実装中です
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="kpi" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <h3 className="font-medium mb-2">KPI設定</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">評価期間</p>
                    <p className="font-medium">{parsedSettings.kpi.evaluationPeriod}日</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">メトリクス</h4>
                  <div className="border rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-2 text-left font-medium">メトリクス名</th>
                          <th className="px-4 py-2 text-right font-medium">目標値</th>
                          <th className="px-4 py-2 text-right font-medium">重み付け</th>
                          <th className="px-4 py-2 text-right font-medium">単位</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedSettings.kpi.metrics.map((metric, index) => (
                          <tr key={metric.id} className={index !== parsedSettings.kpi.metrics.length - 1 ? "border-b" : ""}>
                            <td className="px-4 py-2">{metric.name}</td>
                            <td className="px-4 py-2 text-right">{metric.target}</td>
                            <td className="px-4 py-2 text-right">{metric.weight}</td>
                            <td className="px-4 py-2 text-right">{metric.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
} 