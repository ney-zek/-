import React, { useState } from 'react';
import { ShieldLogo } from './ShieldLogo';
import { AdminUser } from '../types';
import { Lock, Eye, EyeOff, LogIn, ArrowRight, AlertCircle, User } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, getTranslation } from '../lib/i18n';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToHome: () => void;
  lang?: Language;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToHome,
  lang = 'ar',
}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const inputEmail = email.trim();
    const inputPassword = password.trim();

    if (!inputEmail || !inputPassword) {
      setErrorMessage(getTranslation(lang, 'loginErrorMissing'));
      return;
    }

    setIsLoading(true);

    try {
      const normalizedCred = inputEmail.toLowerCase();

      // Check Private Administrator Credentials (Toriss College)
      const isTorissAdmin = (
        normalizedCred === 'toriss' ||
        normalizedCred === 'info@toriss@college.com' ||
        normalizedCred === 'info@torisscollege.com' ||
        normalizedCred === 'info.toriss@college.com' ||
        normalizedCred === 'toriss@college.com' ||
        normalizedCred === 'info@toriss.college.com' ||
        normalizedCred === 'info@toriss.college'
      ) && (
        inputPassword === 'Torisscollege@2013@' ||
        password === 'Torisscollege@2013@' ||
        inputPassword === 'Torisscollege@2013'
      );

      if (isTorissAdmin) {
        const torissAdminUser: AdminUser = {
          id: 'admin-toriss-college',
          email: 'Toriss',
          name: 'إدارة كلية طوريس (Toriss College)',
          role: 'admin',
        };
        localStorage.setItem('sitr_admin_session', JSON.stringify(torissAdminUser));
        onLoginSuccess(torissAdminUser);
        setIsLoading(false);
        return;
      }

      // Check standard counselor credentials
      if (
        (normalizedCred === 'counselor@sitr.school' && inputPassword === 'sitr2026') ||
        (normalizedCred === 'admin@sitr.school' && inputPassword === 'sitr2026')
      ) {
        const counselorUser: AdminUser = {
          id: 'admin-001',
          email: inputEmail,
          name: 'أ. نادية المنصوري (المرشد الطلابي)',
          role: 'school_counselor',
        };
        localStorage.setItem('sitr_admin_session', JSON.stringify(counselorUser));
        onLoginSuccess(counselorUser);
        setIsLoading(false);
        return;
      }

      setErrorMessage(getTranslation(lang, 'loginErrorInvalid'));
    } catch (err: any) {
      setErrorMessage(err.message || getTranslation(lang, 'loginErrorInvalid'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#0b142c] border border-teal-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-right"
      >
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-400" />

        {/* Back Link */}
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 mb-6 transition cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>{getTranslation(lang, 'backToHome')}</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <ShieldLogo size="lg" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
            {getTranslation(lang, 'loginTitle')}
          </h2>
          <p className="text-xs text-slate-400">
            {getTranslation(lang, 'loginSubtitle')}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {getTranslation(lang, 'usernameLabel')}
            </label>
            <div className="relative">
              <input
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Toriss"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 text-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
                dir="ltr"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {getTranslation(lang, 'passwordLabel')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 text-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{getTranslation(lang, 'loginBtn')}</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
