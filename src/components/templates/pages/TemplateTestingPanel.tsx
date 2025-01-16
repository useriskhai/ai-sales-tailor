import React, { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { Company } from '@/types/company';
import { Template, TemplateSettings } from '@/types/template';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductSelector } from '@/components/products/ProductSelector';
import { CompanySelector } from '@/components/companies/CompanySelector';
import { generateMessage } from '@/utils/generate-message';
import { toast } from '@/components/ui/use-toast';
import { TemplateSettings as TemplateSettingsComponent } from '@/components/templates/TemplateSettings';
import { TemplateSettingsModal } from '@/components/templates/TemplateSettingsModal';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { InfoIcon } from 'lucide-react';

interface Props {
  template: Template;
  onTemplateUpdate?: (updatedTemplate: Template) => void;
}

export function TemplateTestingPanel({ template, onTemplateUpdate }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [temporarySettings, setTemporarySettings] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);

  // プログレスバーの擬似的な進行を制御する関数
  const simulateProgress = (start: number, end: number, duration: number) => {
    // 既存のインターバルをクリア
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    const steps = end - start; // 1%ずつ増加
    const intervalTime = Math.floor(duration / steps);
    let currentProgress = start;

    const interval = setInterval(() => {
      if (currentProgress >= end) {
        clearInterval(interval);
        return;
      }
      currentProgress += 1;
      setProgress(currentProgress);
    }, intervalTime);

    setProgressInterval(interval);
    return interval;
  };

  const validateSettings = (settings: any) => {
    try {
      const { strategy, execution } = settings;
      
      // 戦略設定のバリデーション
      if (!strategy || typeof strategy !== 'object') {
        throw new Error('戦略設定が不正です');
      }
      
      if (!['ai_auto', 'manual'].includes(strategy.mode)) {
        throw new Error('無効なモードが指定されています');
      }
      
      if (typeof strategy.maxLength !== 'number' || strategy.maxLength < 1) {
        throw new Error('最大文字数は1以上の数値を指定してください');
      }

      // 実行設定のバリデーション
      if (!execution || typeof execution !== 'object') {
        throw new Error('実行設定が不正です');
      }
      
      if (!['speed', 'balanced', 'quality'].includes(execution.execution_priority)) {
        throw new Error('無効な優先度が指定されています');
      }
      
      if (typeof execution.parallel_tasks !== 'number' || execution.parallel_tasks < 1) {
        throw new Error('並列タスク数は1以上の数値を指定してください');
      }
      
      if (typeof execution.retry_attempts !== 'number' || execution.retry_attempts < 0) {
        throw new Error('リトライ回数は0以上の数値を指定してください');
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: '設定エラー',
          description: error.message,
          variant: 'destructive',
        });
      }
      return false;
    }
  };

  const handleTest = async () => {
    if (!selectedProduct || !selectedCompany) {
      toast({
        title: 'エラー',
        description: 'プロダクトと会社を選択してください',
        variant: 'destructive',
      });
      return;
    }

    // 一時的な設定のバリデーション
    if (temporarySettings && !validateSettings(temporarySettings)) {
      return;
    }
    
    setIsGenerating(true);
    setProgress(0);
    setProgressMessage('テスト実行の準備中...');

    console.log('テスト実行開始:', {
      templateId: template.id,
      productId: selectedProduct.id,
      companyId: selectedCompany.id,
      useTemporarySettings: !!temporarySettings,
    });

    try {
      setProgress(20);
      setProgressMessage('テンプレート設定の検証中...');

      const testTemplate = temporarySettings
        ? { ...template, template_settings: JSON.stringify(temporarySettings) }
        : template;

      setProgress(40);
      setProgressMessage('メッセージを生成中...');

      // 会社情報を取得（web_contentを含む）
      const { data: companyWithContent } = await supabase
        .from('companies')
        .select('*')
        .eq('id', selectedCompany.id)
        .single();

      if (!companyWithContent) {
        throw new Error('会社情報の取得に失敗しました');
      }

      // メッセージ生成中の擬似的な進行を開始（40%から90%まで10秒かけて進行）
      const interval = simulateProgress(40, 90, 10000);

      const response = await generateMessage({
        template: testTemplate,
        product: selectedProduct,
        company: {
          ...selectedCompany,
          website_content: companyWithContent.website_content
        },
      });

      // インターバルをクリア
      clearInterval(interval);

      setProgress(90);
      setProgressMessage('結果を処理中...');

      setGeneratedMessage(response.message);
      console.log('メッセージ生成成功:', {
        messageLength: response.message.length,
      });

      setProgress(100);
      setProgressMessage('完了');

      toast({
        title: '成功',
        description: 'メッセージを生成しました',
      });
    } catch (error) {
      // エラー時もインターバルをクリア
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      console.error('テスト実行エラー:', {
        error,
        template: template.id,
        product: selectedProduct.id,
        company: selectedCompany.id,
      });

      let errorMessage = 'メッセージの生成に失敗しました';
      let errorDetail = '';

      if (error instanceof Error) {
        errorMessage = error.message;
        if ('cause' in error && error.cause) {
          errorDetail = String(error.cause);
        }
      }

      toast({
        title: 'エラー',
        description: (
          <div className="space-y-2">
            <p>{errorMessage}</p>
            {errorDetail && (
              <p className="text-sm text-muted">{errorDetail}</p>
            )}
          </div>
        ),
        variant: 'destructive',
      });
    } finally {
      // インターバルが残っている場合はクリア
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setIsGenerating(false);
      // プログレスバーをリセットするまでに少し待機
      setTimeout(() => {
        setProgress(0);
        setProgressMessage('');
      }, 1000);
    }
  };

  const handleSettingsChange = (settings: any) => {
    if (!validateSettings(settings)) {
      return;
    }

    setTemporarySettings(settings);
    toast({
      title: '設定を変更しました',
      description: '次回のテスト実行時に適用されます',
    });
  };

  const handleResetSettings = () => {
    setTemporarySettings(null);
    toast({
      title: '設定をリセットしました',
      description: '元の設定に戻りました',
    });
  };

  const handleSaveAsTemplate = async () => {
    console.log('Props check:', {
      hasTemplate: !!template,
      hasUpdateFunction: !!onTemplateUpdate,
      updateFunction: onTemplateUpdate,
      template: template
    });

    if (!temporarySettings) {
      console.log('一時的な設定がないため保存をスキップ');
      toast({
        title: '変更なし',
        description: '保存する変更がありません',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (!onTemplateUpdate) {
        console.error('更新関数が設定されていません');
        throw new Error('テンプレートを更新できません。更新関数が設定されていません。');
      }

      const updatedTemplate = {
        ...template,
        template_settings: JSON.stringify(temporarySettings)
      };
      
      console.log('更新するテンプレート:', {
        id: updatedTemplate.id,
        content: temporarySettings,
        originalContent: template.template_settings
      });

      // 保存処理を実行
      await onTemplateUpdate(updatedTemplate);
      console.log('テンプレート更新完了');
      
      // 保存成功後に状態をクリア
      setTemporarySettings(null);
      setGeneratedMessage('');
      
      toast({
        title: '保存完了',
        description: 'テンプレートの設定を更新しました',
      });
    } catch (error) {
      console.error('テンプレート更新エラー:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'テンプレートの更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pb-6">
          <CardTitle className="text-2xl font-medium">テンプレートのテスト</CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">現在の設定</h2>
            <div className="flex items-center gap-3">
              <TemplateSettingsModal
                template={temporarySettings ? { ...template, template_settings: JSON.stringify(temporarySettings) } : template}
                onSettingsChange={handleSettingsChange}
              />
              {temporarySettings && (
                <>
                  <Button variant="outline" onClick={handleResetSettings} size="sm">
                    設定をリセット
                  </Button>
                  <Button 
                    variant="default"
                    onClick={handleSaveAsTemplate}
                    size="sm"
                  >
                    テンプレートとして保存
                  </Button>
                </>
              )}
            </div>
          </div>
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <TemplateSettingsComponent
                template={temporarySettings ? { ...template, template_settings: JSON.stringify(temporarySettings) } : template}
              />
              {temporarySettings && (
                <div className="mt-6 rounded-md bg-amber-50 border border-amber-200 p-4">
                  <p className="text-sm text-amber-800 flex items-center gap-2">
                    <InfoIcon className="h-4 w-4" />
                    現在、一時的な設定変更が適用されています
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">テスト用データ</h2>
          </div>
          <div className="grid gap-6">
            <Card className="border border-gray-200">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-base font-medium">プロダクトの選択</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ProductSelector
                  selectedProduct={selectedProduct}
                  onSelect={setSelectedProduct}
                />
                {selectedProduct && (
                  <div className="mt-6 space-y-4 rounded-lg border border-gray-100 bg-gray-50/50 p-6">
                    <div className="grid gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500">製品名</div>
                        <div className="mt-1">{selectedProduct.name}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">概要（USP）</div>
                        <div className="mt-1">{selectedProduct.usp}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">製品概要</div>
                        <div className="mt-1">{selectedProduct.description}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">メリット</div>
                        <ul className="mt-1 space-y-1">
                          {selectedProduct.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-base font-medium">会社の選択</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CompanySelector
                  selectedCompany={selectedCompany}
                  onSelect={setSelectedCompany}
                />
                {selectedCompany && (
                  <div className="mt-6 space-y-4 rounded-lg border border-gray-100 bg-gray-50/50 p-6">
                    <div className="grid gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500">会社名</div>
                        <div className="mt-1">{selectedCompany.website_display_name || selectedCompany.name}</div>
                      </div>
                      {selectedCompany.description && (
                        <div>
                          <div className="text-sm font-medium text-gray-500">会社概要</div>
                          <div className="mt-1">{selectedCompany.description}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Button
              onClick={handleTest}
              disabled={!selectedProduct || !selectedCompany || isGenerating}
              size="lg"
              className="min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  テスト実行中...
                </>
              ) : (
                'テスト実行'
              )}
            </Button>
          </div>

          {isGenerating && (
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{progressMessage}</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          )}
        </div>

        {generatedMessage && (
          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-base font-medium">生成されたメッセージ</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-6">
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-wrap">{generatedMessage}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 