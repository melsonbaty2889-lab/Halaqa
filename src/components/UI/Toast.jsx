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

  const styles = {
    success: 'bg-emerald-950/90 border-emerald-500 text-emerald-200',
    error: 'bg-red-950/90 border-red-500 text-red-200',
    warning: 'bg-amber-950/90 border-amber-500 text-amber-200',
    info: 'bg-slate-900/90 border-amber-500/50 text-slate-200',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-amber-400 shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-[99999] min-w-[300px] max-w-[90vw] p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300">
      <div className={`flex items-center justify-between gap-3 text-sm font-medium ${styles[type] || styles.info}`}>
        <div className="flex items-center gap-2">
          {icons[type] || icons.info}
          <span>{message}</span>
        </div>
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-white transition-colors p-1"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
