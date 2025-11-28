export interface LinkedInProfile {
  name: string;
  role: string;
  company: string;
  location: string;
  profileUrl?: string;
  tenure?: string;
  education?: string; // Novo: Formação/Instituição
  state?: string;     // Novo: Estado de residência
}

export interface ExtractionBatch {
  id: string;
  timestamp: Date;
  count: number;
}

export interface SavedSheet {
  id: string;
  title: string;
  date: string; // ISO string
  profiles: LinkedInProfile[];
  batches: ExtractionBatch[];
}

export enum ExtractionStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}