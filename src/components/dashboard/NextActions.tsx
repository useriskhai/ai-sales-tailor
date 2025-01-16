import React from 'react';
import { NextAction } from '@/types/dashboard';
import Link from 'next/link';

interface NextActionsProps {
  actions: NextAction[];
}

const NextActions: React.FC<NextActionsProps> = ({ actions }) => {
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'template_edit':
        return '📝';
      case 'new_batch_job':
        return '🚀';
      case 'apply_suggestion':
        return '💡';
      default:
        return '➡️';
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">次のアクション</h2>

      <div className="space-y-4">
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <div className="text-2xl">{getActionIcon(action.type)}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(action.priority)}`}>
                  {action.priority === 'high' ? '優先度: 高' :
                   action.priority === 'medium' ? '優先度: 中' : '優先度: 低'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">{action.description}</p>
              {action.expectedImpact && (
                <p className="text-sm text-green-600">
                  予想改善効果: {action.expectedImpact}
                </p>
              )}
              <Link
                href={action.actionUrl}
                className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                アクションを実行 →
              </Link>
            </div>
          </div>
        ))}

        {actions.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            現在推奨されるアクションはありません
          </div>
        )}
      </div>
    </div>
  );
};

export default NextActions; 