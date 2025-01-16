'use client';

import React from 'react';
import {
  Building,
  Globe,
  Mail,
  MapPin,
  Phone,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Company } from '@/types/company';

interface CompanyDetailsProps {
  company: Company;
  showActions?: boolean;
  onEdit?: (company: Company) => void;
  onDelete?: (id: string) => void;
}

export function CompanyDetails({
  company,
  showActions = false,
  onEdit,
  onDelete,
}: CompanyDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building className="w-5 h-5" />
          <span>会社情報</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{company.website_display_name || company.name}</h3>
            <div className="mt-4 space-y-3">
              {company.employee_count && (
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    従業員数: {company.employee_count}名
                  </span>
                </div>
              )}
              {company.contact_email && (
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={`mailto:${company.contact_email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {company.contact_email}
                  </a>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{company.phone}</span>
                </div>
              )}
              {company.address && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{company.address}</span>
                </div>
              )}
              {company.industry && (
                <div className="flex items-center space-x-2 text-sm">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    業種: {company.industry}
                  </span>
                </div>
              )}
              {company.contact_form_url && (
                <div className="flex items-center space-x-2 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={company.contact_form_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    問い合わせフォーム
                  </a>
                </div>
              )}
            </div>
            {company.url && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(company.url, '_blank')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  企業サイトを開く
                </Button>
              </div>
            )}
          </div>

          {company.description && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">説明</h4>
                <p className="text-sm text-muted-foreground">
                  {company.description}
                </p>
              </div>
            </>
          )}

          {company.business_description && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">事業内容（手動入力）</h4>
                <p className="text-sm text-muted-foreground">
                  {company.business_description}
                </p>
              </div>
            </>
          )}

          {company.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">メモ</h4>
                <p className="text-sm text-muted-foreground">{company.notes}</p>
              </div>
            </>
          )}

          {company.website_content && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Webサイトコンテンツ</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {company.website_content}
                </p>
              </div>
            </>
          )}

          {company.last_crawled_at && (
            <div className="text-xs text-muted-foreground mt-4">
              最終クロール: {new Date(company.last_crawled_at).toLocaleString()}
            </div>
          )}

          {showActions && company.id && (
            <>
              <Separator />
              <div className="flex justify-end space-x-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(company)}
                  >
                    編集
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(company.id)}
                  >
                    削除
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 