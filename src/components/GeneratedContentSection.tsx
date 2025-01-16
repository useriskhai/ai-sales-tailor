import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Edit, Trash2 } from 'lucide-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContentEditDialog } from '@/components/ContentEditDialog';
import { useFormSubmission } from '@/utils/formSubmissionUtils';
import { AutomatedFormActions } from '@/components/AutomatedFormActions';

interface GeneratedContentSectionProps {
  userContents: any[];
  setUserContents: React.Dispatch<React.SetStateAction<any[]>>;
  session: any;
}

export const GeneratedContentSection: React.FC<GeneratedContentSectionProps> = ({
  userContents,
  setUserContents,
  session
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('作成日時');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [editingContent, setEditingContent] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const supabase = useSupabaseClient();

  const handleStatusUpdate = useCallback((generatedContentId: string, status: string, errorMessage?: string) => {
    setUserContents(prevContents => prevContents.map(content => 
      content.id === generatedContentId 
        ? { ...content, status, error_message: errorMessage } 
        : content
    ));
  }, [setUserContents]);

  const { submitForm } = useFormSubmission();

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedContents = useMemo(() => {
    if (!Array.isArray(userContents)) return [];

    return userContents
      .filter(content =>
        (content.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (content.search_keyword || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortColumn === '作成日時') {
          const aValue = new Date(a.created_at).getTime();
          const bValue = new Date(b.created_at).getTime();
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        } else if (sortColumn === '企業名') {
          const aValue = (a.company_name || '').toLowerCase();
          const bValue = (b.company_name || '').toLowerCase();
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else if (sortColumn === 'コンテンツ') {
          const aValue = a.content.toLowerCase();
          const bValue = b.content.toLowerCase();
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });
  }, [userContents, searchTerm, sortColumn, sortDirection]);

  const handleDelete = useCallback(async (contentId: string) => {
    if (!session?.user) return;
  
    try {
      const { error } = await supabase.functions.invoke('content-operations', {
        body: JSON.stringify({
          action: 'deleteUserContent',
          data: { contentId, userId: session.user.id }
        })
      });
  
      if (error) throw error;
  
      setUserContents(prevContents => prevContents.filter(content => content.id !== contentId));
      toast({
        title: "通知",
        description: "コンテンツが削除されました",
      });
    } catch (error) {
      console.error('コンテンツの削除に失敗しました。', error);
      toast({
        title: "エラー",
        description: "コンテンツの削除に失敗しました",
      });
    }
  }, [session, supabase, toast, setUserContents]);

  const handleEditDialogOpen = (content: any) => {
    setEditingContent(content);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditingContent(null);
    setIsEditDialogOpen(false);
  };

  const handleEditSave = async (updatedContent: string) => {
    if (!editingContent || !session?.user) return;

    setUserContents(prevContents => 
      prevContents.map(c => c.id === editingContent.id ? { ...c, content: updatedContent } : c)
    );
    handleEditDialogClose();
    toast({
      title: "通知",
      description: "コンテンツが更新されました",
    });
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: "通知",
        description: "コンテンツをクリップボードにコピーしました",
      });
    }).catch((err) => {
      console.error('コピーに失敗しました:', err);
      toast({
        title: "エラー",
        description: "コンテンツのコピーに失敗しました",
      });
    });
  };

  return (
    <Card className="max-w-full mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">生成したコンテンツ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {filteredAndSortedContents.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedContents.map((content, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <a
                    href={content.company_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline font-semibold"
                  >
                    {content.company_name || '企業名なし'}
                  </a>
                  <span className="text-sm text-gray-500">{new Date(content.created_at).toLocaleString()}</span>
                </div>
                <details>
                  <summary className="cursor-pointer text-blue-500">コンテンツを表示</summary>
                  <div className="mt-2">
                    <p className="whitespace-pre-wrap">{content.content}</p>
                  </div>
                </details>
                {content.status && (
                  <p className="mt-2">送信状態: {content.status}</p>
                )}
                <div className="flex space-x-2 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => handleCopyContent(content.content)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Dialog open={isEditDialogOpen && editingContent?.id === content.id} onOpenChange={(open) => {
                    if (!open) handleEditDialogClose();
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => handleEditDialogOpen(content)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px]">
                      <ContentEditDialog
                        content={editingContent?.content || ''}
                        contentId={editingContent?.id || ''}
                        userId={session?.user?.id || ''}
                        onSave={handleEditSave}
                        onCancel={handleEditDialogClose}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(content.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <AutomatedFormActions
                    content={content}
                    session={session}
                    onStatusUpdate={handleStatusUpdate}
                  />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p>生成したコンテンツはありません。</p>
        )}
      </CardContent>
    </Card>
  );
};