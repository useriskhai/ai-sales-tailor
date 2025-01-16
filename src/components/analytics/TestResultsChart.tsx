"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Crown, ArrowUp, ArrowDown } from "lucide-react";

interface TestResultsChartProps {
  testResults: {
    testId: string;
    startDate: string;
    endDate: string;
    variants: {
      id: string;
      metrics: {
        [key: string]: number;
      };
      improvement: number;
      confidence: number;
      isWinner: boolean;
    }[];
    statisticalSignificance: number;
    recommendations: string[];
  };
}

export function TestResultsChart({ testResults }: TestResultsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>A/Bテスト結果</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* テスト期間 */}
          <div>
            <p className="text-sm text-muted-foreground">
              テスト期間: {new Date(testResults.startDate).toLocaleDateString()} - {new Date(testResults.endDate).toLocaleDateString()}
            </p>
          </div>

          {/* バリアント結果 */}
          <div className="space-y-4">
            {testResults.variants.map((variant) => (
              <div
                key={variant.id}
                className={`p-4 rounded-lg border ${
                  variant.isWinner ? 'bg-green-50 border-green-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">バリアント {variant.id}</h4>
                    {variant.isWinner && (
                      <Badge className="bg-green-100 text-green-800">
                        <Crown className="w-4 h-4 mr-1" />
                        勝者
                      </Badge>
                    )}
                  </div>
                  <Badge variant={variant.improvement > 0 ? "success" : "destructive"}>
                    <span className="flex items-center">
                      {variant.improvement > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                      {Math.abs(variant.improvement * 100).toFixed(1)}%
                    </span>
                  </Badge>
                </div>

                <div className="space-y-3">
                  {Object.entries(variant.metrics).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium">{(value * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={value * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 統計的有意性 */}
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-blue-600">
              信頼度: {(testResults.statisticalSignificance * 100).toFixed(1)}%
            </Badge>
          </div>

          {/* 推奨事項 */}
          {testResults.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">推奨アクション</h4>
              <ul className="space-y-2">
                {testResults.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 