"use client";

import { Template } from "@/types/template";
import { JobSettings, JobConfig } from "@/types/batchJob";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BatchSettingsProps {
  onUpdate: (settings: JobSettings) => void;
  settings?: JobSettings;
  template?: Template;
  targetCount: number;
}

export function BatchSettings({
  onUpdate,
  settings,
  template,
  targetCount,
}: BatchSettingsProps) {
  const handleSettingsUpdate = (partialSettings: Partial<JobSettings>) => {
    onUpdate({
      ...settings,
      ...partialSettings,
    } as JobSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>実行設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="jobName">バッチジョブ名</Label>
            <Input
              id="jobName"
              placeholder={template?.name || "バッチジョブ名を入力"}
              value={settings?.name || ""}
              onChange={(e) => handleSettingsUpdate({ name: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              未入力の場合はテンプレート名がジョブ名として使用されます
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxDailyTasks">1日あたりの最大タスク数</Label>
            <Input
              id="maxDailyTasks"
              type="number"
              value={settings?.maxDailyTasks || ""}
              onChange={(e) => 
                handleSettingsUpdate({ 
                  maxDailyTasks: parseInt(e.target.value) 
                })
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="parallelTasks">並列タスク数</Label>
            <Input
              id="parallelTasks"
              type="number"
              value={settings?.parallelTasks || ""}
              onChange={(e) => 
                handleSettingsUpdate({ 
                  parallelTasks: parseInt(e.target.value) 
                })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 