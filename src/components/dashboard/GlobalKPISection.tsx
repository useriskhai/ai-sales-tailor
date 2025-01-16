import React from 'react';
import { KPIStats } from '@/types/dashboard';

interface KPICardProps {
  title: string;
  value: number;
  diff: number;
  format?: (value: number) => string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, diff, format = (v) => `${v}%` }) => {
  const formattedValue = format(value);
  const formattedDiff = format(Math.abs(diff));
  const isPositive = diff > 0;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{formattedValue}</p>
        <p className={`ml-2 flex items-baseline text-sm font-semibold ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="mr-1">{isPositive ? '↑' : '↓'}</span>
          {formattedDiff}
        </p>
      </div>
    </div>
  );
};

interface GlobalKPISectionProps {
  kpi: KPIStats;
}

const GlobalKPISection: React.FC<GlobalKPISectionProps> = ({ kpi }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">メインKPI</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="成約率"
          value={kpi.conversionRate}
          diff={kpi.conversionRateDiff}
        />
        <KPICard
          title="反応率"
          value={kpi.responseRate}
          diff={kpi.responseRateDiff}
        />
        <KPICard
          title="ROI"
          value={kpi.roi}
          diff={kpi.roiDiff}
          format={(v) => v.toFixed(1)}
        />
      </div>
      <div className="mt-2 text-sm text-gray-500">
        前回ジョブ: #{kpi.lastJobId} からの改善履歴を反映
      </div>
    </div>
  );
};

export default GlobalKPISection; 