import { Template, MessageStrategyConfig } from '@/types/template';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Props {
  template: Template;
  onSettingsClick?: () => void;
}

export function TemplateSettings({ template, onSettingsClick }: Props) {
  const settings = JSON.parse(template.template_settings);

  // 文字数が有効な値かチェック
  const validMaxLengths = [300, 400, 500, 600, 800];
  const isValidMaxLength = validMaxLengths.includes(settings.strategy.maxLength);

  return (
    <Card className="shadow-sm">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-xl font-semibold">メッセージ戦略</h3>
      </div>
      <Separator />
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-[120px,1fr] items-center">
                <span className="text-gray-500">モード</span>
                <span>{settings.strategy.mode === 'manual' ? '手動選択' : 'AI自動選択'}</span>
              </div>
              <div className="grid grid-cols-[120px,1fr] items-center">
                <span className="text-gray-500">戦略</span>
                <span>{MessageStrategyConfig.strategy[settings.strategy.strategy]}</span>
              </div>
              <div className="grid grid-cols-[120px,1fr] items-center">
                <span className="text-gray-500">トーン</span>
                <span>{MessageStrategyConfig.tone[settings.strategy.toneOfVoice]}</span>
              </div>
              <div className="grid grid-cols-[120px,1fr] items-center">
                <span className="text-gray-500">最大文字数</span>
                <span>{isValidMaxLength ? `${settings.strategy.maxLength}文字` : '不正な値'}</span>
              </div>
              <div className="grid grid-cols-[120px,1fr] items-center">
                <span className="text-gray-500">絵文字</span>
                <span>{settings.strategy.useEmoji ? '使用する' : '使用しない'}</span>
              </div>
              {settings.strategy.mode === 'manual' && (
                <>
                  <div className="grid grid-cols-[120px,1fr] items-center">
                    <span className="text-gray-500">フォーカス</span>
                    <span>{settings.strategy.contentFocus && MessageStrategyConfig.focus[settings.strategy.contentFocus]}</span>
                  </div>
                  <div className="grid grid-cols-[120px,1fr]">
                    <span className="text-gray-500">カスタム指示</span>
                    <span className="text-sm text-gray-600">{settings.strategy.customInstructions || '設定なし'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 