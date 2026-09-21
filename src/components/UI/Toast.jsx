import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ 
  isOpen, 
  message, 
  type = 'info', 
  onClose = () => {}, 
  duration = 4000 
}) {
  useEffect(() => {
    if (isOpen && duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      style: 'bg-semantic-success/15 border-semantic-success/40 text-semantic-success',
      iconColor: 'text-semantic-success'
    },
    error: {
      icon: AlertCircle,
      style: 'bg-semantic-error/15 border-semantic-error/40 text-semantic-error',
      iconColor: 'text-semantic-error'
    },
    warning: {
      icon: AlertTriangle,
      style: 'bg-semantic-warning/15 border-semantic-warning/40 text-semantic-warning',
      iconColor: 'text-semantic-error'
    },
    info: {
      icon: Info,
      style: 'bg-semantic-surfaceInput border-semantic-borderInput text-semantic-textPrimary',
      iconColor: 'text-semantic-actionPrimary'
    }
  }[type] || {
    icon: Info,
    style: 'bg-semantic-surfaceInput border-semantic-borderInput text-semantic-textPrimary',
    iconColor: 'text-semantic-actionPrimary'
  };

  const IconComponent = config.icon;

  return (
    <div 
      role="status" 
      aria-live="polite" 
      className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border backdrop-blur-md shadow-lg ${config.style}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <IconComponent size={20} className={`shrink-0 ${config.iconColor}`} />
          <p className="text-xs font-semibold leading-relaxed break-words">
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
          aria-label="إغلاق"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
