import React from 'react';
import { ShieldLogo } from './ShieldLogo';
import { Lock, PhoneCall, LayoutDashboard, Send, Sun, Moon } from 'lucide-react';
import { Language, Theme, getTranslation } from '../lib/i18n';

interface NavbarProps {
  currentView: 'public' | 'login' | 'admin';
  onNavigate: (view: 'public' | 'login' | 'admin') => void;
  isAdminLoggedIn: boolean;
  onOpenEmergencyModal: () => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  theme: Theme;
  onThemeToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isAdminLoggedIn,
  onOpenEmergencyModal,
  lang,
  onLangChange,
  theme,
  onThemeToggle,
}) => {
  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-md ${theme === 'dark' ? 'bg-[#091124]/85 border-b border-teal-900/30 text-white' : 'bg-white/90 border-b border-slate-200 text-slate-900 shadow-sm'}`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <button
          onClick={() => onNavigate('public')}
          className="flex items-center gap-2.5 sm:gap-3 group text-right transition-transform hover:scale-[1.01] shrink-0"
        >
          <ShieldLogo size="md" />
          <div className="flex flex-col text-right">
            <span className="text-xl sm:text-2xl font-black tracking-tight">
              {getTranslation(lang, 'appName')}
            </span>
            <span className={`hidden sm:block text-[11px] font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {getTranslation(lang, 'tagline')}
            </span>
          </div>
        </button>

        {/* Controls & Language & Theme */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Language Selector */}
          <div className="relative flex items-center">
            <select
              value={lang}
              onChange={(e) => onLangChange(e.target.value as Language)}
              className={`text-xs font-bold rounded-xl px-2 sm:px-2.5 py-1.5 sm:py-2 border outline-none cursor-pointer transition ${
                theme === 'dark'
                  ? 'bg-slate-900 text-teal-300 border-slate-700 hover:border-teal-500'
                  : 'bg-slate-100 text-teal-700 border-slate-300 hover:border-teal-500'
              }`}
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="zgh">ⵜⴰⵎⴰⵣⵉⵖⵜ</option>
            </select>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onThemeToggle}
            className={`p-1.5 sm:p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title={theme === 'dark' ? getTranslation(lang, 'themeLight') : getTranslation(lang, 'themeDark')}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Quick Help Line Button */}
          <button
            onClick={onOpenEmergencyModal}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-emerald-300 bg-emerald-950/40 border border-emerald-500/25 hover:bg-emerald-900/40 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>{getTranslation(lang, 'emergencyHelp')}</span>
          </button>

          {/* Navigation link based on auth / view */}
          {currentView !== 'public' && (
            <button
              onClick={() => onNavigate('public')}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
            >
              <Send className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-teal-400" />
              <span>{getTranslation(lang, 'publicReport')}</span>
            </button>
          )}

          {isAdminLoggedIn ? (
            <button
              onClick={() => onNavigate('admin')}
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
                currentView === 'admin'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20'
                  : 'bg-teal-500/10 text-teal-300 border border-teal-500/30 hover:bg-teal-500/20'
              }`}
            >
              <LayoutDashboard className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span>{getTranslation(lang, 'tabDashboard')}</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate(currentView === 'login' ? 'public' : 'login')}
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition ${
                currentView === 'login'
                  ? 'bg-slate-800 text-teal-300 border border-teal-500/30'
                  : 'text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Lock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-teal-400" />
              <span>{currentView === 'login' ? getTranslation(lang, 'backToHome') : getTranslation(lang, 'adminLogin')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
