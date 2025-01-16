import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface CustomSettingsData {
  contentFocus: 'benefit' | 'technical' | 'case-study' | 'roi' | 'relationship';
  customInstructions: string;
}

interface CustomSettingsFormProps {
  data: CustomSettingsData;
  onChange: (data: CustomSettingsData) => void;
}

const CONTENT_FOCUS = [
  { value: 'benefit', label: '利点重視' },
  { value: 'technical', label: '技術的詳細' },
  { value: 'case-study', label: '事例重視' },
  { value: 'roi', label: 'ROI重視' },
  { value: 'relationship', label: '関係構築重視' },
];

export const CustomSettingsForm: React.FC<CustomSettingsFormProps> = ({
  data,
  onChange,
}) => {
  const handleChange = (field: keyof CustomSettingsData) => (value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>コンテンツフォーカス</Label>
        <Select
          value={data.contentFocus}
          onValueChange={handleChange('contentFocus')}
        >
          <SelectTrigger>
            <SelectValue placeholder="コンテンツフォーカスを選択" />
          </SelectTrigger>
          <SelectContent>
            {CONTENT_FOCUS.map((focus) => (
              <SelectItem key={focus.value} value={focus.value}>
                {focus.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          メッセージの主な焦点を設定します
        </p>
      </div>

      <div className="space-y-2">
        <Label>カスタム指示</Label>
        <Textarea
          value={data.customInstructions}
          onChange={(e) => handleChange('customInstructions')(e.target.value)}
          placeholder="AIアシスタントへの詳細な指示を入力してください"
          rows={6}
        />
        <p className="text-sm text-muted-foreground">
          AIアシスタントの振る舞い、制約、特別な指示などを記述できます
        </p>
      </div>
    </div>
  );
}; 