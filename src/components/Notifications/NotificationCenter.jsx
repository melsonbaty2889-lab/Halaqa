/* src/components/Notifications/NotificationCenter.jsx */
import React from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, Trash2 } from 'lucide-react';
import colors from '@/theme/colors';

export default function NotificationCenter({ notifications = [], onMarkAsRead, onDelete }) {
  return (
    <div className={`w-full max-w-md bg-[${colors.surface || '#0F172A'}] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-right rtl`}>
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#FBBF24]" />
          <h3 className="text-white font-bold text-base">مركز الإشعارات</h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
          {notifications.length} إشعار
        </span>
      </div>

      <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            لا توجد إشعارات جديدة حالياً
          </div>
        ) : (
          notifications.map((item) => (
            <div 
              key={item.id} 
              className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                item.is_read ? 'bg-white/[0.01] border-white/5 opacity-70' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                {item.type === 'alert' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                ) : item.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-[#FBBF24] mt-0.5 shrink-0" />
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-white">{item.title}</span>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.message}</p>
                  <span className="text-[10px] text-slate-500 mt-1">{item.created_at}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!item.is_read && (
                  <button 
                    type="button"
                    onClick={() => onMarkAsRead(item.id)}
                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    title="تعليم مقروء"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
