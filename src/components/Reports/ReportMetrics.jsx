import React from 'react';
import { useTranslation } from 'react-i18next';
import { Send, CheckCircle2, Clock, AlertCircle, Users } from 'lucide-react';
import { Card, Btn } from '@/components/UI/UI';

export default function ReportMetrics({
  totalCount = 0,
  completionPercentage = 0,
  remainingCount = 0,
  unsentCount = 0,
  onBulkSend
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isArabic = currentLang.startsWith('ar');

  // تقريب نسبة الإنجاز لتجنب ظهور الكسور الطويلة
  const roundedPercentage = Math.round(completionPercentage || 0);

  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* البطاقات الرئيسية للإحصائيات (متجاوبة: 2 في الشاشات الصغيرة، 4 في الشاشات الكبيرة) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        
        {/* إجمالي الطلاب */}
        <Card className="p-3 text-center bg-slate-900/90 border-slate-800 rounded-xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400 font-semibold">
              {t('reports.metrics.total', { defaultValue: isArabic ? 'الإجمالي' : 'Total' })}
            </span>
          </div>
          <span className="text-lg font-bold text-slate-100">
            {totalCount}
          </span>
        </Card>

        {/* نسبة الإرسال مع شريط تقدم مصغر */}
        <Card className="p-3 text-center bg-slate-900/90 border-slate-800 rounded-xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-400 font-semibold">
              {t('reports.metrics.completion', { defaultValue: isArabic ? 'نسبة الإنجاز' : 'Completion' })}
            </span>
          </div>
          <span className="text-lg font-bold text-emerald-400">
            {roundedPercentage}%
          </span>
          {/* شريط التقدم المرئي */}
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(0, roundedPercentage))}%` }}
            />
          </div>
        </Card>

        {/* المتبقي */}
        <Card className="p-3 text-center bg-slate-900/90 border-slate-800 rounded-xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-slate-400 font-semibold">
              {t('reports.metrics.remaining', { defaultValue: isArabic ? 'المتبقي' : 'Remaining' })}
            </span>
          </div>
          <span className="text-lg font-bold text-amber-400">
            {remainingCount}
          </span>
        </Card>

        {/* غير مرسل */}
        <Card className="p-3 text-center bg-slate-900/90 border-slate-800 rounded-xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[11px] text-slate-400 font-semibold">
              {t('reports.metrics.unsent', { defaultValue: isArabic ? 'غير مرسل' : 'Unsent' })}
            </span>
          </div>
          <span className="text-lg font-bold text-red-400">
            {unsentCount}
          </span>
        </Card>
      </div>

      {/* زر الإرسال الجماعي التتابعي */}
      {unsentCount > 0 && (
        <Btn
          variant="primary"
          onClick={onBulkSend}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 border-none text-white font-bold text-sm flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-emerald-950/30 transition-all cursor-pointer active:scale-[0.99]"
        >
          <Send className="w-4 h-4" />
          <span>
            {t('reports.metrics.send_next', { 
              defaultValue: isArabic 
                ? `إرسال التالي تلقائياً (${unsentCount} متبقي)` 
                : `Send Next Automatically (${unsentCount} remaining)` 
            })}
          </span>
        </Btn>
      )}
    </div>
  );
}
