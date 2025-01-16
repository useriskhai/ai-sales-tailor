"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useBatchJob } from '@/hooks/useBatchJob';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  FileText, 
  Users, 
  Package, 
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "@/components/batch-jobs/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { mockProducts } from '@/data/mockData/products';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BatchJobsPage() {
  const [activeTab, setActiveTab] = useState<'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const { jobs, isLoading, deleteJob } = useBatchJob();
  const router = useRouter();

  // プロダクト名を取得する関数
  const getProductName = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    return product?.name || '未設定';
  };

  const handleJobSelect = (job: any) => {
    router.push(`/batch-jobs/${job.id}`);
  };

  const handleDeleteJob = async (jobId: string) => {
    await deleteJob(jobId);
  };

  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = 
      job.template_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.sending_group?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedJobs = [...(filteredJobs || [])].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return a.status.localeCompare(b.status);
  });

  return (
    <div className="container mx-auto p-6">
      {/* ヘッダー - シンプル化 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">バッチジョブ</h1>
        <Button onClick={() => router.push('/batch-jobs/create')}>
          <Plus className="w-4 h-4 mr-2" />
          新規作成
        </Button>
      </div>

      {/* 検索フィルター - コンパクト化 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="completed">完了</SelectItem>
            <SelectItem value="running">実行中</SelectItem>
            <SelectItem value="scheduled">予定</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ジョブ一覧 - プロダクト情報を追加 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">全{filteredJobs?.length || 0}件</span>
            <Badge variant="outline" className="ml-2">
              実行中: {filteredJobs?.filter(j => j.status === 'running').length || 0}
            </Badge>
          </div>
          <Select value={sortBy} onValueChange={(value: 'date' | 'status') => setSortBy(value)}>
            <SelectTrigger className="w-[140px]">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="date">作成日時</SelectItem>
              <SelectItem value="status">ステータス</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {sortedJobs?.map((job) => (
                <div
                  key={job.id}
                  className="group p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-all"
                  onClick={() => handleJobSelect(job)}
                >
                  {/* ヘッダー部分 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={job.status} />
                      <span className="text-sm text-muted-foreground">#{job.id}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteJob(job.id);
                        }}>
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* メイン情報 */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      {/* テッチジョブ名 */}
                      <h3 className="text-lg font-semibold">{job.name || `バッチジブ #${job.id}`}</h3>

                      {/* テンプレート名 */}
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-muted-foreground">テンプレート:</span>
                        <span>{job.template_name}</span>
                      </div>

                      {/* プロダクト情報 */}
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-purple-500" />
                        <span className="text-muted-foreground">プロダクト:</span>
                        <Badge variant="outline" className="font-normal">
                          {getProductName(job.product_id)}
                        </Badge>
                      </div>

                      {/* 送信グループ情報 */}
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-green-500" />
                        <span className="text-muted-foreground">送信先:</span>
                        <span>{job.sending_group?.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {job.total_tasks}件
                        </Badge>
                      </div>
                    </div>

                    {/* 進捗と日時情報 */}
                    <div className="text-right space-y-2">
                      {/* 進捗状況 */}
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm font-medium">
                          {job.completed_tasks} / {job.total_tasks}
                        </span>
                        <Badge variant={job.completed_tasks === job.total_tasks ? "success" : "default"}>
                          {((job.completed_tasks / job.total_tasks) * 100).toFixed(0)}%
                        </Badge>
                      </div>

                      {/* 日時情報 */}
                      <div className="flex flex-col items-end text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          作成: {new Date(job.created_at).toLocaleDateString()}
                        </div>
                        {job.scheduled_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-yellow-500" />
                            予定: {new Date(job.scheduled_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* タグ */}
                  {job.sending_group?.tags && (
                    <div className="flex gap-1 mt-3">
                      {job.sending_group.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 