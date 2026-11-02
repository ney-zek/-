import React from 'react';
import { ShieldLogo } from './ShieldLogo';
import { Language, Theme, getTranslation } from '../lib/i18n';
import {
  ShieldCheck,
  Lock,
  PhoneCall,
  FileText,
  AlertTriangle,
  Sun,
  Moon,
  ArrowUp,
} from 'lucide-react';

interface FooterProps {
  lang: Language;
  theme: Theme;
  onNavigate: (view: 'public' | 'login' | 'admin') => void;
  onOpenEmergency: () => void;
  onLangChange?: (lang: Language) => void;
  onThemeToggle?: () => void;
  isAdminLoggedIn?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  theme,
  onNavigate,
  onOpenEmergency,
  onLangChange,
  onThemeToggle,
  isAdminLoggedIn = false,
}) => {
  const isDark = theme === 'dark';
  const isRtl = lang === 'ar' || lang === 'zgh';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'zgh', label: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', flag: 'ⵣ' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  return (
    <footer
      className={`relative border-t transition-colors duration-300 mt-16 ${
        isDark
          ? 'bg-[#060a16] border-slate-800 text-slate-300'
          : 'bg-white border-slate-200 text-slate-700 shadow-inner'
      } font-['Cairo',sans-serif]`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Accent Gradient Line */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500" />

      {/* Main Footer Container (3 Clean Balanced Columns, No Artificial Site/Server Specs) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <ShieldLogo size="md" />
              <div>
                <h3 className={`text-lg sm:text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {getTranslation(lang, 'appName')}
                </h3>
                <span className="text-xs text-teal-500 font-semibold block">
                  {getTranslation(lang, 'tagline')}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-400">
              {getTranslation(lang, 'heroSubtitle')}
            </p>

            <div className="pt-1">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${
                isDark ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-teal-50 text-teal-700 border border-teal-200'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>{getTranslation(lang, 'fullPrivacyTitle')}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Platform Menus */}
          <div className="space-y-3">
            <h4 className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {getTranslation(lang, 'quickNavTitle')}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => {
                    onNavigate('public');
                    scrollToTop();
                  }}
                  className="flex items-center gap-2 hover:text-teal-400 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>{getTranslation(lang, 'publicReport')}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenEmergency}
                  className="flex items-center gap-2 text-rose-400 hover:text-rose-300 font-semibold transition cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>{getTranslation(lang, 'emergencyHelp')}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate(isAdminLoggedIn ? 'admin' : 'login');
                    scrollToTop();
                  }}
                  className="flex items-center gap-2 hover:text-teal-400 transition cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-teal-400" />
                  <span>{isAdminLoggedIn ? getTranslation(lang, 'tabDashboard') : getTranslation(lang, 'adminLogin')}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Emergency Hotlines & Support */}
          <div className="space-y-3">
            <h4 className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {getTranslation(lang, 'hotlinesTitle')}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className={`p-2.5 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="block font-bold text-teal-400 text-xs">{getTranslation(lang, 'childSupportTitle')}</span>
                  <span className="text-[11px] text-slate-400">{getTranslation(lang, 'childSupportDesc')}</span>
                </div>
                <a
                  href="tel:116111"
                  className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 font-black text-xs hover:bg-teal-500/30 transition flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>116111</span>
                </a>
              </li>

              <li className={`p-2.5 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="block font-bold text-rose-400 text-xs">{getTranslation(lang, 'medicalEmergencyTitle')}</span>
                </div>
                <a
                  href="tel:15"
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-black text-xs hover:bg-rose-500/30 transition flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>15 / 112</span>
                </a>
              </li>

              <li className={`p-2.5 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="block font-bold text-amber-400 text-xs">{getTranslation(lang, 'policeEmergencyTitle')}</span>
                </div>
                <a
                  href="tel:19"
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs hover:bg-amber-500/30 transition flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>19 / 112</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Clean Sub-Footer Bar (No artificial site info or fake versions) */}
        <div className={`mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
          isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'
        }`}>
          {/* Copyright */}
          <div>
            <span>© {new Date().getFullYear()} {getTranslation(lang, 'appName')} - {getTranslation(lang, 'allRightsReserved')}</span>
          </div>

          {/* Quick Language & Theme Controls in Footer */}
          <div className="flex flex-wrap items-center gap-2">
            {onLangChange && (
              <div className={`flex items-center p-0.5 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'
              }`}>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => onLangChange(l.code)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      lang === l.code
                        ? 'bg-teal-500 text-white shadow'
                        : 'text-slate-400 hover:text-teal-300'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}

            {onThemeToggle && (
              <button
                onClick={onThemeToggle}
                className={`p-1.5 rounded-xl border transition cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
                title={isDark ? getTranslation(lang, 'themeLight') : getTranslation(lang, 'themeDark')}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              onClick={scrollToTop}
              className={`p-1.5 rounded-xl border transition cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-teal-400 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-300 text-teal-600 hover:bg-slate-200'
              }`}
              title="Top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Navigation Bar for Mobile (Fully Translated) */}
      <div className={`sm:hidden fixed bottom-0 left-0 right-0 z-40 px-3 py-2 border-t backdrop-blur-lg ${
        isDark
          ? 'bg-[#080d1a]/95 border-slate-800 text-slate-200'
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-2xl'
      }`}>
        <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
          <button
            onClick={() => {
              onNavigate('public');
              scrollToTop();
            }}
            className="flex flex-col items-center justify-center py-1 rounded-xl text-teal-400 hover:bg-teal-500/10 transition cursor-pointer"
          >
            <FileText className="w-4 h-4 mb-0.5" />
            <span className="font-bold">{getTranslation(lang, 'publicReport')}</span>
          </button>

          <button
            onClick={onOpenEmergency}
            className="flex flex-col items-center justify-center py-1 rounded-xl text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 mb-0.5" />
            <span className="font-bold">{getTranslation(lang, 'emergencyHelp')}</span>
          </button>

          <button
            onClick={onThemeToggle}
            className="flex flex-col items-center justify-center py-1 rounded-xl text-amber-400 hover:bg-amber-500/10 transition cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 mb-0.5" /> : <Moon className="w-4 h-4 mb-0.5" />}
            <span className="font-bold">{isDark ? getTranslation(lang, 'themeLight') : getTranslation(lang, 'themeDark')}</span>
          </button>

          <button
            onClick={() => {
              onNavigate(isAdminLoggedIn ? 'admin' : 'login');
              scrollToTop();
            }}
            className="flex flex-col items-center justify-center py-1 rounded-xl text-cyan-400 hover:bg-cyan-500/10 transition cursor-pointer"
          >
            <Lock className="w-4 h-4 mb-0.5" />
            <span className="font-bold">{isAdminLoggedIn ? getTranslation(lang, 'tabDashboard') : getTranslation(lang, 'adminLogin')}</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
