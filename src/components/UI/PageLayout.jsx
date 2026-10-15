/* src/components/UI/PageLayout.jsx */

import React from 'react';
import { ListFilter, FilterX, RefreshCw } from 'lucide-react';

export default function PageLayout({
  // 1. ترويسة الصفحة
  title,
  subtitle,
  icon: Icon,
  actionButtonText,
  onActionButtonClick,

  // 2. كروت الإحصائيات التفاعلية
  statsGrid,

  // 3. الفلاتر والبحث
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filtersChildren,

  // 4. تذييل النتائج وحالة الفلاتر
  totalCount = 0,
  filteredCount = 0,
  hasActiveFilters = false,
  onResetFilters,
  onRefresh,
  countUnitText = 'طالب', // يمكن تمرير: 'طالب' أو 'فرد' أو 'حلقة' أو 'ولي أمر'

  // 5. المحتوى والتحكم
  children,
  isLoading = false,
  isRtl = true,
  t = (s) => s
}) {
  return (
    <div className="space-y-4 text-semantic-textPrimary" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. رأس الصفحة القياسي */}
      <div className="bg-semantic-surfaceCard border border-semantic-borderCard rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 text-start w-full sm:w-auto">
          {Icon && (
            <div className="flex shrink-0 items-center justify-center w-11 h-11 rounded-xl bg-semantic-actionPrimary/10 text-semantic-actionPrimary border border-semantic-actionPrimary/20">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-semantic-textPrimary leading-snug">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-semantic-textSecondary">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actionButtonText && (
          <button 
            type="button"
            onClick={onActionButtonClick} 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-semantic-actionPrimary text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
          >
            <span>{actionButtonText}</span>
          </button>
        )}
      </div>

      {/* 2. شبكة كروت الإحصائيات */}
      {statsGrid}

      {/* 3. شريط البحث والفلترة الموحد */}
      <div className="bg-semantic-surfaceCard/60 p-3 sm:p-4 rounded-2xl border border-semantic-borderCard space-y-3 shadow-md relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {onSearchChange && (
            <div className="relative w-full col-span-2 md:col-span-1 z-10">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder || t('common.search', 'البحث...')}
                className="w-full bg-semantic-surfaceInput border border-semantic-borderInput rounded-xl px-3 py-2 text-xs sm:text-sm text-semantic-textPrimary placeholder-semantic-textSecondary focus:outline-none focus:border-semantic-actionPrimary transition-colors"
              />
            </div>
          )}

          {filtersChildren}
        </div>

        {/* سطر التذييل الموحد والأسهل بدون الاعتماد على مفاتيح ترجمة قديمة */}
        <div className="flex items-center justify-between text-xs text-semantic-textSecondary pt-2 px-1 border-t border-semantic-borderCard/40 relative z-0">
          <span className="flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-semantic-actionPrimary" />
            <span>
              {`عرض ${filteredCount} من إجمالي ${totalCount} ${countUnitText}`}
            </span>
          </span>

          <div className="flex items-center gap-3">
            {hasActiveFilters && onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="flex items-center gap-1 text-semantic-actionPrimary hover:underline font-medium transition-colors cursor-pointer"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>{t('common.reset_filters', 'إلغاء الفلاتر')}</span>
              </button>
            )}

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="flex items-center gap-1 text-semantic-textSecondary hover:text-semantic-textPrimary transition-colors cursor-pointer"
                title={t('common.refresh', 'تحديث البيانات')}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. محتوى الصفحة أو حالة التحميل */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-semantic-textSecondary">
          {t('loading', 'جاري تحميل البيانات...')}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
