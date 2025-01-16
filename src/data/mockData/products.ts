import { Product } from '@/types/product';

export const mockProducts: Product[] = [
  {
    id: 'product-1',
    user_id: 'user-1',
    name: 'AI営業アシスタント',
    description: '営業活動を効率化するAIツール',
    usp: '営業プロセスの自動化による生産性向上',
    benefits: [
      'AIによる顧客分析',
      '自動メール作成',
      'フォローアップ管理',
      '商談スケジュール管理'
    ],
    solutions: [
      '営業活動の自動化',
      'データ駆動型の意思決定',
      '効率的な顧客管理'
    ],
    price_range: '¥50,000 - ¥100,000/月',
    challenges: '営業活動の非効率性、顧客フォローの漏れ、データ活用の不足',
    case_studies: [
      {
        industry: '製造業',
        companySize: '中規模',
        challenge: '営業プロセスの効率化',
        result: '商談数が30%増加、成約率が20%向上'
      }
    ],
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-12-01')
  },
  {
    id: 'product-2',
    user_id: 'user-1',
    name: 'データ分析プラットフォーム',
    description: '顧客データを分析し、インサイトを提供',
    usp: 'リアルタイムデータ分析による迅速な意思決定',
    benefits: [
      'リアルタイムデータ分析',
      'カスタムレポート作成',
      'データ可視化',
      'AIによる予測分析'
    ],
    solutions: [
      'データの一元管理',
      '分析プロセスの自動化',
      'インサイトの可視化'
    ],
    price_range: '¥100,000 - ¥200,000/月',
    challenges: 'データの分散管理、分析の遅延、インサイトの活用不足',
    case_studies: [
      {
        industry: '小売業',
        companySize: '大規模',
        challenge: '顧客行動分析の効率化',
        result: '売上が15%増加、在庫回転率が25%改善'
      }
    ],
    created_at: new Date('2023-02-01'),
    updated_at: new Date('2023-12-01')
  },
  {
    id: 'product-3',
    user_id: 'user-1',
    name: 'マーケティング自動化ツール',
    description: 'マーケティングキャンペーンの自動化と最適化',
    usp: '効率的なマーケティング施策の実現',
    benefits: [
      'キャンペーン自動配信',
      'A/Bテスト',
      '顧客セグメンテーション',
      'パフォーマンス分析'
    ],
    solutions: [
      'マーケティング業務の自動化',
      'データに基づくキャンペーン最適化',
      '効果測定の効率化'
    ],
    price_range: '¥80,000 - ¥150,000/月',
    challenges: 'キャンペーン管理の煩雑さ、効果測定の遅延、セグメント分析の不足',
    case_studies: [
      {
        industry: 'サービス業',
        companySize: '中規模',
        challenge: 'マーケティング施策の効率化',
        result: '顧客獲得コストを40%削減、CVRが25%向上'
      }
    ],
    created_at: new Date('2023-03-01'),
    updated_at: new Date('2023-12-01')
  }
]; 