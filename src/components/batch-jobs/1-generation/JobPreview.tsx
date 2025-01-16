"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { usePreviewGeneration } from "@/hooks/usePreviewGeneration";
import { useToast } from "@/components/ui/use-toast";
import { Template } from '@/types/template';
import { Company } from '@/types/company';

interface JobPreviewProps {
  template: Template;
  targets: Company[];
  onApprove: () => void;
  onRegenerate: () => void;
  onEdit: () => void;
}

export function JobPreview({
  template,
  targets,
  onApprove,
  onRegenerate,
  onEdit
}: JobPreviewProps) {
  const [selectedTarget, setSelectedTarget] = useState(targets[0]);
  const [previews, setPreviews] = useState<any[]>([]);
  const { generatePreviews, isGenerating, progress } = usePreviewGeneration();
  const { toast } = useToast();

  useEffect(() => {
    const initializePreviews = async () => {
      try {
        // 最初の3件のみプレビュー生成
        const previewResults = await generatePreviews(template, targets.slice(0, 3));
        setPreviews(previewResults);

        toast({
          title: "プレビュー生成完了",
          description: "残りのコンテンツは順次生成されます",
        });
      } catch (error) {
        toast({
          title: "エラー",
          description: "プレビューの生成に失敗しました",
          variant: "destructive",
        });
      }
    };

    initializePreviews();
  }, [template, targets]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            セールスレタープレビュー
            {isGenerating && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                生成中... {progress.toFixed(0)}%
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            {/* ターゲットリスト */}
            <div className="w-1/3">
              <ScrollArea className="h-[500px]">
                {targets.map((target) => (
                  <div
                    key={target.id}
                    className={`p-4 cursor-pointer rounded-lg mb-2 ${
                      selectedTarget.id === target.id ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedTarget(target)}
                  >
                    <h3 className="font-medium">{target.name}</h3>
                    <p className="text-sm text-muted-foreground">{target.industry}</p>
                  </div>
                ))}
              </ScrollArea>
            </div>

            {/* プレビュー */}
            <div className="flex-1">
              <Tabs defaultValue="preview">
                <TabsList>
                  <TabsTrigger value="preview">プレビュー</TabsTrigger>
                  <TabsTrigger value="analysis">分析</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="mb-4">
                      <Badge>自動生成</Badge>
                    </div>
                    <div className="prose max-w-none">
                      <p>
                        {selectedTarget.name}様<br /><br />
                        {/* 生成されたコンテンツ */}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={onEdit}>
                      編集
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onRegenerate}
                      disabled={isGenerating}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      再生成
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  {/* 分析結果 */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-medium mb-2">品質スコア</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-green-500">92</span>
                          <Check className="w-4 h-4 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-medium mb-2">リスク評価</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-yellow-500">低</span>
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => {}}>
          戻る
        </Button>
        <Button onClick={onApprove}>
          <Check className="w-4 h-4 mr-2" />
          承認して作成
        </Button>
      </div>
    </div>
  );
} 