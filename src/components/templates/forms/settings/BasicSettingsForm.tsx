import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Strategy, ToneOfVoice, MessageStrategyConfig } from '@/types/template';

interface BasicSettingsData {
  strategy: Strategy;
  toneOfVoice: ToneOfVoice;
  maxLength: 300 | 400 | 500 | 600 | 800;
  useEmoji: boolean;
}

interface BasicSettingsFormProps {
  data: BasicSettingsData;
  onChange: (data: BasicSettingsData) => void;
}

// MessageStrategyConfigから選択肢を生成
const STRATEGIES = Object.entries(MessageStrategyConfig.strategy).map(([value, label]) => ({
  value: value as Strategy,
  label,
}));

const TONES = Object.entries(MessageStrategyConfig.tone).map(([value, label]) => ({
  value: value as ToneOfVoice,
  label,
}));

const MAX_LENGTHS = [
  { value: 300, label: '300文字（簡潔なフォーム向け）' },
  { value: 400, label: '400文字（標準的なメール向け）' },
  { value: 500, label: '500文字（詳細な説明向け）' },
  { value: 600, label: '600文字（提案書形式向け）' },
  { value: 800, label: '800文字（詳細な提案向け）' },
];

export const BasicSettingsForm: React.FC<BasicSettingsFormProps> = ({
  data,
  onChange,
}) => {
  const handleSelectChange = (field: keyof BasicSettingsData) => (value: string) => {
    onChange({
      ...data,
      [field]: field === 'maxLength' ? parseInt(value, 10) : value,
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    onChange({
      ...data,
      useEmoji: checked,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>戦略</Label>
        <Select
          value={data.strategy}
          onValueChange={handleSelectChange('strategy')}
        >
          <SelectTrigger>
            <SelectValue placeholder="戦略を選択" />
          </SelectTrigger>
          <SelectContent>
            {STRATEGIES.map((strategy) => (
              <SelectItem key={strategy.value} value={strategy.value}>
                {strategy.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          メッセージの基本的なアプローチ方法を選択します
        </p>
      </div>

      <div className="space-y-2">
        <Label>トーン</Label>
        <Select
          value={data.toneOfVoice}
          onValueChange={handleSelectChange('toneOfVoice')}
        >
          <SelectTrigger>
            <SelectValue placeholder="トーンを選択" />
          </SelectTrigger>
          <SelectContent>
            {TONES.map((tone) => (
              <SelectItem key={tone.value} value={tone.value}>
                {tone.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          メッセージの話し方や雰囲気を設定します
        </p>
      </div>

      <div className="space-y-2">
        <Label>最大文字数</Label>
        <Select
          value={data.maxLength.toString()}
          onValueChange={handleSelectChange('maxLength')}
        >
          <SelectTrigger>
            <SelectValue placeholder="最大文字数を選択" />
          </SelectTrigger>
          <SelectContent>
            {MAX_LENGTHS.map((length) => (
              <SelectItem key={length.value} value={length.value.toString()}>
                {length.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          生成されるメッセージの最大文字数を設定します
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="use-emoji">絵文字を使用</Label>
          <Switch
            id="use-emoji"
            checked={data.useEmoji}
            onCheckedChange={handleSwitchChange}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          メッセージに適切な絵文字を自動的に追加します
        </p>
      </div>
    </div>
  );
}; 