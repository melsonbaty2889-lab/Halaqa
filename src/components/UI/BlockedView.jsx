import React from 'react';
import { AlertOctagon, MessageCircle, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import C from '@/theme/colors';

// 🛡️ دالة آمنة لمعالجة الكائنات المترجمة { ar: "..." } ومنع الخطأ #31
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
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : ['ar', 'ur'].includes(cleanLang);

  const academyName = getSafeText(
    academy?.name, 
    cleanLang, 
    t('blockedView.defaultAcademyName', 'الأكاديمية')
  );

  const blockReason = getSafeText(
    academy?.blocked_reason, 
    cleanLang, 
    t('blockedView.defaultReason', 'تم تعليق حساب الأكاديمية مؤقتاً من قبل إدارة المنصة بسبب انتهاء الاشتراك أو مراجعة الحساب.')
  );

  const handleSupportContact = () => {
    const supportPhone = "201552518406";
    const msgText = t(
      'blockedView.whatsappMsg', 
      'السلام عليكم، أنا مالك أكاديمية ({{name}})، تم تعليق الحساب وأود الاستفسار والتفعيل.', 
      { name: academyName }
    );
    const msg = encodeURIComponent(msgText);
    window.open(`https://wa.me/${supportPhone}?text=${msg}`, '_blank');
  };

  // استخراج الأنماط البصرية من كائن الألوان C
  const mainBg = C.dark?.bg || '#0F172A';
  const cardBg = C.dark?.surface || '#1E293B';
  const titleColor = C.text?.title || '#F8FAFC';
  const textColor = C.text?.body || C.text?.sub || '#CBD5E1';
  const borderCol = C.dark?.borderInput || C.inputs?.border || '#334155';
  
  const errorColor = C.error?.DEFAULT || '#EF4444';
  const emeraldColor = C.emerald?.DEFAULT || C.success?.DEFAULT || '#10B981';

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 transition-colors"
      style={{ backgroundColor: mainBg }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div 
        className="max-w-md w-full border rounded-2xl p-6 text-center shadow-2xl space-y-5"
        style={{ 
          backgroundColor: cardBg,
          borderColor: `${errorColor}40`
        }}
      >
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ 
            backgroundColor: `${errorColor}1A`,
            borderColor: `${errorColor}33`,
            borderWidth: '1px',
            borderStyle: 'solid',
            color: errorColor
          }}
        >
          <AlertOctagon size={36} />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: titleColor }}>
            {t('blockedView.title', 'تم تعليق حساب الأكاديمية')}
          </h2>
          <p className="text-sm font-semibold" style={{ color: errorColor }}>
            {academyName}
          </p>
        </div>

        <div 
          className="border p-4 rounded-xl text-xs leading-relaxed text-start"
          style={{ 
            backgroundColor: mainBg,
            borderColor: borderCol,
            color: textColor
          }}
        >
          {blockReason}
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleSupportContact}
            aria-label={t('blockedView.contactSupport', 'التواصل مع الإدارة عبر الواتساب')}
            className="w-full border-0 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition-all min-h-[44px]"
            style={{ 
              backgroundColor: emeraldColor,
              color: mainBg
            }}
          >
            <MessageCircle size={18} />
            <span>{t('blockedView.contactSupport', 'التواصل مع الإدارة عبر الواتساب')}</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              aria-label={t('blockedView.logout', 'تسجيل الخروج')}
              className="w-full border-0 rounded-xl font-semibold text-xs cursor-pointer flex items-center justify-center gap-2 transition-all min-h-[44px]"
              style={{ 
                backgroundColor: borderCol,
                color: titleColor
              }}
            >
              <LogOut size={16} />
              <span>{t('blockedView.logout', 'تسجيل الخروج')}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
