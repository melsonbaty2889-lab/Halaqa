// src/components/Teachers/TeacherStats.jsx

import React from 'react';

export default function TeacherStats({ teachers = [], statusFilter, setStatusFilter, t }) {
  const stats = {
    total: teachers.length,
    teaching: teachers.filter(s => s.is_teaching === true).length,
    active: teachers.filter(s => s.is_active === true).length,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
      <div 
        onClick={() => setStatusFilter('all')}
        className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'all' ? 'border-semantic-actionPrimary ring-1 ring-semantic-actionPrimary' : 'border-semantic-borderCard hover:border-semantic-borderCard/80'}`}
      >
        <div className="absolute top-0 start-0 end-0 h-1 bg-semantic-actionPrimary"></div>
        <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('teachers.totalStaff', 'إجمالي الكادر')}</p>
        <p className="text-base sm:text-xl font-bold text-semantic-textPrimary mt-1">{stats.total}</p>
      </div>

      <div 
        onClick={() => setStatusFilter('teaching')}
        className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'teaching' ? 'border-semantic-success ring-1 ring-semantic-success' : 'border-semantic-borderCard hover:border-semantic-borderCard/80'}`}
      >
        <div className="absolute top-0 start-0 end-0 h-1 bg-semantic-success"></div>
        <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('teachers.activeTeaching', 'المعلمون المباشرون')}</p>
        <p className="text-base sm:text-xl font-bold text-semantic-success mt-1">{stats.teaching}</p>
      </div>

      <div 
        onClick={() => setStatusFilter('active')}
        className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all col-span-2 sm:col-span-1 ${statusFilter === 'active' ? 'border-sky-400 ring-1 ring-sky-400' : 'border-semantic-borderCard hover:border-semantic-borderCard/80'}`}
      >
        <div className="absolute top-0 start-0 end-0 h-1 bg-sky-400"></div>
        <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('teachers.activeAccounts', 'الحسابات النشطة')}</p>
        <p className="text-base sm:text-xl font-bold text-sky-400 mt-1">{stats.active}</p>
      </div>
    </div>
  );
}
