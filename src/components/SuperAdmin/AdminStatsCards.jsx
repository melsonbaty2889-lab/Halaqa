import React from 'react';
import { Building2, Clock, CheckCircle, DollarSign } from 'lucide-react';

export default function AdminStatsCards({ stats = {}, isRtl = true }) {
  // دالة مساعدة معالجة وأمنة للقيم والمجالات الرقمية والمترجمة
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {/* إجمالي الأكاديميات */}
      <div className="card-surface p-4 rounded-xl">
        <div className="flex items-center gap-2 text-semantic-textSecondary text-xs mb-1">
          <Building2 size={16} className="text-sky-400" />
          <span>{isRtl ? 'إجمالي الأكاديميات' : 'Total Academies'}</span>
        </div>
        <h3 className="text-xl font-bold text-semantic-textPrimary m-0">
          {safeStats.totalAcademiesCount}
        </h3>
      </div>

      {/* معلقة المراجعة */}
      <div className="card-surface border-amber-500/30 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-amber-400 text-xs mb-1">
          <Clock size={16} />
          <span>{isRtl ? 'معلقة المراجعة' : 'Pending Verification'}</span>
        </div>
        <h3 className="text-xl font-bold text-amber-300 m-0">
          {safeStats.pendingCount}
        </h3>
      </div>

      {/* نشطة */}
      <div className="card-surface border-semantic-successBorder/50 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-semantic-success text-xs mb-1">
          <CheckCircle size={16} />
          <span>{isRtl ? 'نشطة' : 'Active'}</span>
        </div>
        <h3 className="text-xl font-bold text-semantic-success m-0">
          {safeStats.activeCount}
        </h3>
      </div>

      {/* إجمالي الإيرادات */}
      <div className="card-surface p-4 rounded-xl">
        <div className="flex items-center gap-2 text-semantic-textSecondary text-xs mb-1">
          <DollarSign size={16} className="text-semantic-success" />
          <span>{isRtl ? 'إجمالي الإيرادات' : 'Total Revenue'}</span>
        </div>
        <h3 className="text-xl font-bold text-semantic-textPrimary m-0">
          {safeStats.totalRevenue.toLocaleString()} <span className="text-xs font-normal text-semantic-textMuted">{isRtl ? 'ج.م' : 'EGP'}</span>
        </h3>
      </div>
    </div>
  );
      }
