import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  SearchIcon,
  Loader2Icon,
  ChevronRight, 
  X,
  CheckIcon,
  MinusCircleIcon,
  CheckCircleIcon,
  GlobeIcon,
  InfoIcon
} from 'lucide-react';
import Link from 'next/link';
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from 'framer-motion';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useAuth } from '@/contexts/AuthContext';
import { Company } from '@/types/company';
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SearchCompanyProps {
  onCompaniesSelected: (companies: Company[]) => void;
  setSearchKeyword: (keyword: string) => void;
  domainRestriction: string;
  onClose?: () => void;
}

export function SearchCompany({ onCompaniesSelected, setSearchKeyword, domainRestriction, onClose }: SearchCompanyProps) {
  const [searchKeyword, setLocalSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchAlertMessage, setSearchAlertMessage] = useState('');
  const [targetCompanies, setTargetCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [displayedCompanies, setDisplayedCompanies] = useState<Company[]>([]);
  const [page, setPage] = useState(1);
  const [companyLimit, setCompanyLimit] = useState(5);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const supabase = useSupabaseClient();
  const companiesPerPage = 10;
  const { session } = useAuth();
  const [isAllSelected, setIsAllSelected] = useState(true);
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [descriptionLoading, setDescriptionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSearchKeyword(searchKeyword);
  }, [searchKeyword]);

  useEffect(() => {
    setDisplayedCompanies(targetCompanies.slice(0, page * companiesPerPage));
  }, [targetCompanies, page]);

  useEffect(() => {
    const loadCompanyLimit = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase.functions.invoke('user-operations', {
            body: JSON.stringify({
              action: 'getUserSettings',
              data: { userId: session.user.id }
            }),
          });
    
          if (error) throw error;
    
          setCompanyLimit(data?.company_limit || 5);
        } catch (error) {
          console.error('会社制限の読み込みエラー:', error);
        }
      }
    };

    loadCompanyLimit();
  }, [session, supabase]);

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handleSearch = async () => {
    if (!searchKeyword) {
      setSearchAlertMessage('業界を入力してください。');
      return;
    }
    if (companyLimit === null) {
      setSearchAlertMessage('設定の読み込み中です。しばらくお待ちください。');
      return;
    }
    if (!session?.user?.id) {
      setSearchAlertMessage('ユーザー認証に失敗しました。再度ログインしてください。');
      return;
    }

    try {
      setIsLoading(true);
      setSearchAlertMessage('');
      setSearchPerformed(true);

      const { data: companies, error } = await supabase.functions.invoke('company-operations', {
        body: {
          action: 'searchCompanies',
          data: {
            keyword: searchKeyword,
            userId: session.user.id,
            page: 1,
            itemsPerPage: 10,
            domainRestriction,
            searchType: 'external'
          }
        }
      });

      if (error) throw error;

      if (!companies?.companies || companies.companies.length === 0) {
        setSearchAlertMessage('検索結果が見つかりませんでした。');
        setTargetCompanies([]);
        setSearchResults([]);
        return;
      }

      setSearchResults(companies.companies);
      setTargetCompanies(companies.companies);
      setSelectedCompanies(new Set(companies.companies.map(company => company.id)));
      setPage(1);

    } catch (error) {
      console.error('企業検索エラー:', error);
      setSearchAlertMessage('検索中にエラーが発生しました。時間をおいて再度お試しください。');
      setTargetCompanies([]);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyToggle = (companyId: string | undefined) => {
    if (!companyId) return;
    
    console.log('企業の選択状態を切り替え:', companyId);
    console.log('現在の選択状態:', Array.from(selectedCompanies));
    console.log('isAllSelected:', isAllSelected);
    
    setSelectedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
        console.log('企業の選択を解除:', companyId);
      } else {
        newSet.add(companyId);
        console.log('企業を選択:', companyId);
      }
      console.log('新しい選択状態:', Array.from(newSet));
      return newSet;
    });
  };

  const handleConfirmSelection = async () => {
    try {
      if (!session?.user?.id) {
        setSearchAlertMessage('ユーザー認証に失敗しました。再度ログインしてください。');
        return;
      }

      const selectedCompanyList = searchResults.filter(company => 
        selectedCompanies.has(company.id)
      );

      if (selectedCompanyList.length === 0) {
        setSearchAlertMessage('企業を選択してください。');
        return;
      }

      setIsLoading(true);
      const { data: result, error } = await supabase.functions.invoke('company-operations', {
        body: {
          action: 'insertCompanies',
          data: {
            companies: selectedCompanyList,
            userId: session.user.id,
            searchKeyword
          }
        }
      });

      if (error) throw error;

      console.log('企業登録成功:', result);
      onCompaniesSelected(result);
      onClose?.();

    } catch (error) {
      console.error('企業登録エラー:', error);
      setSearchAlertMessage('企業の登録に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelection = () => {
    console.log('全選択/解除の切り替え');
    console.log('現在のisAllSelected:', isAllSelected);
    console.log('現在の選択状態:', Array.from(selectedCompanies));
    
    setSelectedCompanies(isAllSelected 
      ? new Set() 
      : new Set(targetCompanies.map(company => company.id).filter((id): id is string => id !== undefined))
    );
    setIsAllSelected(!isAllSelected);
    
    console.log('新しいisAllSelected:', !isAllSelected);
  };

  const fetchCompanyDescription = async (company: Company) => {
    if (!company.url) return;
    
    setDescriptionLoading(prev => ({ ...prev, [company.id]: true }));
    
    try {
      console.log('企業情報取得開始:', company.url);
      
      const response = await supabase.functions.invoke('proxy-html', {
        body: { url: company.url }
      });

      console.log('proxy-html レスポンス:', response);

      if (response.error) {
        console.error('proxy-htmlエラー:', response.error);
        throw response.error;
      }

      if (!response.data) {
        console.error('proxy-htmlレスポンスにデータがありません');
        return;
      }

      const { html } = response.data;
      
      if (!html) {
        console.error('HTMLコンテンツが取得できませんでした');
        return;
      }

      // HTMLからメタ情報を抽出
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // メタ情報を取得
      const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      console.log('取得したメタ情報:', metaDescription);

      // 企業情報を更新
      const companyInfo: Partial<Company> = {
        id: company.id,
        website_content: metaDescription || doc.title || '説明が見つかりません'
      };

      // 更新された企業情報を反映
      setTargetCompanies(prev => 
        prev.map(c => c.id === company.id ? { ...c, ...companyInfo } : c)
      );

    } catch (error) {
      console.error('企業情報の取得に失敗しました:', error);
    } finally {
      setDescriptionLoading(prev => ({ ...prev, [company.id]: false }));
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col px-6">
      {/* ヘッダー部分 */}
      <div className="flex-shrink-0 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">企業を検索</h2>
            <p className="text-sm text-muted-foreground mt-1">
              業界名を入力して企業を検索できます
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchPerformed(false);
              setLocalSearchKeyword('');
            }}
          >
            <X className="h-4 w-4 mr-1.5" />
            検索をクリア
          </Button>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 
              group-focus-within:text-primary transition-colors" />
            <Input
              id="search-keyword"
              type="text"
              placeholder="例：製造業、IT、小売など"
              value={searchKeyword}
              onChange={(e) => setLocalSearchKeyword(e.target.value)}
              className="pl-9 pr-10"
            />
            {searchKeyword && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0
                  hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setLocalSearchKeyword('')}
                aria-label="検索をクリア"
              >
                <X className="h-4 w-4 text-gray-500" />
              </Button>
            )}
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={!searchKeyword || isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                検索中
              </>
            ) : (
              <>
                <SearchIcon className="mr-2 h-4 w-4" />
                検索
              </>
            )}
          </Button>
        </div>

        {!searchPerformed && !isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <InfoIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <p>具体的な業界名を入力すると、より正確な結果が得られます。複数の業界をカンマ区切りで入力することもできます。</p>
          </div>
        )}
      </div>

      {/* 検索結果 */}
      {searchPerformed && (
        <div className="flex-1 flex flex-col min-h-0 -mx-6">
          {/* 結果ヘッダー */}
          <div className="flex-shrink-0 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-3 border-y">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-medium">検索結果</h3>
                <Badge variant="secondary" className="font-normal">
                  {targetCompanies.length}件
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleSelection}
                  className="text-sm"
                >
                  {isAllSelected ? (
                    <>
                      <MinusCircleIcon className="mr-1.5 h-4 w-4" />
                      選択を解除
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="mr-1.5 h-4 w-4" />
                      すべて選択
                    </>
                  )}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedCompanies.size}社選択中
              </div>
            </div>
          </div>

          {/* スクロール可能な結果リスト */}
          <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-20">
            <div className="py-4 space-y-2">
              {displayedCompanies.map((company) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="mb-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`company-${company.id}`}
                          checked={selectedCompanies.has(company.id)}
                          onCheckedChange={() => handleCompanyToggle(company.id)}
                        />
                        <CardTitle className="text-md font-bold">
                          {company.name}
                        </CardTitle>
                        {company.url && (
                          <Link
                            href={company.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <GlobeIcon className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {company.description && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">
                              {company.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {displayedCompanies.length < targetCompanies.length && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    className="w-full"
                  >
                    あと {Math.min(10, targetCompanies.length - displayedCompanies.length)} 件を表示
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* フッター */}
          <div className="flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 fixed bottom-0 left-0 right-0 p-4 border-t">
            <div className="container flex items-center justify-between gap-4">
              <div className="text-sm">
                <span className="font-medium">{selectedCompanies.size}</span>
                <span className="text-muted-foreground">社を選択中</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchPerformed(false);
                    setLocalSearchKeyword('');
                  }}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleConfirmSelection}
                  disabled={selectedCompanies.size === 0}
                >
                  <CheckIcon className="mr-2 h-4 w-4" />
                  {selectedCompanies.size}社を追加
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {searchAlertMessage && (
        <Alert className="mt-4">
          <AlertDescription>{searchAlertMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
