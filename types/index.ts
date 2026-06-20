export type Pillar =
  | 'COGNITIVE OFFLOADING'
  | 'FRICTION & VERIFICATION'
  | 'TEMPORAL PERCEPTION'
  | 'EPISTEMIC AGENCY'
  | 'PROHIBITED PRACTICE'
  | 'HIGH RISK'
  | 'LIMITED RISK'
  | 'MINIMAL RISK';

export type RiskLevel = 'stable' | 'warning' | 'critical';
export type SourceType = 'peer-reviewed' | 'preprint' | 'conference' | 'regulation';

export interface RegistryRecord {
  id: number;
  code: string;
  pillar: Pillar;
  title: string;
  human_summary: string;
  metric: string;
  verdict: string;
  risk_level: RiskLevel;
  source_url: string | null;
  source_type: SourceType;
  paper_year: number | null;
  authors: string | null;
  is_premium: boolean;
  created_at: string;
}

export interface AuditRequest {
  prompt: string;
  byok_key?: string;
  source?: 'corpus' | 'ai_act' | 'both';
}

export interface AuditResponse {
  audit: string;
  citations: RegistryRecord[];
  session_remaining: number;
}

export interface IngestedPaper {
  isRelevant: boolean;
  pillar: Pillar;
  title: string;
  human_summary: string;
  metric: string;
  verdict: string;
  risk_level: RiskLevel;
  source_type: SourceType;
  methodology?: string;
  threat_vector?: string;
}
