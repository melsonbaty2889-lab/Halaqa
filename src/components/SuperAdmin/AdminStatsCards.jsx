import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { formatCurrencyAmount } from '@/utils/subscriptionUtils';

export default function AdminStatsCards({ stats = {} }) {
  const { t } = useTranslation();

  const safeNumber = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return Number(val) || 0;
    if (typeof val === 'object' && val !== null) {
      return Number(val.ar || val.en || 0) || 0;
    }
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 font-cairo">
      
      {/* 1. إجمالي الأكاديميات */}
      <div className="relative overflow-hidden card-surface p-5 rounded-2xl border border-semantic-borderCard shadow-sm hover:shadow-md transition-all">
        <div className="absolute top-0 right-0 w-1.5 h-full bg-sky-500" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-semantic-textSecondary">
            {t('admin.total_academies', 'إجمالي الأكاديميات')}
          </span>
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Building2 size={18} />
          </div>
        </div>
        <div className="text-2xl font-black text-semantic-textPrimary">
          {safeStats.totalAcademiesCount}
        </div>
      </div>

      {/* 2. معلقة المراجعة */}
      <div className="relative overflow-hidden card-surface p-5 rounded-2xl border border-semantic-borderCard shadow-sm hover:shadow-md transition-all">
        <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-semantic-textSecondary">
            {t('admin.pending_verification', 'معلقة المراجعة')}
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock size={18} />
          </div>
        </div>
        <div className="text-2xl font-black text-amber-400">
          {safeStats.pendingCount}
        </div>
      </div>

      {/* 3. نشطة */}
      <div className="relative overflow-hidden card-surface p-5 rounded-2xl border border-semantic-borderCard shadow-sm hover:shadow-md transition-all">
        <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-semantic-textSecondary">
            {t('admin.active_academies', 'نشطة')}
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle size={18} />
          </div>
        </div>
        <div className="text-2xl font-black text-emerald-400">
          {safeStats.activeCount}
        </div>
      </div>

      {/* 4. إجمالي الإيرادات */}
      <div className="relative overflow-hidden card-surface p-5 rounded-2xl border border-semantic-borderCard shadow-sm hover:shadow-md transition-all">
        <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-500" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-semantic-textSecondary">
            {t('admin.total_revenue', 'إجمالي الإيرادات')}
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <DollarSign size={18} />
          </div>
        </div>
        <div className="space-y-1">
          {revenueEntries.length === 0 ? (
            <div className="text-xl font-black text-semantic-textPrimary">
              {formatCurrencyAmount(0, 'EGP')}
            </div>
          ) : (
            revenueEntries.map(([currency, amount]) => (
              <div key={currency} className="text-lg font-black text-semantic-textPrimary">
                {formatCurrencyAmount(amount, currency)}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
