"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GenerationTask } from "@/types/task";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  Edit,
  AlertTriangle
} from "lucide-react";

interface TaskReviewProps {
  task: GenerationTask;
  onApprove: (taskId: string) => void;
  onRegenerate: (taskId: string, reason?: string) => void;
  onRequestEdit: (taskId: string, notes: string) => void;
  onClose: () => void;
}

export function TaskReview({
  task,
  onApprove,
  onRegenerate,
  onRequestEdit,
  onClose
}: TaskReviewProps) {
  const [action, setAction] = useState<'approve' | 'regenerate' | 'edit'>('approve');
  const [notes, setNotes] = useState('');
  const [regenerateReason, setRegenerateReason] = useState('');

  const handleSubmit = () => {
    switch (action) {
      case 'approve':
        onApprove(task.id);
        break;
      case 'regenerate':
        onRegenerate(task.id, regenerateReason);
        break;
      case 'edit':
        onRequestEdit(task.id, notes);
        break;
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>レビュー - {task.company.name}</span>
            <Badge variant={
              task.quality_score && task.quality_score > 0.8 ? 'success' : 'warning'
            }>
              品質スコア: {task.quality_score ? `${(task.quality_score * 100).toFixed(0)}%` : '未評価'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            生成されたレターの内容を確認し、適切なアクションを選択してください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* レター内容 */}
          <div>
            <h4 className="text-sm font-medium mb-2">生成内容</h4>
            <ScrollArea className="h-[200px] border rounded-lg p-4">
              <div className="prose prose-sm max-w-none">
                {task.content}
              </div>
            </ScrollArea>
          </div>

          {/* アクション選択 */}
          <div>
            <h4 className="text-sm font-medium mb-2">アクション</h4>
            <Select value={action} onValueChange={(value: any) => setAction(value)}>
              <SelectTrigger>
                <SelectValue placeholder="アクションを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">
                  <div className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    承認
                  </div>
                </SelectItem>
                <SelectItem value="regenerate">
                  <div className="flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2 text-blue-500" />
                    AI再生成
                  </div>
                </SelectItem>
                <SelectItem value="edit">
                  <div className="flex items-center">
                    <Edit className="w-4 h-4 mr-2 text-yellow-500" />
                    手動修正依頼
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* アクション別の追加入力 */}
          {action === 'regenerate' && (
            <div>
              <h4 className="text-sm font-medium mb-2">再生成理由</h4>
              <Select 
                value={regenerateReason} 
                onValueChange={setRegenerateReason}
              >
                <SelectTrigger>
                  <SelectValue placeholder="再生成の理由を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tone">トーンの調整が必要</SelectItem>
                  <SelectItem value="content">内容の充実が必要</SelectItem>
                  <SelectItem value="length">文章量の調整が必要</SelectItem>
                  <SelectItem value="focus">焦点の修正が必要</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {action === 'edit' && (
            <div>
              <h4 className="text-sm font-medium mb-2">修正指示</h4>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="具体的な修正内容を入力してください"
                className="h-[100px]"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={
              (action === 'regenerate' && !regenerateReason) ||
              (action === 'edit' && !notes)
            }
          >
            {action === 'approve' ? '承認' :
             action === 'regenerate' ? 'AI再生成' :
             '修正依頼'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 