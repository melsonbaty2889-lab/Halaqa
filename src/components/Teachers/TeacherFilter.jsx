import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/UI/UI';

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
    <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3 md:space-y-0 md:flex md:items-center md:gap-4">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
        <Input 
          type="text" 
          placeholder={t('البحث بالاسم أو رقم الهاتف...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-9"
        />
      </div>

      <div className="flex gap-2">
        <select 
          value={selectedTitle}
          onChange={(e) => setSelectedTitle(e.target.value)}
          className="p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none"
        >
          <option value="all">{t('كل المسميات')}</option>
          <option value="معلّم / مقرئ">{t('معلّم / مقرئ')}</option>
          <option value="مشرف تعليمي">{t('مشرف تعليمي')}</option>
          <option value="مدير أكاديمية">{t('مدير أكاديمية')}</option>
        </select>

        <select 
          value={selectedIjaza}
          onChange={(e) => setSelectedIjaza(e.target.value)}
          className="p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none"
        >
          <option value="all">{t('كل الإجازات')}</option>
          <option value="حفص عن عاصم">حفص عن عاصم</option>
          <option value="ورش عن نافع">ورش عن نافع</option>
          <option value="قالون عن نافع">قالون عن نافع</option>
          <option value="القراءات العشر الصغرى">القراءات العشر الصغرى</option>
          <option value="القراءات العشر الكبرى">القراءات العشر الكبرى</option>
        </select>

        <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
