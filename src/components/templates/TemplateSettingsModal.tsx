import { useState } from 'react';
import { Template, Strategy, ToneOfVoice, ContentFocus, MessageStrategyConfig } from '@/types/template';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Props {
  template: Template;
  onSettingsChange: (settings: any) => void;
}

// MessageStrategyConfigから選択肢を生成
const STRATEGY_OPTIONS = Object.entries(MessageStrategyConfig.strategy).map(([value, label]) => ({
  value: value as Strategy,
  label,
}));

const TONE_OPTIONS = Object.entries(MessageStrategyConfig.tone).map(([value, label]) => ({
  value: value as ToneOfVoice,
  label,
}));

const MAX_LENGTH_OPTIONS = [
  { value: 300, label: '300文字' },
  { value: 400, label: '400文字' },
  { value: 500, label: '500文字' },
  { value: 600, label: '600文字' },
  { value: 800, label: '800文字' },
];

const FOCUS_OPTIONS = Object.entries(MessageStrategyConfig.focus).map(([value, label]) => ({
  value: value as ContentFocus,
  label,
}));

export function TemplateSettingsModal({ template, onSettingsChange }: Props) {
  const content = JSON.parse(template.content);
  const [settings, setSettings] = useState(content);
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (section: string, field: string, value: any): string | null => {
    switch (field) {
      case 'maxLength':
        if (typeof value !== 'number' || value < 1) {
          return '1以上の数値を入力してください';
        }
        break;
    }
    return null;
  };

  const handleChange = (section: string, field: string, value: any) => {
    const error = validateField(section, field, value);
    setErrors(prev => ({
      ...prev,
      [`${section}.${field}`]: error || '',
    }));

    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    ['maxLength'].forEach(field => {
      const error = validateField('strategy', field, settings.strategy[field]);
      if (error) {
        newErrors[`strategy.${field}`] = error;
        hasError = true;
      }
    });

    setErrors(newErrors);

    if (hasError) {
      toast({
        title: 'エラー',
        description: '入力内容を確認してください',
        variant: 'destructive',
      });
      return;
    }

    onSettingsChange(settings);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">設定を変更</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">テンプレート設定の一時的な変更</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">生成モード</Label>
                  <Select
                    value={settings.strategy.mode}
                    onValueChange={(value) => handleChange('strategy', 'mode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="モードを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai_auto">AI自動選択</SelectItem>
                      <SelectItem value="manual">手動選択</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {settings.strategy.mode === 'ai_auto' ? 
                      'AIが最適な戦略とトーンを自動的に選択します' : 
                      '戦略とトーンを手動で設定します'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold mb-4">基本設定</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>戦略</Label>
                      <Select
                        value={settings.strategy.strategy}
                        onValueChange={(value) => handleChange('strategy', 'strategy', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="戦略を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {STRATEGY_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>トーン</Label>
                      <Select
                        value={settings.strategy.toneOfVoice}
                        onValueChange={(value) => handleChange('strategy', 'toneOfVoice', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="トーンを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {TONE_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>最大文字数</Label>
                      <Select
                        value={settings.strategy.maxLength.toString()}
                        onValueChange={(value) => handleChange('strategy', 'maxLength', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="文字数を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {MAX_LENGTH_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>絵文字</Label>
                      <Select
                        value={settings.strategy.useEmoji.toString()}
                        onValueChange={(value) => handleChange('strategy', 'useEmoji', value === 'true')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="絵文字の使用" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">使用する</SelectItem>
                          <SelectItem value="false">使用しない</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {settings.strategy.mode === 'manual' && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="text-base font-semibold mb-4">詳細設定</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>コンテンツフォーカス</Label>
                          <Select
                            value={settings.strategy.contentFocus}
                            onValueChange={(value) => handleChange('strategy', 'contentFocus', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="フォーカスを選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {FOCUS_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>カスタム指示</Label>
                          <Textarea
                            value={settings.strategy.customInstructions}
                            onChange={(e) => handleChange('strategy', 'customInstructions', e.target.value)}
                            placeholder="AIへの具体的な指示を入力してください"
                            rows={3}
                            className="resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave}>
              変更を適用
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 