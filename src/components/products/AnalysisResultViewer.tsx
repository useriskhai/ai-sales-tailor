import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AnalysisResult } from '@/types/analysis';

interface AnalysisResultViewerProps {
  result: AnalysisResult;
  onEdit?: (field: keyof AnalysisResult, value: any) => void;
}

export function AnalysisResultViewer({ result, onEdit }: AnalysisResultViewerProps) {
  return (
    <div className="space-y-6">
      {/* USPセクション */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">USP（主要な価値提案）</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{result.usp}</p>
        </CardContent>
      </Card>

      {/* 製品概要セクション */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">製品概要</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{result.description}</p>
        </CardContent>
      </Card>

      {/* 課題セクション */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">課題</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{result.challenges}</p>
        </CardContent>
      </Card>

      {/* 解決策セクション */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">解決策</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] pr-4">
            <ul className="space-y-2">
              {result.solutions.map((solution, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-1 shrink-0">
                    {index + 1}
                  </Badge>
                  <p className="text-gray-700">{solution}</p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* メリットセクション */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">導入効果</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] pr-4">
            <ul className="space-y-2">
              {result.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-1 shrink-0">
                    {index + 1}
                  </Badge>
                  <p className="text-gray-700">{benefit}</p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 導入事例セクション */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">導入事例</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-6">
              {result.case_studies.map((caseStudy, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <p className="text-gray-700">{caseStudy}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 