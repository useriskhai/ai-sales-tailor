import { 
  SystemKPITarget, 
  CustomKPITarget, 
  SYSTEM_METRICS, 
  CUSTOM_KPI_UNITS,
  KPIAnalysis
} from '@/types/template';

// システムKPIのターゲット設定のモック
export const mockSystemKPITargets: SystemKPITarget[] = [
  {
    type: 'system',
    metric: SYSTEM_METRICS.FORM_LINK_CLICK,
    target: 100,
    weight: 0.6,
    minimumThreshold: 50,
    maximumThreshold: 200,
  },
  {
    type: 'system',
    metric: SYSTEM_METRICS.FORM_LINK_CLICK_RATE,
    target: 0.15,
    weight: 0.4,
    minimumThreshold: 0.05,
    maximumThreshold: 0.3,
  },
];

// カスタムKPIのターゲット設定のモック
export const mockCustomKPITargets: CustomKPITarget[] = [
  {
    type: 'custom',
    id: 'meeting_count',
    name: '商談獲得数',
    description: '月間の新規商談獲得数',
    unit: CUSTOM_KPI_UNITS.NUMBER,
    target: 100,
    weight: 0.3,
    minimumThreshold: 30,
    maximumThreshold: 150,
    trackingMethod: 'manual',
  },
  {
    type: 'custom',
    id: 'conversion_rate',
    name: '商談成約率',
    description: '商談から成約に至った割合',
    unit: CUSTOM_KPI_UNITS.PERCENTAGE,
    target: 0.20,
    weight: 0.3,
    minimumThreshold: 0.15,
    maximumThreshold: 0.30,
    trackingMethod: 'manual',
  },
  {
    type: 'custom',
    id: 'response_quality',
    name: '返信品質スコア',
    description: '返信の好意的な態度を数値化',
    unit: CUSTOM_KPI_UNITS.NUMBER,
    target: 8.5,
    weight: 0.2,
    minimumThreshold: 7.0,
    maximumThreshold: 10.0,
    trackingMethod: 'manual',
  },
  {
    type: 'custom',
    id: 'time_to_meeting',
    name: '商談設定までの日数',
    description: '初回接触から商談設定までの平均日数',
    unit: CUSTOM_KPI_UNITS.NUMBER,
    target: 7,
    weight: 0.1,
    minimumThreshold: 14,
    maximumThreshold: 3,
    trackingMethod: 'manual',
  },
  {
    type: 'custom',
    id: 'sales_productivity',
    name: '営業生産性',
    description: '営業担当者1人あたりの月間商談数',
    unit: CUSTOM_KPI_UNITS.NUMBER,
    target: 20,
    weight: 0.1,
    minimumThreshold: 6,
    maximumThreshold: 30,
    trackingMethod: 'manual',
  }
];

// KPI分析結果のモック
export const mockKPIAnalysis: KPIAnalysis = {
  templateId: 'template-123',
  period: '30d',
  startDate: '2024-02-01',
  endDate: '2024-03-01',
  
  // システムで測定した結果
  systemResults: {
    form_link_click: {
      kpiId: SYSTEM_METRICS.FORM_LINK_CLICK,
      type: 'system',
      value: 85,
      targetValue: 100,
      achievement: 0.85,
      trend: 0.1,
      sampleSize: 1000,
      lastUpdated: '2024-03-01T12:00:00Z',
      dataSource: 'system',
    },
    form_link_click_rate: {
      kpiId: SYSTEM_METRICS.FORM_LINK_CLICK_RATE,
      type: 'system',
      value: 0.085,
      targetValue: 0.15,
      achievement: 0.567,
      trend: -0.05,
      sampleSize: 1000,
      lastUpdated: '2024-03-01T12:00:00Z',
      dataSource: 'system',
    },
  },
  
  // 手動入力の結果
  customResults: {
    meeting_count: {
      kpiId: 'meeting_count',
      type: 'custom',
      value: 45,
      targetValue: 100,
      achievement: 0.45,
      trend: 0.5,
      sampleSize: 1000,
      lastUpdated: '2024-03-01T10:00:00Z',
      dataSource: 'manual',
    },
    conversion_rate: {
      kpiId: 'conversion_rate',
      type: 'custom',
      value: 0.17,
      targetValue: 0.20,
      achievement: 0.85,
      trend: 0.13,
      sampleSize: 45,
      lastUpdated: '2024-03-01T10:00:00Z',
      dataSource: 'manual',
    },
    response_quality: {
      kpiId: 'response_quality',
      type: 'custom',
      value: 8.0,
      targetValue: 8.5,
      achievement: 0.94,
      trend: 0.05,
      sampleSize: 150,
      lastUpdated: '2024-03-01T10:00:00Z',
      dataSource: 'manual',
    },
    time_to_meeting: {
      kpiId: 'time_to_meeting',
      type: 'custom',
      value: 10,
      targetValue: 7,
      achievement: 0.7,
      trend: -0.2,
      sampleSize: 45,
      lastUpdated: '2024-03-01T10:00:00Z',
      dataSource: 'manual',
    },
    sales_productivity: {
      kpiId: 'sales_productivity',
      type: 'custom',
      value: 9,
      targetValue: 20,
      achievement: 0.45,
      trend: 0.5,
      sampleSize: 5,
      lastUpdated: '2024-03-01T10:00:00Z',
      dataSource: 'manual',
    }
  },
  
  overallScore: 0.75,
  
  insights: [
    {
      type: 'success',
      message: '商談獲得数が大幅に改善しています',
      metric: 'meeting_count',
      impact: 0.3,
    },
    {
      type: 'warning',
      message: '商談設定までの日数短縮が必要です',
      metric: 'time_to_meeting',
      impact: -0.2,
    },
    {
      type: 'improvement',
      message: '営業生産性は改善傾向ですが、目標までまだ開きがあります',
      metric: 'sales_productivity',
      impact: 0.1,
    },
  ],
}; 