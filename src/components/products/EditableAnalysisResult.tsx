import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { AnalysisResult } from '@/types/analysis';
import { PencilIcon, CheckIcon, XIcon } from 'lucide-react';

interface EditableAnalysisResultProps {
  result: AnalysisResult;
  onSave: (updatedResult: AnalysisResult) => void;
}

export function EditableAnalysisResult({ result, onSave }: EditableAnalysisResultProps) {
  const [editMode, setEditMode] = useState<keyof AnalysisResult | null>(null);
  const [editedValue, setEditedValue] = useState<any>(null);

  const handleEdit = (field: keyof AnalysisResult) => {
    setEditMode(field);
    setEditedValue(result[field]);
  };

  const handleSave = () => {
    if (editMode && editedValue !== null) {
      onSave({
        ...result,
        [editMode]: editedValue
      });
      setEditMode(null);
      setEditedValue(null);
    }
  };

  const handleCancel = () => {
    setEditMode(null);
    setEditedValue(null);
  };

  const renderEditableField = (field: keyof AnalysisResult, value: any, type: 'text' | 'textarea' | 'array') => {
    if (editMode === field) {
      return (
        <div className="space-y-2">
          {type === 'textarea' ? (
            <Textarea
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              className="min-h-[100px]"
            />
          ) : type === 'array' ? (
            <div className="space-y-2">
              {(editedValue as string[]).map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newValue = [...editedValue];
                      newValue[index] = e.target.value;
                      setEditedValue(newValue);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newValue = editedValue.filter((_: any, i: number) => i !== index);
                      setEditedValue(newValue);
                    }}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => setEditedValue([...editedValue, ''])}
              >
                項目を追加
              </Button>
            </div>
          ) : (
            <Input
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
            />
          )}
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">
              <CheckIcon className="h-4 w-4 mr-1" />
              保存
            </Button>
            <Button onClick={handleCancel} variant="ghost" size="sm">
              <XIcon className="h-4 w-4 mr-1" />
              キャンセル
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="group relative">
        {type === 'array' ? (
          <ul className="space-y-2">
            {(value as string[]).map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1 shrink-0">
                  {index + 1}
                </Badge>
                <p className="text-gray-700">{item}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700 whitespace-pre-wrap">{value}</p>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleEdit(field)}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* USPセクション */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">USP（主要な価値提案）</CardTitle>
        </CardHeader>
        <CardContent>
          {renderEditableField('usp', result.usp, 'text')}
        </CardContent>
      </Card>

      {/* 製品概要セクション */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">製品概要</CardTitle>
        </CardHeader>
        <CardContent>
          {renderEditableField('description', result.description, 'textarea')}
        </CardContent>
      </Card>

      {/* 課題セクション */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">課題</CardTitle>
        </CardHeader>
        <CardContent>
          {renderEditableField('challenges', result.challenges, 'textarea')}
        </CardContent>
      </Card>

      {/* 解決策セクション */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">解決策</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] pr-4">
            {renderEditableField('solutions', result.solutions, 'array')}
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
            {renderEditableField('benefits', result.benefits, 'array')}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 導入事例セクション */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">導入事例</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] pr-4">
            {renderEditableField('case_studies', result.case_studies, 'array')}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 