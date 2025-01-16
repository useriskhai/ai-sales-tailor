import React, { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CustomPagination } from '@/components/CustomPagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchCompany } from '@/components/companies/SearchCompany';
import { Company } from '@/types/company';
import { CompanySelector } from '@/components/companies/CompanyMultiSelector';
import { Badge } from '@/components/ui/badge';
import { 
  MailIcon, 
  GlobeIcon, 
  PencilIcon, 
  TrashIcon,
  BuildingIcon,
  SearchIcon,
  PlusIcon,
  FileIcon,
  UploadIcon,
  DownloadIcon,
  Loader2Icon
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from '@/hooks/useDebounce';
import { Textarea } from "@/components/ui/textarea";
import { CompanyDetails } from './CompanyDetails';

interface AddCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (company: Partial<Company>) => void;
}

const AddCompanyDialog = ({ isOpen, onClose, onSubmit }: AddCompanyDialogProps) => {
  const [company, setCompany] = useState<Partial<Company>>({});

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">新規企業の追加</DialogTitle>
          <DialogDescription className="text-gray-500">
            取引先企業の基本情報を入力してください。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">基本情報</h3>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  企業名
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="例: 株式会社サンプル"
                  value={company.name || ''}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="industry" className="text-sm font-medium">
                  業種
                </Label>
                <Select
                  value={company.industry}
                  onValueChange={(value) => setCompany({ ...company, industry: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="業種を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT・通信</SelectItem>
                    <SelectItem value="製造">製造</SelectItem>
                    <SelectItem value="小売">小売</SelectItem>
                    <SelectItem value="サービス">サービス</SelectItem>
                    <SelectItem value="その他">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">連絡先情報</h3>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="contact_email" className="text-sm font-medium">
                  連絡先メール
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  placeholder="contact@example.com"
                  value={company.contact_email || ''}
                  onChange={(e) => setCompany({ ...company, contact_email: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="url" className="text-sm font-medium">
                  企業URL
                </Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={company.url || ''}
                  onChange={(e) => setCompany({ ...company, url: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contact_form_url" className="text-sm font-medium">
                  問い合わせフォームURL
                </Label>
                <Input
                  id="contact_form_url"
                  type="url"
                  placeholder="https://example.com/contact"
                  value={company.contact_form_url || ''}
                  onChange={(e) => setCompany({ ...company, contact_form_url: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">追加情報</h3>
            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                メモ
              </Label>
              <Textarea
                id="notes"
                placeholder="企業に関する補足情報があれば入力してください"
                value={company.notes || ''}
                onChange={(e) => setCompany({ ...company, notes: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={() => onSubmit(company)}>
            <PlusIcon className="h-4 w-4 mr-1" />
            企業を追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const CompanyManager: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [newCompany, setNewCompany] = useState<Partial<Company>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [domainRestriction, setDomainRestriction] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const supabase = useSupabaseClient();
  const user = useUser();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const fetchCompanies = useCallback(async () => {
    if (!user) {
      toast({
        title: 'エラー',
        description: 'ユーザー認証が必要です',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: result } = await supabase.functions.invoke('company-operations', {
        body: {
          action: 'searchCompanies',
          data: { 
            keyword: debouncedSearchTerm,
            userId: user.id,
            page: currentPage,
            itemsPerPage,
            domainRestriction
          }
        }
      });

      if (result) {
        setCompanies(result.companies || []);
        setTotalPages(Math.ceil(result.totalCount / itemsPerPage) || 1);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'エラー',
        description: '企業情報の取得に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [supabase, user, debouncedSearchTerm, currentPage, itemsPerPage, domainRestriction]);

  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [fetchCompanies, user]);

  const handleAddCompany = async () => {
    try {
      const { data: validationResult } = await supabase.functions.invoke('company-operations', {
        body: {
          action: 'validateCompany',
          data: newCompany
        }
      });

      if (!validationResult.valid) {
        toast({
          title: 'エラー',
          description: validationResult.errors.join('\n'),
          variant: 'destructive',
        });
        return;
      }

      const { data: addResult } = await supabase.functions.invoke('company-operations', {
        body: {
          action: 'addCompany',
          data: { newCompany }
        }
      });

      toast({
        title: '成功',
        description: '企業を追加しました。',
      });
      setIsAddDialogOpen(false);
      setNewCompany({});
      fetchCompanies();
    } catch (error) {
      console.error('Error adding company:', error);
      toast({
        title: 'エラー',
        description: '企業の追加に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  const handleEditCompany = async () => {
    if (!editingCompany) return;

    try {
      const { data: validationResult } = await supabase.functions.invoke('company-operations', {
        body: {
          action: 'validateCompany',
          data: editingCompany
        }
      });

      if (!validationResult.valid) {
        toast({
          title: 'エラー',
          description: validationResult.errors.join('\n'),
          variant: 'destructive',
        });
        return;
      }

      await supabase.functions.invoke('company-operations', {
        body: {
          action: 'editCompany',
          data: { company: editingCompany }
        }
      });

      toast({
        title: '成功',
        description: '企業情報を更新しました。',
      });
      setIsEditDialogOpen(false);
      setEditingCompany(null);
      fetchCompanies();
    } catch (error) {
      console.error('Error editing company:', error);
      toast({
        title: 'エラー',
        description: '企業情報の更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      await supabase.functions.invoke('company-operations', {
        body: {
          action: 'deleteCompany',
          data: { id: companyId }
        }
      });

      toast({
        title: '成功',
        description: '企業を削除しました。',
      });
      fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: 'エラー',
        description: '企業の削除に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvContent = e.target?.result as string;
        try {
          const { data: importResult } = await supabase.functions.invoke('company-operations', {
            body: {
              action: 'importCompaniesFromCSV',
              data: { csvContent }
            }
          });

          toast({
            title: '成功',
            description: `${importResult.importedCount}件の企業をインポートしました。`,
          });
          fetchCompanies();
        } catch (error) {
          console.error('Error importing CSV:', error);
          toast({
            title: 'エラー',
            description: 'CSVのインポートに失敗しました。',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCSVExport = async () => {
    try {
      const { data: exportResult } = await supabase.functions.invoke('company-operations', {
        body: {
          action: 'exportCompaniesToCSV'
        }
      });

      const blob = new Blob([exportResult], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'companies.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: 'エラー',
        description: 'CSVのエクスポートに失敗しました。',
        variant: 'destructive',
      });
    }
  };

  const handleCompaniesSelected = async (selectedCompanies: Company[]) => {
    console.log('handleCompaniesSelected called with:', selectedCompanies);
    try {
      const { data: addResult } = await supabase.functions.invoke('company-operations', {
        body: {
          action: 'addMultipleCompanies',
          data: { companies: selectedCompanies }
        }
      });
  
      toast({
        title: '成功',
        description: `${selectedCompanies.length}件の企業を追加しました。`,
      });
      setIsSearchDialogOpen(false);
      fetchCompanies();
    } catch (error) {
      console.error('Error adding companies:', error);
      toast({
        title: 'エラー',
        description: '企業の追加に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsSearching(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-md relative group">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 
            group-focus-within:text-primary" />
          <Input
            type="text"
            placeholder="企業名で検索..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-9 w-full transition-shadow focus:ring-2 ring-primary/20"
          />
          {isSearching && (
            <Loader2Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)} variant="default">
            <PlusIcon className="h-4 w-4 mr-1" />
            企業を追加
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileIcon className="h-4 w-4 mr-1" />
                インポート/エクスポート
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
                <UploadIcon className="h-4 w-4 mr-2" />
                CSVインポート
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCSVExport}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                CSVエクスポート
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsSearchDialogOpen(true)} variant="outline">
            <SearchIcon className="h-4 w-4 mr-1" />
            企業を検索して追加
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
              <TableHead className="font-medium">企業名</TableHead>
              <TableHead className="font-medium">業種</TableHead>
              <TableHead className="font-medium">連絡先メール</TableHead>
              <TableHead className="font-medium">URL</TableHead>
              <TableHead className="w-[180px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // ローディングスケルトン
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </TableCell>
                  <TableCell className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </TableCell>
                  <TableCell className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </TableCell>
                  <TableCell className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </TableCell>
                  <TableCell className="animate-pulse">
                    <div className="flex gap-2">
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <BuildingIcon className="h-12 w-12 text-gray-400" />
                    <div className="text-lg font-medium">企業が見つかりません</div>
                    <p className="text-sm text-gray-500">
                      新しい企業を追加するか、検索条件を変更してください
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow 
                  key={company.id}
                  className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium"
                      onClick={() => {
                        setSelectedCompany(company);
                        setIsDetailsDialogOpen(true);
                      }}
                    >
                      {company.website_display_name || company.name}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {company.industry && (
                      <Badge variant="secondary">{company.industry}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {company.contact_email && (
                      <a 
                        href={`mailto:${company.contact_email}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <MailIcon className="h-4 w-4" />
                        {company.contact_email}
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    {company.url && (
                      <a 
                        href={company.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <GlobeIcon className="h-4 w-4" />
                        {new URL(company.url).hostname}
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCompany(company);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        編集
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (company.id) {
                            handleDeleteCompany(company.id);
                          } else {
                            console.error('Company ID is undefined');
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        削除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(newItemsPerPage: number) => {
          setItemsPerPage(newItemsPerPage);
          setCurrentPage(1); // ページ数が変更されたら、最初のページに戻る
        }}
      />

      <AddCompanyDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddCompany}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>企業情報編集</DialogTitle>
          </DialogHeader>
          {editingCompany && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  企業名
                </Label>
                <Input
                  id="edit-name"
                  value={editingCompany.name}
                  onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-industry" className="text-right">
                  業種
                </Label>
                <Select
                  value={editingCompany.industry}
                  onValueChange={(value) => setEditingCompany({ ...editingCompany, industry: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="業種を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT・通信</SelectItem>
                    <SelectItem value="製造">製造</SelectItem>
                    <SelectItem value="小売">小売</SelectItem>
                    <SelectItem value="サービス">サービス</SelectItem>
                    <SelectItem value="その他">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-url" className="text-right">
                  企業URL
                </Label>
                <Input
                  id="edit-url"
                  type="url"
                  value={editingCompany.url}
                  onChange={(e) => setEditingCompany({ ...editingCompany, url: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-contact_email" className="text-right">
                  連絡先メール
                </Label>
                <Input
                  id="edit-contact_email"
                  type="email"
                  value={editingCompany.contact_email}
                  onChange={(e) => setEditingCompany({ ...editingCompany, contact_email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-contact_form_url" className="text-right">
                  問い合わせフォームURL
                </Label>
                <Input
                  id="edit-contact_form_url"
                  type="url"
                  value={editingCompany.contact_form_url}
                  onChange={(e) => setEditingCompany({ ...editingCompany, contact_form_url: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  電話番号
                </Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editingCompany.phone}
                  onChange={(e) => setEditingCompany({ ...editingCompany, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-address" className="text-right">
                  住所
                </Label>
                <Input
                  id="edit-address"
                  value={editingCompany.address}
                  onChange={(e) => setEditingCompany({ ...editingCompany, address: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-employee_count" className="text-right">
                  従業員数
                </Label>
                <Input
                  id="edit-employee_count"
                  type="number"
                  value={editingCompany.employee_count}
                  onChange={(e) => setEditingCompany({ ...editingCompany, employee_count: parseInt(e.target.value) || undefined })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-business_description" className="text-right">
                  事業内容
                </Label>
                <Textarea
                  id="edit-business_description"
                  value={editingCompany.business_description}
                  onChange={(e) => setEditingCompany({ ...editingCompany, business_description: e.target.value })}
                  className="col-span-3 min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-notes" className="text-right">
                  メモ
                </Label>
                <Textarea
                  id="edit-notes"
                  value={editingCompany.notes}
                  onChange={(e) => setEditingCompany({ ...editingCompany, notes: e.target.value })}
                  className="col-span-3 min-h-[100px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleEditCompany}>
              更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>CSVインポート</DialogTitle>
          </DialogHeader>
          <Input type="file" accept=".csv" onChange={handleCSVImport} />
        </DialogContent>
      </Dialog>

      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>企業を検索して追加</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <SearchCompany
              onCompaniesSelected={handleCompaniesSelected}
              setSearchKeyword={(keyword) => {/* 必要に応じて処理を追加 */}}
              domainRestriction=""
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>企業詳細</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <CompanyDetails
              company={selectedCompany}
              showActions
              onEdit={(company) => {
                setEditingCompany(company);
                setIsEditDialogOpen(true);
                setIsDetailsDialogOpen(false);
              }}
              onDelete={(id) => {
                handleDeleteCompany(id);
                setIsDetailsDialogOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyManager;
