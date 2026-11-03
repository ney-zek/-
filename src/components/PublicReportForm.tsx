import React, { useState } from 'react';
import { BullyingType, ReportLocation } from '../types';
import { submitReport } from '../lib/supabase';
import { ShieldLogo } from './ShieldLogo';
import { SuccessView } from './SuccessView';
import { Language, Theme, getTranslation } from '../lib/i18n';
import {
  MessageSquareWarning,
  Flame,
  Smartphone,
  Send,
  EyeOff,
  Shield,
  HelpCircle,
  AlertTriangle,
  Lock,
  ChevronDown,
  User,
  Cpu,
} from 'lucide-react';
import { motion } from 'motion/react';

interface PublicReportFormProps {
  onNavigateToLogin: () => void;
  lang: Language;
  theme: Theme;
  onOpenSimulation?: () => void;
}

export const PublicReportForm: React.FC<PublicReportFormProps> = ({ onNavigateToLogin, lang, theme, onOpenSimulation }) => {
  const [bullyingType, setBullyingType] = useState<BullyingType>('verbal');
  const [location, setLocation] = useState<string>('ساحة');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [incidentDate, setIncidentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [incidentPeriod, setIncidentPeriod] = useState<string>('الصباحية');
  const [victimName, setVictimName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const bullyingTypesConfig: Array<{
    id: BullyingType;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'verbal',
      label: getTranslation(lang, 'verbalBullyingLabel'),
      sublabel: getTranslation(lang, 'verbalBullyingSub'),
      icon: <MessageSquareWarning className="w-5 h-5 text-teal-400" />,
    },
    {
      id: 'physical',
      label: getTranslation(lang, 'physicalBullyingLabel'),
      sublabel: getTranslation(lang, 'physicalBullyingSub'),
      icon: <Flame className="w-5 h-5 text-rose-400" />,
    },
    {
      id: 'cyber',
      label: getTranslation(lang, 'cyberBullyingLabel'),
      sublabel: getTranslation(lang, 'cyberBullyingSub'),
      icon: <Smartphone className="w-5 h-5 text-cyan-400" />,
    },
  ];

  const locationsList: Array<{ key: ReportLocation; label: string }> = [
    { key: 'ساحة', label: getTranslation(lang, 'locYard') },
    { key: 'ممر', label: getTranslation(lang, 'locCorridor') },
    { key: 'قسم', label: getTranslation(lang, 'locClassroom') },
    { key: 'حمام', label: getTranslation(lang, 'locRestroom') },
    { key: 'مكتبة', label: getTranslation(lang, 'locLibrary') },
    { key: 'أخرى', label: getTranslation(lang, 'locOther') },
  ];

  const periodsList = [
    { key: 'الصباحية', label: getTranslation(lang, 'periodMorning') },
    { key: 'الاستراحة', label: getTranslation(lang, 'periodBreak') },
    { key: 'المسائية', label: getTranslation(lang, 'periodAfternoon') },
    { key: 'أخرى', label: getTranslation(lang, 'periodOther') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const finalLocation = location === 'أخرى' && customLocation.trim() 
      ? `أخرى: ${customLocation.trim()}` 
      : location;

    if (!description.trim()) {
      setValidationError(getTranslation(lang, 'validationErrorEmpty'));
      return;
    }

    if (description.trim().length < 8) {
      setValidationError(getTranslation(lang, 'validationErrorShort'));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitReport({
        type: bullyingType,
        location: finalLocation,
        incident_date: incidentDate || new Date().toISOString().slice(0, 10),
        incident_period: incidentPeriod,
        victim_name: victimName.trim() || undefined,
        description: description.trim(),
      });

      if (result.success) {
        setSubmittedReportId(result.reportId);
      } else {
        setValidationError(result.error || getTranslation(lang, 'submitError'));
      }
    } catch (err: any) {
      setValidationError(getTranslation(lang, 'submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedReportId(null);
    setDescription('');
    setVictimName('');
    setBullyingType('verbal');
    setLocation('ساحة');
    setCustomLocation('');
    setValidationError(null);
  };

  if (submittedReportId) {
    return (
      <div className="py-6 px-3 sm:px-4">
        <SuccessView reportId={submittedReportId} onReset={handleResetForm} lang={lang} />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      {/* Clean, Non-redundant Hero */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-6 sm:mb-8"
      >
        <div className="flex justify-center mb-3 sm:mb-4">
          <ShieldLogo size="lg" />
        </div>

        <h1 className={`text-2xl sm:text-4xl font-black tracking-tight leading-snug mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {getTranslation(lang, 'heroTitle')}
        </h1>

        <p className={`text-sm sm:text-base max-w-xl mx-auto font-medium leading-relaxed mb-4 ${isDark ? 'text-teal-200/90' : 'text-slate-600'}`}>
          أبلغ بسرية تامة 100% دون الكشف عن هويتك لحماية نفسك وزملائك.
        </p>

        {/* Single Sleek Trust Indicator (No clutter or duplicate pills) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold border bg-teal-500/10 border-teal-500/25 text-teal-300">
          <Shield className="w-3.5 h-3.5 text-teal-400" />
          <span>بلاغ مشفر ومجهول الهوية بالكامل - لن يعرف أحد هويتك</span>
        </div>

        {/* 3D Hardware Simulation Callout (ESP32 ➔ Raspberry Pi) */}
        {onOpenSimulation && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={onOpenSimulation}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-950/90 to-slate-900/90 hover:from-teal-900/80 hover:to-slate-800/80 border border-teal-500/40 text-teal-200 text-xs sm:text-sm font-bold shadow-lg shadow-teal-950/40 transition-all cursor-pointer group hover:scale-[1.01]"
            >
              <Cpu className="w-4 h-4 text-teal-400 animate-pulse group-hover:scale-110 transition-transform" />
              <span>محاكاة معمارية الأجهزة 3D: رصد العنف عبر ESP32 ونقل البيانات للـ Raspberry Pi</span>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-mono border border-teal-500/30">
                3D Interactive
              </span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Main Reporting Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className={`border rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl relative overflow-hidden ${
          isDark
            ? 'bg-[#0b142c] border-teal-900/40 text-slate-100 shadow-[#040813]/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-lg'
        }`}
      >
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-600" />

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Field 1: Type of Bullying */}
          <div>
            <label className={`block text-xs sm:text-sm font-bold mb-2 text-right ${isDark ? 'text-white' : 'text-slate-900'}`}>
              1. {getTranslation(lang, 'bullyingTypeLabel')}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {bullyingTypesConfig.map((item) => {
                const isSelected = bullyingType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBullyingType(item.id)}
                    className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl text-right transition-all flex flex-col justify-between cursor-pointer border ${
                      isSelected
                        ? isDark
                          ? 'bg-teal-950/60 border-teal-400 ring-2 ring-teal-500/40 shadow'
                          : 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/30 shadow'
                        : isDark
                        ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white shadow-xs'}`}>
                        {item.icon}
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-teal-400 bg-teal-500 text-white'
                            : isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div>
                      <h3 className={`font-bold text-xs sm:text-sm mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.label}
                      </h3>
                      <p className={`text-[11px] sm:text-xs leading-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {item.sublabel}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 2: Location */}
          <div>
            <label className={`block text-xs sm:text-sm font-bold mb-2 text-right ${isDark ? 'text-white' : 'text-slate-900'}`}>
              2. {getTranslation(lang, 'locationLabel')}
            </label>

            <div className="relative">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full rounded-xl px-4 py-3 text-xs sm:text-sm appearance-none cursor-pointer transition outline-none border ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-700 text-white focus:border-teal-400'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-teal-500'
                }`}
              >
                {locationsList.map((loc) => (
                  <option key={loc.key} value={loc.key} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    {loc.label}
                  </option>
                ))}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {location === 'أخرى' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder={getTranslation(lang, 'customLocationPlaceholder')}
                  className={`w-full rounded-xl px-4 py-2.5 text-xs sm:text-sm border outline-none ${
                    isDark ? 'bg-slate-900/90 border-teal-500/40 text-white' : 'bg-slate-50 border-teal-500/40 text-slate-900'
                  }`}
                />
              </motion.div>
            )}
          </div>

          {/* Field 3: Incident Date & Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs sm:text-sm font-bold mb-2 text-right ${isDark ? 'text-white' : 'text-slate-900'}`}>
                3. {getTranslation(lang, 'incidentDateLabel')}
              </label>
              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className={`w-full rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none border ${
                  isDark ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-bold mb-2 text-right ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {getTranslation(lang, 'incidentPeriodLabel')}
              </label>
              <div className="relative">
                <select
                  value={incidentPeriod}
                  onChange={(e) => setIncidentPeriod(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-xs sm:text-sm appearance-none cursor-pointer outline-none border ${
                    isDark ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  {periodsList.map((period) => (
                    <option key={period.key} value={period.key} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                      {period.label}
                    </option>
                  ))}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Field 4: Victim Name (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-sm sm:text-base font-bold text-right flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span>4. {getTranslation(lang, 'victimNameLabel')}</span>
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={victimName}
                onChange={(e) => setVictimName(e.target.value)}
                placeholder={getTranslation(lang, 'victimNamePlaceholder')}
                className={`w-full rounded-xl px-4 py-3 text-sm outline-none border ${
                  isDark ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <User className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Field 5: Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-sm sm:text-base font-bold text-right ${isDark ? 'text-white' : 'text-slate-900'}`}>
                5. {getTranslation(lang, 'descriptionLabel')}
              </label>
              <span className="text-xs text-slate-400">{description.length}</span>
            </div>

            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={getTranslation(lang, 'descriptionPlaceholder')}
              className={`w-full rounded-2xl p-4 text-sm sm:text-base leading-relaxed outline-none transition resize-y min-h-[130px] border ${
                isDark ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-black text-base sm:text-lg shadow-lg shadow-teal-700/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {isSubmitting ? (
                <span>{getTranslation(lang, 'submitting')}</span>
              ) : (
                <>
                  <Send className="w-5 h-5 text-teal-100" />
                  <span>{getTranslation(lang, 'submitReportBtn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
