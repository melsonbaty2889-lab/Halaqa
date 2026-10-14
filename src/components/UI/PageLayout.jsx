/* src/components/UI/PageLayout.jsx */

import React from 'react';
import PageHeader from './PageHeader';
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
    <div className={`px-3 sm:px-5 space-y-6 ${isRtl ? 'text-right' : 'text-left'} font-cairo`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 1. ترويسة الصفحة الموحدة داخل بطاقة زجاجية متوافقة مع الهوية */}
      <div className="card-surface bg-gradient-to-r from-semantic-surfaceCard via-semantic-surfaceSecondary to-semantic-surfaceCard">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              {Icon && (
                <span className="p-2 rounded-xl bg-semantic-actionPrimary/15 text-semantic-actionPrimary border border-semantic-actionPrimary/30">
                  <Icon className="w-5 h-5" />
                </span>
              )}
              <h2 className={UI.title}>{title}</h2>
            </div>
            {description && <p className={UI.subtitle}>{description}</p>}
          </div>

          {actionButton && <div className="w-full sm:w-auto">{actionButton}</div>}
        </div>
      </div>

      {/* 2. شبكة الإحصائيات الموحدة */}
      {statsGrid && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {statsGrid}
        </div>
      )}

      {/* 3. شريط الفلترة والبحث */}
      {filterBar && filterBar}

      {/* 4. حاوية المحتوى الرئيسي أو مؤشر التحميل */}
      {loading ? (
        <div className="text-center py-16 text-semantic-textSecondary text-xs flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-semantic-actionPrimary border-t-transparent animate-spin"></div>
          <span>{t ? t('common.loading', 'جاري تحميل البيانات...') : 'جاري تحميل البيانات...'}</span>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
