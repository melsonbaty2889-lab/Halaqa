/* src/components/Halaqat/HalaqasFilterBar.jsx */

import React from 'react';
import { Search, Users, CheckCircle2, Archive, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input, Select } from '@/components/UI';
import { getFilterTrackOptions } from './HalaqaConstants';

export default function HalaqasFilterBar({
  searchQuery = '',
  setSearchQuery,
  selectedTrack = 'all',
  setSelectedTrack,
  viewMode = 'active',
  setViewMode,
  stats = { totalActive: 0, totalArchived: 0, unassigned: 0 }
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  const isRtl = ['ar', 'ur'].includes(currentLang);

  const trackOptions = getFilterTrackOptions(t);

  const handleSearchChange = (e) => {
    if (typeof setSearchQuery !== 'function') return;
    let value = typeof e === 'string' || typeof e === 'number' ? String(e) : (e?.target?.value ?? e?.value ?? '');
    setSearchQuery(value);
  };

  const handleTrackChange = (e) => {
    if (typeof setSelectedTrack !== 'function') return;
    let value = typeof e === 'string' || typeof e === 'number' ? String(e) : (e?.target?.value ?? e?.value ?? 'all');
    setSelectedTrack(value);
  };

  const hasActiveFilters = Boolean(searchQuery?.trim()) || selectedTrack !== 'all';

  const handleResetFilters = () => {
    if (typeof setSearchQuery === 'function') setSearchQuery('');
    if (typeof setSelectedTrack === 'function') setSelectedTrack('all');
  };

  return (
    <div 
      className={`space-y-2.5 bg-semantic-surfaceCard p-3 rounded-2xl border border-semantic-borderCard shadow-sm ${isRtl ? 'text-right' : 'text-left'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* 1. التبويبات الرئيسية دون تقطيع نصوص */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-semantic-surfaceInput rounded-xl border border-semantic-borderCard">
        <button
          type="button"
          onClick={() => typeof setViewMode === 'function' && setViewMode('active')}
          className={`py-1.5 px-1 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all border-none cursor-pointer ${
            viewMode === 'active'
              ? 'bg-semantic-surfaceCard text-semantic-actionPrimary shadow-sm border border-semantic-borderCard'
              : 'bg-transparent text-semantic-textMuted hover:text-semantic-textPrimary'
          }`}
        >
          <CheckCircle2 size={13} className="shrink-0" />
          <span className="truncate">{t('statActive', 'النشطة')}</span>
          <span className="bg-semantic-actionPrimary/15 text-semantic-actionPrimary px-1.5 py-0.2 rounded-full text-[10px] font-black shrink-0">
            <bdi>{stats.totalActive || 0}</bdi>
          </span>
        </button>

        <button
          type="button"
          onClick={() => typeof setViewMode === 'function' && setViewMode('unassigned')}
          className={`py-1.5 px-1 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all border-none cursor-pointer ${
            viewMode === 'unassigned'
              ? 'bg-semantic-surfaceCard text-semantic-actionPrimary shadow-sm border border-semantic-borderCard'
              : 'bg-transparent text-semantic-textMuted hover:text-semantic-textPrimary'
          }`}
        >
          <Users size={13} className="shrink-0" />
          <span className="truncate">{t('statUnassigned', 'بلا معلم')}</span>
          <span className="bg-semantic-borderCard text-semantic-textMuted px-1.5 py-0.2 rounded-full text-[10px] font-black shrink-0">
            <bdi>{stats.unassigned || 0}</bdi>
          </span>
        </button>

        <button
          type="button"
          onClick={() => typeof setViewMode === 'function' && setViewMode('archived')}
          className={`py-1.5 px-1 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all border-none cursor-pointer ${
            viewMode === 'archived'
              ? 'bg-semantic-surfaceCard text-semantic-actionPrimary shadow-sm border border-semantic-borderCard'
              : 'bg-transparent text-semantic-textMuted hover:text-semantic-textPrimary'
          }`}
        >
          <Archive size={13} className="shrink-0" />
          <span className="truncate">{t('statArchived', 'المؤرشفة')}</span>
          <span className="bg-semantic-borderCard text-semantic-textMuted px-1.5 py-0.2 rounded-full text-[10px] font-black shrink-0">
            <bdi>{stats.totalArchived || 0}</bdi>
          </span>
        </button>
      </div>

      {/* 2. شريط البحث وقائمة المسارات */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder={t('searchPlaceholder', 'ابحث باسم الحلقة أو المعلم...')}
            value={searchQuery}
            onChange={handleSearchChange}
            icon={<Search size={14} className="text-semantic-textMuted" />}
          />
          {searchQuery && searchQuery.trim() !== '' && (
            <button
              type="button"
              onClick={() => typeof setSearchQuery === 'function' && setSearchQuery('')}
              className={`absolute top-1/2 -translate-y-1/2 text-semantic-textMuted hover:text-semantic-textPrimary transition-colors p-1 rounded-full bg-semantic-surfaceInput/50 hover:bg-semantic-surfaceInput cursor-pointer border-none flex items-center justify-center ${
                isRtl ? 'left-3' : 'right-3'
              }`}
              title={t('clearSearch', 'مسح البحث')}
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="w-full sm:w-64 shrink-0 flex items-center gap-1.5">
          <div className="flex-1">
            <Select
              title={t('selectTrackTitle', 'المسار التعليمي')}
              value={selectedTrack}
              onChange={handleTrackChange}
              options={trackOptions}
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              title={t('resetFilters', 'إعادة ضبط الفلاتر')}
              className="p-2.5 rounded-xl bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textMuted hover:text-semantic-textPrimary cursor-pointer shrink-0 transition-colors flex items-center justify-center"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
