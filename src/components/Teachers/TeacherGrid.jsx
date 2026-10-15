// src/components/Teachers/TeacherGrid.jsx

import React from 'react';
import { Users, FilterX } from 'lucide-react';
import TeacherCard from './TeacherCard';

export default function TeacherGrid({ teachers = [], loading, onToggleStatus, onManageAvailability, onResetFilters, t }) {
  if (loading) {
    return (
      <div className="text-center py-12 text-sm text-semantic-textSecondary">
        {t('loading', 'جاري تحميل البيانات...')}
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="text-center py-12 bg-semantic-surfaceCard rounded-2xl border border-semantic-borderCard space-y-2">
        <Users className="w-10 h-10 text-semantic-textSecondary mx-auto" />
        <p className="text-semantic-textPrimary font-medium text-sm">
          {t('no_search_results', 'لم يتم العثور على نتائج تطابق بحثك.')}
        </p>
        <button
          onClick={onResetFilters}
          className="mt-2 inline-flex items-center gap-1 text-xs text-semantic-actionPrimary underline cursor-pointer"
        >
          <FilterX className="w-3 h-3" />
          <span>{t('common.reset_filters', 'إلغاء الفلاتر')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 relative z-0">
      {teachers.map((person) => (
        <TeacherCard
          key={person.id}
          person={person}
          onToggleStatus={onToggleStatus}
          onManageAvailability={onManageAvailability}
          t={t}
        />
      ))}
    </div>
  );
}
