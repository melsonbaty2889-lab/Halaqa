/* src/components/Teachers/TeacherStats.jsx */

import React from 'react';
import { Users, UserCheck, ShieldCheck } from 'lucide-react';
import { UI } from '@/theme/styles';

export default function TeacherStats({ teachers = [], selectedTitle, setSelectedTitle, t }) {
  const totalCount = teachers.length;
  const teachingCount = teachers.filter(s => s.is_teaching === true).length;
  const activeCount = teachers.filter(s => s.is_active === true).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full">
      {/* إجمالي الكادر */}
      <button
        type="button"
        onClick={() => setSelectedTitle('all')}
        className={`${UI.card} !p-3 flex items-center justify-between text-start cursor-pointer transition-all hover:scale-[1.01] ${
          selectedTitle === 'all' ? 'border-semantic-actionPrimary ring-1 ring-semantic-actionPrimary/40' : ''
        }`}
      >
        <div>
          <p className="text-[10px] sm:text-[11px] text-semantic-textSecondary">{t('teachers.totalStaff', 'إجمالي الكادر')}</p>
          <p className="text-base sm:text-xl font-extrabold text-semantic-textPrimary mt-0.5">
            <bdi>{totalCount}</bdi>
          </p>
        </div>
        <div className="p-2 rounded-xl bg-semantic-actionPrimary/10 text-semantic-actionPrimary shrink-0">
          <Users className="w-4 h-4" />
        </div>
      </button>

      {/* المعلمون المباشرون */}
      <button
        type="button"
        onClick={() => setSelectedTitle('quran_teacher')}
        className={`${UI.card} !p-3 flex items-center justify-between text-start cursor-pointer transition-all hover:scale-[1.01] ${
          selectedTitle === 'quran_teacher' ? 'border-semantic-success ring-1 ring-semantic-success/40' : ''
        }`}
      >
        <div>
          <p className="text-[10px] sm:text-[11px] text-semantic-textSecondary">{t('teachers.activeTeaching', 'المعلمون المباشرون')}</p>
          <p className="text-base sm:text-xl font-extrabold text-semantic-success mt-0.5">
            <bdi>{teachingCount}</bdi>
          </p>
        </div>
        <div className="p-2 rounded-xl bg-semantic-successBg text-semantic-success shrink-0">
          <UserCheck className="w-4 h-4" />
        </div>
      </button>

      {/* الحسابات النشطة */}
      <button
        type="button"
        onClick={() => setSelectedTitle('active')}
        className={`${UI.card} !p-3 flex items-center justify-between text-start cursor-pointer transition-all hover:scale-[1.01] col-span-2 sm:col-span-1 ${
          selectedTitle === 'active' ? 'border-sky-400 ring-1 ring-sky-400/40' : ''
        }`}
      >
        <div>
          <p className="text-[10px] sm:text-[11px] text-semantic-textSecondary">{t('teachers.activeAccounts', 'الحسابات النشطة')}</p>
          <p className="text-base sm:text-xl font-extrabold text-sky-400 mt-0.5">
            <bdi>{activeCount}</bdi>
          </p>
        </div>
        <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
}
