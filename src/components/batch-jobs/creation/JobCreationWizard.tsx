"use client";

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Template } from "@/types/template";
import { SendingGroup } from "@/types/sendingGroup";
import { Product } from "@/types/product";
import { JobConfig } from "@/types/batchJob";
import {
  Steps,
  StepsContent,
  StepsHeader,
  StepsItem,
} from "@/components/ui/steps";
import { FileText, Users, Package, Settings, Eye, ArrowLeft, CheckCircle2 } from "lucide-react";
import { TemplateSelection } from './TemplateSelection';
import { SendingGroupSelection } from './SendingGroupSelection';
import { ProductSelection } from './ProductSelection';
import { BatchSettings } from './BatchSettings';
import { JobPreview } from './JobPreview';

interface JobCreationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export type Step = 'template' | 'group' | 'product' | 'settings' | 'preview';

export function JobCreationWizard({ onComplete, onCancel }: JobCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('template');
  const [jobConfig, setJobConfig] = useState<JobConfig>({});
  const { toast } = useToast();

  const steps: Step[] = ['template', 'group', 'product', 'settings', 'preview'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleConfirm = async () => {
    try {
      // ここでバッチジョブの作成APIを呼び出す
      toast({
        title: "成功",
        description: "バッチジョブが作成されました",
      });
      onComplete();
    } catch (error) {
      toast({
        title: "エラー",
        description: "バッチジョブの作成に失敗しました",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* プログレスバー */}
      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ステップインジケーター */}
      <StepsHeader>
        <StepsItem
          icon={FileText}
          title="テンプレート選択"
          description="メッセージテンプレートを選択"
          isActive={currentStep === 'template'}
          isCompleted={!!jobConfig.template}
        />
        <StepsItem
          icon={Users}
          title="送信グループ"
          description="送信先グループの選択"
          isActive={currentStep === 'group'}
          isCompleted={!!jobConfig.sendingGroup}
        />
        <StepsItem
          icon={Package}
          title="サービス選択"
          description="提案するサービスの選択"
          isActive={currentStep === 'product'}
          isCompleted={!!jobConfig.product}
        />
        <StepsItem
          icon={Settings}
          title="実行設定"
          description="バッチジョブの設定"
          isActive={currentStep === 'settings'}
          isCompleted={!!jobConfig.settings}
        />
        <StepsItem
          icon={Eye}
          title="プレビュー"
          description="最終確認"
          isActive={currentStep === 'preview'}
        />
      </StepsHeader>

      {/* コンテンツエリア */}
      <Card className="p-6">
        <StepsContent>
          {currentStep === 'template' && (
            <TemplateSelection
              onSelect={(template) => {
                setJobConfig(prev => ({ ...prev, template }));
                setCurrentStep('group');
              }}
              selectedTemplate={jobConfig.template}
            />
          )}

          {currentStep === 'group' && (
            <SendingGroupSelection
              onSelect={(group) => {
                setJobConfig(prev => ({ ...prev, sendingGroup: group }));
                setCurrentStep('product');
              }}
              selectedGroup={jobConfig.sendingGroup}
              template={jobConfig.template}
            />
          )}

          {currentStep === 'product' && (
            <ProductSelection
              onSelect={(product) => {
                setJobConfig(prev => ({ ...prev, product }));
                setCurrentStep('settings');
              }}
              selectedProduct={jobConfig.product}
              template={jobConfig.template}
              sendingGroup={jobConfig.sendingGroup}
            />
          )}

          {currentStep === 'settings' && (
            <BatchSettings
              onUpdate={(settings) => {
                setJobConfig(prev => ({ ...prev, settings }));
              }}
              settings={jobConfig.settings}
              template={jobConfig.template}
              targetCount={jobConfig.sendingGroup?.company_count || 0}
            />
          )}

          {currentStep === 'preview' && (
            <JobPreview
              config={jobConfig}
              onEdit={(step: Step) => setCurrentStep(step)}
            />
          )}
        </StepsContent>
      </Card>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        
        <div className="space-x-2">
          {currentStep !== 'template' && (
            <Button
              variant="outline"
              onClick={() => {
                const currentIndex = steps.indexOf(currentStep);
                setCurrentStep(steps[currentIndex - 1]);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          )}
          
          {currentStep === 'preview' ? (
            <Button
              onClick={handleConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              バッチジョブを作成
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (currentStep === 'settings') {
                  setCurrentStep('preview');
                } else {
                  const currentIndex = steps.indexOf(currentStep);
                  setCurrentStep(steps[currentIndex + 1]);
                }
              }}
              disabled={
                (currentStep === 'template' && !jobConfig.template) ||
                (currentStep === 'group' && !jobConfig.sendingGroup) ||
                (currentStep === 'product' && !jobConfig.product) ||
                (currentStep === 'settings' && !jobConfig.settings?.name)
              }
            >
              次へ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 