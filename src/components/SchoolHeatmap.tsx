import React, { useState, useMemo } from 'react';
import {
  Report,
  SeverityLevel,
  BullyingType,
  ReportStatus,
} from '../types';
import { Language, getTranslation } from '../lib/i18n';
import {
  getTypeLabel,
  getSeverityLabel,
  getStatusLabel,
} from '../lib/severityDetection';
import {
  MapPin,
  Flame,
  AlertTriangle,
  ShieldCheck,
  Filter,
  Eye,
  Clock,
  User,
  Activity,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu,
  Printer,
  Sparkles,
  Info,
  Calendar,
  X,
  Search,
  BellRing,
} from 'lucide-react';

export interface CampusZone {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'outdoor' | 'corridor' | 'facility' | 'classroom';
  sensorId?: string;
  keywords: string[];
  // Architectural SVG coordinates (normalized 0-1000 x 0-600)
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number; // Center X for radial heat gradient
  cy: number; // Center Y for radial heat gradient
  recommendedAction: string;
}

const CAMPUS_ZONES: CampusZone[] = [
  {
    id: 'yard',
    nameAr: 'الساحة المدرسية الرئيسية والفناء',
    nameEn: 'Main School Courtyard / Yard',
    category: 'outdoor',
    sensorId: 'ESP32-CSI-YARD-01',
    keywords: ['ساحة', 'فناء', 'ملعب خارجي', 'yard', 'courtyard', 'cour'],
    x: 320,
    y: 190,
    width: 360,
    height: 220,
    cx: 500,
    cy: 300,
    recommendedAction: 'تكثيف المناوبة الإشرافية أثناء الفسحة ومراقبة الأركان المعتمة.',
  },
  {
    id: 'corridor_a',
    nameAr: 'الممر A - الطابق الأرضي',
    nameEn: 'Corridor A (Ground Floor)',
    category: 'corridor',
    sensorId: 'ESP32-CSI-CORR-A',
    keywords: ['ممر a', 'ممر أ', 'الممر a', 'ممر أرضي', 'corridor a'],
    x: 80,
    y: 190,
    width: 220,
    height: 70,
    cx: 190,
    cy: 225,
    recommendedAction: 'تثبيت مستشعر سِتر إضافي لرصد التدافع بين الحصص الدراسية.',
  },
  {
    id: 'corridor_b',
    nameAr: 'الممر B - الطابق الأول',
    nameEn: 'Corridor B (First Floor)',
    category: 'corridor',
    sensorId: 'ESP32-CSI-CORR-B',
    keywords: ['ممر b', 'ممر ب', 'الممر b', 'ممر علوي', 'ممر', 'corridor', 'couloir'],
    x: 700,
    y: 190,
    width: 220,
    height: 70,
    cx: 810,
    cy: 225,
    recommendedAction: 'الممر يشهد تجمعات حرجة؛ يُنصح بمتابعة تنبيهات حساس CSI الفورية.',
  },
  {
    id: 'restrooms_w',
    nameAr: 'دورات المياه الغربية',
    nameEn: 'West Restrooms',
    category: 'facility',
    sensorId: 'ESP32-CSI-REST-W',
    keywords: ['حمام', 'حمامات', 'دورة مياه', 'دورات المياه', 'toilet', 'restroom'],
    x: 80,
    y: 280,
    width: 140,
    height: 130,
    cx: 150,
    cy: 345,
    recommendedAction: 'منطقة ذات حساسية خصوصية عالية بدون كاميرات؛ يعتمد الرصد حصرياً على موجات CSI لكشف العنف.',
  },
  {
    id: 'restrooms_e',
    nameAr: 'دورات المياه الشرقية',
    nameEn: 'East Restrooms',
    category: 'facility',
    sensorId: 'ESP32-CSI-REST-E',
    keywords: ['حمامات شرقية', 'حمامات بنات', 'حمامات أولاد'],
    x: 780,
    y: 280,
    width: 140,
    height: 130,
    cx: 850,
    cy: 345,
    recommendedAction: 'تفعيل إشعارات الإنذار المباشرة لغرفة الإدارة عند استشعار اضطراب غير طبيعي.',
  },
  {
    id: 'cafeteria',
    nameAr: 'المقصف والمطعم المدرسي',
    nameEn: 'Cafeteria & Canteen',
    category: 'facility',
    sensorId: 'ESP32-CSI-CAFE-01',
    keywords: ['مقصف', 'مطعم', 'كانتين', 'كافتيريا', 'cafeteria', 'canteen'],
    x: 80,
    y: 430,
    width: 260,
    height: 130,
    cx: 210,
    cy: 495,
    recommendedAction: 'تنظيم طوابير الشراء للحد من التدافع والتنمر اللفظي بين الصفوف المختلفة.',
  },
  {
    id: 'classrooms_north',
    nameAr: 'جناح الفصول الدراسية (الشمالي)',
    nameEn: 'Classrooms Complex (North Wing)',
    category: 'classroom',
    sensorId: 'ESP32-CSI-CLASS-N',
    keywords: ['قسم', 'فصل', 'صف', 'فصول', 'classroom', 'classe'],
    x: 200,
    y: 40,
    width: 600,
    height: 120,
    cx: 500,
    cy: 100,
    recommendedAction: 'التأكد من تواجد المعلمين بين الحصص لمنع حالات التنمر في غياب المدرس.',
  },
  {
    id: 'library',
    nameAr: 'المكتبة المدرسية وقاعة القراءة',
    nameEn: 'School Library & Study Room',
    category: 'facility',
    sensorId: 'ESP32-CSI-LIB-01',
    keywords: ['مكتبة', 'قاعة مطالعة', 'library', 'bibliothèque'],
    x: 700,
    y: 430,
    width: 220,
    height: 130,
    cx: 810,
    cy: 495,
    recommendedAction: 'منطقة هادئة ذات مخاطر منخفضة بشكل عام؛ استمرار المتابعة الروتينية.',
  },
  {
    id: 'gym',
    nameAr: 'الملعب الرياضي والصالة المغطاة',
    nameEn: 'Sports Gym & Field',
    category: 'outdoor',
    sensorId: 'ESP32-CSI-GYM-01',
    keywords: ['ملعب', 'صالة رياضية', 'رياضة', 'gym', 'sports'],
    x: 360,
    y: 430,
    width: 320,
    height: 130,
    cx: 520,
    cy: 495,
    recommendedAction: 'متابعة الأنشطة التنافسية وحث معلمي الرياضة على حل النزاعات اللحظية.',
  },
  {
    id: 'stairs',
    nameAr: 'الدرج ومخارج الطوارئ',
    nameEn: 'Staircases & Emergency Exits',
    category: 'corridor',
    sensorId: 'ESP32-CSI-STAIRS-01',
    keywords: ['درج', 'سلم', 'سلالم', 'مخرج', 'stairs', 'escalier'],
    x: 80,
    y: 40,
    width: 100,
    height: 120,
    cx: 130,
    cy: 100,
    recommendedAction: 'نقطة عمياء تتكرر فيها حوادث العنف الخفي؛ يوصى بمتابعة دورية لحساسات الحركة.',
  },
  {
    id: 'gate',
    nameAr: 'محيط البوابة الخارجية للمدرسة',
    nameEn: 'Outer School Gate & Perimeter',
    category: 'outdoor',
    sensorId: 'ESP32-CSI-GATE-01',
    keywords: ['بوابة', 'باب المدرسة', 'محيط المدرسة', 'خارج المدرسة', 'gate'],
    x: 820,
    y: 40,
    width: 100,
    height: 120,
    cx: 870,
    cy: 100,
    recommendedAction: 'التنسيق مع حراس الأمن ومراقبة أوقات الدخول والانصراف.',
  },
];

