export type BullyingType = 'verbal' | 'physical' | 'cyber';

export type ReportLocation = 
  | 'ممر' 
  | 'ساحة' 
  | 'قسم' 
  | 'حمام' 
  | 'مكتبة'
  | 'أخرى';

export type SeverityLevel = 'high' | 'medium' | 'low';

export type ReportStatus = 'new' | 'in_progress' | 'resolved';

export interface Report {
  id: string;
  type: BullyingType;
  location: string;
  incident_date?: string;
  incident_period?: string;
  victim_name?: string; // Optional name of the person subjected to bullying/violence
  description: string;
  severity: SeverityLevel;
  status: ReportStatus;
  created_at: string;
  notes?: string;
  detected_keywords?: string[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'school_counselor' | 'admin' | 'principal';
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
