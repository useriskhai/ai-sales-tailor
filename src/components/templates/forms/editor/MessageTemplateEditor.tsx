import React from 'react';
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Variable {
  key: string;
  label: string;
}

interface VariableGroup {
  title: string;
  variables: Variable[];
}

const VARIABLE_GROUPS: VariableGroup[] = [
  {
    title: '会社情報',
    variables: [
      { key: 'company_name', label: '会社名' },
      { key: 'company_description', label: '会社の説明' },
      { key: 'company_url', label: '会社のURL' },
      { key: 'industry', label: '業界' },
    ],
  },
  {
    title: 'ユーザー情報',
    variables: [
      { key: 'user_name', label: 'ユーザー名' },
      { key: 'user_company', label: 'ユーザーの所属会社' },
      { key: 'user_profile', label: 'プロフィール情報' },
    ],
  },
  {
    title: '製品情報',
    variables: [
      { key: 'product_name', label: '製品名' },
      { key: 'product_description', label: '製品の説明' },
    ],
  },
  {
    title: 'メタデータ',
    variables: [
      { key: 'created_at', label: '作成日時' },
      { key: 'updated_at', label: '更新日時' },
      { key: 'category', label: 'カテゴリ' },
    ],
  },
];

interface MessageTemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MessageTemplateEditor: React.FC<MessageTemplateEditorProps> = ({
  value,
  onChange,
}) => {
  const handleInsertVariable = (key: string) => {
    const variable = `{{${key}}}`;
    const cursorPosition = (document.activeElement as HTMLTextAreaElement)?.selectionStart || value.length;
    const newValue = 
      value.slice(0, cursorPosition) +
      variable +
      value.slice(cursorPosition);
    
    onChange(newValue);
  };

  const handleCopyVariable = (key: string) => {
    navigator.clipboard.writeText(`{{${key}}}`);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="変数を使用して動的なメッセージを作成できます"
          rows={10}
        />
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">利用可能な変数</h4>
          {VARIABLE_GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <p className="text-sm text-muted-foreground">{group.title}</p>
              <div className="flex flex-wrap gap-2">
                {group.variables.map((variable) => (
                  <div
                    key={variable.key}
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-primary text-primary hover:bg-primary/10"
                  >
                    <button
                      type="button"
                      className="mr-1.5"
                      onClick={() => handleInsertVariable(variable.key)}
                    >
                      {variable.label}
                    </button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => handleCopyVariable(variable.key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>変数をコピー</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-sm text-muted-foreground">
            変数をクリックしてテンプレートに挿入、またはコピーアイコンをクリックしてクリップボードにコピーできます
          </p>
        </div>
      </Card>
    </div>
  );
}; 