/* src/components/Teachers/TeacherFilter.jsx */

import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { UI } from '@/theme/styles';

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
  return (
    <div className="card-surface p-4 space-y-3 md:space-y-0 md:flex md:items-center md:gap-4 border-semantic-borderCard">
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

      <div className="flex gap-2">
        <select 
          value={selectedTitle}
          onChange={(e) => setSelectedTitle(e.target.value)}
          className={UI.input}
        >
          <option value="all" className="bg-slate-900 text-white">{t('teachers.allTitles', 'كل المسميات')}</option>
          <option value="معلّم / مقرئ" className="bg-slate-900 text-white">{t('teachers.titles.teacher', 'معلّم / مقرئ')}</option>
          <option value="مشرف تعليمي" className="bg-slate-900 text-white">{t('teachers.titles.supervisor', 'مشرف تعليمي')}</option>
          <option value="مدير أكاديمية" className="bg-slate-900 text-white">{t('teachers.titles.admin', 'مدير أكاديمية')}</option>
        </select>

        <select 
          value={selectedIjaza}
          onChange={(e) => setSelectedIjaza(e.target.value)}
          className={UI.input}
        >
          <option value="all" className="bg-slate-900 text-white">{t('teachers.allIjazat', 'كل الإجازات')}</option>
          <option value="حفص عن عاصم" className="bg-slate-900 text-white">حفص عن عاصم</option>
          <option value="ورش عن نافع" className="bg-slate-900 text-white">ورش عن نافع</option>
          <option value="قالون عن نافع" className="bg-slate-900 text-white">قالون عن نافع</option>
          <option value="القراءات العشر الصغرى" className="bg-slate-900 text-white">القراءات العشر الصغرى</option>
          <option value="القراءات العشر الكبرى" className="bg-slate-900 text-white">القراءات العشر الكبرى</option>
        </select>

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
