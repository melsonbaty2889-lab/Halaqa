// src/components/Teachers/TeacherStats.jsx

import React from 'react';

export default function TeacherStats({ teachers = [], statusFilter, setStatusFilter, t }) {
  const stats = {
    total: teachers.length,
    teaching: teachers.filter(s => s.is_teaching === true).length,
    active: teachers.filter(s => s.is_active === true).length,
    inactive: teachers.filter(s => s.is_active === false).length,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {/* إجمالي الكادر */}
      <div 
        onClick={() => setStatusFilter('all')}
        className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'all' ? 'border-semantic-actionPrimary ring-1 ring-semantic-actionPrimary' : 'border-semantic-borderCard hover:border-semantic-borderCard/80'}`}
      >
        <div className="absolute top-0 start-0 end-0 h-1 bg-semantic-actionPrimary"></div>
        <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('teachers.totalStaff', 'إجمالي الكادر')}</p>
        <p className="text-base sm:text-xl font-bold text-semantic-textPrimary mt-1">{stats.total}</p>
      </div>

      {/* المعلمون المباشرون */}
      <div 
        onClick={() => setStatusFilter('teaching')}
        className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'teaching' ? 'border-semantic-success ring-1 ring-semantic-success' : 'border-semantic-borderCard hover:border-semantic-borderCard/80'}`}
      >
        <div className="absolute top-0 start-0 end-0 h-1 bg-semantic-success"></div>
        <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('teachers.activeTeaching', 'المعلمون المباشرون')}</p>
        <p className="text-base sm:text-xl font-bold text-semantic-success mt-1">{stats.teaching}</p>
      </div>

      {/* الحسابات النشطة */}
      <div 
        onClick={() => setStatusFilter('active')}
        className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'active' ? 'border-semantic-actionPrimary ring-1 ring-semantic-actionPrimary' : 'border-semantic-borderCard hover:border-semantic-borderCard/80'}`}
      >
        <div className="absolute top-0 start-0 end-0 h-1 bg-semantic-actionPrimary"></div>
        <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('teachers.activeAccounts', 'الحسابات النشطة')}</p>
        <p className="text-base sm:text-xl font-bold text-semantic-actionPrimary mt-1">{stats.active}</p>
      </div>

      {/* غير النشطين */}
      <div 
        onClick={() => setStatusFilter('inactive')}
        className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'inactive' ? 'border-semantic-error ring-1 ring-semantic-error' : 'border-semantic-borderCard hover:border-semantic-borderCard/80'}`}
      >
        <div className="absolute top-0 start-0 end-0 h-1 bg-semantic-error"></div>
        <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('teachers.inactiveAccounts', 'غير النشطين')}</p>
        <p className="text-base sm:text-xl font-bold text-semantic-error mt-1">{stats.inactive}</p>
      </div>
    </div>
  );
}
