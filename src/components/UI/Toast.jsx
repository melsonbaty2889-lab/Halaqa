import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ isOpen, message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  // أنماط الألوان متكاملة للخلفية والحدود والنصوص
  const typeStyles = {
    success: 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200',
    error: 'bg-red-950/95 border-red-500/50 text-red-200',
    warning: 'bg-amber-950/95 border-amber-500/50 text-amber-200',
    info: 'bg-slate-900/95 border-amber-500/40 text-slate-200',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-amber-400 shrink-0" />,
  };

  const currentStyle = typeStyles[type] || typeStyles.info;
  const currentIcon = icons[type] || icons.info;

  return (
    <div 
      dir="auto"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] w-[90%] max-w-md p-3.5 sm:p-4 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${currentStyle}`}
    >
      <div className="flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2.5 min-w-0">
          {currentIcon}
          <span className="leading-snug break-words truncate">{message}</span>
        </div>

        <button 
          type="button"
          onClick={onClose} 
          className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
