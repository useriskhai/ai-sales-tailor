import React from 'react';
import { BatchJobSummary } from '@/types/dashboard';
import Link from 'next/link';

interface CurrentBatchJobProps {
  job: BatchJobSummary;
}

const CurrentBatchJob: React.FC<CurrentBatchJobProps> = ({ job }) => {
  const insights = job.analytics?.insights ?? [];
  const hasInsights = insights.length > 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">現在実行中のバッチジョブ</h2>
        <Link
          href={`/batch-jobs/${job.jobId}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          詳細を見る →
        </Link>
      </div>

      <div className="space-y-4">
        {/* 進捗バー */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              {job.name}（{job.jobId}）
            </span>
            <span className="text-sm font-medium text-gray-700">
              {job.progress.percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${job.progress.percentage}%` }}
            />
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {job.progress.completed} / {job.progress.total} タスク完了
          </div>
        </div>

        {/* メトリクス */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">平均応答時間</div>
            <div className="mt-1 text-lg font-semibold">
              {job.metrics.averageResponseTime.toFixed(1)}h
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">エラータスク</div>
            <div className="mt-1 text-lg font-semibold">
              {job.metrics.errorCount}件
            </div>
          </div>
          {job.metrics.responseRate !== undefined && (
            <div>
              <div className="text-sm font-medium text-gray-500">現在の反応率</div>
              <div className="mt-1 text-lg font-semibold">
                {(job.metrics.responseRate * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {/* インサイト */}
        {hasInsights && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">主な発見</h3>
            <ul className="space-y-2">
              {insights.slice(0, 2).map((insight, index) => (
                <li
                  key={index}
                  className={`text-sm ${
                    insight.type === 'positive'
                      ? 'text-green-600'
                      : insight.type === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {insight.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentBatchJob; 