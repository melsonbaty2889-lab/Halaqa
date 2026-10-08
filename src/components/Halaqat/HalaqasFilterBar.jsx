import React from 'react';
import { 
  Search, Users, Grid, List, CheckCircle2, Archive, X 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input, Select } from '@/components/UI';
import { getTrackOptions } from '@/constants/halaqaConstants';

export default function HalaqasFilterBar({
  searchQuery = '',
  setSearchQuery,
  selectedTrack = 'all',
  setSelectedTrack,
  viewMode = 'active',
  setViewMode,
  layoutMode = 'grid',
  setLayoutMode,
  stats = { totalActive: 0, totalArchived: 0, unassigned: 0 }
}) {
  const { t } = useTranslation();

  const extractValue = (val) => {
    if (val && typeof val === 'object' && 'target' in val) {
      return val.target.value;
    }
    return val;
  };

  const trackOptions = getTrackOptions(t);
  const hasActiveFilters = Boolean(searchQuery?.trim()) || selectedTrack !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTrack('all');
  };

  return (
    <div className="space-y-3">
      {/* 1. التبويبات الثلاثة الرئيسية */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-semantic-surfaceInput rounded-xl border border-semantic-borderCard">
        <button
          type="button"
          onClick={() => setViewMode('active')}
          className={`py-1.5 px-1 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all border-none cursor-pointer ${
            viewMode === 'active'
              ? 'bg-semantic-bgMain text-semantic-actionPrimary shadow-sm'
              : 'bg-transparent text-semantic-textMuted hover:text-semantic-textPrimary'
          }`}
        >
          <CheckCircle2 size={13} />
          <span>{t('statActive', 'النشطة')}</span>
          <span className="bg-semantic-actionPrimary/15 text-semantic-actionPrimary px-1.5 py-0.2 rounded-full text-[10px]">
            {stats.totalActive}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('unassigned')}
          className={`py-1.5 px-1 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all border-none cursor-pointer ${
            viewMode === 'unassigned'
              ? 'bg-semantic-bgMain text-semantic-actionPrimary shadow-sm'
              : 'bg-transparent text-semantic-textMuted hover:text-semantic-textPrimary'
          }`}
        >
          <Users size={13} />
          <span>{t('statUnassigned', 'بلا معلم')}</span>
          <span className="bg-semantic-borderCard text-semantic-textMuted px-1.5 py-0.2 rounded-full text-[10px]">
            {stats.unassigned}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('archived')}
          className={`py-1.5 px-1 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all border-none cursor-pointer ${
            viewMode === 'archived'
              ? 'bg-semantic-bgMain text-semantic-actionPrimary shadow-sm'
              : 'bg-transparent text-semantic-textMuted hover:text-semantic-textPrimary'
          }`}
        >
          <Archive size={13} />
          <span>{t('statArchived', 'المؤرشفة')}</span>
          <span className="bg-semantic-borderCard text-semantic-textMuted px-1.5 py-0.2 rounded-full text-[10px]">
            {stats.totalArchived}
          </span>
        </button>
      </div>

      {/* 2. عناصر البحث والفلترة والتحكم بالنمط */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder={t('searchPlaceholder', 'ابحث باسم الحلقة أو المعلم...')}
            value={searchQuery}
            onChange={(v) => setSearchQuery(extractValue(v))}
            icon={<Search size={14} className="text-semantic-textMuted" />}
          />
        </div>

        <div className="w-full sm:w-64 shrink-0 flex items-center gap-1.5">
          <div className="flex-1">
            <Select
              title={t('selectTrackTitle', 'المسار التعليمي')}
              value={selectedTrack}
              onChange={(v) => setSelectedTrack(extractValue(v))}
              options={trackOptions}
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              title={t('resetFilters', 'إعادة ضبط')}
              className="p-2.5 rounded-xl bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textMuted hover:text-semantic-textPrimary cursor-pointer shrink-0"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center bg-semantic-surfaceInput rounded-xl p-1 border border-semantic-borderCard shrink-0">
          <button
            type="button"
            onClick={() => setLayoutMode('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${
              layoutMode === 'grid' ? 'bg-semantic-actionPrimary text-semantic-bgMain' : 'bg-transparent text-semantic-textMuted'
            }`}
          >
            <Grid size={14} />
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode('list')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${
              layoutMode === 'list' ? 'bg-semantic-actionPrimary text-semantic-bgMain' : 'bg-transparent text-semantic-textMuted'
            }`}
          >
            <List size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
