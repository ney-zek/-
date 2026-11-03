import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PublicReportForm } from './components/PublicReportForm';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { EmergencyModal } from './components/EmergencyModal';
import { Footer } from './components/Footer';
import { Esp32PiSimulation } from './components/Esp32PiSimulation';
import { AdminUser } from './types';
import { Language, Theme } from './lib/i18n';

export default function App() {
  const [currentView, setCurrentView] = useState<'public' | 'login' | 'admin'>('public');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState<boolean>(false);
  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('dark');

  // Load saved session, language, and theme on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('sitr_admin_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.email && parsed.name) {
          setAdminUser(parsed);
        }
      }

      const savedLang = localStorage.getItem('sitr_lang') as Language;
      if (savedLang && ['ar', 'en', 'fr', 'zgh'].includes(savedLang)) {
        setLang(savedLang);
      }

      const savedTheme = localStorage.getItem('sitr_theme') as Theme;
      if (savedTheme && ['dark', 'light'].includes(savedTheme)) {
        setTheme(savedTheme);
      }
    } catch (e) {
      console.warn('Error reading stored preferences:', e);
    }
  }, []);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('sitr_lang', newLang);
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('sitr_theme', nextTheme);
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    localStorage.setItem('sitr_admin_session', JSON.stringify(user));
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('sitr_admin_session');
    setCurrentView('public');
  };

  const handleNavigate = (view: 'public' | 'login' | 'admin') => {
    if (view === 'admin' && !adminUser) {
      setCurrentView('login');
    } else {
      setCurrentView(view);
    }
  };

  const isRtl = lang === 'ar' || lang === 'zgh';
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-[#080d1a] text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Navbar is displayed on public & login views */}
      {currentView !== 'admin' && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          isAdminLoggedIn={!!adminUser}
          onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
          lang={lang}
          onLangChange={handleLangChange}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          onOpenSimulation={() => setIsSimulationOpen(true)}
        />
      )}

      {/* Main View Router */}
      <main className={`w-full overflow-x-hidden ${currentView !== 'admin' ? 'pb-20 sm:pb-8' : ''}`}>
        {currentView === 'public' && (
          <PublicReportForm
            onNavigateToLogin={() => setCurrentView('login')}
            lang={lang}
            theme={theme}
            onOpenSimulation={() => setIsSimulationOpen(true)}
          />
        )}

        {currentView === 'login' && (
          <AdminLogin
            onLoginSuccess={handleLoginSuccess}
            onBackToHome={() => setCurrentView('public')}
            lang={lang}
          />
        )}

        {currentView === 'admin' && adminUser && (
          <AdminDashboard
            user={adminUser}
            onLogout={handleLogout}
            onNavigateToPublic={() => setCurrentView('public')}
            lang={lang}
            onLangChange={handleLangChange}
            theme={theme}
            onThemeToggle={handleThemeToggle}
            onOpenSimulation={() => setIsSimulationOpen(true)}
          />
        )}
      </main>

      {/* Footer with professional bottom menus */}
      {currentView !== 'admin' && (
        <Footer
          lang={lang}
          theme={theme}
          onNavigate={handleNavigate}
          onOpenEmergency={() => setIsEmergencyModalOpen(true)}
          onLangChange={handleLangChange}
          onThemeToggle={handleThemeToggle}
          isAdminLoggedIn={!!adminUser}
        />
      )}

      {/* Quick Emergency Assistance Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        lang={lang}
      />

      {/* 3D Hardware Simulation Modal: ESP32 ➔ Raspberry Pi */}
      {isSimulationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-5xl h-[92vh] max-h-[860px]">
            <Esp32PiSimulation onClose={() => setIsSimulationOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
