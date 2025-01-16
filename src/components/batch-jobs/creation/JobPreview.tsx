"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Users, Package } from "lucide-react";
import { JobConfig, Step } from "@/types/batchJob";
import { Template } from "@/types/template";
import { SendingGroup } from "@/types/sendingGroup";
import { Product } from "@/types/product";

interface JobPreviewProps {
  config: JobConfig;
  onEdit: (step: Step) => void;
}

export function JobPreview({
  config,
  onEdit
}: JobPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>設定内容の確認</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* テンプレート情報 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">選択したテンプレート</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit('template')}
              >
                <FileText className="w-4 h-4 mr-2" />
                編集
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">{config.template?.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {config.template?.description}
              </p>
            </div>
          </div>

          {/* 送信グループ情報 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">送信グループ</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit('group')}
              >
                <Users className="w-4 h-4 mr-2" />
                編集
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">{config.sendingGroup?.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {config.sendingGroup?.description}
              </p>
              <div className="mt-2">
                <Badge>{config.sendingGroup?.total_contacts}社</Badge>
              </div>
            </div>
          </div>

          {/* サービス情報 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">選択したサービス</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit('product')}
              >
                <Package className="w-4 h-4 mr-2" />
                編集
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">{config.product?.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {config.product?.description}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 