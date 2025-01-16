import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category, CATEGORY_LABELS } from '../../../types/template';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 各ステップコンポーネントのインポート
import { BasicInfoStep, type BasicInfoData } from '@/components/templates/wizard/steps/BasicInfoStep';
import { MessageStrategyStep, type MessageStrategyData } from '@/components/templates/wizard/steps/MessageStrategyStep';
import { ExecutionSettingsStep, type ExecutionSettingsData } from '@/components/templates/wizard/steps/ExecutionSettingsStep';
import { KPISettingsStep, type KPISettingsData } from './steps/KPISettingsStep';

export interface TemplateData {
  basicInfo: BasicInfoData;
  messageStrategy: MessageStrategyData;
  executionSettings: ExecutionSettingsData;
  kpiSettings: KPISettingsData;
}

interface CreateTemplateWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TemplateData) => void;
}

const steps = [
  'テンプレート基本情報',
  'メッセージ戦略',
  '実行設定',
  'KPI設定',
];

const defaultTemplateData = {
  basicInfo: {
    name: '',
    category: 'new-client-acquisition' as Category,
  },
  messageStrategy: {
    mode: 'ai_auto',
    strategy: 'benefit-first',
    toneOfVoice: 'professional',
    maxLength: 400,
    useEmoji: false,
  },
  executionSettings: {
    execution_priority: 'balanced',
  },
  kpiSettings: {
    metrics: [],
    evaluationPeriod: 30,
  },
};

export const CreateTemplateWizard: React.FC<CreateTemplateWizardProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [templateData, setTemplateData] = useState<TemplateData>({
    basicInfo: {
      name: '',
      description: '',
      category: 'new-client-acquisition',
      tags: [],
      target_industry: '',
    },
    messageStrategy: {
      mode: 'ai_auto',
      strategy: 'benefit-first',
      toneOfVoice: 'professional',
      maxLength: 400,
      useEmoji: false,
    },
    executionSettings: {
      execution_priority: 'balanced',
    },
    kpiSettings: {
      metrics: [],
      evaluationPeriod: 30,
    },
  });

  useEffect(() => {
    console.log('[CreateTemplateWizard] Template data updated:', {
      category: {
        value: templateData.basicInfo.category,
        label: CATEGORY_LABELS[templateData.basicInfo.category],
        isValid: Object.keys(CATEGORY_LABELS).includes(templateData.basicInfo.category),
      }
    });
  }, [templateData.basicInfo.category]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSave = async () => {
    try {
      await onSave(templateData);
    } catch (error) {
      // エラーは上位コンポーネントで処理されるため、ここでは何もしない
    }
  };

  const updateTemplateData = (key: keyof TemplateData, value: any) => {
    setTemplateData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <BasicInfoStep
            data={templateData.basicInfo}
            onSave={(data) => updateTemplateData('basicInfo', data)}
          />
        );
      case 1:
        return (
          <MessageStrategyStep
            data={templateData.messageStrategy}
            onSave={(data) => updateTemplateData('messageStrategy', data)}
          />
        );
      case 2:
        return (
          <ExecutionSettingsStep
            data={templateData.executionSettings}
            onSave={(data) => updateTemplateData('executionSettings', data)}
          />
        );
      case 3:
        return (
          <KPISettingsStep
            data={templateData.kpiSettings}
            onSave={(data) => updateTemplateData('kpiSettings', data)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>テンプレートの作成</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="w-full flex-1 overflow-y-auto">
          <div className="flex justify-center mb-8">
            {steps.map((label, index) => (
              <div
                key={label}
                className="flex items-center"
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2",
                    activeStep === index
                      ? "border-primary bg-primary text-primary-foreground"
                      : activeStep > index
                      ? "border-primary bg-primary/20"
                      : "border-muted"
                  )}
                >
                  {activeStep > index ? "✓" : index + 1}
                </div>
                <div
                  className={cn(
                    "text-sm mx-2",
                    activeStep === index
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-12 h-0.5",
                      activeStep > index ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">{renderStepContent(activeStep)}</div>
        </div>

        <div className="flex justify-between mt-8 border-t pt-4">
          <Button
            variant="outline"
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            戻る
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button onClick={handleSave}>
                保存
              </Button>
            ) : (
              <Button onClick={handleNext}>
                次へ
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 