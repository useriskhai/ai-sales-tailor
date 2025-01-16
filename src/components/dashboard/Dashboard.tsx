import React from 'react';
import { DashboardData } from '@/types/dashboard';
import GlobalKPISection from './GlobalKPISection';
import CurrentBatchJob from './CurrentBatchJob';
import RecentResults from './RecentResults';
import NextActions from './NextActions';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';

export interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">エラーが発生しました: {error.message}</div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <div className="text-sm text-gray-500">
          最終更新: {new Date(data.lastUpdated).toLocaleString('ja-JP')}
        </div>
      </div>

      {/* メインKPI表示 */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <GlobalKPISection kpi={data.kpi} />
      </div>

      {/* 現在実行中のバッチジョブ */}
      {data.currentJob && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <CurrentBatchJob job={data.currentJob} />
        </div>
      )}

      {/* 最近のジョブ結果とPDCAサイクル */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <RecentResults
            results={data.recentResults}
            improvements={data.improvements}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <NextActions actions={data.nextActions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 