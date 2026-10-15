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
  // جلب خيارات المسميات والإجازات من ملفات الثوابت المركزية
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
    <div className="card-surface p-4 space-y-3 md:space-y-0 md:flex md:items-center md:gap-4 border-semantic-borderCard">
      {/* حقل البحث الشامل */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute start-3 top-3 text-semantic-textSecondary" />
        <input 
          type="text" 
          placeholder={t('teachers.searchPlaceholder', 'البحث بالاسم أو رقم الهاتف...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`${UI.input} ps-9`}
        />
      </div>

      {/* حنبات الفلترة وزر التحديث */}
      <div className="flex gap-2 items-center">
        <div className="w-40 sm:w-48">
          <Select
            title={t('teachers.fields.title', 'المسمى')}
            placeholder={t('teachers.allTitles', 'كل المسميات')}
            value={selectedTitle}
            onChange={(v) => setSelectedTitle(v)}
            options={titleOptions}
          />
        </div>

        <div className="w-40 sm:w-48">
          <Select
            title={t('teachers.ijazatTitle', 'الإجازة')}
            placeholder={t('teachers.allIjazat', 'كل الإجازات')}
            value={selectedIjaza}
            onChange={(v) => setSelectedIjaza(v)}
            options={ijazaOptions}
          />
        </div>

        <button 
          onClick={onRefresh} 
          className="p-2.5 bg-semantic-surfaceInput hover:border-semantic-borderHover text-semantic-textSecondary hover:text-semantic-textPrimary border border-semantic-borderInput rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
          title={t('common.refresh', 'تحديث')}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
