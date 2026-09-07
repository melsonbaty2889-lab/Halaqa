import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { C } from '@/theme/colors';

// Helper آمن للترجمة الموحدة لمنع ظهور Key جاف
const getText = (t, key, fallback) => {
  const translated = t(key);
  return translated && translated !== key ? translated : fallback;
};

export default function SubscriptionStatus({ status }) {
  const { t } = useTranslation();

  if (status !== 'pending_verification') return null;

  return (
    <div 
      role="status"
      aria-live="polite"
      style={{
        backgroundColor: C.dark?.card || 'rgba(15, 23, 42, 0.85)',
        borderColor: C.amber?.borderFocus || '#D97706',
        boxShadow: `0 8px 24px ${C.amber?.glowFocus || 'rgba(217, 119, 6, 0.2)'}`
      }}
      className="border rounded-2xl p-5 mb-8 text-center backdrop-blur-sm transition-all"
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <Clock 
          size={20} 
          style={{ color: C.amber?.DEFAULT || '#D97706' }} 
          className="animate-pulse shrink-0" 
        />
        <h3 
          style={{ color: C.text?.subtitle || '#D97706' }} 
          className="font-extrabold text-base m-0"
        >
          {getText(
            t, 
            'subscription.status.pendingTitle', 
            'طلب الاشتراك قيد المراجعة والتحقق'
          )}
        </h3>
      </div>

      <p 
        style={{ color: C.text?.body || '#E2E8F0' }} 
        className="text-xs leading-relaxed m-0 max-w-xl mx-auto"
      >
        {getText(
          t, 
          'subscription.status.pendingDesc', 
          'تم استلام إيصال التحويل الخاص بك بنجاح، ويقوم فريق الإدارة بمراجعته الآن. سيتم تفعيل ترخيص المنظومة فور الاعتماد.'
        )}
      </p>
    </div>
  );
}
