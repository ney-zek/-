import React, { useState, useEffect, useMemo } from 'react';
import {
  Report,
  AdminUser,
  ReportStatus,
  SeverityLevel,
  BullyingType,
} from '../types';
import {
  fetchAllReports,
  updateReportStatus,
  deleteReport,
  clearAllReports,
} from '../lib/supabase';
import {
  getTypeLabel,
  getStatusLabel,
  getSeverityLabel,
  HIGH_SEVERITY_KEYWORDS,
  MEDIUM_SEVERITY_KEYWORDS,
} from '../lib/severityDetection';
import { ShieldLogo } from './ShieldLogo';
import {
  LayoutDashboard,
  FileText,
  MapPin,
  Settings,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Eye,
  Download,
  Copy,
  Check,
  Flame,
  MessageSquareWarning,
  Smartphone,
  Save,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Info,
  ShieldCheck,
  School,
  Lock,
  Sparkles,
  Sliders,
  BellRing,
  User,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  CalendarDays,
  Layers,
  LineChart as LineChartIcon,
  Sun,
  Moon,
  Globe,
  Printer,
  Cpu,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Language, Theme, getTranslation, LANGUAGES } from '../lib/i18n';
import { exportSingleReportPdf, exportAllReportsPdf } from '../lib/pdfExport';
import { SchoolHeatmap } from './SchoolHeatmap';

