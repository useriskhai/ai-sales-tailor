"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, MoreHorizontal, Filter, ArrowUpDown, Trash, Archive, Copy } from 'lucide-react';
import { CreateTemplateDialog } from '@/components/templates/wizard/CreateTemplateDialog';
import { useTemplates } from '@/hooks/useTemplates';
import { Template, TemplateSettings, Category } from '@/types/template';
import { CATEGORY_LABELS } from '@/types/template';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/router';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from '@/hooks/useSession';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TemplateManagerProps {
  onTemplateCreated: (newTemplate: Template) => void;
}

interface FilterState {
  category: Category | 'all';
  sortBy: 'created_at' | 'updated_at';
  sortOrder: 'asc' | 'desc';
}

export function TemplateManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchTemplates } = useTemplates();
  const { toast } = useToast();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const handleOpenCreateDialog = () => {
    if (!session) {
      toast({
        title: "認証エラー",
        description: "ログインが必要です",
        variant: "destructive"
      });
      return;
    }
    setIsCreateDialogOpen(true);
  };

  useEffect(() => {
    async function loadTemplates() {
      try {
        setIsLoading(true);
        const data = await fetchTemplates();
        if (data) {
          setTemplates(data);
        }
      } catch (error) {
        console.error('テンプレート読み込みエラー:', error);
        toast({
          title: "エラー",
          description: "テンプレートの読み込みに失敗しました",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      loadTemplates();
    }
  }, [session, fetchTemplates, toast]);

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const handleTemplateCreated = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTemplates();
      if (data) {
        setTemplates(data);
      }
    } catch (error) {
      console.error('テンプレート読み込みエラー:', error);
      toast({
        title: "エラー",
        description: "テンプレートの読み込みに失敗しました",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateClick = (templateId: string) => {
    router.push(`/templates/${templateId}`);
  };

  const handleTemplateAction = (action: string, templateId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    switch (action) {
      case 'edit':
        router.push(`/templates/${templateId}/edit`);
        break;
      case 'duplicate':
        // TODO: 複製機能の実装
        toast({
          title: "機能準備中",
          description: "テンプレートの複製機能は現在開発中です",
        });
        break;
      case 'archive':
        // TODO: アーカイブ機能の実装
        toast({
          title: "機能準備中",
          description: "テンプレートのアーカイブ機能は現在開発中です",
        });
        break;
      case 'delete':
        // TODO: 削除機能の実装
        toast({
          title: "機能準備中",
          description: "テンプレートの削除機能は現在開発中です",
        });
        break;
    }
  };

  const handleTemplateSelect = (templateId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelected = new Set(selectedTemplates);
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId);
    } else {
      newSelected.add(templateId);
    }
    setSelectedTemplates(newSelected);
  };

  const handleBulkAction = async (action: 'delete' | 'archive' | 'duplicate') => {
    if (selectedTemplates.size === 0) return;

    try {
      switch (action) {
        case 'delete':
          toast({
            title: "機能準備中",
            description: "一括削除機能は現在開発中です",
          });
          break;
        case 'archive':
          toast({
            title: "機能準備中",
            description: "一括アーカイブ機能は現在開発中です",
          });
          break;
        case 'duplicate':
          toast({
            title: "機能準備中",
            description: "一括複製機能は現在開発中です",
          });
          break;
      }
    } catch (error) {
      console.error('バルク操作エラー:', error);
      toast({
        title: "エラー",
        description: "操作に失敗しました",
        variant: "destructive"
      });
    }
  };

  const filteredAndSortedTemplates = templates
    .filter((template) => filters.category === 'all' || template.category === filters.category)
    .sort((a, b) => {
      const dateA = a[filters.sortBy] || '1970-01-01';
      const dateB = b[filters.sortBy] || '1970-01-01';
      return filters.sortOrder === 'asc' 
        ? new Date(dateA).getTime() - new Date(dateB).getTime()
        : new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  const renderTemplateCard = (template: Template) => {
    const parsedSettings = template.template_settings ? JSON.parse(template.template_settings) as TemplateSettings : null;

    return (
      <Card key={template.id} className="relative">
        <div className="text-sm text-muted-foreground">
          {parsedSettings?.basicInfo?.description || '説明なし'}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">テンプレート管理</h1>
          <p className="text-muted-foreground">営業メッセージのテンプレートを管理・カスタマイズできます</p>
        </div>
        <div className="flex items-center space-x-2">
          {isSelectionMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelectionMode(false)}
                className="text-muted-foreground"
              >
                選択をキャンセル
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('duplicate')}
                disabled={selectedTemplates.size === 0}
              >
                複製
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('archive')}
                disabled={selectedTemplates.size === 0}
              >
                アーカイブ
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                disabled={selectedTemplates.size === 0}
              >
                削除
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelectionMode(true)}
              >
                複数選択
              </Button>
              <Button
                onClick={handleOpenCreateDialog}
                disabled={isLoading}
              >
                新規テンプレート作成
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <select
          className="bg-background border border-input rounded-md px-3 py-1 text-sm"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value as Category | 'all' })}
        >
          <option value="all">すべてのカテゴリー</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          className="bg-background border border-input rounded-md px-3 py-1 text-sm"
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            setFilters({
              ...filters,
              sortBy: sortBy as 'created_at' | 'updated_at',
              sortOrder: sortOrder as 'asc' | 'desc',
            });
          }}
        >
          <option value="created_at-desc">作成日（新しい順）</option>
          <option value="created_at-asc">作成日（古い順）</option>
          <option value="updated_at-desc">更新日（新しい順）</option>
          <option value="updated_at-asc">更新日（古い順）</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedTemplates.map((template) => {
            const parsedSettings = template.template_settings ? JSON.parse(template.template_settings) as TemplateSettings : null;
            return (
              <Card
                key={template.id}
                className={`group relative hover:shadow-lg transition-all duration-200 border border-border/50 ${
                  selectedTemplates.has(template.id) ? 'ring-2 ring-primary' : ''
                }`}
                onClick={(e: React.MouseEvent) => isSelectionMode ? handleTemplateSelect(template.id, e) : handleTemplateClick(template.id)}
              >
                {isSelectionMode && (
                  <div
                    className="absolute top-2 left-2 w-4 h-4 rounded border border-input bg-background"
                    onClick={(e) => handleTemplateSelect(template.id, e)}
                  >
                    {selectedTemplates.has(template.id) && (
                      <div className="w-full h-full bg-primary" />
                    )}
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-medium">{template.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={(e) => handleTemplateAction('edit', template.id, e)}>
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleTemplateAction('duplicate', template.id, e)}>
                          複製
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleTemplateAction('archive', template.id, e)}>
                          アーカイブ
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => handleTemplateAction('delete', template.id, e)}
                        >
                          削除
                        </DropdownMenuItem>
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
                        {parsedSettings?.strategy?.mode === 'ai_auto' ? 'AI自動生成' : '手動'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>作成日: {template.created_at ? new Date(template.created_at).toLocaleDateString() : '未設定'}</p>
                      <p>更新日: {template.updated_at ? new Date(template.updated_at).toLocaleDateString() : '未設定'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateTemplateDialog
        open={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onTemplateCreated={handleTemplateCreated}
      />
    </div>
  );
} 