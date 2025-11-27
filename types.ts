export interface LinkedInProfile {
  name: string;
  role: string;
  company: string;
  location: string;
  profileUrl?: string;
  tenure?: string; // Novo campo: Tempo no Cargo
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