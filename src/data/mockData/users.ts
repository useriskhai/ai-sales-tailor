import { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: 'user',
    company: 'Test Company',
    position: 'Test Position'
  }
]; 