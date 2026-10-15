/* src/components/UI/PageLayout.jsx */

import React from 'react';
import { UI } from '@/theme/styles';

export default function PageLayout({
  title,
  description,
  icon: Icon,
  actionButton,
  statsGrid,
  filterBar,
  children,
  loading,
  isRtl,
  t
}) {
  return (
    <div className={`px-3 sm:px-5 lg:px-6 space-y-4 sm:space-y-5 ${isRtl ? 'text-right' : 'text-left'} font-cairo pb-16`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 1. الترويسة الرئيسية المدمجة */}
      <div className="card-surface bg-gradient-to-r from-semantic-surfaceCard via-semantic-surfaceSecondary to-semantic-surfaceCard p-3.5 sm:p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              {Icon && (
                <span className="p-1.5 sm:p-2 rounded-xl bg-semantic-actionPrimary/15 text-semantic-actionPrimary border border-semantic-actionPrimary/30 shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
              )}
              <h2 className={`${UI.title} text-base sm:text-xl truncate`}>{title}</h2>
            </div>
            {description && <p className={`${UI.subtitle} text-xs sm:text-sm`}>{description}</p>}
          </div>

          {actionButton && (
            <div className="w-full sm:w-auto shrink-0">
              {actionButton}
            </div>
          )}
        </div>
      </div>

      {/* 2. شبكة الإحصائيات المدمجة (Compact Grid 2x2 في الموبايل) */}
      {statsGrid && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {statsGrid}
        </div>
      )}

      {/* 3. شريط الفلترة والبحث */}
      {filterBar && (
        <div className="w-full">
          {filterBar}
        </div>
      )}

      {/* 4. محتوى الصفحة الرئيسي */}
      {loading ? (
        <div className="text-center py-16 text-semantic-textSecondary text-xs flex flex-col items-center justify-center gap-2.5">
          <div className="w-7 h-7 rounded-full border-2 border-semantic-actionPrimary border-t-transparent animate-spin"></div>
          <span>{t ? t('common.loading', 'جاري تحميل البيانات...') : 'جاري تحميل البيانات...'}</span>
        </div>
      ) : (
        <div className="w-full">
          {children}
        </div>
      )}
    </div>
  );
}
