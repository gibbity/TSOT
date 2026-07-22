export interface ResearchRecord {
  id: number;
  code: string;
  pillar: string;
  title: string;
  human_summary: string;
  metric: string;
  verdict: string;
  risk_level: string;
  source_url: string;
  source_type: string;
  paper_year: number;
  authors: string;
  is_premium: boolean;
  created_at: string;
}

export interface AiActArticle {
  id?: number;
  code: string;
  title: string;
  category: string;
  article_text: string;
  compliance_verdict: string;
  risk_level: string;
  source_url?: string;
  source_type?: string;
  paper_year?: number;
  authors?: string;
  is_premium?: boolean;
  created_at?: string;
}

export interface ServerConfig {
  supabaseUrl?: string;
  supabaseKey?: string;
  geminiApiKey?: string;
  geminiModel?: string;
}
