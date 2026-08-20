/* src/components/Logs/ActivityAuditLogs.jsx */
import React from 'react';
import { ShieldCheck, Activity, User, Clock, FileText } from 'lucide-react';
import colors from '@/theme/colors';

export default function ActivityAuditLogs({ logs = [] }) {
  return (
    <div className={`w-full bg-[${colors.surface || '#0F172A'}] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-right rtl`}>
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#FBBF24]" />
          <h3 className="text-white font-bold text-base">سجلات النشاط والتدقيق</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>مراقب الآمان مفعل</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            لا توجد سجلات نشاط مسجلة
          </div>
        ) : (
          logs.map((log) => (
            <div 
              key={log.id} 
              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/5 text-[#FBBF24] mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-white">{log.action_description || log.action}</span>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      {log.actor_name || log.user_id}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {log.created_at}
                    </span>
                  </div>
                </div>
              </div>

              <div className="self-end sm:self-center">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-white/5 text-slate-300 border border-white/10">
                  {log.target_table || 'النظام'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
