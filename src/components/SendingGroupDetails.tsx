import React, { useEffect, useState } from 'react';
import { useSendingGroup } from '@/hooks/useSendingGroup';
import { Company } from '@/types/company';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Pencil, Trash2, Save, X, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CompanySelector } from '@/components/companies/CompanyMultiSelector';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomPagination } from '@/components/CustomPagination';
import { Badge } from '@/components/ui/badge';
import { GlobeIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

interface SendingGroupDetailsProps {
  groupId: string;
  onClose: () => void;
}

export const SendingGroupDetails: React.FC<SendingGroupDetailsProps> = ({ groupId, onClose }) => {
  const { fetchCompaniesInGroup, addCompaniesToGroup, updateSendingGroup, deleteSendingGroup, removeCompaniesFromGroup } = useSendingGroup();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const { toast } = useToast();
  const [isAddCompanyDialogOpen, setIsAddCompanyDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { user } = useAuth();

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId, currentPage, itemsPerPage]);

  const fetchGroupDetails = async () => {
    try {
      const result = await fetchCompaniesInGroup(groupId, currentPage, itemsPerPage);
      console.log('Fetched companies:', result.companies);
      setCompanies(result.companies);
      setTotalCount(result.totalCount);
      setGroupName(result.groupName);
      setGroupDescription(result.groupDescription);
    } catch (error) {
      console.error('Error fetching group details:', error);
      toast({
        title: 'エラー',
        description: 'グループ詳細の取得に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  const handleAddCompanies = async (companies: Company[]) => {
    if (!user) return;

    try {
      const companiesWithUserId = companies.map(company => ({
        ...company,
        user_id: user.id
      }));
      
      await addCompaniesToGroup(groupId, companiesWithUserId);
      fetchGroupDetails();
      setIsAddCompanyDialogOpen(false);
      toast({
        title: '企業を追加しました',
        description: `${companiesWithUserId.length}社の企業を送信グループに追加しました。`,
      });
    } catch (error) {
      console.error('企業の追加エラー:', error);
      toast({
        title: "エラー",
        description: "企業の追加に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGroup = async () => {
    try {
      await updateSendingGroup(groupId, groupName, groupDescription);
      setIsEditMode(false);
      toast({
        title: 'グループを更新しました',
        description: '送信グループの情報が正常に更新されました。',
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'グループの更新に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm('本当にこのグループを削除しますか？')) {
      try {
        await deleteSendingGroup(groupId);
        onClose();
        toast({
          title: 'グループを削除しました',
          description: '送信グループが正常に削除されました。',
        });
      } catch (error) {
        toast({
          title: 'エラー',
          description: 'グループの削除に失敗しました。',
          variant: 'destructive',
        });
      }
    }
  };

  const handleRemoveCompany = async (companyId: string) => {
    if (!companyId || !user) return;
    try {
      await removeCompaniesFromGroup(groupId, [companyId]);
      fetchGroupDetails();
      toast({
        title: '企業を削除しました',
        description: '企業が送信グループから正常に削除されました。',
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: '企業の削除に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="flex flex-col h-[80vh] overflow-hidden">
      {/* ヘッダー部分 */}
      <div className="flex-shrink-0 px-6 py-4 border-b">
        <div className="flex justify-between items-start mb-4">
          <AnimatePresence mode="wait">
            {isEditMode ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 space-y-3"
              >
                <div className="space-y-2">
                  <Label htmlFor="group-name">グループ名</Label>
                  <Input
                    id="group-name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="グループ名を入力..."
                    className="max-w-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-description">説明</Label>
                  <Textarea
                    id="group-description"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="グループの説明を入力..."
                    className="max-w-md h-24"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateGroup} variant="default">
                    <Save className="mr-2 h-4 w-4" />
                    保存
                  </Button>
                  <Button onClick={() => setIsEditMode(false)} variant="outline">
                    <X className="mr-2 h-4 w-4" />
                    キャンセル
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold">{groupName}</h2>
                  <Button onClick={() => setIsEditMode(true)} variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                {groupDescription && (
                  <p className="text-sm text-muted-foreground max-w-2xl">
                    {groupDescription}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <Button onClick={handleDeleteGroup} variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-medium">送信先企業</h3>
            <Badge variant="secondary">
              {totalCount}社
            </Badge>
          </div>
          <Button onClick={() => setIsAddCompanyDialogOpen(true)} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            企業を追加
          </Button>
        </div>
      </div>

      {/* 企業リスト */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6">
        <div className="py-4 space-y-2">
          {companies.map(company => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="font-medium">{company.name}</div>
                {company.url && (
                  <a
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:underline"
                  >
                    <GlobeIcon className="mr-1 h-3.5 w-3.5" />
                    {new URL(company.url).hostname}
                  </a>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveCompany(company.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* フッター */}
      <div className="flex-shrink-0 px-6 py-4 border-t bg-gray-50/80 backdrop-blur-sm">
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* 企業追加ダイアログ */}
      <Dialog open={isAddCompanyDialogOpen} onOpenChange={setIsAddCompanyDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{groupName}に企業を追加</DialogTitle>
          </DialogHeader>
          <CompanySelector
            onCompaniesSelected={handleAddCompanies}
            initialSelectedCompanies={[]}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};