"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTemplateAnalytics } from "@/hooks/useTemplateAnalytics";
import { useTemplate } from "@/hooks/useTemplate";
import { Template } from "@/types/template";
import { mockTemplates } from "@/data/mockData"; // モックデータをインポート
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  Filter,
  TrendingUp,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart2
} from "lucide-react";

interface TemplateSelectionProps {
  onSelect: (template: Template) => void;
  selectedTemplate?: Template;
}

export function TemplateSelection({ onSelect, selectedTemplate }: TemplateSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'success_rate' | 'usage' | 'recent'>('success_rate');
  const [filteredTemplates, setFilteredTemplates] = useState(mockTemplates);

  useEffect(() => {
    filterAndSortTemplates();
  }, [searchTerm, selectedCategory, sortBy]);

  const filterAndSortTemplates = () => {
    let filtered = [...mockTemplates];

    // 検索フィルター
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term)
      );
    }

    // カテゴリーフィルター
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'success_rate':
          return (b.metrics?.successRate || 0) - (a.metrics?.successRate || 0);
        case 'usage':
          return (b.usage_count || 0) - (a.usage_count || 0);
        case 'recent':
          return new Date(b.updated_at || b.created_at || '').getTime() -
                 new Date(a.updated_at || a.created_at || '').getTime();
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>テンプレートの選択</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 検索とフィルター */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="テンプレートを検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="カテゴリー" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="new-client-acquisition">新規開拓</SelectItem>
                <SelectItem value="proposal">提案</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(value: 'success_rate' | 'usage' | 'recent') => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px]">
                <BarChart2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="並び替え" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="success_rate">成功率順</SelectItem>
                <SelectItem value="usage">使用回数順</SelectItem>
                <SelectItem value="recent">最近の使用順</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* テンプレートリスト */}
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                    selectedTemplate?.id === template.id ? 'border-primary' : ''
                  }`}
                  onClick={() => onSelect(template)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                    {template.recommended && (
                      <Badge variant="secondary">
                        <Star className="w-3 h-3 mr-1" />
                        おすすめ
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">成功率</p>
                      <p className="font-medium">
                        {template.metrics?.successRate ? 
                          `${(template.metrics.successRate * 100).toFixed(1)}%` : 
                          '未測定'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">使用回数</p>
                      <p className="font-medium">{template.usage_count}回</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">平均処理時間</p>
                      <p className="font-medium">{template.metrics?.averageProcessingTime ? 
                        `${template.metrics.averageProcessingTime.toFixed(1)}秒` : 
                        '未測定'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {template.tags?.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
} 