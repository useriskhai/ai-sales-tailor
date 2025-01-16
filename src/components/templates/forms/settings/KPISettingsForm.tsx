import React, { useState } from 'react';
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export interface KPIMetric {
  id: string;
  name: string;
  type: 'system' | 'custom';
  target: number;
  weight: number;
  unit?: string;
}

export interface KPISettingsFormData {
  metrics: KPIMetric[];
  evaluationPeriod: number;
}

export interface KPISettingsFormProps {
  data: KPISettingsFormData;
  onChange: (data: KPISettingsFormData) => void;
}

const SYSTEM_METRICS = [
  { id: 'form_clicks', name: 'フォームリンククリック数', type: 'system' as const, unit: '回' },
  { id: 'form_ctr', name: 'フォームリンククリック率', type: 'system' as const, unit: '%' },
];

const CUSTOM_METRICS = [
  { id: 'deals_count', name: '商談獲得数', type: 'custom' as const, unit: '件' },
  { id: 'deals_rate', name: '商談成約率', type: 'custom' as const, unit: '%' },
  { id: 'reply_quality', name: '返信品質スコア', type: 'custom' as const, unit: 'ポイント' },
  { id: 'days_to_meeting', name: '商談設定までの日数', type: 'custom' as const, unit: '日' },
  { id: 'sales_productivity', name: '営業生産性', type: 'custom' as const, unit: '円/時間' },
];

const UNITS = [
  { value: '回', label: '回数' },
  { value: '件', label: '件数' },
  { value: '%', label: 'パーセント' },
  { value: '円', label: '金額（円）' },
  { value: '日', label: '日数' },
  { value: 'ポイント', label: 'ポイント' },
  { value: '時間', label: '時間' },
  { value: '円/時間', label: '円/時間' },
];

interface CustomMetricDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (metric: Omit<KPIMetric, 'target' | 'weight'>) => void;
}

const CustomMetricDialog: React.FC<CustomMetricDialogProps> = ({
  open,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('回');

  const handleAdd = () => {
    if (name.trim()) {
      onAdd({
        id: `custom_${Date.now()}`,
        name: name.trim(),
        type: 'custom',
        unit,
      });
      setName('');
      setUnit('回');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>カスタムメトリクスの追加</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="metric-name">メトリクス名</Label>
            <Input
              id="metric-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>単位</Label>
            <Select
              value={unit}
              onValueChange={setUnit}
            >
              <SelectTrigger>
                <SelectValue placeholder="単位を選択" />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleAdd} disabled={!name.trim()}>
            追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const KPISettingsForm: React.FC<KPISettingsFormProps> = ({
  data,
  onChange,
}) => {
  const [isAddingCustomMetric, setIsAddingCustomMetric] = useState(false);

  const handleMetricChange = (metricId: string, field: keyof KPIMetric, value: any) => {
    const newMetrics = data.metrics.map((metric) =>
      metric.id === metricId ? { ...metric, [field]: value } : metric
    );
    onChange({ ...data, metrics: newMetrics });
  };

  const handleDeleteMetric = (metricId: string) => {
    const newMetrics = data.metrics.filter((metric) => metric.id !== metricId);
    onChange({ ...data, metrics: newMetrics });
  };

  const handleAddSystemMetric = (metric: typeof SYSTEM_METRICS[0]) => {
    if (!data.metrics.some((m) => m.id === metric.id)) {
      onChange({
        ...data,
        metrics: [
          ...data.metrics,
          {
            ...metric,
            target: 0,
            weight: 1,
          },
        ],
      });
    }
  };

  const handleAddCustomMetric = (metric: Omit<KPIMetric, 'target' | 'weight'>) => {
    onChange({
      ...data,
      metrics: [
        ...data.metrics,
        {
          ...metric,
          target: 0,
          weight: 1,
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 font-medium">システムメトリクス</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {SYSTEM_METRICS.map((metric) => (
            <Button
              key={metric.id}
              variant="outline"
              size="sm"
              onClick={() => handleAddSystemMetric(metric)}
              disabled={data.metrics.some((m) => m.id === metric.id)}
            >
              {metric.name}
            </Button>
          ))}
        </div>

        <h4 className="mb-2 font-medium">カスタムメトリクス</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {CUSTOM_METRICS.map((metric) => (
            <Button
              key={metric.id}
              variant="outline"
              size="sm"
              onClick={() => handleAddCustomMetric(metric)}
              disabled={data.metrics.some((m) => m.id === metric.id)}
            >
              {metric.name}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingCustomMetric(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            カスタム追加
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>メトリクス名</TableHead>
              <TableHead className="text-right">目標値</TableHead>
              <TableHead className="text-right">重み付け</TableHead>
              <TableHead className="text-right">単位</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.metrics.map((metric) => (
              <TableRow key={metric.id}>
                <TableCell>{metric.name}</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={metric.target}
                    onChange={(e) =>
                      handleMetricChange(metric.id, 'target', parseFloat(e.target.value) || 0)
                    }
                    className="w-24 text-right"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={metric.weight}
                    onChange={(e) =>
                      handleMetricChange(metric.id, 'weight', parseFloat(e.target.value) || 0)
                    }
                    className="w-24 text-right"
                  />
                </TableCell>
                <TableCell className="text-right">{metric.unit}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteMetric(metric.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CustomMetricDialog
        open={isAddingCustomMetric}
        onClose={() => setIsAddingCustomMetric(false)}
        onAdd={handleAddCustomMetric}
      />
    </div>
  );
}; 