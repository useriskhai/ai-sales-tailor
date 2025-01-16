export interface JobLog {
    created_at: string;
    message: string;
    level: 'info' | 'warning' | 'error';
    job_id: string;
    task_id?: string;
}

export enum BatchJobStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    PAUSED = 'paused',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

export enum TaskStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

export enum TaskSubStatus {
    INITIAL = 'initial',
    CONTENT_GENERATION = 'content_generation',
    DM_PROCESS = 'dm_process',
    FORM_PROCESS = 'form_process'
}

export enum TaskDetailedStatus {
    INITIAL = 'initial',
    CONTENT_GENERATION = 'content_generation',
    CONTENT_GENERATED = 'content_generated',
    DM_CHECK = 'dm_check',
    DM_READY = 'dm_ready',
    FALLBACK_TO_FORM = 'fallback_to_form',
    FORM_DETECTION = 'form_detection',
    FORM_DETECTED = 'form_detected',
    FALLBACK_TO_DM = 'fallback_to_dm',
    DM_PREPARATION = 'dm_preparation',
    DM_SENDING = 'dm_sending',
    FORM_DATA_PREPARED = 'form_data_prepared',
    AUTO_FILL_READY = 'auto_fill_ready',
    SUBMISSION_IN_PROGRESS = 'submission_in_progress',
    COMPLETED_DM_SENT = 'completed_dm_sent',
    COMPLETED_FORM_SUBMITTED = 'completed_form_submitted',
    FAILED_CONTENT_GENERATION = 'failed_content_generation',
    FAILED_DM_SENDING = 'failed_dm_sending',
    FAILED_FORM_DETECTION = 'failed_form_detection',
    FAILED_FORM_SUBMISSION = 'failed_form_submission',
    FAILED_FALLBACK = 'failed_fallback'
}

export interface BatchJob {
    id: string; // UUID
    status: BatchJobStatus;
    product_id: string; // 製品ID
    sending_group_id: string; // 送信グループID
    completed_at?: string; // 完了日時
    error?: string; // エラーメッセージ
    completed_tasks: number; // 完了したタスク数
    total_tasks: number; // 総タスク数
    preferred_method: 'DM' | 'FORM'; // 優先方法
    user_id: string; // ユーザーID
    content_directives?: string; // コンテンツ生成指示
    parallel_tasks?: number; // 同時実行タスク数
    retry_attempts?: number; // 再試行回数
}

export interface JobHistoryResponse {
    data: BatchJob[];
    totalCount: number;
}

export interface BatchJobError {
    message: string;
    code?: string;
    details?: string;
}

export interface Company {
    id: string;
    name: string;
    url?: string;
    description?: string;
    business_description?: string;
    domain_for_check?: string | null;
    normalized_name?: string;
    user_id?: string;
    website_content?: string;
    last_crawled_at?: string;
}

export interface GroupCompanyResult {
    companies: {
        id: string;
        name: string;
        url: string;
        description?: string;
    }[];
}

export interface SearchCompanyResult {
    id: string;
    name: string;
    url?: string;
    description?: string;
    website_content?: string;
    website_display_name?: string;
    last_crawled_at?: string;
}

export type CompanyInput = Omit<Company, 'id' | 'created_at' | 'updated_at' | 'last_crawled_at'>;

export interface SendingGroup {
    id: string; // UUID
    name: string; // グループ名
    description: string; // 説明
    company_count: number; // 企業数
}

export interface UploadFileData {
    fileName: string; // ファイル名
    content?: string; // コンテンツ（オプショナル）
    userId: string; // ユーザーID
    productId: string; // 関連する製品のID
    fileUrl: string; // ファイルのURL
}

export interface Task {
    id: string; // UUID
    userId: string; // ユーザーID
    product: string; // 製品名
    company: string; // 企業名
    selectedModel: string; // 選択されたモデル
    fileContent: string; // ファイルの内容
    customPrompt: string; // カスタムプロンプト
    senderName: string; // 送信者名
    senderCompany: string; // 送信者の会社名
    sendMethod: 'form' | 'dm'; // 送信方法
    main_status: TaskStatus; // メインステータス
    sub_status: TaskSubStatus; // サブステータス
    detailed_status: TaskDetailedStatus; // 詳細ステータス
    created_at: string; // 作成日時
    updated_at: string; // 更新日時
    completed_at?: string; // 完了日時
    error?: string; // エラーメッセージ
    content?: string; // コンテンツ
    company_id: string; // 企業ID
  }

// メッセージ戦略の型定義
export type Strategy = 'benefit-first' | 'problem-solution' | 'story-telling' | 'direct-offer';
export type ToneOfVoice = 'formal' | 'professional' | 'friendly' | 'casual';
export type ContentFocus = 'benefit' | 'technical' | 'case-study' | 'roi' | 'relationship';

// バリデーション関数
export const isValidStrategy = (strategy: string): strategy is Strategy => {
  return ['benefit-first', 'problem-solution', 'story-telling', 'direct-offer'].includes(strategy);
};

export const isValidTone = (tone: string): tone is ToneOfVoice => {
  return ['formal', 'professional', 'friendly', 'casual'].includes(tone);
};

export const isValidFocus = (focus: string): focus is ContentFocus => {
  return ['benefit', 'technical', 'case-study', 'roi', 'relationship'].includes(focus);
};

// メッセージ戦略の設定値と日本語訳の定義
export const MessageStrategyConfig = {
  strategy: {
    'benefit-first': 'メリット訴求型',
    'problem-solution': '課題解決型',
    'story-telling': 'ストーリー型',
    'direct-offer': '直接提案型'
  },
  tone: {
    'formal': 'フォーマル',
    'professional': 'ビジネス',
    'friendly': 'フレンドリー',
    'casual': 'カジュアル'
  },
  focus: {
    'benefit': '利点',
    'technical': '技術的詳細',
    'case-study': '事例',
    'roi': 'ROI',
    'relationship': '関係構築'
  }
} as const;