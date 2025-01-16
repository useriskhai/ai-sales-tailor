"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BatchJob } from "@/types/batchJob";
import { SentLetter, SENT_LETTER_STATUS, SentLetterStatus } from "@/types/delivery";
import {
  CheckCircle2,
  Clock,
  Filter,
  ArrowUpDown,
  Eye,
  Mail,
  MessageSquare,
  AlertTriangle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SentLettersProps {
  job?: BatchJob | null;
}

export function SentLetters({ job }: SentLettersProps) {
  const [filter, setFilter] = useState<'all' | SentLetterStatus>('all');
  const [sort, setSort] = useState<'time' | 'status'>('time');
  const [selectedLetter, setSelectedLetter] = useState<SentLetter | null>(null);

  if (!job) return null;

  const letters = job.sent_letters || [];

  const filteredLetters = letters.filter(letter => {
    if (filter === 'all') return true;
    return letter.status === filter;
  });

  const sortedLetters = [...filteredLetters].sort((a, b) => {
    if (sort === 'time') {
      return new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime();
    }
    const statusOrder = {
      [SENT_LETTER_STATUS.REPLIED]: 3,
      [SENT_LETTER_STATUS.OPENED]: 2,
      [SENT_LETTER_STATUS.DELIVERED]: 1,
      [SENT_LETTER_STATUS.FAILED]: 0
    };
    return statusOrder[b.status] - statusOrder[a.status];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          送信済みレター
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {letters.length}件
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* フィルターとソート */}
        <div className="flex items-center space-x-4 mb-4">
          <Select
            value={filter}
            onValueChange={(value: any) => setFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="ステータスでフィルタ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value={SENT_LETTER_STATUS.DELIVERED}>配信済み</SelectItem>
              <SelectItem value={SENT_LETTER_STATUS.OPENED}>開封済み</SelectItem>
              <SelectItem value={SENT_LETTER_STATUS.REPLIED}>返信あり</SelectItem>
              <SelectItem value={SENT_LETTER_STATUS.FAILED}>失敗</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(value: any) => setSort(value)}
          >
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">送信日時順</SelectItem>
              <SelectItem value="status">ステータス順</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* レター一覧 */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {sortedLetters.map((letter) => (
              <div
                key={letter.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-accent"
                onClick={() => setSelectedLetter(letter)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {letter.status === SENT_LETTER_STATUS.REPLIED ? (
                      <MessageSquare className="w-5 h-5 text-green-500" />
                    ) : letter.status === SENT_LETTER_STATUS.OPENED ? (
                      <Eye className="w-5 h-5 text-blue-500" />
                    ) : letter.status === SENT_LETTER_STATUS.FAILED ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Mail className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <p className="font-medium">{letter.company_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {letter.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant={
                        letter.status === SENT_LETTER_STATUS.REPLIED ? 'success' :
                        letter.status === SENT_LETTER_STATUS.OPENED ? 'default' :
                        letter.status === SENT_LETTER_STATUS.FAILED ? 'destructive' :
                        'secondary'
                      }
                    >
                      {letter.status === SENT_LETTER_STATUS.REPLIED ? '返信あり' :
                       letter.status === SENT_LETTER_STATUS.OPENED ? '開封済み' :
                       letter.status === SENT_LETTER_STATUS.FAILED ? '失敗' :
                       '配信済み'}
                    </Badge>
                    <div className="flex flex-col items-end text-sm text-muted-foreground">
                      <span>{new Date(letter.sent_at).toLocaleTimeString()}</span>
                      <span>{new Date(letter.sent_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      {/* レター詳細モーダル */}
      <Dialog
        open={!!selectedLetter}
        onOpenChange={() => setSelectedLetter(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>レター詳細</DialogTitle>
          </DialogHeader>
          {selectedLetter && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium">送信先企業</h4>
                <p>{selectedLetter.company_name}</p>
              </div>
              <div>
                <h4 className="font-medium">件名</h4>
                <p>{selectedLetter.subject}</p>
              </div>
              <div>
                <h4 className="font-medium">本文</h4>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedLetter.content}</p>
                </div>
              </div>
              {selectedLetter.response && (
                <div>
                  <h4 className="font-medium">返信内容</h4>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      受信日時: {new Date(selectedLetter.response.received_at).toLocaleString()}
                    </p>
                    <p className="whitespace-pre-wrap">{selectedLetter.response.message}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">送信日時</h4>
                  <p className="text-muted-foreground">
                    {new Date(selectedLetter.sent_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">ステータス</h4>
                  <Badge
                    variant={
                      selectedLetter.status === SENT_LETTER_STATUS.REPLIED ? 'success' :
                      selectedLetter.status === SENT_LETTER_STATUS.OPENED ? 'default' :
                      selectedLetter.status === SENT_LETTER_STATUS.FAILED ? 'destructive' :
                      'secondary'
                    }
                  >
                    {selectedLetter.status === SENT_LETTER_STATUS.REPLIED ? '返信あり' :
                     selectedLetter.status === SENT_LETTER_STATUS.OPENED ? '開封済み' :
                     selectedLetter.status === SENT_LETTER_STATUS.FAILED ? '失敗' :
                     '配信済み'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
} 