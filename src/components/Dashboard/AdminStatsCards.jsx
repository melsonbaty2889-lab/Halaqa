import React from 'react';
import { Building2, Clock, CheckCircle, ShieldAlert, DollarSign } from 'lucide-react';

export default function AdminStatsCards({ stats, isRtl }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
          <Building2 size={16} className="text-sky-400" />
          <span>{isRtl ? 'إجمالي الأكاديميات' : 'Total Academies'}</span>
        </div>
        <h3 className="text-xl font-bold text-white m-0">{stats.totalAcademiesCount}</h3>
      </div>

      <div className="bg-slate-900/80 border border-amber-500/30 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-amber-400 text-xs mb-1">
          <Clock size={16} />
          <span>{isRtl ? 'معلقة المراجعة' : 'Pending Verification'}</span>
        </div>
        <h3 className="text-xl font-bold text-amber-300 m-0">{stats.pendingCount}</h3>
      </div>

      <div className="bg-slate-900/80 border border-emerald-500/30 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
          <CheckCircle size={16} />
          <span>{isRtl ? 'نشطة' : 'Active'}</span>
        </div>
        <h3 className="text-xl font-bold text-emerald-300 m-0">{stats.activeCount}</h3>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
          <DollarSign size={16} className="text-emerald-400" />
          <span>{isRtl ? 'إجمالي الإيرادات' : 'Total Revenue'}</span>
        </div>
        <h3 className="text-xl font-bold text-white m-0">
          {stats.totalRevenue.toLocaleString()} <span className="text-xs font-normal text-slate-400">{isRtl ? 'ج.م' : 'EGP'}</span>
        </h3>
      </div>
    </div>
  );
}
