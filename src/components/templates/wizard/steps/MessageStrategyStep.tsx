import React, { useState } from 'react';
import { TemplateSettingsMode } from '@/components/templates/shared/TemplateSettingsMode';
import { BasicSettingsForm } from '@/components/templates/forms/settings/BasicSettingsForm';
import { CustomSettingsForm, CustomSettingsData } from '@/components/templates/forms/settings/CustomSettingsForm';
import { MessageTemplateEditor } from '@/components/templates/forms/editor/MessageTemplateEditor';
import { Separator } from "@/components/ui/separator";

export interface MessageStrategyData {
  mode: 'ai_auto' | 'manual';
  // 基本設定（両モード共通）
  strategy: 'benefit-first' | 'problem-solution' | 'story-telling' | 'direct-offer';
  toneOfVoice: 'formal' | 'professional' | 'friendly' | 'casual';
  maxLength: 300 | 400 | 500 | 600 | 800;
  useEmoji: boolean;
  
  // 詳細設定（手動モード）
  contentFocus?: 'benefit' | 'technical' | 'case-study' | 'roi' | 'relationship';
  customInstructions?: string;
  messageTemplate?: string;
}

interface MessageStrategyStepProps {
  data: MessageStrategyData;
  onSave: (data: MessageStrategyData) => void;
}

export const MessageStrategyStep: React.FC<MessageStrategyStepProps> = ({
  data,
  onSave,
}) => {
  const [formData, setFormData] = useState<MessageStrategyData>(data);

  const handleModeChange = (mode: 'ai_auto' | 'manual') => {
    const newData = {
      ...formData,
      mode,
      // 手動モードの場合は既存の値を保持、AIおまかせモードの場合はリセット
      ...(mode === 'ai_auto' && {
        contentFocus: undefined,
        customInstructions: undefined,
        messageTemplate: undefined,
      }),
    };
    setFormData(newData);
    onSave(newData);
  };

  const handleBasicSettingsChange = (basicSettings: {
    strategy: 'benefit-first' | 'problem-solution' | 'story-telling' | 'direct-offer';
    toneOfVoice: 'formal' | 'professional' | 'friendly' | 'casual';
    maxLength: 300 | 400 | 500 | 600 | 800;
    useEmoji: boolean;
  }) => {
    const newData = {
      ...formData,
      ...basicSettings,
    };
    setFormData(newData);
    onSave(newData);
  };

  const handleCustomSettingsChange = (customSettings: CustomSettingsData) => {
    const newData = {
      ...formData,
      contentFocus: customSettings.contentFocus,
      customInstructions: customSettings.customInstructions,
    };
    setFormData(newData);
    onSave(newData);
  };

  const handleMessageTemplateChange = (messageTemplate: string) => {
    const newData = {
      ...formData,
      messageTemplate,
    };
    setFormData(newData);
    onSave(newData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">メッセージ戦略</h2>
        <p className="text-sm text-muted-foreground">
          メッセージの生成方法と戦略を設定します
        </p>
      </div>

      <TemplateSettingsMode
        mode={formData.mode}
        onChange={handleModeChange}
      />

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">基本設定</h3>
          <BasicSettingsForm
            data={{
              strategy: formData.strategy,
              toneOfVoice: formData.toneOfVoice,
              maxLength: formData.maxLength,
              useEmoji: formData.useEmoji,
            }}
            onChange={handleBasicSettingsChange}
          />
        </div>
      </div>

      {formData.mode === 'manual' && (
        <>
          <Separator />
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">詳細設定</h3>
              <CustomSettingsForm
                data={{
                  contentFocus: formData.contentFocus || 'benefit',
                  customInstructions: formData.customInstructions || '',
                }}
                onChange={handleCustomSettingsChange}
              />
            </div>
          </div>

          <Separator />
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">メッセージテンプレート</h3>
              <MessageTemplateEditor
                value={formData.messageTemplate || ''}
                onChange={handleMessageTemplateChange}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 