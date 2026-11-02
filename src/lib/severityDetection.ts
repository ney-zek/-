import { SeverityLevel } from '../types';
import { Language, getTranslation } from './i18n';

export const HIGH_SEVERITY_KEYWORDS = [
  'ضرب',
  'دم',
  'تهديد',
  'سكين',
  'سلاح',
  'اعتداء',
  'ابتزاز',
  'خنق',
  'موت',
  'قتل',
  'عصابة',
  'إيذاء',
  'انتحار',
  'جرح',
  'كسر',
  'عنف',
  'kill',
  'hit',
  'knife',
  'weapon',
  'blood',
  'threat',
  'tuer',
  'frapper',
  'arme',
  'sang'
];

export const MEDIUM_SEVERITY_KEYWORDS = [
  'سخرية',
  'شتم',
  'إهانة',
  'كلام',
  'تنمر',
  'سب',
  'استهزاء',
  'مقاطعة',
  'تخويف',
  'تشهير',
  'نشر صور',
  'تعليقات مسيئة',
  'مضايقة',
  'insult',
  'bully',
  'mock',
  'harass',
  'insulte',
  'harcèlement'
];

export function detectSeverity(description: string): {
  severity: SeverityLevel;
  detectedKeywords: string[];
} {
  const normalized = description.toLowerCase();
  const detectedHigh: string[] = [];
  const detectedMedium: string[] = [];

  for (const keyword of HIGH_SEVERITY_KEYWORDS) {
    if (normalized.includes(keyword)) {
      detectedHigh.push(keyword);
    }
  }

  if (detectedHigh.length > 0) {
    return {
      severity: 'high',
      detectedKeywords: detectedHigh,
    };
  }

  for (const keyword of MEDIUM_SEVERITY_KEYWORDS) {
    if (normalized.includes(keyword)) {
      detectedMedium.push(keyword);
    }
  }

  if (detectedMedium.length > 0) {
    return {
      severity: 'medium',
      detectedKeywords: detectedMedium,
    };
  }

  return {
    severity: 'low',
    detectedKeywords: [],
  };
}

export function getTypeLabel(type: string, lang: Language = 'ar'): string {
  switch (type) {
    case 'verbal':
      return getTranslation(lang, 'verbalBullyingLabel');
    case 'physical':
      return getTranslation(lang, 'physicalBullyingLabel');
    case 'cyber':
      return getTranslation(lang, 'cyberBullyingLabel');
    default:
      return type;
  }
}

export function getStatusLabel(status: string, lang: Language = 'ar'): string {
  switch (status) {
    case 'new':
      return getTranslation(lang, 'statusNew');
    case 'in_progress':
      return getTranslation(lang, 'statusInProgress');
    case 'resolved':
      return getTranslation(lang, 'statusResolved');
    default:
      return status;
  }
}

export function getSeverityLabel(severity: string, lang: Language = 'ar'): string {
  switch (severity) {
    case 'high':
      return getTranslation(lang, 'severityHigh');
    case 'medium':
      return getTranslation(lang, 'severityMedium');
    case 'low':
      return getTranslation(lang, 'severityLow');
    default:
      return severity;
  }
}
