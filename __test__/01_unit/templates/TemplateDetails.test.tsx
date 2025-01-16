import { render, screen } from '@testing-library/react';
import { TemplateDetails } from '@/components/templates/pages/TemplateDetails';
import { 
  Template, 
  Category, 
  Strategy, 
  ToneOfVoice, 
  TemplateSettings, 
  KPISettings,
  SYSTEM_METRICS,
  ContentFocus
} from '@/types/template';

describe('TemplateDetails', () => {
  const mockKPISettings: KPISettings = {
    systemKPIs: [{
      type: 'system',
      metric: SYSTEM_METRICS.FORM_LINK_CLICK,
      target: 30,
      weight: 0.5,
      minimumThreshold: 20,
      maximumThreshold: 40
    }],
    customKPIs: [],
    overallTarget: {
      responseRate: 0.3,
      conversionRate: 0.1
    }
  };

  const mockSettings: TemplateSettings = {
    kpi: mockKPISettings,
    parallelTasks: 3,
    retryAttempts: 2,
    maxDailyTasks: 100,
    errorThreshold: 0.1,
    pauseOnErrorRate: 0.2,
    preferredMethod: "FORM"
  };

  const mockTemplate = {
    id: '1',
    name: 'Test Template',
    category: 'new-client-acquisition' as Category,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "test-user-id",
    mode: "ai_auto",
    strategy: "direct-offer" as Strategy,
    toneOfVoice: "formal" as ToneOfVoice,
    maxLength: 500,
    useEmoji: true,
    execution_priority: "balanced",
    parallel_tasks: 3,
    retry_attempts: 2,
    preferred_method: "FORM",
    metrics: [
      {
        id: "metric-1",
        name: "開封率",
        type: "system",
        unit: "%",
        target: 30,
        weight: 0.5
      }
    ],
    evaluationPeriod: "7d",
    promptConfig: {
      strategy: "direct-offer" as Strategy,
      toneOfVoice: "formal" as ToneOfVoice,
      contentFocus: "benefit" as ContentFocus,
      maxLength: 500,
      outputFormat: "text"
    }
  } as unknown as Template;

  // 正常系のテストケース
  describe('全ての項目が正しく表示される', () => {
    it('基本情報が表示される', () => {
      render(<TemplateDetails template={mockTemplate} />);
      expect(screen.getByText('テストテンプレート')).toBeInTheDocument();
      expect(screen.getByText('新規開拓')).toBeInTheDocument();
    });

    it('メッセージ戦略が表示される', () => {
      render(<TemplateDetails template={mockTemplate} />);
      expect(screen.getByText('direct-offer')).toBeInTheDocument();
      expect(screen.getByText('formal')).toBeInTheDocument();
      expect(screen.getByText('500文字')).toBeInTheDocument();
    });

    it('実行設定が表示される', () => {
      render(<TemplateDetails template={mockTemplate} />);
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('フォーム')).toBeInTheDocument();
    });

    it('KPI設定が表示される', () => {
      render(<TemplateDetails template={mockTemplate} />);
      expect(screen.getByText(SYSTEM_METRICS.FORM_LINK_CLICK)).toBeInTheDocument();
      expect(screen.getByText('system')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('重み: 0.5')).toBeInTheDocument();
    });
  });

  // データなしの場合のテスト
  describe('データがない場合の表示', () => {
    it('テンプレートがundefinedの場合、ローディング表示される', () => {
      render(<TemplateDetails template={undefined as any} />);
      expect(screen.getByText('テンプレートの読み込み中...')).toBeInTheDocument();
    });

    it('必須フィールドが欠落している場合、未設定と表示される', () => {
      const incompleteTemplate: Partial<Template> = {
        id: "test-id",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "test-user-id"
      };
      render(<TemplateDetails template={incompleteTemplate as Template} />);
      expect(screen.getAllByText('未設定')).toHaveLength(4); // 基本情報の2項目が未設定
    });
  });

  // レスポンシブ対応のテスト
  describe('レスポンシブ対応', () => {
    it('グリッドレイアウトが適用されている', () => {
      render(<TemplateDetails template={mockTemplate} />);
      const gridElements = document.querySelectorAll('.grid-cols-2');
      expect(gridElements.length).toBeGreaterThan(0);
    });

    it('タブが正しく表示される', () => {
      render(<TemplateDetails template={mockTemplate} />);
      expect(screen.getByText('基本情報')).toBeInTheDocument();
      expect(screen.getByText('メッセージ戦略')).toBeInTheDocument();
      expect(screen.getByText('実行設定')).toBeInTheDocument();
      expect(screen.getByText('KPI設定')).toBeInTheDocument();
    });
  });
}); 