import React from 'react';
import { PhoneCall, Heart, X } from 'lucide-react';
import { Language, getTranslation } from '../lib/i18n';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, lang = 'ar' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#0c162e] border border-teal-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative text-right text-white">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/80 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-teal-500/15 text-teal-400">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {getTranslation(lang, 'emergencyModalTitle')}
            </h3>
            <p className="text-xs text-teal-300">
              {getTranslation(lang, 'emergencyModalSubtitle')}
            </p>
          </div>
        </div>

        <div className="space-y-3 my-4">
          {/* Hotline 1 */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between">
            <div className="text-right">
              <span className="text-xs text-teal-400 font-semibold block">
                {getTranslation(lang, 'childSupportTitle')}
              </span>
              <h4 className="text-lg sm:text-xl font-black text-white tracking-widest mt-0.5">
                116111 / 1919
              </h4>
              <p className="text-[11px] text-slate-400">
                {getTranslation(lang, 'childSupportDesc')}
              </p>
            </div>
            <a
              href="tel:116111"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{getTranslation(lang, 'directCall')}</span>
            </a>
          </div>

          {/* Hotline 2 */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between">
            <div className="text-right">
              <span className="text-xs text-rose-400 font-semibold block">
                {getTranslation(lang, 'medicalEmergencyTitle')}
              </span>
              <h4 className="text-lg sm:text-xl font-black text-white tracking-widest mt-0.5">
                15 / 112
              </h4>
            </div>
            <a
              href="tel:15"
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{getTranslation(lang, 'directCall')}</span>
            </a>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/20 text-xs text-teal-200/90 leading-relaxed mb-4">
          <p>
            {getTranslation(lang, 'urgentAdvice')}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
        >
          {getTranslation(lang, 'closeModal')}
        </button>
      </div>
    </div>
  );
};
