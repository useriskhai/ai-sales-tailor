export interface CaseStudy {
  industry: string;
  companySize: string;
  challenge: string;
  result: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string;
  usp: string;
  benefits: string[];
  solutions: string[];
  price_range: string;
  challenges: string;
  case_studies: CaseStudy[];
  file_name?: string;
  file_url?: string;
  file_size?: number;
  created_at: Date;
  updated_at: Date;
}

export interface PDFFileInfo {
  fileName: string;
  file: File;
  filePath?: string;
  createdAt: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  usp: string;
  benefits: string[];
  solutions: string[];
  priceRange: string;
  challenges: string;
  caseStudies: CaseStudy[];
  pdfFile?: PDFFileInfo;
} 