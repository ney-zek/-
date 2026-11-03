import React, { useState } from 'react';
import { ShieldLogo } from './ShieldLogo';
import {
  Lock,
  PhoneCall,
  LayoutDashboard,
  Send,
  Sun,
  Moon,
  Cpu,
  Menu,
  X,
  ShieldCheck,
  Globe,
  HelpCircle,
} from 'lucide-react';
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
  onOpenSimulation?: () => void;
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
  onOpenSimulation,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-md ${theme === 'dark' ? 'bg-[#091124]/90 border-b border-teal-900/30 text-white' : 'bg-white/95 border-b border-slate-200 text-slate-900 shadow-sm'}`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <button
          onClick={() => {
            onNavigate('public');
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 sm:gap-3 group text-right transition-transform hover:scale-[1.01] shrink-0 cursor-pointer"
        >
          <ShieldLogo size="md" />
          <div className="flex flex-col text-right">
            <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-l from-teal-300 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              {getTranslation(lang, 'appName')}
            </span>
            <span className={`hidden sm:block text-[11px] font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {getTranslation(lang, 'tagline')}
            </span>
          </div>
        </button>

        {/* Desktop Controls & Professional Navigation */}
        <div className="hidden lg:flex items-center gap-2.5">
          {/* Language Selector */}
          <div className="relative flex items-center">
            <select
              value={lang}
              onChange={(e) => onLangChange(e.target.value as Language)}
              className={`text-xs font-bold rounded-xl px-2.5 py-2 border outline-none cursor-pointer transition ${
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
            className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title={theme === 'dark' ? getTranslation(lang, 'themeLight') : getTranslation(lang, 'themeDark')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* 3D Simulation Button */}
          {onOpenSimulation && (
            <button
              onClick={onOpenSimulation}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold rounded-xl text-teal-300 bg-teal-950/70 border border-teal-500/50 hover:bg-teal-900/70 shadow-sm transition cursor-pointer"
              title="محاكاة معمارية النظام: ESP32 ➔ Raspberry Pi"
            >
              <Cpu className="w-4 h-4 text-teal-400 animate-pulse" />
              <span>محاكاة 3D (ESP32 ➔ Pi)</span>
            </button>
          )}

          {/* Emergency Line */}
          <button
            onClick={onOpenEmergencyModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-emerald-300 bg-emerald-950/40 border border-emerald-500/25 hover:bg-emerald-900/40 transition cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>{getTranslation(lang, 'emergencyHelp')}</span>
          </button>

          {/* Public Report Button */}
          {currentView !== 'public' && (
            <button
              onClick={() => onNavigate('public')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-teal-400" />
              <span>{getTranslation(lang, 'publicReport')}</span>
            </button>
          )}

          {/* Admin Login / Dashboard */}
          {isAdminLoggedIn ? (
            <button
              onClick={() => onNavigate('admin')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20'
                  : 'bg-teal-500/10 text-teal-300 border border-teal-500/30 hover:bg-teal-500/20'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{getTranslation(lang, 'tabDashboard')}</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate(currentView === 'login' ? 'public' : 'login')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl transition cursor-pointer ${
                currentView === 'login'
                  ? 'bg-slate-800 text-teal-300 border border-teal-500/30'
                  : 'text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>{currentView === 'login' ? getTranslation(lang, 'backToHome') : getTranslation(lang, 'adminLogin')}</span>
            </button>
          )}
        </div>

        {/* Mobile & Tablet Hamburger Menu Button (3 Lines - الثلاث خطوط الاحترافية) */}
        <div className="flex items-center gap-2 lg:hidden">
          {onOpenSimulation && (
            <button
              onClick={onOpenSimulation}
              className="p-2 rounded-xl text-teal-300 bg-teal-950/70 border border-teal-500/50 shadow-sm transition"
              title="محاكاة 3D"
            >
              <Cpu className="w-4 h-4 text-teal-400 animate-pulse" />
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center justify-center ${
              isMobileMenuOpen
                ? 'bg-teal-600 text-white border-teal-500 shadow-md shadow-teal-500/20'
                : 'bg-slate-900 text-teal-300 border-slate-700 hover:border-teal-500'
            }`}
            title="القائمة الاحترافية (3 خطوط)"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              /* THE 3 LINES ICON (الثلاث خطوط الاحترافية) */
              <div className="w-5 h-5 flex flex-col justify-between items-center py-0.5">
                <span className="w-full h-0.5 bg-teal-400 rounded-full transition-all" />
                <span className="w-full h-0.5 bg-teal-400 rounded-full transition-all" />
                <span className="w-full h-0.5 bg-teal-400 rounded-full transition-all" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Professional Mobile Dropdown Menu (Opened via the 3 lines button) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full inset-x-0 bg-[#080d1a]/98 border-b border-teal-900/40 p-4 space-y-3 backdrop-blur-xl animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400">قائمة منصة SchoolShield</span>
            <div className="flex items-center gap-2">
              <select
                value={lang}
                onChange={(e) => onLangChange(e.target.value as Language)}
                className="bg-slate-900 text-xs text-teal-300 font-bold border border-slate-700 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="zgh">ⵜⴰⵎⴰⵣⵉⵖⵜ</option>
              </select>

              <button
                onClick={onThemeToggle}
                className="p-2 rounded-xl bg-slate-900 text-amber-400 border border-slate-700 transition"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <nav className="space-y-2">
            {currentView !== 'public' && (
              <button
                onClick={() => {
                  onNavigate('public');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-bold transition border border-slate-800 cursor-pointer"
              >
                <Send className="w-4 h-4 text-teal-400" />
                <span>{getTranslation(lang, 'publicReport')}</span>
              </button>
            )}

            {onOpenSimulation && (
              <button
                onClick={() => {
                  onOpenSimulation();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 text-xs font-bold transition border border-teal-500/40 cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-teal-400" />
                <span>محاكاة الحساس 3D (ESP32 ➔ Pi)</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenEmergencyModal();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 text-xs font-bold transition border border-emerald-500/30 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>{getTranslation(lang, 'emergencyHelp')}</span>
            </button>

            {isAdminLoggedIn ? (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{getTranslation(lang, 'tabDashboard')}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate(currentView === 'login' ? 'public' : 'login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition border border-slate-800 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-teal-400" />
                <span>{currentView === 'login' ? getTranslation(lang, 'backToHome') : getTranslation(lang, 'adminLogin')}</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
