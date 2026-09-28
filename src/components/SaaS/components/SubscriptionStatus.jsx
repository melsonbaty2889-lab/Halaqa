import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { UI } from '@/theme/styles';

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
      className={`${UI.card} border-amber-500/40 bg-amber-500/10 shadow-lg shadow-amber-500/10 rounded-2xl p-5 mb-8 text-center backdrop-blur-sm transition-all`}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <Clock 
          size={20} 
          className="text-amber-500 animate-pulse shrink-0" 
        />
        <h3 className="font-extrabold text-base m-0 text-amber-500">
          {getText(
            t, 
            'subscription.status.pendingTitle', 
            'طلب الاشتراك قيد المراجعة والتحقق'
          )}
        </h3>
      </div>

      <p className={`${UI.subtitle} text-xs leading-relaxed m-0 max-w-xl mx-auto`}>
        {getText(
          t, 
          'subscription.status.pendingDesc', 
          'تم استلام إيصال التحويل الخاص بك بنجاح، ويقوم فريق الإدارة بمراجعته الآن. سيتم تفعيل ترخيص المنظومة فور الاعتماد.'
        )}
      </p>
    </div>
  );
}
