export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  created_at: string;
  updated_at: string;
  role: 'user' | 'admin';
  // プロフィール情報を追加
  company?: string;
  position?: string;
} 