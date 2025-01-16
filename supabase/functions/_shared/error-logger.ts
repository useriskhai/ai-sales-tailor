import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// 型定義
interface ErrorLogContext {
  company_id?: string;
  company_name?: string;
  action: string;
}

interface ErrorLog {
  id: string;
  error_message: string;
  error_stack?: string;
  context: ErrorLogContext;
  created_at: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function logError(error: Error, context: ErrorLogContext): Promise<void> {
  try {
    const errorLog: Omit<ErrorLog, 'id' | 'created_at'> = {
      error_message: error.message,
      error_stack: error.stack,
      context
    };

    const { error: insertError } = await supabase
      .from('error_logs')
      .insert(errorLog);

    if (insertError) {
      console.error('Failed to save error log:', insertError);
    }
  } catch (logError) {
    console.error('Error while logging error:', logError);
  }
} 