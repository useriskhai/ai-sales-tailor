import React, { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVirtualizer } from '@tanstack/react-virtual';
import debounce from 'lodash/debounce';
import { motion } from 'framer-motion';
import { Search, Loader2, CheckSquare, Square, Globe as GlobeIcon } from 'lucide-react';
import { Company } from '@/types/company';
import { AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface CompanySelectorProps {
  onCompaniesSelected: (companies: Company[]) => void;
  initialSelectedCompanies: Company[];
  isNewGroup?: boolean | null;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({ 
  onCompaniesSelected, 
  initialSelectedCompanies,
  isNewGroup 
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>(initialSelectedCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState<'name' | 'created_at'>('name');
  const ITEMS_PER_PAGE = 100;
  const { session } = useAuth();

  const isAllSelected = companies.length > 0 && companies.length === selectedCompanies.length;

  const handleSelectAll = (checked: boolean) => {
    setSelectedCompanies(checked ? companies : []);
  };

  const supabase = useSupabaseClient();
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: companies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  });

  const fetchCompanies = async (search: string = '') => {
    if (!session?.user?.id) {
      setError('ユーザー認証が必要です');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: result } = await supabase.functions.invoke('company-operations', {
        body: {
          action: 'searchCompanies',
          data: { 
            keyword: search,
            userId: session.user.id,
            page,
            itemsPerPage: ITEMS_PER_PAGE,
            searchType: 'default'
          }
        }
      });

      if (!result) {
        setCompanies([]);
        setHasMore(false);
        setTotalCount(0);
        return;
      }

      const companies = Array.isArray(result) ? result : result.companies || [];
      const totalCount = Array.isArray(result) ? result.length : result.totalCount || companies.length;

      setCompanies(prevCompanies => (page === 1 ? companies : [...prevCompanies, ...companies]));
      setHasMore(totalCount > page * ITEMS_PER_PAGE);
      setTotalCount(totalCount);

      if (companies.length === 0 && search) {
        setError('検索条件に一致する企業が見つかりませんでした。');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('企業データの取得に失敗しました。');
      setCompanies([]);
      setHasMore(false);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchCompanies = useCallback(
    debounce((search: string) => {
      setPage(1);
      setCompanies([]);
      fetchCompanies(search);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFetchCompanies(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (page > 1) {
      fetchCompanies(searchTerm);
    }
  }, [page]);

  useEffect(() => {
    if (initialSelectedCompanies.length > 0) {
      setSelectedCompanies(initialSelectedCompanies);
    }
  }, [initialSelectedCompanies]);

  const handleCompanySelect = (companyId: string) => {
    const targetCompany = companies.find(c => c.id === companyId);
    if (!targetCompany) return;

    setSelectedCompanies(prev => 
      prev.some(c => c.id === companyId)
        ? prev.filter(c => c.id !== companyId)
        : [...prev, targetCompany]
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handleSubmit = () => {
    const selectedCompanyObjects = companies.filter(company => selectedCompanies.some(c => c.id === company.id));
    onCompaniesSelected(selectedCompanyObjects);
  };

  const toggleAllCompanies = () => {
    if (selectedCompanies.length === companies.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(companies);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, companyId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCompanySelect(companyId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 p-4 bg-white rounded-lg shadow-md"
    >
      {isNewGroup && (
        <div className="rounded-lg bg-muted p-4 mb-6">
          <div className="flex items-start space-x-3">
            <CheckSquare className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">グループを作成しました</h4>
              <p className="text-sm text-muted-foreground mt-1">
                次に、グループに追加する企業を選択してください
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="企業名で検索..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>
        <Select
          value={sortField}
          onValueChange={(value) => setSortField(value as 'name' | 'created_at')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="並び替え" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">企業名</SelectItem>
            <SelectItem value="created_at">登録日</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <div className="p-4 border-b bg-muted">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">全て選択</span>
            </div>
            <Badge variant="secondary">
              {selectedCompanies.length}社選択中
            </Badge>
          </div>
        </div>

        <div className="divide-y max-h-[400px] overflow-y-auto">
          {companies.map((company) => (
            <div
              key={company.id}
              className="p-4 flex items-center space-x-4 hover:bg-muted/50"
            >
              <Checkbox
                checked={selectedCompanies.some(c => c.id === company.id)}
                onCheckedChange={(checked) => handleCompanySelect(company.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{company.name}</p>
                {company.url && (
                  <a
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:underline flex items-center space-x-1"
                  >
                    <GlobeIcon className="h-3.5 w-3.5" />
                    <span>{new URL(company.url).hostname}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {totalCount}社中{selectedCompanies.length}社を選択
        </p>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => setSelectedCompanies([])}>
            選択をクリア
          </Button>
          <Button 
            onClick={() => onCompaniesSelected(selectedCompanies)}
            disabled={selectedCompanies.length === 0}
          >
            {selectedCompanies.length}社を追加
          </Button>
        </div>
      </div>

      <AlertDescription className="flex items-center justify-between">
        <span>会社が登録されていません。</span>
        <Link href="/companies" passHref>
          <Button variant="outline" size="sm">
            会社管理へ
          </Button>
        </Link>
      </AlertDescription>
    </motion.div>
  );
};