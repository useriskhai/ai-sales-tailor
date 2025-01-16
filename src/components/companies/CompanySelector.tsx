import { Company } from '@/types/company';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCompanies } from '@/hooks/useCompanies';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
  selectedCompany: Company | null;
  onSelect: (company: Company | null) => void;
}

export function CompanySelector({ selectedCompany, onSelect }: Props) {
  const { companies, isLoading, error } = useCompanies();

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>エラーが発生しました</div>;
  }

  if (!companies || companies.length === 0) {
    return (
      <Alert variant="destructive" className="bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>会社が登録されていません。</span>
          <Link href="/companies" passHref>
            <Button variant="outline" size="sm">
              会社管理へ
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Select
      value={selectedCompany?.id}
      onValueChange={(value) => {
        const company = companies?.find((c) => c.id === value) ?? null;
        onSelect(company);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="会社を選択">
          {selectedCompany ? selectedCompany.website_display_name || selectedCompany.name : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {companies?.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            {company.website_display_name || company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 