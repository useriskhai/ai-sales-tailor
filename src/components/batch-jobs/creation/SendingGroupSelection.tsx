"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { SendingGroup } from "@/types/sendingGroup";
import { Template } from "@/types/template";
import { mockSendingGroups } from "@/data/mockData";

interface SendingGroupSelectionProps {
  onSelect: (group: SendingGroup) => void;
  selectedGroup?: SendingGroup;
  template?: Template;
}

export function SendingGroupSelection({
  onSelect,
  selectedGroup,
  template
}: SendingGroupSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGroups, setFilteredGroups] = useState(mockSendingGroups);

  useEffect(() => {
    filterGroups();
  }, [searchTerm]);

  const filterGroups = () => {
    if (!searchTerm) {
      setFilteredGroups(mockSendingGroups);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = mockSendingGroups.filter(group => {
      const nameMatch = group.name.toLowerCase().includes(term);
      const descriptionMatch = group.description?.toLowerCase().includes(term) ?? false;
      const tagMatch = group.tags?.some(tag => tag.toLowerCase().includes(term)) ?? false;
      
      return nameMatch || descriptionMatch || tagMatch;
    });
    setFilteredGroups(filtered);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>送信グループの選択</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="グループ名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                    selectedGroup?.id === group.id ? 'border-primary' : ''
                  }`}
                  onClick={() => onSelect(group)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-muted-foreground">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <Badge>{group.total_contacts}社</Badge>
                  </div>
                  {group.tags && group.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {group.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {group.last_used_at && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      最終使用: {new Date(group.last_used_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
} 