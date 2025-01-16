import React from 'react';
import { JobResult, TemplateImprovement } from '@/types/dashboard';
import Link from 'next/link';

interface RecentResultsProps {
  results: JobResult[];
  improvements: TemplateImprovement[];
}

const RecentResults: React.FC<RecentResultsProps> = ({ results, improvements }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">最近完了したジョブの結果</h2>

      <div className="space-y-6">
        {/* 最近のジョブ結果 */}
        {results.map((result) => (
          <div key={result.jobId} className="border-b border-gray-200 pb-4 last:border-b-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{result.name}</h3>
                <p className="text-sm text-gray-500">
                  ジョブID: {result.jobId}
                  {result.targetIndustry && ` • ${result.targetIndustry}`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  成功率: {result.successRate}%
                </div>
                <div className={`text-sm ${
                  result.responseRateChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  反応率: {result.responseRateChange >= 0 ? '+' : ''}{result.responseRateChange}%
                </div>
              </div>
            </div>

            {/* インサイト */}
            {result.insights.length > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-medium text-gray-700 mb-1">主な発見</h4>
                <ul className="space-y-1">
                  {result.insights.map((insight, index) => (
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
        ))}

        {/* 改善提案 */}
        {improvements.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">改善提案</h3>
            <ul className="space-y-3">
              {improvements.map((improvement, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{improvement.suggestion}</p>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-sm text-green-600">
                        予想改善効果: {improvement.expectedImprovement}
                      </span>
                      {improvement.timing && (
                        <span className="text-sm text-gray-500">
                          • {improvement.timing}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={improvement.actionUrl}
                    className="text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
                  >
                    適用する →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentResults; 