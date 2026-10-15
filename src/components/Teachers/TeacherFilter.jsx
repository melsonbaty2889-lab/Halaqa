/* src/components/Teachers/TeacherFilter.jsx */

import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { UI } from '@/theme/styles';
import { Select } from '@/components/UI';
import { getStaffTitles } from '@/constants/staffTitles';
import { getIjazatOptions } from '@/constants/ijazat';

export default function TeacherFilter({ 
  searchTerm, 
  setSearchTerm, 
  selectedTitle, 
  setSelectedTitle, 
  selectedIjaza, 
  setSelectedIjaza, 
  onRefresh,
  t = (s) => s
}) {
  const titlesList = getStaffTitles(t);
  const ijazatOptions = getIjazatOptions(t);

  const titleOptions = [
    { value: 'all', label: t('teachers.allTitles', 'كل المسميات') },
    ...titlesList.map(item => ({ value: item.value, label: item.label }))
  ];

  const ijazaOptions = [
    { value: 'all', label: t('teachers.allIjazat', 'كل الإجازات') },
    ...ijazatOptions.map(item => ({ value: item.id, label: item.label }))
  ];

  return (
    <div className={`${UI.card} p-3 sm:p-4 space-y-3`}>
      {/* حقل البحث الشامل */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute start-3 top-3.5 text-semantic-textSecondary" />
        <input 
          type="text" 
          placeholder={t('teachers.searchPlaceholder', 'البحث بالاسم أو رقم الهاتف...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`${UI.input} ps-9 w-full`}
        />
      </div>

      {/* قوائم الفلترة وزر التحديث متجاوبة بالكامل */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
        <div className="sm:col-span-5">
          <Select
            title={t('teachers.fields.title', 'المسمى')}
            placeholder={t('teachers.allTitles', 'كل المسميات')}
            value={selectedTitle}
            onChange={(v) => setSelectedTitle(v)}
            options={titleOptions}
          />
        </div>

        <div className="sm:col-span-5">
          <Select
            title={t('teachers.ijazatTitle', 'الإجازة')}
            placeholder={t('teachers.allIjazat', 'كل الإجازات')}
            value={selectedIjaza}
            onChange={(v) => setSelectedIjaza(v)}
            options={ijazaOptions}
          />
        </div>

        <div className="sm:col-span-2 flex justify-end">
          <button 
            onClick={onRefresh} 
            className="w-full sm:w-auto p-2.5 bg-semantic-surfaceInput hover:border-semantic-borderHover text-semantic-textSecondary hover:text-semantic-textPrimary border border-semantic-borderInput rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0"
            title={t('common.refresh', 'تحديث البيانات')}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="sm:hidden text-xs">{t('common.refresh', 'تحديث')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
