import React, { useState } from 'react';
import { Category, CATEGORY_LABELS } from '@/types/template';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BasicInfoData {
  name: string;
  description: string;
  category: Category;
  tags: string[];
  target_industry: string;
}

export interface BasicInfoStepProps {
  data: BasicInfoData;
  onSave: (data: BasicInfoData) => void;
}

const CATEGORIES = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value: value as Category,
  label,
}));

const validateCategory = (value: string): value is Category => {
  return Object.keys(CATEGORY_LABELS).includes(value);
};

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  data,
  onSave,
}) => {
  const [formData, setFormData] = useState<BasicInfoData>(data);
  const [tagInput, setTagInput] = useState('');

  const handleChange = (field: keyof BasicInfoData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
  ) => {
    const value = typeof event === 'string' ? event : event.target.value;
    
    if (field === 'category' && !validateCategory(value)) {
      console.error('Invalid category value:', value);
      return;
    }

    const newData = {
      ...formData,
      [field]: value,
    };
    setFormData(newData);
    onSave(newData);
  };

  const handleTagInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        const newData = {
          ...formData,
          tags: [...formData.tags, newTag],
        };
        setFormData(newData);
        onSave(newData);
      }
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    const newData = {
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToDelete),
    };
    setFormData(newData);
    onSave(newData);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">基本情報</h2>
      
      <div className="space-y-2">
        <Label htmlFor="template-name">テンプレート名</Label>
        <Input
          id="template-name"
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="例: IT企業向け新規開拓テンプレート"
          required
          aria-label="テンプレート名"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-description">説明</Label>
        <Textarea
          id="template-description"
          value={formData.description}
          onChange={handleChange('description')}
          placeholder="テンプレートの用途や特徴を説明してください"
          rows={4}
          required
          aria-label="説明"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">カテゴリ</Label>
        <Select
          value={formData.category}
          onValueChange={handleChange('category')}
        >
          <SelectTrigger id="category" aria-label="カテゴリ">
            <SelectValue placeholder="カテゴリを選択" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="target-industry">ターゲット業界</Label>
        <Input
          id="target-industry"
          value={formData.target_industry}
          onChange={handleChange('target_industry')}
          placeholder="例: IT・通信"
          aria-label="ターゲット業界"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tag-input">タグ</Label>
        <Input
          id="tag-input"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagInputKeyDown}
          placeholder="タグを入力してEnterで追加"
          aria-label="タグ"
        />
        <p className="text-sm text-muted-foreground">
          カンマまたはEnterキーで区切って複数のタグを追加できます
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="px-2 py-1 flex items-center gap-1"
            >
              {tag}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent"
                onClick={() => handleDeleteTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}; 