import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ExecutionSettingsData {
  execution_priority: 'quality' | 'balanced' | 'speed';
}

interface ExecutionSettingsFormProps {
  data: ExecutionSettingsData;
  onChange: (data: ExecutionSettingsData) => void;
}

const EXECUTION_PRIORITIES = [
  { 
    value: 'quality',
    label: '品質重視',
    description: '生成に時間をかけてでも、より質の高いメッセージを作成します',
  },
  { 
    value: 'balanced',
    label: 'バランス型',
    description: '品質とスピードのバランスを取りながらメッセージを生成します',
  },
  { 
    value: 'speed',
    label: 'スピード重視',
    description: '素早くメッセージを生成することを優先します',
  },
];

export const ExecutionSettingsForm: React.FC<ExecutionSettingsFormProps> = ({
  data,
  onChange,
}) => {
  const handleChange = (value: string) => {
    onChange({
      ...data,
      execution_priority: value as 'quality' | 'balanced' | 'speed',
    });
  };

  return (
    <div className="space-y-2">
      <Label>実行優先度</Label>
      <Select
        value={data.execution_priority}
        onValueChange={handleChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="実行優先度を選択" />
        </SelectTrigger>
        <SelectContent>
          {EXECUTION_PRIORITIES.map((priority) => (
            <SelectItem key={priority.value} value={priority.value}>
              {priority.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        {EXECUTION_PRIORITIES.find(p => p.value === data.execution_priority)?.description}
      </p>
    </div>
  );
}; 