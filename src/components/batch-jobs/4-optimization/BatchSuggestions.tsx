"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BatchJob } from "@/types/batchJob";
import {
  Lightbulb,
  ArrowRight,
  Target,
  Users,
  Calendar,
  Settings,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface BatchSuggestionsProps {
  job?: BatchJob | null;
}

export function BatchSuggestions({ job }: BatchSuggestionsProps) {
  if (!job) return null;

  // デフォルト値を設定
  const suggestions = job.suggestions || {
    targeting: {
      expected_improvement: 0,
      recommendations: []
    },
    scheduling: {
      expected_improvement: 0,
      recommendations: []
    },
    content: {
      expected_improvement: 0,
      recommendations: []
    },
    implementation_order: []
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5" />
          <span>次回バッチへの提案</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* カテゴリー別の提案 */}
        <Accordion type="single" collapsible>
          {/* ターゲティング改善 */}
          <AccordionItem value="targeting">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>ターゲティングの改善</span>
                <Badge variant="secondary" className="ml-2">
                  期待改善率: +{suggestions.targeting.expected_improvement}%
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4">
                  {suggestions.targeting.recommendations.map((rec, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{rec.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {rec.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          影響度: {rec.impact_score}/10
                        </Badge>
                        <Button variant="ghost" size="sm">
                          適用 <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* スケジューリング最適化 */}
          <AccordionItem value="scheduling">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>スケジューリング最適化</span>
                <Badge variant="secondary" className="ml-2">
                  期待改善率: +{suggestions.scheduling.expected_improvement}%
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 p-4">
                {suggestions.scheduling.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Settings className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">{rec.title}</span>
                      </div>
                      <Badge variant="outline">
                        優先度: {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rec.description}
                    </p>
                    {rec.metrics && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {rec.metrics.map((metric, i) => (
                          <div key={i} className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <TrendingUp className="w-3 h-3" />
                            <span>{metric.label}: {metric.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* コンテンツ改善 */}
          <AccordionItem value="content">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>コンテンツ改善</span>
                <Badge variant="secondary" className="ml-2">
                  期待改善率: +{suggestions.content.expected_improvement}%
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 p-4">
                <ScrollArea className="h-[300px]">
                  {suggestions.content.recommendations.map((rec, index) => (
                    <div key={index} className="p-4 border rounded-lg mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{rec.title}</span>
                        <Badge variant={rec.type === 'critical' ? 'destructive' : 'default'}>
                          {rec.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {rec.description}
                      </p>
                      {rec.examples && (
                        <div className="bg-muted p-3 rounded-lg text-sm">
                          <p className="font-medium mb-2">改善例:</p>
                          <div className="space-y-2">
                            {rec.examples.map((example, i) => (
                              <div key={i}>
                                <p className="text-muted-foreground">変更前:</p>
                                <p className="mb-1">{example.before}</p>
                                <p className="text-muted-foreground">変更後:</p>
                                <p>{example.after}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* 実装の優先順位 */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-3">実装の優先順位</h3>
          <div className="space-y-3">
            {suggestions.implementation_order.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    {index + 1}
                  </div>
                  <span>{item.title}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">
                    期待改善率: +{item.expected_improvement}%
                  </Badge>
                  <Badge variant="outline">
                    実装難易度: {item.implementation_difficulty}
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