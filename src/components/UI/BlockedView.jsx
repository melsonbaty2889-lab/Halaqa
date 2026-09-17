import React from 'react';
import { AlertOctagon, MessageCircle, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// 🛡️ دالة آمنة لمعالجة الكائنات المترجمة ومنع الخطأ #31
const getSafeText = (val, currentLang = 'ar', defaultVal = '') => {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (val[currentLang]) return String(val[currentLang]);
    if (val.ar) return String(val.ar);
    if (val.en) return String(val.en);
    const firstVal = Object.values(val)[0];
    if (firstVal && typeof firstVal !== 'object') return String(firstVal);
    return defaultVal;
  }
  return String(val);
};

export default function BlockedView({ academy, onLogout }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const cleanLang = currentLang.toLowerCase().split('-')[0];
  
  const isRtl = i18n?.dir 
    ? i18n.dir() === 'rtl' 
    : ['ar', 'ur'].includes(cleanLang);

  const academyName = getSafeText(
    academy?.name, 
    cleanLang, 
    t('blockedView.defaultAcademyName')
  );

  const blockReason = getSafeText(
    academy?.blocked_reason, 
    cleanLang, 
    t('blockedView.defaultReason')
  );

  const handleSupportContact = () => {
    const supportPhone = "201552518406";
    const msgText = t('blockedView.whatsappMsg', { name: academyName });
    const msg = encodeURIComponent(msgText);
    window.open(`https://wa.me/${supportPhone}?text=${msg}`, '_blank');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-dark-bg text-appText-main transition-colors select-none"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-md w-full bg-dark-card border border-appError/30 rounded-2xl p-6 text-center shadow-main space-y-5 backdrop-blur-md">
        
        {/* أيقونة التنبيه */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-appError/10 border border-appError/20 text-appError">
          <AlertOctagon size={36} />
        </div>

        {/* العناوين */}
        <div>
          <h2 className="text-xl font-bold mb-1 text-appText-main">
            {t('blockedView.title')}
          </h2>
          <p className="text-sm font-semibold text-appError">
            {academyName}
          </p>
        </div>

        {/* سبب الحظر */}
        <div className="border border-appBorder-input bg-dark-input p-4 rounded-xl text-xs leading-relaxed text-start text-appText-sub">
          {blockReason}
        </div>

        {/* الأزرار والإجراءات */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleSupportContact}
            aria-label={t('blockedView.contactSupport')}
            className="w-full rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition-all min-h-[44px] bg-brandEmerald text-dark-bg hover:opacity-90 active:scale-[0.99]"
          >
            <MessageCircle size={18} />
            <span>{t('blockedView.contactSupport')}</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              aria-label={t('blockedView.logout')}
              className="w-full border border-appBorder-input bg-dark-input hover:bg-dark-card text-appText-main rounded-xl font-semibold text-xs cursor-pointer flex items-center justify-center gap-2 transition-all min-h-[44px] active:scale-[0.99]"
            >
              <LogOut size={16} />
              <span>{t('blockedView.logout')}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
