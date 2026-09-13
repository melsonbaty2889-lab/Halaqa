import React from 'react';
import { useTranslation } from 'react-i18next';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import { C } from '@/theme/colors';

export default function AppBrand({ className = "", subtitle }) {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* غلاف اللوجو مع التوهج الزمردي الموحد مع الشاشة الافتتاحية */}
      <div className="relative mb-3 flex items-center justify-center">
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-60 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${C?.emerald?.DEFAULT || '#10B981'} 0%, transparent 70%)`
          }}
        />
        <div className="relative z-10 animate-pulse drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <SmartHalaqaProLogo size={64} />
        </div>
      </div>

      {/* اسم التطبيق الموحد الهوية */}
      <h2 
        className="text-xl sm:text-2xl font-black tracking-tight mb-1"
        style={{ color: C?.amber?.DEFAULT || '#E07A00' }}
      >
        {t('common.appName', 'الحلقة الذكية')}
      </h2>

      {/* العنوان الفرعي المترجم */}
      {subtitle && (
        <p 
          className="text-xs font-medium tracking-wide m-0"
          style={{ color: C?.text?.muted || '#94A3B8' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
