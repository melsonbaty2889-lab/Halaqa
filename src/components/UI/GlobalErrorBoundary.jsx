import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// مكون العرض الفرعي للاستفادة من الـ Hooks بشكل صحيح
function ErrorBoundaryView({ error, onReload }) {
  const { t } = useTranslation();
  const errorMessage = error?.toString() || t('errorBoundary.defaultMessage', 'حدث خطأ غير متوقع في النظام');

  return (
    <div className="min-h-screen bg-[#070B11] flex items-center justify-center p-4 sm:p-6 font-['Cairo',sans-serif] text-white" dir="auto">
      <div className="w-full max-w-[520px] bg-[#0F172A]/85 border border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* توهج خلفية الأخطاء */}
        <div className="absolute -top-[60px] left-1/2 -translate-x-1/2 w-[180px] h-[180px] bg-red-500/20 blur-[90px] pointer-events-none" />
        
        {/* أيقونة التنبيه */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AlertTriangle size={32} />
        </div>

        {/* العناوين */}
        <h2 className="text-lg sm:text-xl font-bold mb-2 text-white">
          {t('errorBoundary.title', 'عذراً، حدث خطأ تقني غير متوقع')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
          {t('errorBoundary.description', 'واجه النظام مشكلة أثناء تحميل هذه الصفحة. حاول تفريغ الذاكرة المؤقتة وإعادة التحديث.')}
        </p>

        {/* صندوق تفاصيل الخطأ البرمجي */}
        <div className="bg-[#0A0F1C] border border-white/10 rounded-xl p-3.5 text-start mb-6">
          <div className="text-[11px] text-slate-400 mb-1.5 flex justify-between items-center dir-ltr">
            <span className="font-mono text-red-400/80">CRASH_REPORT</span>
            <span className="font-sans text-slate-400">:تفاصيل الخطأ</span>
          </div>
          <p className="text-xs text-red-300 m-0 whitespace-pre-wrap break-words max-h-[100px] overflow-y-auto font-mono dir-ltr select-text">
            {errorMessage}
          </p>
        </div>

        {/* زر إعادة التحميل */}
        <button
          onClick={onReload}
          aria-label={t('errorBoundary.reloadBtn', 'إعادة تحميل الصفحة')}
          className="w-full py-3 px-5 min-h-[44px] bg-gradient-to-b from-[#E67E00] to-[#D97706] text-white rounded-xl font-bold text-sm cursor-pointer flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg active:shadow-none"
        >
          <RefreshCw size={18} />
          <span>{t('errorBoundary.reloadBtn', 'إعادة تحميل الصفحة')}</span>
        </button>
      </div>
    </div>
  );
}

export default class GlobalErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) { 
    return { hasError: true, error }; 
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 Global App Crash:", error, errorInfo);
  }

  handleReload = () => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (let name of names) caches.delete(name);
      });
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryView 
          error={this.state.error} 
          onReload={this.handleReload} 
        />
      );
    }
    return this.props.children;
  }
}
