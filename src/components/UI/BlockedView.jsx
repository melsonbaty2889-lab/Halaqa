import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertOctagon, LogOut, MessageCircle } from 'lucide-react';

export default function BlockedView({ academy, onLogout, isDemo = false }) {
  const { t, i18n } = useTranslation();
  
  // تحديد اللغة الحالية المسجلة بالنظام
  const currentLang = i18n.language || 'ar';

  // استخراج اسم الأكاديمية حسب اللغة الفعالة
  const academyName = typeof academy?.name === 'object' 
    ? (academy.name[currentLang] || academy.name['ar'] || academy.name['en'])
    : (academy?.name || t('blockedView.defaultAcademyName'));

  // رابط الواتساب بالرسالة المترجمة تلقائياً
  const rawWhatsappMsg = t('blockedView.whatsappMsg', { name: academyName });
  const whatsappUrl = `https://wa.me/201068220037?text=${encodeURIComponent(rawWhatsappMsg)}`;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 dir-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl space-y-6">
        
        {/* أيقونة الحظر */}
        <div className="mx-auto w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
          <AlertOctagon className="w-8 h-8 text-red-500" />
        </div>

        {/* العناوين واسم الأكاديمية */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">
            {t('blockedView.title')}
          </h1>
          <p className="text-sm font-medium text-red-400">
            {academyName}
          </p>
        </div>

        {/* وصف الحظر */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 text-xs leading-relaxed text-slate-400">
          {t('blockedView.description')}
        </div>

        {/* الأزرار */}
        <div className="space-y-3 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t('blockedView.contactSupport')}</span>
          </a>

          <button
            onClick={onLogout}
            className="w-full py-3 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium text-sm rounded-xl border border-slate-700/50 flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('blockedView.logout')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