interface SchoolHeatmapProps {
  reports: Report[];
  lang?: Language;
  onSelectReport?: (report: Report) => void;
  onOpenSimulation?: () => void;
}

export const SchoolHeatmap: React.FC<SchoolHeatmapProps> = ({
  reports,
  lang = 'ar',
  onSelectReport,
  onOpenSimulation,
}) => {
  const isRtl = lang === 'ar' || lang === 'zgh';

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'blueprint' | 'cards'>('blueprint');
  const [selectedZone, setSelectedZone] = useState<CampusZone | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filterType !== 'all' && r.type !== filterType) return false;
      if (filterSeverity !== 'all' && r.severity !== filterSeverity) return false;
      if (filterPeriod !== 'all') {
        const p = (r.incident_period || '').toLowerCase();
        if (filterPeriod === 'morning' && !p.includes('صباح') && !p.includes('morning')) return false;
        if (filterPeriod === 'break' && !p.includes('فسحة') && !p.includes('استراحة') && !p.includes('break')) return false;
        if (filterPeriod === 'dismissal' && !p.includes('انصراف') && !p.includes('مساء') && !p.includes('dismissal')) return false;
      }
      return true;
    });
  }, [reports, filterType, filterSeverity, filterPeriod]);

  // Map zone statistics
  const zoneStats = useMemo(() => {
    return CAMPUS_ZONES.map((zone) => {
      const zoneReports = filteredReports.filter((r) => {
        const loc = (r.location || '').toLowerCase();
        return zone.keywords.some((kw) => loc.includes(kw.toLowerCase()));
      });

      const highCount = zoneReports.filter((r) => r.severity === 'high').length;
      const medCount = zoneReports.filter((r) => r.severity === 'medium').length;
      const lowCount = zoneReports.filter((r) => r.severity === 'low').length;

      const physicalCount = zoneReports.filter((r) => r.type === 'physical').length;
      const verbalCount = zoneReports.filter((r) => r.type === 'verbal').length;
      const cyberCount = zoneReports.filter((r) => r.type === 'cyber').length;

      // Risk score: weight high by 3, medium by 2, low by 1
      const score = highCount * 3 + medCount * 2 + lowCount * 1;

      // Determine risk level & intensity (0% - 100%)
      let level: 'critical' | 'high' | 'medium' | 'low' | 'safe' = 'safe';
      let intensity = 0;

      if (zoneReports.length === 0) {
        level = 'safe';
        intensity = 0;
      } else if (score >= 6 || highCount >= 2) {
        level = 'critical';
        intensity = Math.min(100, 75 + score * 4);
      } else if (score >= 3 || physicalCount >= 2) {
        level = 'high';
        intensity = Math.min(74, 50 + score * 5);
      } else if (score >= 2 || zoneReports.length >= 2) {
        level = 'medium';
        intensity = 35 + score * 4;
      } else {
        level = 'low';
        intensity = 20;
      }

      return {
        zone,
        reports: zoneReports,
        total: zoneReports.length,
        highCount,
        medCount,
        lowCount,
        physicalCount,
        verbalCount,
        cyberCount,
        score,
        level,
        intensity,
      };
    });
  }, [filteredReports]);

  // Overall campus metrics
  const totalZoneReports = useMemo(() => {
    return zoneStats.reduce((sum, z) => sum + z.total, 0);
  }, [zoneStats]);

  const topHotspot = useMemo(() => {
    const sorted = [...zoneStats].sort((a, b) => b.score - a.score);
    return sorted[0]?.total > 0 ? sorted[0] : null;
  }, [zoneStats]);

  const criticalHotspotsCount = useMemo(() => {
    return zoneStats.filter((z) => z.level === 'critical').length;
  }, [zoneStats]);

  // Color helpers
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return {
          fill: '#dc2626',
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          badge: 'bg-rose-600 text-white',
          border: 'border-rose-500',
          label: 'بؤرة حرجة جداً 🔥',
          glow: 'rgba(239, 68, 68, 0.55)',
        };
      case 'high':
        return {
          fill: '#ea580c',
          bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          badge: 'bg-orange-500 text-white',
          border: 'border-orange-500',
          label: 'خطورة مرتفعة ⚠️',
          glow: 'rgba(249, 115, 22, 0.45)',
        };
      case 'medium':
        return {
          fill: '#eab308',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          badge: 'bg-amber-500 text-slate-950',
          border: 'border-amber-500',
          label: 'متوسط الخطورة ⚡',
          glow: 'rgba(234, 179, 8, 0.35)',
        };
      case 'low':
        return {
          fill: '#06b6d4',
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          badge: 'bg-cyan-600 text-white',
          border: 'border-cyan-500',
          label: 'منخفض الخطورة ℹ️',
          glow: 'rgba(6, 182, 212, 0.25)',
        };
      default:
        return {
          fill: '#10b981',
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          badge: 'bg-emerald-600 text-white',
          border: 'border-emerald-500/40',
          label: 'آمن وخالٍ من البلاغات ✅',
          glow: 'rgba(16, 185, 129, 0.15)',
        };
    }
  };

  const activeZoneStat = useMemo(() => {
    if (!selectedZone) return null;
    return zoneStats.find((s) => s.zone.id === selectedZone.id) || null;
  }, [selectedZone, zoneStats]);

  return (
    <div className="space-y-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. TOP STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Top Hotspot */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#0b142c] border border-slate-800 flex items-center justify-between">
          <div className="text-start">
            <span className="text-[11px] text-slate-400 font-bold block mb-1">
              أعلى بؤرة توتر (Hotspot)
            </span>
            <h4 className="text-sm sm:text-base font-black text-rose-300 truncate max-w-[150px]">
              {topHotspot ? topHotspot.zone.nameAr : 'لا توجد بؤر حرجة'}
            </h4>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {topHotspot ? `${topHotspot.total} بلاغ مسجل` : 'الحرم المدرسي آمن'}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
        </div>

        {/* Metric 2: Critical Hotspots Count */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#0b142c] border border-slate-800 flex items-center justify-between">
          <div className="text-start">
            <span className="text-[11px] text-slate-400 font-bold block mb-1">
              المناطق الحرجة حالياً
            </span>
            <h4 className="text-xl sm:text-2xl font-black text-white">
              {criticalHotspotsCount} <span className="text-xs font-medium text-slate-400">مناطق</span>
            </h4>
            <span className="text-[10px] text-teal-400 mt-0.5 block">
              تتطلب مناوبة إشرافية فورية
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* Metric 3: Total Location Reports */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#0b142c] border border-slate-800 flex items-center justify-between">
          <div className="text-start">
            <span className="text-[11px] text-slate-400 font-bold block mb-1">
              إجمالي بلاغات المواقع
            </span>
            <h4 className="text-xl sm:text-2xl font-black text-teal-300">
              {totalZoneReports} <span className="text-xs font-medium text-slate-400">حالة</span>
            </h4>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              موزعة على مرافق المدرسة
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-teal-400" />
          </div>
        </div>

        {/* Metric 4: IoT CSI Sensor Coverage */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#0b142c] border border-slate-800 flex items-center justify-between">
          <div className="text-start">
            <span className="text-[11px] text-slate-400 font-bold block mb-1">
              تغطية مستشعرات سِتر (CSI)
            </span>
            <h4 className="text-xl sm:text-2xl font-black text-emerald-300">
              92% <span className="text-xs font-medium text-slate-400">نشطة</span>
            </h4>
            <button
              onClick={onOpenSimulation}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-bold mt-0.5 block cursor-pointer"
            >
              عرض محاكاة الحساس 3D &larr;
            </button>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* 2. CONTROLS BAR: FILTERS & VIEW MODE */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0b142c] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 w-full md:w-auto">
          <button
            onClick={() => setViewMode('blueprint')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === 'blueprint'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>المخطط المعماري التفاعلي (Floor Plan)</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>مصفوفة تحليل المخاطر</span>
          </button>
        </div>

        {/* Right: Quick Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Bullying Type Filter */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-teal-400"
            >
              <option value="all">كل أنواع العنف</option>
              <option value="physical">عنف جسدي واشتباك</option>
              <option value="verbal">تنمر لفظي وإهانة</option>
              <option value="cyber">تنمر إلكتروني</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="relative">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-teal-400"
            >
              <option value="all">كل مستويات الخطورة</option>
              <option value="high">خطورة قصوى فقط 🔥</option>
              <option value="medium">خطورة متوسطة ⚠️</option>
              <option value="low">خطورة منخفضة</option>
            </select>
          </div>

          {/* Time Period Filter */}
          <div className="relative">
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-teal-400"
            >
              <option value="all">جميع الفترات الزمنية</option>
              <option value="break">فترة الفسحة المدرسية</option>
              <option value="morning">طابور الصباح والحصص</option>
              <option value="dismissal">فترة الانصراف والمساء</option>
            </select>
          </div>

          {/* Reset Filters if active */}
          {(filterType !== 'all' || filterSeverity !== 'all' || filterPeriod !== 'all') && (
            <button
              onClick={() => {
                setFilterType('all');
                setFilterSeverity('all');
                setFilterPeriod('all');
              }}
              className="p-2 rounded-xl bg-slate-800 text-rose-300 hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
              title="إعادة ضبط الفلاتر"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. MAIN HEATMAP DISPLAY */}
      {viewMode === 'blueprint' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* The Floor Plan Architectural SVG Canvas (Col 8) */}
          <div className="xl:col-span-8 bg-[#070c1a] border border-slate-800 rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-2xl">
            {/* Header of Map */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="text-start">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    مخطط الحرم المدرسي الحراري (School Floor Plan Heatmap)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                    تحديث حي
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  انقر على أي مرفق أو ممر لعرض البلاغات وتفاصيل مستشعر سِتر (CSI)
                </p>
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center gap-2 text-[10px] font-bold bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">التدرج الحراري:</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>آمن</span>
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>متوسط</span>
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>بؤرة ساخنة</span>
                </span>
              </div>
            </div>

            {/* SVG Interactive Architectural Map */}
            <div className="relative w-full aspect-[1000/620] bg-[#050813] rounded-2xl border border-slate-800/80 p-2 overflow-hidden select-none">
              <svg
                viewBox="0 0 1000 620"
                className="w-full h-full"
                style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
              >
                {/* SVG Definitions for Radial Heat Gradients */}
                <defs>
                  {/* Subtle Grid Pattern for Blueprint Feel */}
                  <pattern id="archGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0f172a" strokeWidth="0.8" />
                  </pattern>

                  {/* Dynamic Heat Gradient for each zone */}
                  {zoneStats.map(({ zone, level, intensity }) => {
                    const colors = getLevelColor(level);
                    return (
                      <radialGradient
                        key={`heat-grad-${zone.id}`}
                        id={`heat-${zone.id}`}
                        cx="50%"
                        cy="50%"
                        r="50%"
                      >
                        <stop offset="0%" stopColor={colors.fill} stopOpacity={intensity > 0 ? (intensity / 100) * 0.85 : 0.05} />
                        <stop offset="40%" stopColor={colors.fill} stopOpacity={intensity > 0 ? (intensity / 100) * 0.45 : 0.02} />
                        <stop offset="80%" stopColor={colors.fill} stopOpacity={intensity > 0 ? (intensity / 100) * 0.15 : 0} />
                        <stop offset="100%" stopColor={colors.fill} stopOpacity="0" />
                      </radialGradient>
                    );
                  })}
                </defs>

                {/* Background Blueprint Grid */}
                <rect width="1000" height="620" fill="#040711" />
                <rect width="1000" height="620" fill="url(#archGrid)" />

                {/* Outer Campus Perimeter Walls */}
                <rect
                  x="50"
                  y="20"
                  width="900"
                  height="570"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="4"
                  rx="18"
                />

                {/* Corridor Connecting Lines (Pathways) */}
                <path
                  d="M 190 225 L 500 300 L 810 225 M 500 100 L 500 495"
                  fill="none"
                  stroke="#0f2b3e"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="4 6"
                />

                {/* 1. RENDER HEAT GRADIENT BLOBS (Behind rooms) */}
                {zoneStats.map(({ zone, total, level, intensity }) => {
                  if (total === 0) return null;
                  const radius = Math.max(zone.width, zone.height) * (0.65 + (intensity / 100) * 0.5);
                  return (
                    <g key={`heat-blob-${zone.id}`} className="pointer-events-none">
                      <circle
                        cx={zone.cx}
                        cy={zone.cy}
                        r={radius}
                        fill={`url(#heat-${zone.id})`}
                        className={level === 'critical' ? 'animate-pulse' : ''}
                      />
                    </g>
                  );
                })}

                {/* 2. RENDER ARCHITECTURAL ROOMS & FACILITIES */}
                {zoneStats.map(({ zone, total, level, physicalCount, highCount }) => {
                  const isHovered = hoveredZoneId === zone.id;
                  const isSelected = selectedZone?.id === zone.id;
                  const colors = getLevelColor(level);

                  return (
                    <g
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      onMouseEnter={() => setHoveredZoneId(zone.id)}
                      onMouseLeave={() => setHoveredZoneId(null)}
                      className="cursor-pointer transition-all duration-200"
                      style={{
                        transform: isHovered || isSelected ? 'scale(1.006)' : 'none',
                        transformOrigin: `${zone.cx}px ${zone.cy}px`,
                      }}
                    >
                      {/* Room Wall Boundary */}
                      <rect
                        x={zone.x}
                        y={zone.y}
                        width={zone.width}
                        height={zone.height}
                        rx="12"
                        fill={
                          isSelected
                            ? 'rgba(20, 184, 166, 0.22)'
                            : isHovered
                            ? 'rgba(30, 41, 59, 0.9)'
                            : total > 0
                            ? 'rgba(15, 23, 42, 0.85)'
                            : 'rgba(8, 14, 28, 0.7)'
                        }
                        stroke={
                          isSelected
                            ? '#14b8a6'
                            : isHovered
                            ? '#38bdf8'
                            : total > 0
                            ? colors.fill
                            : '#1e293b'
                        }
                        strokeWidth={isSelected ? '3.5' : total > 0 ? '2' : '1.2'}
                        strokeDasharray={zone.category === 'outdoor' ? '6 4' : 'none'}
                      />

                      {/* Zone Name Label */}
                      <text
                        x={zone.cx}
                        y={zone.y + 26}
                        textAnchor="middle"
                        fill={isSelected ? '#2dd4bf' : '#f8fafc'}
                        fontSize="12"
                        fontWeight="bold"
                        fontFamily="Cairo, sans-serif"
                      >
                        {zone.nameAr}
                      </text>

                      {/* IoT Sensor Icon & Identifier */}
                      {zone.sensorId && (
                        <g transform={`translate(${zone.x + 8}, ${zone.y + 8})`}>
                          <circle cx="6" cy="6" r="4" fill={total > 0 ? colors.fill : '#10b981'} className={level === 'critical' ? 'animate-ping' : ''} />
                          <circle cx="6" cy="6" r="2.5" fill="#ffffff" />
                        </g>
                      )}

                      {/* Incident Counter Badge Pill */}
                      {total > 0 ? (
                        <g transform={`translate(${zone.cx}, ${zone.cy + 10})`}>
                          <rect
                            x="-42"
                            y="-14"
                            width="84"
                            height="28"
                            rx="14"
                            fill={colors.fill}
                            className="shadow-lg"
                          />
                          <text
                            x="0"
                            y="4"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="11"
                            fontWeight="900"
                            fontFamily="Cairo, sans-serif"
                          >
                            {total} بلاغ {highCount > 0 ? '🔥' : '⚠️'}
                          </text>
                        </g>
                      ) : (
                        <g transform={`translate(${zone.cx}, ${zone.cy + 8})`}>
                          <text
                            x="0"
                            y="0"
                            textAnchor="middle"
                            fill="#64748b"
                            fontSize="10"
                            fontFamily="Cairo, sans-serif"
                          >
                            منطقة آمنة ✅
                          </text>
                        </g>
                      )}

                      {/* CSI Sensor Tag Footnote */}
                      <text
                        x={zone.cx}
                        y={zone.y + zone.height - 10}
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {zone.sensorId || 'Node CSI'}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Right Inspector Panel for Selected Zone (Col 4) */}
          <div className="xl:col-span-4 bg-[#0b142c] border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
            {activeZoneStat ? (
              <div className="space-y-5 text-start animate-fade-in">
                {/* Zone Header */}
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full border ${
                        getLevelColor(activeZoneStat.level).bg
                      }`}
                    >
                      {getLevelColor(activeZoneStat.level).label}
                    </span>
                    <button
                      onClick={() => setSelectedZone(null)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                      title="إلغاء التحديد"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    {activeZoneStat.zone.nameAr}
                  </h3>
                  <span className="text-xs text-slate-400 block mt-0.5" dir="ltr">
                    {activeZoneStat.zone.nameEn}
                  </span>
                </div>

                {/* CSI Sensor Live Status */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-teal-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {activeZoneStat.zone.sensorId}
                      </span>
                      <span className="text-[10px] text-teal-400">
                        مستشعر WiFi CSI سِتر نشط
                      </span>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                </div>

                {/* Incident Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">
                    توزيع البلاغات حسب نوع العنف:
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center">
                      <span className="block text-sm font-black text-rose-300">
                        {activeZoneStat.physicalCount}
                      </span>
                      <span className="text-[10px] text-slate-400">عنف جسدي</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-center">
                      <span className="block text-sm font-black text-amber-300">
                        {activeZoneStat.verbalCount}
                      </span>
                      <span className="text-[10px] text-slate-400">تنمر لفظي</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-center">
                      <span className="block text-sm font-black text-cyan-300">
                        {activeZoneStat.cyberCount}
                      </span>
                      <span className="text-[10px] text-slate-400">إلكتروني</span>
                    </div>
                  </div>
                </div>

                {/* Recommended Action */}
                <div className="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>توصية الإشراف الأمني المقترحة:</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeZoneStat.zone.recommendedAction}
                  </p>
                </div>

                {/* Recent Reports in this zone */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">
                      البلاغات المسجلة هنا ({activeZoneStat.reports.length}):
                    </span>
                  </div>

                  {activeZoneStat.reports.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                      لم يتم تسجيل أي بلاغ في هذا المرفق حتى الآن.
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {activeZoneStat.reports.map((report) => (
                        <div
                          key={report.id}
                          onClick={() => onSelectReport && onSelectReport(report)}
                          className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/40 transition cursor-pointer text-start flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  report.severity === 'high'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {getSeverityLabel(report.severity, lang)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(report.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-200 truncate">
                              {report.description}
                            </p>
                          </div>
                          <Eye className="w-4 h-4 text-teal-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-teal-400 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    حدد مرفقاً من الخريطة
                  </h4>
                  <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
                    انقر فوق أي ساحة أو ممر لمعاينة تركيز البلاغات، مستويات العنف، وتوصيات التدخل الإشرافي.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-[11px] text-teal-400 bg-teal-950/60 border border-teal-500/30 px-3 py-1.5 rounded-xl font-bold">
                    إجمالي {CAMPUS_ZONES.length} مرافق تحت المراقبة
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 4. VIEW MODE: MATRIX & RISK CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...zoneStats]
            .sort((a, b) => b.score - a.score)
            .map(({ zone, total, level, physicalCount, verbalCount, highCount }) => {
              const colors = getLevelColor(level);
              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`p-5 rounded-3xl bg-[#0b142c] border transition-all cursor-pointer text-start flex flex-col justify-between hover:scale-[1.01] ${
                    selectedZone?.id === zone.id
                      ? 'border-teal-400 shadow-xl shadow-teal-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${colors.bg}`}>
                        {colors.label}
                      </span>
                      <span className="text-sm font-black text-white flex items-center gap-1">
                        <Flame className="w-4 h-4 text-rose-400" />
                        <span>{total} بلاغ</span>
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white mb-1">
                      {zone.nameAr}
                    </h4>
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                      {zone.recommendedAction}
                    </p>

                    {/* Threat Intensity Progress Bar */}
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>مؤشر التوتر:</span>
                        <strong className="text-white">
                          {total > 0 ? `${Math.min(100, total * 15)}%` : '0%'}
                        </strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${total > 0 ? Math.min(100, total * 15) : 4}%`,
                            backgroundColor: colors.fill,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Details */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {zone.sensorId}
                    </span>
                    <span className="text-teal-400 font-bold hover:underline">
                      معاينة التفاصيل &larr;
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};
