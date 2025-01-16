import { Company } from '@/types/company';

export const mockCompanies: Record<string, Company> = {
  'company-1': {
    id: 'company-1',
    name: 'テクノロジー株式会社',
    employee_count: 250,
    url: 'https://tech-company.example.com',
    contact_email: 'contact@tech-company.example.com',
    phone: '03-1234-5678',
    address: '東京都渋谷区...',
    business_description: 'クラウドサービスの開発・提供、システムインテグレーション'
  },
  'company-2': {
    id: 'company-2',
    name: 'イノベーション株式会社',
    employee_count: 180,
    url: 'https://innovation.example.com',
    contact_email: 'info@innovation.example.com',
    phone: '03-2345-6789',
    address: '東京都新宿区...',
    business_description: 'ITコンサルティング、業務システム開発'
  },
  'company-3': {
    id: 'company-3',
    name: 'フューチャー株式会社',
    employee_count: 150,
    url: 'https://future.example.com',
    contact_email: 'contact@future.example.com',
    phone: '03-3456-7890',
    address: '東京都中央区...',
    business_description: 'AIソリューション開発、データ分析'
  },
  'company-4': {
    id: 'company-4',
    name: 'フジタルソリューションズ',
    employee_count: 120,
    url: 'https://digital-solutions.example.com',
    contact_email: 'info@digital-solutions.example.com',
    phone: '03-4567-8901',
    address: '東京都港区...',
    business_description: 'デジタルトランスフォーメーション支援'
  },
  'company-5': {
    id: 'company-5',
    name: 'データアナリティクス',
    employee_count: 90,
    url: 'https://data-analytics.example.com',
    contact_email: 'contact@data-analytics.example.com',
    phone: '03-5678-9012',
    address: '東京都品川区...',
    business_description: 'ビッグデータ分析、データサイエンス'
  }
}; 