import { SendingGroup } from '@/types/sendingGroup';

export const mockSendingGroups: SendingGroup[] = [
  {
    id: 'group-1',
    name: 'IT企業グループA',
    description: '首都圏のIT企業（従業員100名以上）',
    user_id: 'user-1',
    company_count: 80,
    total_contacts: 100,
    tags: ['IT', '首都圏', '中堅企業'],
    created_at: '2024-02-28T00:00:00Z',
    updated_at: '2024-03-01T11:30:00Z',
    last_used_at: '2024-03-01T11:30:00Z'
  },
  {
    id: 'group-2',
    name: '地方自治体グループ',
    description: '人口10万人以上の地方自治体',
    user_id: 'user-1',
    company_count: 40,
    total_contacts: 50,
    tags: ['公共団体', '地方自治体', '人口10万以上'],
    created_at: '2024-02-25T00:00:00Z',
    updated_at: '2024-03-02T09:00:00Z',
    last_used_at: '2024-03-02T09:00:00Z'
  },
  {
    id: 'group-3',
    name: 'IT企業グループB',
    description: '関西圏のIT企業（従業員50名以上）',
    user_id: 'user-1',
    company_count: 60,
    total_contacts: 75,
    tags: ['IT', '関西圏', '中小企業'],
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    last_used_at: null
  }
]; 