import { create } from 'zustand';
import { 
  AnalysisPeriod, 
  PerformanceMetrics 
} from '@/types/analytics';

interface AnalyticsState {
  period: AnalysisPeriod;
  performanceMetrics: { [templateId: string]: PerformanceMetrics };
  isLoading: boolean;
  error: string | null;

  // アクション
  setPeriod: (period: AnalysisPeriod) => void;
  setPerformanceMetrics: (templateId: string, metrics: PerformanceMetrics) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  period: '30d',
  performanceMetrics: {},
  isLoading: false,
  error: null,

  setPeriod: (period) => set({ period }),
  setPerformanceMetrics: (templateId, metrics) =>
    set((state) => ({
      performanceMetrics: { ...state.performanceMetrics, [templateId]: metrics },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
})); 