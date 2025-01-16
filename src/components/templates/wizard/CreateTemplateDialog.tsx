import React from 'react';
import { CreateTemplateWizard } from './CreateTemplateWizard';
import type { TemplateData } from './CreateTemplateWizard';
import { usetemplate } from '@/hooks/useJobTemplate';
import { useToast } from '@/components/ui/use-toast';
import type { Category } from '@/types/template';

interface CreateTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onTemplateCreated?: () => void;
}

function convertToBackendFormat(data: TemplateData) {
  return {
    name: data.basicInfo.name,
    template_settings: JSON.stringify({
      basicInfo: data.basicInfo,
      strategy: data.messageStrategy,
      execution: data.executionSettings,
      kpi: data.kpiSettings,
    }),
    category: data.basicInfo.category as Category,
  };
}

function validateTemplateData(data: TemplateData): { isValid: boolean; error?: { title: string; description: string } } {
  if (!data.basicInfo.name) {
    return {
      isValid: false,
      error: {
        title: 'エラー',
        description: 'テンプレート名は必須です',
      },
    };
  }

  if (!data.basicInfo.category) {
    return {
      isValid: false,
      error: {
        title: 'エラー',
        description: 'カテゴリは必須です',
      },
    };
  }

  if (data.basicInfo.name.length > 100) {
    return {
      isValid: false,
      error: {
        title: 'エラー',
        description: 'テンプレート名は100文字以内で入力してください',
      },
    };
  }

  if (data.basicInfo.description && data.basicInfo.description.length > 500) {
    return {
      isValid: false,
      error: {
        title: 'エラー',
        description: '説明文は500文字以内で入力してください',
      },
    };
  }

  return { isValid: true };
}

export const CreateTemplateDialog: React.FC<CreateTemplateDialogProps> = ({
  open,
  onClose,
  onTemplateCreated,
}) => {
  const { createTemplate } = usetemplate();
  const { toast } = useToast();

  const handleSave = async (data: TemplateData) => {
    try {
      // バリデーション
      const validation = validateTemplateData(data);
      if (!validation.isValid) {
        toast({
          title: validation.error!.title,
          description: validation.error!.description,
          variant: 'destructive',
        });
        return;
      }

      const backendData = convertToBackendFormat(data);
      const templateId = await createTemplate(backendData);
      
      toast({
        title: 'テンプレート作成成功',
        description: '新しいテンプレートが作成されました',
      });
      
      onClose();
      onTemplateCreated?.();
      return templateId;
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'エラー',
        description: 'テンプレートの作成に失敗しました',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <CreateTemplateWizard
      open={open}
      onClose={onClose}
      onSave={handleSave}
    />
  );
}; 