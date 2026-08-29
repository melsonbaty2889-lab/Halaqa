import React from 'react';
import { AlertOctagon, MessageCircle, LogOut } from 'lucide-react';

// 🛡️ دالة آمنة لمعالجة الكائنات المترجمة { ar: "..." } ومنع الخطأ #31
const getSafeText = (val, defaultVal = '') => {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (val.ar) return String(val.ar);
    if (val.en) return String(val.en);
    const firstVal = Object.values(val)[0];
    if (firstVal && typeof firstVal !== 'object') return String(firstVal);
    return defaultVal;
  }
  return String(val);
};

export default function BlockedView({ academy, onLogout, isRtl = true }) {
  const academyName = getSafeText(academy?.name, isRtl ? "الأكاديمية" : "Academy");
  const blockReason = getSafeText(
    academy?.blocked_reason, 
    isRtl 
      ? "تم تعليق حساب الأكاديمية مؤقتاً من قبل إدارة المنصة بسبب انتهاء الاشتراك أو مراجعة الحساب." 
      : "Your academy account has been suspended by administration."
  );

  const handleSupportContact = () => {
    const supportPhone = "201552518406"; // 👈 استبدل هذا الرقم برقم الواتساب الخاص بك
    const msg = encodeURIComponent(`السلام عليكم، أنا مالك أكاديمية (${academyName})، تم تعليق الحساب وأود الاستفسار والتفعيل.`);
    window.open(`https://wa.me/${supportPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 text-center shadow-2xl space-y-5">
        
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-500">
          <AlertOctagon size={36} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            {isRtl ? 'تم تعليق حساب الأكاديمية' : 'Academy Account Suspended'}
          </h2>
          <p className="text-sm font-semibold text-rose-400">
            {academyName}
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 leading-relaxed text-right">
          {blockReason}
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleSupportContact}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-0 py-3 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle size={18} />
            {isRtl ? 'التواصل مع الإدارة عبر الواتساب' : 'Contact Support on WhatsApp'}
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border-0 py-2.5 rounded-xl font-semibold text-xs cursor-pointer flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut size={16} />
              {isRtl ? 'تسجيل الخروج' : 'Log Out'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
