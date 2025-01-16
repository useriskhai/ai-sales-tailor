import React, { useState, useEffect } from 'react';
import { useSendingGroup } from '@/hooks/useSendingGroup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { SendingGroupDetails } from '@/components/SendingGroupDetails';
import { CompanySelector } from '@/components/companies/CompanyMultiSelector';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, Info, Search, SortAsc, SortDesc, Users2Icon, Info as InfoIcon } from 'lucide-react';
import { SendingGroup } from '@/types/sendingGroup';
import { CustomPagination } from '@/components/CustomPagination';
import { motion } from 'framer-motion';
import { Company } from '@/types/company';

export function SendingGroupManager() {
  const {
    sendingGroups,
    loading,
    searchTerm,
    setSearchTerm,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    fetchSendingGroups,
    createSendingGroup,
    addCompaniesToGroup,
    totalCount,
  } = useSendingGroup();

  const { toast } = useToast();
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAddCompanyDialogOpen, setIsAddCompanyDialogOpen] = useState(false);
  const [selectedGroupForAddCompany, setSelectedGroupForAddCompany] = useState<SendingGroup | null>(null);
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);

  useEffect(() => {
    fetchSendingGroups(currentPage, itemsPerPage);
  }, [fetchSendingGroups, currentPage, itemsPerPage, searchTerm, sortField, sortOrder]);

  const handleCreateGroup = async () => {
    try {
      const newGroup = await createSendingGroup(newGroupName, newGroupDescription);
      setNewGroupName('');
      setNewGroupDescription('');
      setIsCreateGroupDialogOpen(false);
      
      setSelectedGroupForAddCompany(newGroup);
      setIsAddCompanyDialogOpen(true);
      
      fetchSendingGroups(currentPage, itemsPerPage);
    } catch (error) {
      console.error('Error in handleCreateGroup:', error);
    }
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field as 'name' | 'created_at');
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddCompanies = async (selectedCompanies: Company[]) => {
    if (selectedGroupForAddCompany) {
      try {
        await addCompaniesToGroup(selectedGroupForAddCompany.id, selectedCompanies);
        fetchSendingGroups(currentPage, itemsPerPage);
        setIsAddCompanyDialogOpen(false);
        toast({
          title: '企業を追加しました',
          description: `${selectedCompanies.length}社の企業を送信グループに追加しました。`,
        });
      } catch (error) {
        toast({
          title: 'エラー',
          description: '企業の追加に失敗しました。',
          variant: 'destructive',
        });
      }
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">送信グループ</h1>
          <p className="text-sm text-muted-foreground mt-1">
            企業をグループ化して効率的に管理できます
          </p>
        </div>
        <Button onClick={() => setIsCreateGroupDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          新規グループ作成
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="グループ名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleSort('name')}
            className="min-w-[120px]"
          >
            名前
            {sortField === 'name' && (
              sortOrder === 'asc' ? 
                <SortAsc className="ml-2 h-4 w-4" /> : 
                <SortDesc className="ml-2 h-4 w-4" />
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSort('created_at')}
            className="min-w-[120px]"
          >
            作成日
            {sortField === 'created_at' && (
              sortOrder === 'asc' ? 
                <SortAsc className="ml-2 h-4 w-4" /> : 
                <SortDesc className="ml-2 h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 rounded-lg border border-gray-200 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-100 rounded w-20"></div>
                    <div className="h-5 bg-gray-100 rounded w-24"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-9 bg-gray-100 rounded w-20"></div>
                  <div className="h-9 bg-gray-100 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sendingGroups.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <Users2Icon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">送信グループがありません</h3>
          <p className="mt-2 text-sm text-gray-500">
            新しいグループを作成して企業を整理しましょう
          </p>
          <Button onClick={() => setIsCreateGroupDialogOpen(true)} className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" />
            グループを作成
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sendingGroups.map((group) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{group.name}</h3>
                  <p className="text-sm text-gray-500">{group.description || "説明なし"}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant="secondary">
                      {group.company_count}社
                    </Badge>
                    <span className="text-gray-500">
                      作成日: {new Date(group.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setIsDetailsDialogOpen(true);
                    }}
                  >
                    <Info className="mr-2 h-4 w-4" />
                    詳細
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedGroupForAddCompany(group);
                      setIsAddCompanyDialogOpen(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    企業を追加
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1);
          }}
        />
      </div>

      <Dialog open={isCreateGroupDialogOpen} onOpenChange={setIsCreateGroupDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新規グループ作成</DialogTitle>
            <DialogDescription>
              送信グループを作成して、関連する企業をまとめて管理できます
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">グループ名</Label>
              <Input
                id="group-name"
                placeholder="例: 重要取引先"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-description">説明</Label>
              <Textarea
                id="group-description"
                placeholder="例: 月次でメールを送信する主要取引先企業"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                className="h-24"
              />
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                グループ作成後、企業を追加できます
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateGroupDialogOpen(false)}>
              キャンセル
            </Button>
            <Button 
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
            >
              作成して企業を追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedGroupId && (
            <SendingGroupDetails
              groupId={selectedGroupId}
              onClose={() => {
                setIsDetailsDialogOpen(false);
                fetchSendingGroups(currentPage, itemsPerPage);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddCompanyDialogOpen} onOpenChange={setIsAddCompanyDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedGroupForAddCompany?.name}に企業を追加
            </DialogTitle>
            <DialogDescription>
              送信グループに追加する企業を選択してください
            </DialogDescription>
          </DialogHeader>
          <CompanySelector
            onCompaniesSelected={handleAddCompanies}
            initialSelectedCompanies={[]}
            isNewGroup={selectedGroupForAddCompany ? !selectedGroupForAddCompany.company_count : undefined}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}