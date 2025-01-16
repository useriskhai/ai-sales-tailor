import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink, Send, FileInput } from 'lucide-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useFormAutomation } from '@/utils/formAutomationUtils';

interface AutomatedFormActionsProps {
  content: any;
  session: any;
  onStatusUpdate: (generatedContentId: string, status: string, errorMessage?: string) => void;
}

export const AutomatedFormActions: React.FC<AutomatedFormActionsProps> = ({
  content,
  session,
  onStatusUpdate
}) => {
  const supabase = useSupabaseClient();
  const { openContactPage, autoSubmitForm, autoFillForm, isLoading } = useFormAutomation(supabase, session, onStatusUpdate);

  return (
    <div className="flex space-x-2">
      <Button variant="ghost" size="sm" onClick={() => openContactPage(content)} disabled={isLoading}>
        <ExternalLink className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => autoSubmitForm(content)} disabled={isLoading}>
        <Send className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => autoFillForm(content)} disabled={isLoading}>
        <FileInput className="w-4 h-4" />
      </Button>
    </div>
  );
};