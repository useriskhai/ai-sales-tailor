import { CaseStudy } from './product';

export interface AnalysisResult {
  usp: string;
  description: string;
  benefits: string[];
  solutions: string[];
  priceRange: string;
  challenges: string;
  case_studies: string[];
}

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface UploadedFile {
  id: string;
  userId: string;
  productId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  analysisStatus: AnalysisStatus;
  analysisResult: AnalysisResult | null;
  createdAt: string;
  updatedAt: string;
} 