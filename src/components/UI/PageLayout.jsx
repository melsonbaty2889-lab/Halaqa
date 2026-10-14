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
    <div className={`px-3 sm:px-5 lg:px-6 space-y-5 sm:space-y-6 ${isRtl ? 'text-right' : 'text-left'} font-cairo pb-16`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 1. ترويسة الصفحة الموحدة (متجاوبة تماماً مع الجوال وسطح المكتب) */}
      <div className="card-surface bg-gradient-to-r from-semantic-surfaceCard via-semantic-surfaceSecondary to-semantic-surfaceCard p-4 sm:p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="space-y-1 w-full sm:w-auto">
            <div className="flex items-center gap-2.5">
              {Icon && (
                <span className="p-2 rounded-xl bg-semantic-actionPrimary/15 text-semantic-actionPrimary border border-semantic-actionPrimary/30 shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
              )}
              <h2 className={`${UI.title} text-lg sm:text-xl truncate`}>{title}</h2>
            </div>
            {description && <p className={`${UI.subtitle} text-xs sm:text-sm`}>{description}</p>}
          </div>

          {actionButton && (
            <div className="w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
              {actionButton}
            </div>
          )}
        </div>
      </div>

      {/* 2. شبكة الإحصائيات (توزيع متجاوب: عمودين في الموبايل، 3 أو 4 في الشاشات الكبيرة) */}
      {statsGrid && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {statsGrid}
        </div>
      )}

      {/* 3. شريط الفلترة والبحث */}
      {filterBar && (
        <div className="w-full">
          {filterBar}
        </div>
      )}

      {/* 4. حاوية المحتوى الرئيسي أو مؤشر التحميل */}
      {loading ? (
        <div className="text-center py-20 text-semantic-textSecondary text-xs flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-semantic-actionPrimary border-t-transparent animate-spin"></div>
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
