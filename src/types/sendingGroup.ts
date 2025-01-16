export interface SendingGroup {
  id: string; // UUID
  name: string; // グループ名
  description?: string; // 説明
  user_id: string;
  created_at: string;
  updated_at?: string;
  company_count: number; // 企業数
  total_contacts: number; // 総連絡先数
  tags?: string[]; // タグ
  last_used_at?: string | null; // 最終使用日時
}