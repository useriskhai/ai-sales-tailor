// フォームフィールドの型定義
export interface FormField {
  name: string;
  value: string;
  confidence: number;
  alternatives?: string[];
  type?: string;
  label?: string;
}

// フォームデータの型定義
export interface CustomFormData {
  action: string;
  method: string;
  fields: FormField[];
}

// フォーム送信のレスポンス
export interface FormSendResponse {
  message: string;
  response: string;
}

// フォーム送信のリクエスト
export interface FormSendRequest {
  formData: CustomFormData;
  companyName: string;
  content: string;
  userId: string;
}

// 送信タスクの状態
export enum SendingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// 送信タスクのインターフェース
export interface SendingTask {
  id: string;
  batch_job_id: string;
  company_id: string;
  content_id: string;
  user_id: string;
  preferred_method: 'form' | 'dm';
  status: SendingStatus;
  attempt_count: number;
  last_attempt: {
    timestamp: string;
    error?: string;
    method: 'form' | 'dm';
  };
  form_data?: {
    url: string;
    fields: FormField[];
    success_probability: number;
  };
  dm_data?: {
    platform: string;
    profile_url: string;
    success_probability: number;
  };
} 