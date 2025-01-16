"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BatchJob } from "@/types/batchJob";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Target,
  Settings
} from "lucide-react";

interface AIAnalysisProps {
  job?: BatchJob | null;
}

export function AIAnalysis({ job }: AIAnalysisProps) {
  if (!job) return null;

  // デフォルト値を設定
  const analysis = job.ai_analysis || {
    quality_score: 0,
    efficiency_score: 0,
    optimization_score: 0,
    key_findings: [],
    improvement_opportunities: [],
    recommended_actions: []
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5" />
          <span>AI分析結果</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* パフォーマンススコア */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">品質スコア</span>
              <Badge variant={analysis.quality_score > 80 ? "success" : "warning"}>
                {analysis.quality_score}/100
              </Badge>
            </div>
            <Progress value={analysis.quality_score} className="h-2" />
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">効率スコア</span>
              <Badge variant={analysis.efficiency_score > 80 ? "success" : "warning"}>
                {analysis.efficiency_score}/100
              </Badge>
            </div>
            <Progress value={analysis.efficiency_score} className="h-2" />
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">最適化スコア</span>
              <Badge variant={analysis.optimization_score > 80 ? "success" : "warning"}>
                {analysis.optimization_score}/100
              </Badge>
            </div>
            <Progress value={analysis.optimization_score} className="h-2" />
          </div>
        </div>

        {/* 主要な発見 */}
        <div>
          <h3 className="text-sm font-medium mb-3">主要な発見</h3>
          <div className="space-y-3">
            {analysis.key_findings.map((finding, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  finding.type === 'success' ? 'bg-green-50' :
                  finding.type === 'warning' ? 'bg-yellow-50' :
                  finding.type === 'info' ? 'bg-blue-50' :
                  'bg-red-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {finding.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : finding.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  ) : finding.type === 'info' ? (
                    <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{finding.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {finding.description}
                    </p>
                    {finding.metrics && (
                      <div className="flex items-center space-x-4 mt-2">
                        {finding.metrics.map((metric, i) => (
                          <div key={i} className="flex items-center space-x-1">
                            <span className="text-sm text-muted-foreground">
                              {metric.label}:
                            </span>
                            <span className="text-sm font-medium">
                              {metric.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 改善機会 */}
        <div>
          <h3 className="text-sm font-medium mb-3">改善機会</h3>
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {analysis.improvement_opportunities.map((opportunity, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{opportunity.title}</span>
                    </div>
                    <Badge variant="outline">
                      期待改善率: +{opportunity.expected_improvement}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {opportunity.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-muted-foreground">
                      影響範囲: {opportunity.impact_scope}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      実装難易度: {opportunity.implementation_difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* 推奨アクション */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-3">推奨アクション</h3>
          <div className="grid grid-cols-2 gap-4">
            {analysis.recommended_actions.map((action, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-2 mb-2">
                  {action.category === 'template' ? (
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                  ) : action.category === 'targeting' ? (
                    <Target className="w-4 h-4 text-green-500" />
                  ) : (
                    <Settings className="w-4 h-4 text-purple-500" />
                  )}
                  <span className="font-medium">{action.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    優先度: {action.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 