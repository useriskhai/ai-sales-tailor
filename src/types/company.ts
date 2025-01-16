export interface Company {
  id: string;
  name: string;
  url?: string;
  industry?: string;
  contact_email?: string;
  contact_form_url?: string;
  phone?: string;
  address?: string;
  employee_count?: number;
  business_description?: string;
  description?: string;
  founded_year?: number;
  notes?: string;
  website_content?: string;
  website_display_name?: string;
  last_crawled_at?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export type CompanyInput = Omit<Company, 'id' | 'created_at' | 'updated_at'>;

export interface ExcludedCompany {
  id: string;
  company_id: string;
  reason: string;
  excluded_at: string;
  excluded_by: string;
  notes?: string;
}

export interface CompanySearchFilters {
  industry?: string[];
  employee_size?: string[];
  location?: string[];
  keywords?: string[];
  excluded?: boolean;
}

export interface CompanyImportResult {
  total: number;
  success: number;
  failed: number;
  errors: {
    row: number;
    message: string;
    data: Record<string, unknown>;
  }[];
}

export interface CompanyInfo {
  name: string;                 // 企業名
  originalUrl: string;          // 元URL
  topPageUrl: string;          // トップページURL
  description?: string;         // 説明
  industry?: string;           // 業種
  location?: string;           // 所在地
  employeeCount?: number;      // 従業員数
  foundedYear?: number;        // 設立年
  metaData: {                  // メタデータ
    title: string;             // ページタイトル
    description?: string;      // メタディスクリプション
    keywords?: string[];       // メタキーワード
  };
  extractionSource: {          // 抽出元情報
    method: 'title' | 'meta' | 'content';  // 抽出方法
    confidence: number;        // 確信度（0-1）
    timestamp: string;         // 取得時刻
  };
}

export interface CompanyExtractResult {
  success: boolean;
  data?: CompanyInfo;
  error?: string;
  confidence: number;
}