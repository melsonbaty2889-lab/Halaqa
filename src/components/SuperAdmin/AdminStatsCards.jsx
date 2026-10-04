import React from 'react';
import { Building2, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { formatCurrencyAmount } from '@/utils/subscriptionUtils';

export default function AdminStatsCards({ stats = {} }) {
  const safeNumber = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return Number(val) || 0;
    return 0;
  };

  const safeStats = {
    totalAcademiesCount: safeNumber(stats?.totalAcademiesCount),
    pendingCount: safeNumber(stats?.pendingCount),
    activeCount: safeNumber(stats?.activeCount),
    totalRevenue: typeof stats?.totalRevenue === 'object' && stats?.totalRevenue !== null 
      ? stats.totalRevenue 
      : { EGP: safeNumber(stats?.totalRevenue) }
  };

  const revenueEntries = Object.entries(safeStats.totalRevenue);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-5 font-cairo" dir="rtl">
      
      {/* 1. إجمالي الأكاديميات */}
      <div className="relative overflow-hidden card-surface p-3 sm:p-4 rounded-xl border border-semantic-borderCard shadow-sm transition-all">
        <div className="absolute top-0 right-0 w-1 h-full bg-sky-500" />
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] sm:text-xs font-semibold text-semantic-textSecondary truncate">
            إجمالي الأكاديميات
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Building2 size={15} />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-semantic-textPrimary">
          {safeStats.totalAcademiesCount}
        </div>
      </div>

      {/* 2. معلقة المراجعة */}
      <div className="relative overflow-hidden card-surface p-3 sm:p-4 rounded-xl border border-semantic-borderCard shadow-sm transition-all">
        <div className="absolute top-0 right-0 w-1 h-full bg-amber-500" />
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] sm:text-xs font-semibold text-semantic-textSecondary truncate">
            معلقة المراجعة
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Clock size={15} />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-amber-400">
          {safeStats.pendingCount}
        </div>
      </div>

      {/* 3. نشطة */}
      <div className="relative overflow-hidden card-surface p-3 sm:p-4 rounded-xl border border-semantic-borderCard shadow-sm transition-all">
        <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500" />
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] sm:text-xs font-semibold text-semantic-textSecondary truncate">
            نشطة
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle size={15} />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-emerald-400">
          {safeStats.activeCount}
        </div>
      </div>

      {/* 4. إجمالي الإيرادات */}
      <div className="relative overflow-hidden card-surface p-3 sm:p-4 rounded-xl border border-semantic-borderCard shadow-sm transition-all">
        <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500" />
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] sm:text-xs font-semibold text-semantic-textSecondary truncate">
            إجمالي الإيرادات
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <DollarSign size={15} />
          </div>
        </div>
        <div className="space-y-0.5">
          {revenueEntries.length === 0 ? (
            <div className="text-base sm:text-xl font-black text-semantic-textPrimary">
              {formatCurrencyAmount(0, 'EGP')}
            </div>
          ) : (
            revenueEntries.map(([currency, amount]) => (
              <div key={currency} className="text-sm sm:text-lg font-black text-semantic-textPrimary truncate">
                {formatCurrencyAmount(amount, currency)}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
