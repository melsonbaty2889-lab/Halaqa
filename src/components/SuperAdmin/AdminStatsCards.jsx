import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Clock, CheckCircle, DollarSign } from 'lucide-react';

export default function AdminStatsCards({ stats = {} }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

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
    totalRevenue: safeNumber(stats?.totalRevenue)
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 font-cairo">
      {/* إجمالي الأكاديميات */}
      <div className="card-surface p-4 rounded-xl border border-semantic-borderCard">
        <div className="flex items-center gap-2 text-semantic-textSecondary text-xs mb-1">
          <Building2 size={16} className="text-sky-400" />
          <span>{t('admin.total_academies', 'إجمالي الأكاديميات')}</span>
        </div>
        <h3 className="text-xl font-bold text-semantic-textPrimary m-0">
          {safeStats.totalAcademiesCount}
        </h3>
      </div>

      {/* معلقة المراجعة */}
      <div className="card-surface border border-amber-500/30 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-amber-400 text-xs mb-1">
          <Clock size={16} />
          <span>{t('admin.pending_verification', 'معلقة المراجعة')}</span>
        </div>
        <h3 className="text-xl font-bold text-amber-300 m-0">
          {safeStats.pendingCount}
        </h3>
      </div>

      {/* نشطة */}
      <div className="card-surface border border-semantic-successBorder/50 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-semantic-success text-xs mb-1">
          <CheckCircle size={16} />
          <span>{t('admin.active_academies', 'نشطة')}</span>
        </div>
        <h3 className="text-xl font-bold text-semantic-success m-0">
          {safeStats.activeCount}
        </h3>
      </div>

      {/* إجمالي الإيرادات */}
      <div className="card-surface p-4 rounded-xl border border-semantic-borderCard">
        <div className="flex items-center gap-2 text-semantic-textSecondary text-xs mb-1">
          <DollarSign size={16} className="text-semantic-success" />
          <span>{t('admin.total_revenue', 'إجمالي الإيرادات')}</span>
        </div>
        <h3 className="text-xl font-bold text-semantic-textPrimary m-0">
          {safeStats.totalRevenue.toLocaleString()}{' '}
          <span className="text-xs font-normal text-semantic-textMuted">
            {isRtl ? 'ج.م' : 'EGP'}
          </span>
        </h3>
      </div>
    </div>
  );
}