interface AdminDashboardProps {
  user: AdminUser;
  onLogout: () => void;
  onNavigateToPublic: () => void;
  lang?: Language;
  onLangChange?: (lang: Language) => void;
  theme?: Theme;
  onThemeToggle?: () => void;
  onOpenSimulation?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
  onNavigateToPublic,
  lang = 'ar',
  onLangChange,
  theme = 'dark',
  onThemeToggle,
  onOpenSimulation,
}) => {
  const isRtl = lang === 'ar' || lang === 'zgh';
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'reports' | 'heatmap' | 'settings'
  >('dashboard');
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [pieMode, setPieMode] = useState<'types' | 'periods' | 'severity'>('types');

  // Modals
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState<boolean>(false);

  // School Platform Settings State
  const [schoolName, setSchoolName] = useState<string>('المؤسسة التعليمية');
  const [counselorName, setCounselorName] = useState<string>('المرشد الطلابي');
  const [emergencyPhone, setEmergencyPhone] = useState<string>('116111');
  const [academicYear, setAcademicYear] = useState<string>('2026');
  const [autoAlertsEnabled, setAutoAlertsEnabled] = useState<boolean>(true);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState<boolean>(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load initial reports
  const loadReports = async () => {
    setIsLoading(true);
    const data = await fetchAllReports();
    setReports(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Sync note input when selecting report
  useEffect(() => {
    if (selectedReport) {
      setAdminNoteInput(selectedReport.notes || '');
    }
  }, [selectedReport]);

  // Handle status update
  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    await updateReportStatus(reportId, newStatus);
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
    );
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Handle saving admin notes
  const handleSaveNotes = async () => {
    if (!selectedReport) return;
    await updateReportStatus(
      selectedReport.id,
      selectedReport.status,
      adminNoteInput
    );
    setReports((prev) =>
      prev.map((r) =>
        r.id === selectedReport.id ? { ...r, notes: adminNoteInput } : r
      )
    );
    setSelectedReport((prev) =>
      prev ? { ...prev, notes: adminNoteInput } : null
    );
    setNotesSavedSuccess(true);
    setTimeout(() => setNotesSavedSuccess(false), 2500);
  };

  // Handle delete
  const handleDeleteReport = async (reportId: string) => {
    await deleteReport(reportId);
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    setDeleteConfirmId(null);
    if (selectedReport?.id === reportId) {
      setSelectedReport(null);
    }
  };

  // Handle clearing all reports
  const handleClearAllReports = async () => {
    await clearAllReports();
    setReports([]);
    setShowClearAllConfirm(false);
    setSelectedReport(null);
  };

  // Save school platform settings
  const handleSaveSchoolSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSavedSuccess(true);
    setTimeout(() => setSettingsSavedSuccess(false), 3000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      getTranslation(lang, 'colVictim'),
      getTranslation(lang, 'colType'),
      getTranslation(lang, 'colLocation'),
      getTranslation(lang, 'colSeverity'),
      getTranslation(lang, 'colStatus'),
      getTranslation(lang, 'colDate'),
      getTranslation(lang, 'colDescription'),
      getTranslation(lang, 'adminNotesLabel'),
    ];
    const rows = reports.map((r) => [
      r.id,
      r.victim_name ? `"${r.victim_name.replace(/"/g, '""')}"` : `"${getTranslation(lang, 'unknownVictim')}"`,
      `"${getTypeLabel(r.type, lang)}"`,
      `"${r.location}"`,
      `"${getSeverityLabel(r.severity, lang)}"`,
      `"${getStatusLabel(r.status, lang)}"`,
      r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
      `"${r.description.replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sitr_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export All/Filtered Reports to Executive PDF Dossier
  const handleExportPDF = () => {
    const listToExport = filteredReports.length > 0 ? filteredReports : reports;
    exportAllReportsPdf(
      listToExport,
      {
        schoolName,
        counselorName,
        academicYear,
        emergencyPhone,
      },
      lang
    );
    setToastMsg(getTranslation(lang, 'pdfExportSuccess'));
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Export Single Report to Official PDF
  const handleExportSingleReportPDF = (report: Report) => {
    exportSingleReportPdf(
      report,
      {
        schoolName,
        counselorName,
        academicYear,
        emergencyPhone,
      },
      lang
    );
    setToastMsg(getTranslation(lang, 'pdfExportSuccess'));
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Filtered & Sorted Reports
  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => {
        if (statusFilter !== 'all' && report.status !== statusFilter) return false;
        if (severityFilter !== 'all' && report.severity !== severityFilter) return false;
        if (typeFilter !== 'all' && report.type !== typeFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesDesc = report.description.toLowerCase().includes(q);
          const matchesLoc = report.location.toLowerCase().includes(q);
          const matchesId = report.id.toLowerCase().includes(q);
          const matchesVictim = report.victim_name ? report.victim_name.toLowerCase().includes(q) : false;
          if (!matchesDesc && !matchesLoc && !matchesId && !matchesVictim) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [reports, statusFilter, severityFilter, typeFilter, searchQuery, sortOrder]);

  // Statistics
  const totalReportsCount = reports.length;
  const highSeverityCount = reports.filter((r) => r.severity === 'high').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
  const inProgressCount = reports.filter((r) => r.status === 'in_progress').length;
  const newReportsCount = reports.filter((r) => r.status === 'new').length;

  // Trend data across time (weekly / monthly)
  const trendData = useMemo(() => {
    const daysCount = timeRange === 'week' ? 7 : 30;
    const now = new Date();
    const result: {
      label: string;
      fullDate: string;
      total: number;
      high: number;
      resolved: number;
    }[] = [];

    const getLocalizedDay = (d: Date) => {
      const arabicDayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const englishDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const frenchDayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      const tamazightDayNames = ['Asamas', 'Aynas', 'Asinas', 'Akras', 'Akwas', 'Simwas', 'Asiḍyas'];
      if (lang === 'en') return englishDayNames[d.getDay()];
      if (lang === 'fr') return frenchDayNames[d.getDay()];
      if (lang === 'zgh') return tamazightDayNames[d.getDay()];
      return arabicDayNames[d.getDay()];
    };

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayName = getLocalizedDay(d);

      const matching = reports.filter((r) => {
        const reportDate = r.incident_date || (r.created_at ? r.created_at.slice(0, 10) : '');
        return reportDate === dateStr;
      });

      const high = matching.filter((r) => r.severity === 'high').length;
      const res = matching.filter((r) => r.status === 'resolved').length;

      result.push({
        label: timeRange === 'week' ? `${dayName} (${d.getDate()})` : `${d.getDate()}/${d.getMonth() + 1}`,
        fullDate: dateStr,
        total: matching.length,
        high,
        resolved: res,
      });
    }

    return result;
  }, [reports, timeRange, lang]);

  // Key Trend Summary Stats
  const trendStats = useMemo(() => {
    let peakDay = { label: '—', count: 0 };
    let totalInPeriod = 0;
    let criticalInPeriod = 0;

    trendData.forEach((item) => {
      totalInPeriod += item.total;
      criticalInPeriod += item.high;
      if (item.total > peakDay.count) {
        peakDay = { label: item.label, count: item.total };
      }
    });

    const daysCount = trendData.length || 1;
    const dailyAverage = (totalInPeriod / daysCount).toFixed(1);

    const mid = Math.floor(trendData.length / 2);
    const firstHalfSum = trendData.slice(0, mid).reduce((acc, cur) => acc + cur.total, 0);
    const secondHalfSum = trendData.slice(mid).reduce((acc, cur) => acc + cur.total, 0);

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (secondHalfSum > firstHalfSum && secondHalfSum > 0) direction = 'up';
    else if (secondHalfSum < firstHalfSum) direction = 'down';

    return {
      peakDay,
      totalInPeriod,
      criticalInPeriod,
      dailyAverage,
      direction,
    };
  }, [trendData]);

  // Multi-Mode Dynamic Pie Chart Data
  const dynamicPieData = useMemo(() => {
    if (pieMode === 'types') {
      const verbal = reports.filter((r) => r.type === 'verbal').length;
      const physical = reports.filter((r) => r.type === 'physical').length;
      const cyber = reports.filter((r) => r.type === 'cyber').length;
      const total = verbal + physical + cyber || 1;
      return [
        { name: getTranslation(lang, 'verbal'), value: verbal, color: '#14b8a6', percent: Math.round((verbal / total) * 100) },
        { name: getTranslation(lang, 'physical'), value: physical, color: '#f43f5e', percent: Math.round((physical / total) * 100) },
        { name: getTranslation(lang, 'cyber'), value: cyber, color: '#06b6d4', percent: Math.round((cyber / total) * 100) },
      ];
    } else if (pieMode === 'periods') {
      const morning = reports.filter((r) => !r.incident_period || r.incident_period.includes('صباح') || r.incident_period.includes('Morning') || r.incident_period.includes('Matin') || r.incident_period.includes('ⵜⵉⴼⴰⵡⵜ')).length;
      const breakTime = reports.filter((r) => r.incident_period && (r.incident_period.includes('فسحة') || r.incident_period.includes('استراحة') || r.incident_period.includes('Break') || r.incident_period.includes('Récréation') || r.incident_period.includes('ⴰⵙⴳⵓⵏⴼⵓ'))).length;
      const afternoon = reports.filter((r) => r.incident_period && (r.incident_period.includes('مساء') || r.incident_period.includes('انصراف') || r.incident_period.includes('Afternoon') || r.incident_period.includes('Après-midi') || r.incident_period.includes('ⵜⴰⴷⴳⴳⵯⴰⵜ'))).length;
      const total = morning + breakTime + afternoon || 1;
      return [
        { name: getTranslation(lang, 'periodMorning'), value: morning, color: '#38bdf8', percent: Math.round((morning / total) * 100) },
        { name: getTranslation(lang, 'periodBreak'), value: breakTime, color: '#f59e0b', percent: Math.round((breakTime / total) * 100) },
        { name: getTranslation(lang, 'periodAfternoon'), value: afternoon, color: '#a855f7', percent: Math.round((afternoon / total) * 100) },
      ];
    } else {
      const high = reports.filter((r) => r.severity === 'high').length;
      const medium = reports.filter((r) => r.severity === 'medium').length;
      const low = reports.filter((r) => r.severity === 'low').length;
      const total = high + medium + low || 1;
      return [
        { name: getTranslation(lang, 'severityHigh'), value: high, color: '#ef4444', percent: Math.round((high / total) * 100) },
        { name: getTranslation(lang, 'severityMedium'), value: medium, color: '#f59e0b', percent: Math.round((medium / total) * 100) },
        { name: getTranslation(lang, 'severityLow'), value: low, color: '#10b981', percent: Math.round((low / total) * 100) },
      ];
    }
  }, [reports, pieMode, lang]);

  // Bar Chart Data: Locations Breakdown
  const locationBarData = useMemo(() => {
    const locationCounts: Record<string, number> = {};
    reports.forEach((r) => {
      const locKey = r.location.startsWith('أخرى') ? getTranslation(lang, 'locOther') : r.location;
      locationCounts[locKey] = (locationCounts[locKey] || 0) + 1;
    });

    return Object.entries(locationCounts).map(([name, count]) => ({
      name,
      [getTranslation(lang, 'reportsCountWord')]: count,
    }));
  }, [reports, lang]);

  // Bar Chart Data: Time Periods Breakdown (Morning, Break, Afternoon...)
  const periodBarData = useMemo(() => {
    const periodCounts: Record<string, number> = {};
    reports.forEach((r) => {
      const pKey = r.incident_period || getTranslation(lang, 'periodMorning');
      periodCounts[pKey] = (periodCounts[pKey] || 0) + 1;
    });

    return Object.entries(periodCounts).map(([name, count]) => ({
      name,
      [getTranslation(lang, 'reportsCountWord')]: count,
    }));
  }, [reports, lang]);

  // Helper function to detect and format keywords in description
  const renderHighlightedDescription = (text: string) => {
    let hasHighKeyword = false;
    let hasMediumKeyword = false;

    for (const kw of HIGH_SEVERITY_KEYWORDS) {
      if (text.includes(kw)) {
        hasHighKeyword = true;
        break;
      }
    }

    for (const kw of MEDIUM_SEVERITY_KEYWORDS) {
      if (text.includes(kw)) {
        hasMediumKeyword = true;
        break;
      }
    }

    return (
      <div className="flex flex-col gap-1">
        <p className="line-clamp-2 text-slate-200 text-xs sm:text-sm leading-relaxed">
          {text}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {hasHighKeyword && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <Flame className="w-3 h-3 text-rose-400" />
              رصد كلمات عنف / تهديد
            </span>
          )}
          {hasMediumKeyword && !hasHighKeyword && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <MessageSquareWarning className="w-3 h-3 text-amber-400" />
              رصد ألفاظ مسيئة / استهزاء
            </span>
          )}
        </div>
      </div>
    );
  };

  // Determine row background color based on AI / Logic Simulation
  const getRowClassName = (report: Report) => {
    const desc = report.description.toLowerCase();
    const hasHighKeyword = HIGH_SEVERITY_KEYWORDS.some((kw) => desc.includes(kw)) || report.severity === 'high';
    const hasMediumKeyword = MEDIUM_SEVERITY_KEYWORDS.some((kw) => desc.includes(kw));

    if (hasHighKeyword) {
      return 'bg-rose-950/20 hover:bg-rose-950/30 border-r-4 border-r-rose-500 transition-colors';
    }
    if (hasMediumKeyword) {
      return 'bg-amber-950/15 hover:bg-amber-950/25 border-r-4 border-r-amber-500 transition-colors';
    }
    return 'hover:bg-slate-800/40 border-r-4 border-r-transparent transition-colors';
  };

  return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col md:flex-row text-slate-100 font-['Cairo',sans-serif]">
      {/* Mobile Top Navigation & Tab Bar (Phones & Small Tablets) */}
      <div className="md:hidden sticky top-0 z-40 bg-[#0a1226]/95 backdrop-blur-md border-b border-teal-900/30 px-3.5 py-2.5">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <ShieldLogo size="sm" />
            <div>
              <h2 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <span>{getTranslation(lang, 'appName')}</span>
                <span className="text-[10px] text-teal-400 font-medium bg-teal-500/10 px-1.5 py-0.2 rounded border border-teal-500/20">
                  {getTranslation(lang, 'adminPanelTitle')}
                </span>
              </h2>
              <span className="text-[11px] text-slate-400 font-medium block truncate max-w-[130px]">
                {user.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Switcher Dropdown */}
            {onLangChange && (
              <div className="relative">
                <select
                  value={lang}
                  onChange={(e) => onLangChange(e.target.value as Language)}
                  className="bg-slate-800 text-[11px] text-teal-300 font-bold border border-slate-700 rounded-lg py-1 px-1.5 outline-none cursor-pointer"
                  title="Language"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {onThemeToggle && (
              <button
                onClick={onThemeToggle}
                className="p-1.5 rounded-lg bg-slate-800 text-amber-300 border border-slate-700 transition"
                title={isDark ? getTranslation(lang, 'themeLight') : getTranslation(lang, 'themeDark')}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            )}

            {onOpenSimulation && (
              <button
                onClick={onOpenSimulation}
                className="p-1.5 rounded-lg bg-teal-950/80 text-teal-300 border border-teal-500/50 transition hover:bg-teal-900/60"
                title="محاكاة سِتر ثلاثية الأبعاد (ESP32 ➔ Pi)"
              >
                <Cpu className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              </button>
            )}

            <button
              onClick={loadReports}
              className="p-1.5 rounded-lg bg-slate-800 text-teal-300 border border-slate-700 transition"
              title={getTranslation(lang, 'refreshData')}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExportPDF}
              className="p-1.5 rounded-lg bg-teal-950/80 text-teal-300 border border-teal-500/50 transition hover:bg-teal-900/60"
              title={getTranslation(lang, 'exportPDF')}
            >
              <Printer className="w-3.5 h-3.5 text-teal-300" />
            </button>
            <button
              onClick={handleExportCSV}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 transition"
              title={getTranslation(lang, 'exportCSV')}
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
            </button>
            <button
              onClick={onNavigateToPublic}
              className="p-1.5 rounded-lg bg-slate-900 text-teal-300 border border-teal-500/30 transition"
              title={getTranslation(lang, 'openPublicPage')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-500/30 transition"
              title={getTranslation(lang, 'logout')}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Strip (Instant 1-tap view switching) */}
        <div className="grid grid-cols-4 gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-1.5 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3 h-3" />
            <span>{getTranslation(lang, 'tabDashboard')}</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`py-1.5 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer relative ${
              activeTab === 'reports'
                ? 'bg-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>{getTranslation(lang, 'tabReports')} ({reports.length})</span>
            {newReportsCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`py-1.5 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'heatmap'
                ? 'bg-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>{getTranslation(lang, 'tabHeatmap')}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-1.5 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3 h-3" />
            <span>{getTranslation(lang, 'tabSettings')}</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar (Only visible on md screens and larger) */}
      <aside className={`hidden md:flex md:w-64 bg-[#0a1226] ${isRtl ? 'border-l' : 'border-r'} border-teal-900/30 flex-col shrink-0`}>
        {/* Brand */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldLogo size="sm" />
            <div>
              <h2 className="font-extrabold text-lg text-white">{getTranslation(lang, 'appName')}</h2>
              <span className="text-[11px] text-teal-400 font-medium block">
                {getTranslation(lang, 'adminPanelTitle')}
              </span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-start">
          <span className="text-[10px] text-teal-400 font-bold block uppercase tracking-wider">
            {getTranslation(lang, 'activeUser')}
          </span>
          <h4 className="text-sm font-bold text-white truncate mt-0.5">
            {user.name}
          </h4>
          <span className="text-xs text-slate-400 block truncate">
            {user.email}
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1.5 py-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition text-start cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-700/25'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-teal-300" />
            <span>{getTranslation(lang, 'tabDashboard')}</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition text-start cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-700/25'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-teal-300" />
              <span>{getTranslation(lang, 'tabReports')}</span>
            </div>
            {newReportsCount > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-400 text-slate-950 font-black">
                {newReportsCount} {getTranslation(lang, 'statusNew')}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition text-start cursor-pointer ${
              activeTab === 'heatmap'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-700/25'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4 text-teal-300" />
            <span>{getTranslation(lang, 'tabHeatmap')}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition text-start cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-700/25'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-teal-300" />
            <span>{getTranslation(lang, 'tabSettings')}</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          {onOpenSimulation && (
            <button
              onClick={onOpenSimulation}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl text-teal-300 bg-teal-950/60 hover:bg-teal-900/60 border border-teal-500/40 shadow-sm transition cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span>محاكاة الحساس 3D (ESP32 ➔ Pi)</span>
            </button>
          )}

          <button
            onClick={onNavigateToPublic}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-teal-300 bg-slate-900 hover:bg-slate-800 border border-teal-500/25 transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{getTranslation(lang, 'openPublicPage')}</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{getTranslation(lang, 'logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Desktop Top Navbar (Hidden on mobile) */}
        <header className="hidden md:flex sticky top-0 z-30 bg-[#091124]/90 backdrop-blur-md border-b border-teal-900/30 px-6 py-4 items-center justify-between">
          <div className="text-start">
            <h1 className="text-lg sm:text-xl font-black text-white">
              {activeTab === 'dashboard' && getTranslation(lang, 'tabDashboard')}
              {activeTab === 'reports' && getTranslation(lang, 'allReportsTitle')}
              {activeTab === 'heatmap' && getTranslation(lang, 'tabHeatmap')}
              {activeTab === 'settings' && getTranslation(lang, 'tabSettings')}
            </h1>
            <p className="text-xs text-slate-400">
              {getTranslation(lang, 'dashboardSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            {onLangChange && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700">
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                <select
                  value={lang}
                  onChange={(e) => onLangChange(e.target.value as Language)}
                  className="bg-transparent text-xs text-white font-bold outline-none cursor-pointer"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                      {l.nativeName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Theme Toggle */}
            {onThemeToggle && (
              <button
                onClick={onThemeToggle}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 transition cursor-pointer"
                title={isDark ? getTranslation(lang, 'themeLight') : getTranslation(lang, 'themeDark')}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={loadReports}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-teal-300 border border-slate-700 transition cursor-pointer"
              title={getTranslation(lang, 'refreshData')}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold border border-teal-500 shadow-sm transition cursor-pointer"
              title={getTranslation(lang, 'exportPDF')}
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>{getTranslation(lang, 'exportPDF')}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>{getTranslation(lang, 'exportCSV')}</span>
            </button>

            {reports.length > 0 && (
              <button
                onClick={() => setShowClearAllConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/60 text-rose-300 text-xs font-bold border border-rose-500/30 transition cursor-pointer"
                title={getTranslation(lang, 'clearHistory')}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">{getTranslation(lang, 'clearHistory')}</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* STATS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Reports */}
            <div className="bg-[#0b142c] border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden text-start">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">
                  {getTranslation(lang, 'metricTotal')}
                </span>
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {totalReportsCount}
              </h3>
              <p className="text-[11px] text-teal-400/90 mt-1">
                {getTranslation(lang, 'tabReports')}
              </p>
            </div>

            {/* High Severity */}
            <div className="bg-[#0b142c] border border-rose-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden text-start">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-300">
                  {getTranslation(lang, 'metricHigh')}
                </span>
                <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 animate-pulse">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-rose-400">
                {highSeverityCount}
              </h3>
              <p className="text-[11px] text-rose-300/80 mt-1">
                {getTranslation(lang, 'severityHigh')}
              </p>
            </div>

            {/* In Progress */}
            <div className="bg-[#0b142c] border border-amber-500/25 rounded-2xl p-4 sm:p-5 relative overflow-hidden text-start">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-300">
                  {getTranslation(lang, 'metricInProgress')}
                </span>
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-300">
                {inProgressCount}
              </h3>
              <p className="text-[11px] text-amber-300/80 mt-1">
                {getTranslation(lang, 'statusInProgress')}
              </p>
            </div>

            {/* Resolved */}
            <div className="bg-[#0b142c] border border-emerald-500/25 rounded-2xl p-4 sm:p-5 relative overflow-hidden text-start">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-300">
                  {getTranslation(lang, 'metricResolved')}
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-400">
                {resolvedCount}
              </h3>
              <p className="text-[11px] text-emerald-300/80 mt-1">
                {getTranslation(lang, 'statusResolved')}
              </p>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & CHARTS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* FEATURED: LINE CHART - Bullying Trends Over Time (Weekly / Monthly) */}
              <div className="bg-[#0b142c] border border-slate-800 rounded-3xl p-5 sm:p-6 text-start">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                        <Activity className="w-4 h-4 text-teal-400" />
                      </div>
                      <h3 className="font-extrabold text-white text-base sm:lg">
                        {getTranslation(lang, 'lineChartTitle')}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {getTranslation(lang, 'lineChartSub')}
                    </p>
                  </div>

                  {/* Toggle: Week vs Month */}
                  <div className="flex items-center bg-[#070d1d] p-1 rounded-2xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setTimeRange('week')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        timeRange === 'week'
                          ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{getTranslation(lang, 'weeklyView')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeRange('month')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        timeRange === 'month'
                          ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>{getTranslation(lang, 'monthlyView')}</span>
                    </button>
                  </div>
                </div>

                {/* Trend Summary Metric Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                  <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block mb-0.5">{getTranslation(lang, 'peakDayLabel')}</span>
                    <span className="text-xs sm:text-sm font-bold text-teal-300">
                      {trendStats.peakDay.label} ({trendStats.peakDay.count} {getTranslation(lang, 'reportsCountWord')})
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block mb-0.5">{getTranslation(lang, 'dailyAverageLabel')}</span>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {trendStats.dailyAverage} {getTranslation(lang, 'reportsCountWord')} / {getTranslation(lang, 'colDate')}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block mb-0.5">{getTranslation(lang, 'trendDirectionLabel')}</span>
                    <span className="text-xs sm:text-sm font-bold flex items-center gap-1">
                      {trendStats.direction === 'up' && (
                        <span className="text-rose-400 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {getTranslation(lang, 'trendRising')}
                        </span>
                      )}
                      {trendStats.direction === 'down' && (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          {getTranslation(lang, 'trendDeclining')}
                        </span>
                      )}
                      {trendStats.direction === 'stable' && (
                        <span className="text-teal-400">
                          {getTranslation(lang, 'trendStable')}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block mb-0.5">{getTranslation(lang, 'criticalInPeriodLabel')}</span>
                    <span className="text-xs sm:text-sm font-bold text-rose-400">
                      {trendStats.criticalInPeriod} {getTranslation(lang, 'severityHigh')}
                    </span>
                  </div>
                </div>

                {/* Line / Area Chart */}
                <div className="h-72 w-full pt-2" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        interval={timeRange === 'week' ? 0 : 'preserveStartEnd'}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0c162e',
                          borderColor: '#1e293b',
                          borderRadius: '14px',
                          color: '#fff',
                          fontFamily: 'Cairo',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                        }}
                        formatter={(value: any, name: any) => [
                          value,
                          name === 'total'
                            ? getTranslation(lang, 'metricTotal')
                            : name === 'high'
                            ? getTranslation(lang, 'metricHigh')
                            : getTranslation(lang, 'statusResolved'),
                        ]}
                        labelFormatter={(label) => `${getTranslation(lang, 'colDate')}: ${label}`}
                      />
                      <Legend
                        formatter={(value) => (
                          <span className="text-slate-300 text-xs font-semibold px-2">
                            {value === 'total'
                              ? getTranslation(lang, 'metricTotal')
                              : value === 'high'
                              ? getTranslation(lang, 'metricHigh')
                              : getTranslation(lang, 'statusResolved')}
                          </span>
                        )}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        name="total"
                        stroke="#14b8a6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                        activeDot={{ r: 6, fill: '#14b8a6' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="high"
                        name="high"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorHigh)"
                        activeDot={{ r: 5, fill: '#f43f5e' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="resolved"
                        name="resolved"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 3, fill: '#10b981' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Grid: Pie Chart (Multi-Mode) & Locations Bar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dynamic Multi-Mode Pie / Donut Chart */}
                <div className="bg-[#0b142c] border border-slate-800 rounded-3xl p-5 sm:p-6 text-start">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-bold text-white text-base">
                        {getTranslation(lang, 'pieChartTitle')}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {pieMode === 'types' && `${getTranslation(lang, 'pieModeTypes')}`}
                        {pieMode === 'periods' && `${getTranslation(lang, 'pieModePeriods')}`}
                        {pieMode === 'severity' && `${getTranslation(lang, 'pieModeSeverity')}`}
                      </span>
                    </div>

                    {/* Mode Pills */}
                    <div className="flex items-center bg-[#070d1d] p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPieMode('types')}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          pieMode === 'types'
                            ? 'bg-teal-500 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {getTranslation(lang, 'pieModeTypes')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPieMode('periods')}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          pieMode === 'periods'
                            ? 'bg-teal-500 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {getTranslation(lang, 'pieModePeriods')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPieMode('severity')}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          pieMode === 'severity'
                            ? 'bg-teal-500 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {getTranslation(lang, 'pieModeSeverity')}
                      </button>
                    </div>
                  </div>

                  {totalReportsCount === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800/80">
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
                        <ShieldLogo size="sm" />
                      </div>
                      <p className="text-sm font-bold text-white mb-1">{getTranslation(lang, 'emptyReportsTitle')}</p>
                      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                        {getTranslation(lang, 'emptyReportsSub')}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="h-60 w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={dynamicPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={75}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {dynamicPieData.map((entry, index) => (
                                <Cell key={`pie-cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0c162e',
                                borderColor: '#1e293b',
                                borderRadius: '12px',
                                color: '#fff',
                                fontFamily: 'Cairo',
                              }}
                              formatter={(val: any, name: any, item: any) => [
                                `${val} ${getTranslation(lang, 'reportsCountWord')} (${item.payload.percent}%)`,
                                name,
                              ]}
                            />
                            <Legend
                              formatter={(value) => (
                                <span className="text-slate-200 text-xs font-medium">
                                  {value}
                                </span>
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Percentage Cards */}
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-800 text-center">
                        {dynamicPieData.map((item, idx) => (
                          <div key={idx} className="p-1.5 rounded-xl bg-slate-900/50 border border-slate-800/70">
                            <span className="text-[11px] font-bold block truncate" style={{ color: item.color }}>
                              {item.name}
                            </span>
                            <div className="flex items-center justify-center gap-1 mt-0.5">
                              <span className="text-sm font-black text-white">{item.value}</span>
                              <span className="text-[10px] text-slate-400">({item.percent}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Bar Chart: Location Breakdown */}
                <div className="bg-[#0b142c] border border-slate-800 rounded-3xl p-5 sm:p-6 text-start">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-white text-base">
                        {getTranslation(lang, 'locationsChartTitle')}
                      </h3>
                      <span className="text-xs text-teal-400 font-medium">
                        {getTranslation(lang, 'locationsChartSub')}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                      <MapPin className="w-4 h-4 text-teal-400" />
                    </div>
                  </div>

                  {totalReportsCount === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800/80">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-teal-400 flex items-center justify-center mb-3">
                        <MapPin className="w-6 h-6 text-teal-400" />
                      </div>
                      <p className="text-sm font-bold text-white mb-1">{getTranslation(lang, 'emptyReportsTitle')}</p>
                      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                        {getTranslation(lang, 'emptyReportsSub')}
                      </p>
                    </div>
                  ) : (
                    <div className="h-60 w-full" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={locationBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0c162e',
                              borderColor: '#1e293b',
                              borderRadius: '12px',
                              color: '#fff',
                              fontFamily: 'Cairo',
                            }}
                          />
                          <Bar dataKey={getTranslation(lang, 'reportsCountWord')} fill="#14b8a6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Table Preview from Dashboard */}
              <div className="bg-[#0b142c] border border-slate-800 rounded-3xl p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-start">
                    <h3 className="font-bold text-white text-base">
                      {getTranslation(lang, 'recentReportsTitle')}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {getTranslation(lang, 'dashboardSubtitle')}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="text-xs text-teal-400 hover:text-teal-300 font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>{getTranslation(lang, 'viewAllReportsBtn')} ({reports.length})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Condensed Table & Mobile Cards */}
                {reports.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800/80">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-teal-400 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-5 h-5 text-teal-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-0.5">{getTranslation(lang, 'emptyReportsTitle')}</h4>
                    <p className="text-xs text-slate-400">{getTranslation(lang, 'emptyReportsSub')}</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile Cards (Visible only on mobile devices) */}
                    <div className="md:hidden space-y-3">
                      {reports.slice(0, 4).map((report) => (
                        <div
                          key={report.id}
                          className={`p-3.5 rounded-2xl bg-[#0e1730] border ${
                            report.severity === 'high'
                              ? 'border-rose-500/40 bg-rose-950/15'
                              : report.severity === 'medium'
                              ? 'border-amber-500/40 bg-amber-950/10'
                              : 'border-slate-800'
                          } space-y-2.5 text-start`}
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                            <span className="text-[11px] font-mono font-bold text-teal-300 bg-slate-900 px-2 py-0.5 rounded">
                              #{report.id.slice(0, 8)}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(report.created_at).toLocaleDateString()} ({report.incident_period || getTranslation(lang, 'periodMorning')})
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                              {getTypeLabel(report.type, lang)}
                            </span>
                            <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {report.location}
                            </span>
                            {report.victim_name ? (
                              <span className="text-teal-300 font-bold bg-teal-950/60 border border-teal-500/30 px-2 py-0.5 rounded">
                                {report.victim_name}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">{getTranslation(lang, 'unknownVictim')}</span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                report.severity === 'high'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : report.severity === 'medium'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {getSeverityLabel(report.severity, lang)}
                            </span>
                          </div>

                          <div>{renderHighlightedDescription(report.description)}</div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                            <select
                              value={report.status}
                              onChange={(e) => handleStatusChange(report.id, e.target.value as ReportStatus)}
                              className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border outline-none ${
                                report.status === 'new'
                                  ? 'bg-blue-950/70 text-blue-300 border-blue-500/40'
                                  : report.status === 'in_progress'
                                  ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                                  : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                              }`}
                            >
                              <option value="new">{getTranslation(lang, 'statusNew')}</option>
                              <option value="in_progress">{getTranslation(lang, 'statusInProgress')}</option>
                              <option value="resolved">{getTranslation(lang, 'statusResolved')}</option>
                            </select>

                            <button
                              onClick={() => setSelectedReport(report)}
                              className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 transition cursor-pointer"
                            >
                              {getTranslation(lang, 'detailsBtn')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table (Visible on md screens and larger) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-start text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="pb-3 px-2">{getTranslation(lang, 'colDate')}</th>
                            <th className="pb-3 px-2">{getTranslation(lang, 'colVictim')}</th>
                            <th className="pb-3 px-2">{getTranslation(lang, 'colType')}</th>
                            <th className="pb-3 px-2">{getTranslation(lang, 'colLocation')}</th>
                            <th className="pb-3 px-2 max-w-xs">{getTranslation(lang, 'colDescription')}</th>
                            <th className="pb-3 px-2">{getTranslation(lang, 'colSeverity')}</th>
                            <th className="pb-3 px-2">{getTranslation(lang, 'colStatus')}</th>
                            <th className="pb-3 px-2 text-center">{getTranslation(lang, 'colActions')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {reports.slice(0, 4).map((report) => (
                          <tr key={report.id} className={getRowClassName(report)}>
                            <td className="py-3 px-2 text-slate-300 whitespace-nowrap">
                              {new Date(report.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-2 whitespace-nowrap">
                              {report.victim_name ? (
                                <span className="font-bold text-teal-300 bg-teal-950/60 border border-teal-500/30 px-2 py-0.5 rounded-md text-xs">
                                  {report.victim_name}
                                </span>
                              ) : (
                                <span className="text-slate-500 text-xs italic">{getTranslation(lang, 'unknownVictim')}</span>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <span className="font-bold text-white">
                                {getTypeLabel(report.type, lang)}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-slate-300">{report.location}</td>
                            <td className="py-3 px-2 max-w-xs">
                              {renderHighlightedDescription(report.description)}
                            </td>
                            <td className="py-3 px-2 whitespace-nowrap">
                              <span
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                  report.severity === 'high'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : report.severity === 'medium'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}
                              >
                                {getSeverityLabel(report.severity, lang)}
                              </span>
                            </td>
                            <td className="py-3 px-2 whitespace-nowrap">
                              <span
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                  report.status === 'new'
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                    : report.status === 'in_progress'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                }`}
                              >
                                {getStatusLabel(report.status, lang)}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center whitespace-nowrap">
                              <button
                                onClick={() => setSelectedReport(report)}
                                className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold transition cursor-pointer"
                              >
                                {getTranslation(lang, 'detailsBtn')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            </div>
          )}

          {/* TAB 2: FULL REPORTS DATA TABLE WITH FILTERS */}
          {activeTab === 'reports' && (
            <div className="bg-[#0b142c] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
              {/* Filters Bar */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={getTranslation(lang, 'searchPlaceholder')}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-teal-400"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-900/90 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-teal-400"
                  >
                    <option value="all">{getTranslation(lang, 'filterAllStatus')}</option>
                    <option value="new">{getTranslation(lang, 'statusNew')}</option>
                    <option value="in_progress">{getTranslation(lang, 'statusInProgress')}</option>
                    <option value="resolved">{getTranslation(lang, 'statusResolved')}</option>
                  </select>

                  {/* Severity Filter */}
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="bg-slate-900/90 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-teal-400"
                  >
                    <option value="all">{getTranslation(lang, 'filterAllSeverity')}</option>
                    <option value="high">{getTranslation(lang, 'severityHigh')}</option>
                    <option value="medium">{getTranslation(lang, 'severityMedium')}</option>
                    <option value="low">{getTranslation(lang, 'severityLow')}</option>
                  </select>

                  {/* Type Filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-slate-900/90 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-teal-400"
                  >
                    <option value="all">{getTranslation(lang, 'filterAllTypes')}</option>
                    <option value="verbal">{getTranslation(lang, 'verbal')}</option>
                    <option value="physical">{getTranslation(lang, 'physical')}</option>
                    <option value="cyber">{getTranslation(lang, 'cyber')}</option>
                  </select>

                  {/* Sort Order Toggle */}
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition"
                    title={getTranslation(lang, 'sortNewest')}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-teal-400" />
                    <span>{sortOrder === 'desc' ? getTranslation(lang, 'sortNewest') : getTranslation(lang, 'sortOldest')}</span>
                  </button>
                </div>
              </div>

              {/* Indicator & Export Actions */}
              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{getTranslation(lang, 'dashboardSubtitle')}</span>
                  <span className="text-[11px] text-teal-400 font-bold">
                    ({filteredReports.length} / {reports.length} {getTranslation(lang, 'reportsCountWord')})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPDF}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer shadow-sm"
                    title={getTranslation(lang, 'exportPDF')}
                  >
                    <Printer className="w-3.5 h-3.5 text-white" />
                    <span>{getTranslation(lang, 'exportPDF')}</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                    title={getTranslation(lang, 'exportCSV')}
                  >
                    <Download className="w-3.5 h-3.5 text-teal-400" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Mobile Cards for Filtered Reports (Phones & Small Tablets) */}
              <div className="md:hidden space-y-3">
                {filteredReports.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
                    {getTranslation(lang, 'noSearchMatch')}
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-3.5 rounded-2xl bg-[#0e1730] border ${
                        report.severity === 'high'
                          ? 'border-rose-500/40 bg-rose-950/15'
                          : report.severity === 'medium'
                          ? 'border-amber-500/40 bg-amber-950/10'
                          : 'border-slate-800'
                      } space-y-2.5 text-start`}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <span className="text-[11px] font-mono font-bold text-teal-300 bg-slate-900 px-2 py-0.5 rounded">
                          #{report.id.slice(0, 8)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(report.created_at).toLocaleDateString()} ({report.incident_period || getTranslation(lang, 'periodMorning')})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                          {getTypeLabel(report.type, lang)}
                        </span>
                        <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {report.location}
                        </span>
                        {report.victim_name ? (
                          <span className="text-teal-300 font-bold bg-teal-950/60 border border-teal-500/30 px-2 py-0.5 rounded">
                            {report.victim_name}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">{getTranslation(lang, 'unknownVictim')}</span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            report.severity === 'high'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : report.severity === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {getSeverityLabel(report.severity, lang)}
                        </span>
                      </div>

                      <div>{renderHighlightedDescription(report.description)}</div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                        <select
                          value={report.status}
                          onChange={(e) => handleStatusChange(report.id, e.target.value as ReportStatus)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border outline-none ${
                            report.status === 'new'
                              ? 'bg-blue-950/70 text-blue-300 border-blue-500/40'
                              : report.status === 'in_progress'
                              ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          <option value="new">{getTranslation(lang, 'statusNew')}</option>
                          <option value="in_progress">{getTranslation(lang, 'statusInProgress')}</option>
                          <option value="resolved">{getTranslation(lang, 'statusResolved')}</option>
                        </select>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 transition cursor-pointer"
                          >
                            {getTranslation(lang, 'detailsBtn')}
                          </button>
                          <button
                            onClick={() => handleExportSingleReportPDF(report)}
                            className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition cursor-pointer"
                            title={getTranslation(lang, 'exportIncidentPDF')}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(report.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition cursor-pointer"
                            title={getTranslation(lang, 'deleteBtn')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Full Desktop Table (Hidden on Mobile) */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-start text-xs sm:text-sm">
                  <thead className="bg-[#0e1730] text-slate-300">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">{getTranslation(lang, 'colDate')}</th>
                      <th className="py-3.5 px-3 font-bold">{getTranslation(lang, 'colVictim')}</th>
                      <th className="py-3.5 px-3 font-bold">{getTranslation(lang, 'colType')}</th>
                      <th className="py-3.5 px-3 font-bold">{getTranslation(lang, 'colLocation')}</th>
                      <th className="py-3.5 px-4 font-bold min-w-[240px]">{getTranslation(lang, 'colDescription')}</th>
                      <th className="py-3.5 px-3 font-bold">{getTranslation(lang, 'colSeverity')}</th>
                      <th className="py-3.5 px-3 font-bold">{getTranslation(lang, 'colStatus')}</th>
                      <th className="py-3.5 px-4 font-bold text-center">{getTranslation(lang, 'colActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-[#0b142c]">
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          {getTranslation(lang, 'noSearchMatch')}
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((report) => (
                        <tr key={report.id} className={getRowClassName(report)}>
                          {/* Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="block font-medium text-white">
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-slate-400 block" dir="ltr">
                              {new Date(report.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>

                          {/* Victim */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {report.victim_name ? (
                              <span className="inline-flex items-center gap-1 font-bold text-teal-300 bg-teal-950/70 border border-teal-500/40 px-2.5 py-1 rounded-lg text-xs">
                                <User className="w-3 h-3 text-teal-400" />
                                <span>{report.victim_name}</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs italic">{getTranslation(lang, 'unknownVictim')}</span>
                            )}
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {report.type === 'verbal' && (
                                <MessageSquareWarning className="w-3.5 h-3.5 text-teal-400" />
                              )}
                              {report.type === 'physical' && (
                                <Flame className="w-3.5 h-3.5 text-rose-400" />
                              )}
                              {report.type === 'cyber' && (
                                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                              )}
                              <span className="font-bold text-white">
                                {getTypeLabel(report.type, lang)}
                              </span>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs">
                              {report.location}
                            </span>
                          </td>

                          {/* Description */}
                          <td className="py-3.5 px-4">
                            {renderHighlightedDescription(report.description)}
                            {report.notes && (
                              <p className="mt-1 text-[11px] text-teal-300 italic">
                                {getTranslation(lang, 'adminNotesLabel')}: {report.notes}
                              </p>
                            )}
                          </td>

                          {/* Severity */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                report.severity === 'high'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : report.severity === 'medium'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {getSeverityLabel(report.severity, lang)}
                            </span>
                          </td>

                          {/* Status Dropdown */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <select
                              value={report.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  report.id,
                                  e.target.value as ReportStatus
                                )
                              }
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer outline-none ${
                                report.status === 'new'
                                  ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                                  : report.status === 'in_progress'
                                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                              }`}
                            >
                              <option value="new">{getTranslation(lang, 'statusNew')}</option>
                              <option value="in_progress">{getTranslation(lang, 'statusInProgress')}</option>
                              <option value="resolved">{getTranslation(lang, 'statusResolved')}</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedReport(report)}
                                className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 transition cursor-pointer"
                                title={getTranslation(lang, 'detailsBtn')}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleExportSingleReportPDF(report)}
                                className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 transition cursor-pointer"
                                title={getTranslation(lang, 'exportIncidentPDF')}
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(report.id)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition cursor-pointer"
                                title={getTranslation(lang, 'deleteBtn')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: HEATMAP / CAMPUS LOCATIONS MAP & TIME PERIODS ANALYTICS */}
          {activeTab === 'heatmap' && (
            <div className="space-y-6">
              {/* Comprehensive Architectural School Heatmap */}
              <SchoolHeatmap
                reports={reports}
                lang={lang}
                onSelectReport={(report) => {
                  setSelectedReport(report);
                  setActiveTab('reports');
                }}
                onOpenSimulation={onOpenSimulation}
              />

              {/* Time Periods Analysis Panel */}
              <div className="bg-[#0b142c] border border-slate-800 rounded-3xl p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-start">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {getTranslation(lang, 'timePeriodAnalysisTitle')}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {getTranslation(lang, 'timePeriodAnalysisSub')}
                    </p>
                  </div>
                  <span className="text-xs text-teal-400 font-bold bg-teal-950/60 border border-teal-500/30 px-3 py-1 rounded-full">
                    {getTranslation(lang, 'pieModePeriods')}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  <div className="lg:col-span-2 h-64 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={periodBarData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0c162e',
                            borderColor: '#1e293b',
                            borderRadius: '12px',
                            color: '#fff',
                            fontFamily: 'Cairo',
                          }}
                        />
                        <Bar dataKey={getTranslation(lang, 'reportsCountWord')} fill="#06b6d4" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3 text-start">
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <h4 className="text-xs font-bold text-teal-300 mb-1">{getTranslation(lang, 'periodBreak')}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {reports.filter((r) => r.incident_period && (r.incident_period.includes('فسحة') || r.incident_period.includes('استراحة') || r.incident_period.includes('Break') || r.incident_period.includes('Récréation'))).length} {getTranslation(lang, 'reportsCountWord')}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <h4 className="text-xs font-bold text-cyan-300 mb-1">{getTranslation(lang, 'periodMorning')}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {reports.filter((r) => !r.incident_period || r.incident_period.includes('صباح') || r.incident_period.includes('Morning') || r.incident_period.includes('Matin')).length} {getTranslation(lang, 'reportsCountWord')}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <h4 className="text-xs font-bold text-amber-300 mb-1">{getTranslation(lang, 'periodAfternoon')}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {reports.filter((r) => r.incident_period && (r.incident_period.includes('مساء') || r.incident_period.includes('انصراف') || r.incident_period.includes('Afternoon') || r.incident_period.includes('Après-midi'))).length} {getTranslation(lang, 'reportsCountWord')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCHOOL PLATFORM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Preferences Form */}
              <form onSubmit={handleSaveSchoolSettings} className="bg-[#0b142c] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 text-start">
                <h3 className="text-base font-bold text-white mb-2">
                  {getTranslation(lang, 'schoolPlatformSettings')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {getTranslation(lang, 'schoolNameLabel')}
                    </label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {getTranslation(lang, 'counselorNameLabel')}
                    </label>
                    <input
                      type="text"
                      value={counselorName}
                      onChange={(e) => setCounselorName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  {settingsSavedSuccess ? (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      {getTranslation(lang, 'saveNotesSuccess')}
                    </span>
                  ) : <span />}

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{getTranslation(lang, 'saveSettingsBtn')}</span>
                  </button>
                </div>
              </form>

              {/* Data & History Management Box */}
              <div className="bg-[#0b142c] border border-slate-800 rounded-3xl p-5 sm:p-6 text-start">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {getTranslation(lang, 'tabReports')}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
                      {reports.length} {getTranslation(lang, 'reportsCountWord')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs border border-teal-500/30 transition cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-teal-400" />
                      <span>{getTranslation(lang, 'exportCSV')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowClearAllConfirm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs border border-rose-500/30 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span>{getTranslation(lang, 'clearHistory')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clean Admin Footer & Navigation */}
          <footer className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <ShieldLogo size="sm" />
              <span className="text-white font-bold">{getTranslation(lang, 'appName')}</span>
              <span className="text-slate-600">|</span>
              <span className="text-teal-400 font-medium">{getTranslation(lang, 'adminPanelTitle')}</span>
              <span className="text-slate-600">|</span>
              <span>© {new Date().getFullYear()} {getTranslation(lang, 'allRightsReserved')}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-teal-500 text-white border-teal-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {getTranslation(lang, 'tabDashboard')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  activeTab === 'reports'
                    ? 'bg-teal-500 text-white border-teal-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {getTranslation(lang, 'tabReports')} ({reports.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('heatmap')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  activeTab === 'heatmap'
                    ? 'bg-teal-500 text-white border-teal-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {getTranslation(lang, 'tabHeatmap')}
              </button>
              <button
                type="button"
                onClick={onNavigateToPublic}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-teal-400 hover:text-teal-300 font-bold transition cursor-pointer"
              >
                {getTranslation(lang, 'openPublicPage')}
              </button>
            </div>
          </footer>
        </div>
      </main>

      {/* DETAIL MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-start">
          <div className="w-full max-w-2xl bg-[#0b142c] border border-teal-500/30 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto print-modal-content">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">ID:</span>
                <code className="text-sm font-bold text-teal-300 bg-slate-900 px-2 py-0.5 rounded">
                  {selectedReport.id.slice(0, 10)}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer"
                  title={getTranslation(lang, 'printReportBtn')}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{getTranslation(lang, 'printReportBtn')}</span>
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                >
                  {getTranslation(lang, 'closeBtn')}
                </button>
              </div>
            </div>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-start">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">{getTranslation(lang, 'colType')}</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    {getTypeLabel(selectedReport.type, lang)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">{getTranslation(lang, 'colLocation')}</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    {selectedReport.location}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">{getTranslation(lang, 'colSeverity')}</span>
                  <span
                    className={`text-xs font-bold mt-1 inline-block px-2 py-0.5 rounded ${
                      selectedReport.severity === 'high'
                        ? 'bg-rose-500/20 text-rose-300'
                        : selectedReport.severity === 'medium'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {getSeverityLabel(selectedReport.severity, lang)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">{getTranslation(lang, 'colStatus')}</span>
                  <span
                    className={`text-xs font-bold mt-1 inline-block px-2 py-0.5 rounded ${
                      selectedReport.status === 'new'
                        ? 'bg-blue-500/20 text-blue-300'
                        : selectedReport.status === 'in_progress'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {getStatusLabel(selectedReport.status, lang)}
                  </span>
                </div>
              </div>

              {/* Victim Card */}
              <div className="p-3.5 rounded-2xl bg-[#091124] border border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">{getTranslation(lang, 'colVictim')}:</span>
                    <span className="text-sm font-bold text-white">
                      {selectedReport.victim_name ? (
                        <span className="text-teal-300 font-bold">{selectedReport.victim_name}</span>
                      ) : (
                        <span className="text-slate-400 font-normal italic">{getTranslation(lang, 'unknownVictim')}</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs font-bold text-teal-400 block mb-2">
                  {getTranslation(lang, 'colDescription')}:
                </span>
                <p className="text-sm sm:text-base text-white leading-relaxed whitespace-pre-wrap">
                  {selectedReport.description}
                </p>

                {selectedReport.detected_keywords && selectedReport.detected_keywords.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-rose-300 font-semibold">
                      {getTranslation(lang, 'detectedKeywords')}
                    </span>
                    {selectedReport.detected_keywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-xs border border-rose-500/40"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Admin Counselor Notes */}
              <div className="p-4 rounded-2xl bg-[#091124] border border-teal-500/30">
                <label className="block text-xs font-bold text-teal-300 mb-1.5">
                  {getTranslation(lang, 'counselorActionPlan')}
                </label>
                <textarea
                  rows={3}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder={getTranslation(lang, 'counselorNotesPlaceholder')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-teal-400"
                />
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{getTranslation(lang, 'changeStatus')}</span>
                    <select
                      value={selectedReport.status}
                      onChange={(e) =>
                        handleStatusChange(
                          selectedReport.id,
                          e.target.value as ReportStatus
                        )
                      }
                      className="bg-slate-800 text-xs text-white border border-slate-700 rounded-lg px-2.5 py-1"
                    >
                      <option value="new">{getTranslation(lang, 'statusNew')}</option>
                      <option value="in_progress">{getTranslation(lang, 'statusInProgress')}</option>
                      <option value="resolved">{getTranslation(lang, 'statusResolved')}</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    {notesSavedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{notesSavedSuccess ? (lang === 'ar' ? 'تم الحفظ بنجاح' : 'Saved!') : getTranslation(lang, 'saveNotesBtn')}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] text-slate-500">
                {getTranslation(lang, 'registeredAt')} {new Date(selectedReport.created_at).toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportSingleReportPDF(selectedReport)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer shadow-md"
                  title={getTranslation(lang, 'exportIncidentPDF')}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{getTranslation(lang, 'exportIncidentPDF')}</span>
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  {getTranslation(lang, 'closeBtn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-start">
          <div className="w-full max-w-md bg-[#0c162e] border border-rose-500/40 rounded-3xl p-6 shadow-2xl relative text-white">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">{getTranslation(lang, 'confirmDeleteTitle')}</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {getTranslation(lang, 'confirmDeleteMsg')}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                {getTranslation(lang, 'cancelBtn')}
              </button>
              <button
                onClick={() => handleDeleteReport(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
              >
                {getTranslation(lang, 'confirmDeleteBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL DATA CONFIRMATION MODAL */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-start">
          <div className="w-full max-w-md bg-[#0c162e] border border-rose-500/40 rounded-3xl p-6 shadow-2xl relative text-white">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">{getTranslation(lang, 'confirmClearAllTitle')}</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {getTranslation(lang, 'confirmClearAllMsg')}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                {getTranslation(lang, 'cancelBtn')}
              </button>
              <button
                onClick={handleClearAllReports}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
              >
                {getTranslation(lang, 'confirmClearAllBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-teal-900/95 text-white border border-teal-400/60 shadow-2xl backdrop-blur-md animate-fade-in text-xs sm:text-sm font-bold">
          <CheckCircle className="w-4 h-4 text-teal-300 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
