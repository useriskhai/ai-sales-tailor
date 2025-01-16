import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Bold, Italic, List, ListOrdered } from 'lucide-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface ContentEditDialogProps {
  content: string;
  contentId: string;
  userId: string;
  onSave: (updatedContent: string) => void;
  onCancel: () => void;
}

export const ContentEditDialog: React.FC<ContentEditDialogProps> = ({ content, contentId, userId, onSave, onCancel }) => {
  const [editedContent, setEditedContent] = useState(content);
  const [wordCount, setWordCount] = useState(0);
  const { toast } = useToast();
  const supabase = useSupabaseClient();

  useEffect(() => {
    setWordCount(editedContent.split(/\s+/).length);
  }, [editedContent]);

  const handleSave = async () => {
    try {
      const { error } = await supabase.functions.invoke('product-operations', {
        body: JSON.stringify({
          action: 'updateUserContent',
          data: { 
            contentId,
            userId,
            updatedContent: editedContent
          }
        })
      });

      if (error) throw error;

      onSave(editedContent);
      toast({
        title: "保存完了",
        description: "コンテンツが正常に保存されました。",
      });
    } catch (error) {
      console.error('コンテンツの更新に失敗しました:', error);
      toast({
        title: "エラー",
        description: "コンテンツの更新に失敗しました",
      });
    }
  };

  const handleFormat = (type: 'bold' | 'italic' | 'ul' | 'ol') => {
    let updatedContent = editedContent;
    switch(type) {
      case 'bold':
        updatedContent = `**${editedContent}**`;
        break;
      case 'italic':
        updatedContent = `*${editedContent}*`;
        break;
      case 'ul':
        updatedContent = `- ${editedContent}`;
        break;
      case 'ol':
        updatedContent = `1. ${editedContent}`;
        break;
    }
    setEditedContent(updatedContent);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">コンテンツを編集</h2>
      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">編集</TabsTrigger>
          <TabsTrigger value="preview">プレビュー</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <div className="mb-4">
            <div className="flex space-x-2 mb-2">
              <Button size="sm" onClick={() => handleFormat('bold')}><Bold size={16} /></Button>
              <Button size="sm" onClick={() => handleFormat('italic')}><Italic size={16} /></Button>
              <Button size="sm" onClick={() => handleFormat('ul')}><List size={16} /></Button>
              <Button size="sm" onClick={() => handleFormat('ol')}><ListOrdered size={16} /></Button>
            </div>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-64 mb-2"
              placeholder="コンテンツを入力..."
            />
            <div className="text-sm text-gray-500">文字数: {wordCount}</div>
          </div>
        </TabsContent>
        <TabsContent value="preview">
          <div className="border p-4 h-64 overflow-auto">
            {editedContent}
          </div>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end space-x-2 mt-4">
        <Button onClick={onCancel}>キャンセル</Button>
        <Button onClick={handleSave}>保存</Button>
      </div>
    </div>
  );
};