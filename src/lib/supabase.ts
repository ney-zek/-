import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Report, BullyingType, ReportStatus, SeverityLevel } from '../types';
import { detectSeverity } from './severityDetection';

// Clean initial reports - ZERO fake data
export const INITIAL_REPORTS: Report[] = [];

const LOCAL_STORAGE_REPORTS_KEY = 'sitr_school_reports_clean_v4';
const LOCAL_STORAGE_CONFIG_KEY = 'sitr_app_config_v4';

// Purge any legacy fake data stored in user's browser
function purgeOldMockData(): void {
  try {
    const keysToPurge = [
      'sitr_school_reports',
      'sitr_school_reports_v2',
      'sitr_school_reports_presentation_v3',
    ];
    for (const k of keysToPurge) {
      localStorage.removeItem(k);
    }
  } catch (e) {
    // ignore
  }
}

// Run purge immediately
purgeOldMockData();

export function getStoredSupabaseConfig(): { url: string; anonKey: string } | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) return parsed;
    }
  } catch (e) {
    console.warn('Error reading stored config:', e);
  }

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  return null;
}

export function saveStoredSupabaseConfig(config: { url: string; anonKey: string } | null) {
  if (!config) {
    localStorage.removeItem(LOCAL_STORAGE_CONFIG_KEY);
  } else {
    localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(config));
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (config?.url && config?.anonKey && config.url.startsWith('http')) {
    try {
      return createClient(config.url, config.anonKey);
    } catch (e) {
      console.error('Failed to initialize client:', e);
    }
  }
  return null;
}

// Local Storage Fallback Engine - Strictly Real Reports Only
function getLocalReports(): Report[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
    if (raw) {
      const parsed: Report[] = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error('Failed to parse local reports', e);
  }
  // Initialize with strictly empty array
  localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify([]));
  return [];
}

function saveLocalReports(reports: Report[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to save local reports', e);
  }
}


export async function clearAllReports(): Promise<boolean> {
  try {
    await fetch('/api/reports', { method: 'DELETE' });
  } catch (e) {
    console.warn('Server clear failed:', e);
  }
  saveLocalReports([]);
  return true;
}

// Unified Service API - Real Database Integration (No API Keys needed)
export async function submitReport(data: {
  type: BullyingType;
  location: string;
  incident_date?: string;
  incident_period?: string;
  victim_name?: string;
  description: string;
}): Promise<{ success: boolean; reportId: string; error?: string }> {
  const { severity, detectedKeywords } = detectSeverity(data.description);
  
  const newReport: Report = {
    id: 'SITR-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    type: data.type,
    location: data.location,
    incident_date: data.incident_date || new Date().toISOString().slice(0, 10),
    incident_period: data.incident_period || 'الصباحية',
    victim_name: data.victim_name?.trim() ? data.victim_name.trim() : undefined,
    description: data.description,
    severity: severity,
    status: 'new',
    created_at: new Date().toISOString(),
    detected_keywords: detectedKeywords,
  };

  // 1. Save to real server-side database
  try {
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: newReport.type,
        location: newReport.location,
        incident_date: newReport.incident_date,
        incident_period: newReport.incident_period,
        victim_name: newReport.victim_name,
        description: newReport.description,
        severity: newReport.severity,
        detected_keywords: newReport.detected_keywords,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.report) {
        newReport.id = result.report.id;
      }
    }
  } catch (err) {
    console.warn('Server API not responding, saving to local persistent store:', err);
  }

  // 2. Always sync to local store
  const current = getLocalReports();
  saveLocalReports([newReport, ...current]);

  return { success: true, reportId: newReport.id };
}

export async function fetchAllReports(): Promise<Report[]> {
  try {
    const response = await fetch('/api/reports');
    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.reports)) {
        saveLocalReports(data.reports);
        return data.reports;
      }
    }
  } catch (err) {
    console.warn('Could not fetch from server API, using local storage:', err);
  }

  return getLocalReports();
}

export async function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus,
  adminNotes?: string
): Promise<boolean> {
  try {
    await fetch(`/api/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, notes: adminNotes }),
    });
  } catch (e) {
    console.warn('Server status update error:', e);
  }

  const reports = getLocalReports();
  const updated = reports.map((r) => {
    if (r.id === reportId) {
      return {
        ...r,
        status: newStatus,
        notes: adminNotes !== undefined ? adminNotes : r.notes,
      };
    }
    return r;
  });
  saveLocalReports(updated);
  return true;
}

export async function deleteReport(reportId: string): Promise<boolean> {
  try {
    await fetch(`/api/reports/${reportId}`, {
      method: 'DELETE',
    });
  } catch (e) {
    console.warn('Server delete error:', e);
  }

  const reports = getLocalReports();
  const filtered = reports.filter((r) => r.id !== reportId);
  saveLocalReports(filtered);
  return true;
}

// SQL Script for Supabase Table Setup
export const SUPABASE_SQL_SCHEMA = `-- 1. إنشاء جدول البلاغات في Supabase
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('verbal', 'physical', 'cyber')),
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. تمكين أمان الصفوف (Row Level Security - RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 3. السماح لأي طالب أو زائر مجهول بإنشاء بلاغ (INSERT ONLY)
CREATE POLICY "Allow anonymous users to insert reports"
ON public.reports
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 4. السماح فقط للمسؤولين المسجلين بعرض وإدارة البلاغات (SELECT, UPDATE, DELETE)
CREATE POLICY "Allow authenticated staff to view all reports"
ON public.reports
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated staff to update reports"
ON public.reports
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated staff to delete reports"
ON public.reports
FOR DELETE
TO authenticated
USING (true);
`;
