"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Company } from "@/types/company";
import { Checkbox } from "@/components/ui/checkbox";

interface TargetSelectionProps {
  onSelect: (company: Company) => void;
  selectedCompanies?: Company[];
  companies: Company[];
}

export function TargetSelection({
  onSelect,
  selectedCompanies: initialSelectedCompanies = [],
  companies
}: TargetSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState(companies);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedCompanies.map(c => c.id));

  useEffect(() => {
    filterCompanies();
  }, [searchTerm, companies]);

  const filterCompanies = () => {
    if (!searchTerm) {
      setFilteredCompanies(companies);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = companies.filter(company => {
      const nameMatch = company.name.toLowerCase().includes(term);
      const industryMatch = company.industry?.toLowerCase().includes(term) ?? false;
      const descriptionMatch = company.business_description?.toLowerCase().includes(term) ?? false;
      return nameMatch || industryMatch || descriptionMatch;
    });
    setFilteredCompanies(filtered);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ターゲット企業の選択</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="企業名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                    selectedIds.includes(company.id) ? 'border-primary' : ''
                  }`}
                  onClick={() => onSelect(company)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{company.name}</p>
                        {company.industry && (
                          <p className="text-xs text-gray-500">{company.industry}</p>
                        )}
                      </div>
                      <Checkbox
                        checked={selectedIds.includes(company.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedIds([...selectedIds, company.id]);
                          } else {
                            setSelectedIds(selectedIds.filter(id => id !== company.id));
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
} 