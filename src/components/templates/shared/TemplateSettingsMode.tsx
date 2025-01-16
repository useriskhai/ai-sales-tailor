import React from 'react';
import { Wand2, Settings2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TemplateSettingsModeProps {
  mode: 'ai_auto' | 'manual';
  onChange: (mode: 'ai_auto' | 'manual') => void;
}

export const TemplateSettingsMode: React.FC<TemplateSettingsModeProps> = ({
  mode,
  onChange,
}) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Label>設定モード</Label>
        <RadioGroup
          value={mode}
          onValueChange={onChange}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem
              value="ai_auto"
              id="ai_auto"
              className="peer sr-only"
            />
            <Label
              htmlFor="ai_auto"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-3">
                <Wand2 className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="font-semibold">AIおまかせモード</div>
                <div className="text-sm text-muted-foreground mt-1">
                  基本的な設定のみで、AIが最適な設定を提案します
                </div>
              </div>
            </Label>
          </div>

          <div>
            <RadioGroupItem
              value="manual"
              id="manual"
              className="peer sr-only"
            />
            <Label
              htmlFor="manual"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-3">
                <Settings2 className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="font-semibold">カスタマイズモード</div>
                <div className="text-sm text-muted-foreground mt-1">
                  プロンプトの詳細設定を手動で調整できます
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>
    </Card>
  );
}; 