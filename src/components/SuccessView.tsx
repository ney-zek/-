import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ShieldCheck, HeartHandshake, RefreshCw, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, getTranslation } from '../lib/i18n';

interface SuccessViewProps {
  reportId: string;
  onReset: () => void;
  lang?: Language;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ reportId, onReset, lang = 'ar' }) => {
  useEffect(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#14b8a6', '#2dd4bf', '#38bdf8', '#5eead4', '#ffffff'],
      disableForReducedMotion: true,
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto my-6 p-6 sm:p-8 bg-[#0c162e] border border-teal-500/30 rounded-3xl shadow-2xl shadow-teal-950/50 text-center relative overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Animated glowing checkmark badge */}
      <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 bg-teal-500/20 rounded-full animate-ping opacity-60" />
        <div className="relative w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/30 text-white">
          <CheckCircle2 className="w-11 h-11 stroke-[2.5]" />
        </div>
      </div>

      {/* Core Success Message */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
        {getTranslation(lang, 'successTitle')}
      </h2>
      <p className="text-teal-200 text-sm sm:text-base font-medium leading-relaxed mb-6">
        {getTranslation(lang, 'successSubtitle')}
      </p>

      {/* Anonymized Reference Tag */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/90 rounded-xl border border-slate-700/80 mb-6">
        <span className="text-xs text-slate-400">{getTranslation(lang, 'encryptedRef')}</span>
        <code className="text-sm font-mono font-bold text-teal-300 tracking-wider">
          {reportId}
        </code>
      </div>

      {/* Privacy & Reassurance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right mb-6">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0 mt-0.5">
            <EyeOff className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white mb-0.5">{getTranslation(lang, 'fullPrivacyTitle')}</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              {getTranslation(lang, 'fullPrivacyDesc')}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white mb-0.5">{getTranslation(lang, 'educationalFollowUpTitle')}</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              {getTranslation(lang, 'educationalFollowUpDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Advice / Care message */}
      <div className="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-500/20 text-right flex items-start gap-3 mb-6">
        <HeartHandshake className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <p className="text-xs text-teal-200/90 leading-relaxed">
          {getTranslation(lang, 'encouragementText')}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition shadow-lg shadow-teal-600/30 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{getTranslation(lang, 'submitAnotherBtn')}</span>
        </button>
      </div>
    </motion.div>
  );
};
