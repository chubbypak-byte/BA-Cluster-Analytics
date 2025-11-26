export interface CsvRow {
  [key: string]: string | number;
}

export interface AggregatedBA {
  ba: string;
  totalAmount: number;
  transactionCount: number;
  avgAmount: number;
  stdDevAmount: number;
}

export interface ClusterData {
  id: string;
  name: string;
  description: string; // คำอธิบายกลุ่ม
  characteristics: string[]; // ลักษณะเด่น
  memberBAs: string[]; // รายชื่อ BA ในกลุ่มนี้
}

export interface ExecutiveInsight {
  overview: string; // ภาพรวมผู้บริหาร
  strategicRecommendations: string[]; // ข้อเสนอแนะเชิงกลยุทธ์
  policyImplications: string[]; // นัยยะเชิงนโยบาย
}

export interface AnalysisResult {
  clusters: ClusterData[];
  executiveSummary: ExecutiveInsight;
}

export enum AppState {
  IDLE,
  PROCESSING_DATA,
  ANALYZING_AI,
  SUCCESS,
  ERROR
}