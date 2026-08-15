import React from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { C } from '@/theme/colors';
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

  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* البطاقات الأربع الرئيسية للإحصائيات */}
      <div className="grid grid-cols-4 gap-2">
        {/* إجمالي الطلاب */}
        <Card className="p-3 text-center bg-slate-900 border-slate-800">
          <span className="text-[11px] text-slate-400 block font-semibold">
            {t('reports.metrics.total', { defaultValue: isArabic ? 'الإجمالي' : 'Total' })}
          </span>
          <span className="text-base font-bold text-slate-100">
            {totalCount}
          </span>
        </Card>

        {/* نسبة الإرسال */}
        <Card className="p-3 text-center bg-slate-900 border-slate-800">
          <span className="text-[11px] text-slate-400 block font-semibold">
            {t('reports.metrics.completion', { defaultValue: isArabic ? 'نسبة الإنجاز' : 'Completion' })}
          </span>
          <span className="text-base font-bold text-emerald-400">
            {completionPercentage}%
          </span>
        </Card>

        {/* المتبقي */}
        <Card className="p-3 text-center bg-slate-900 border-slate-800">
          <span className="text-[11px] text-slate-400 block font-semibold">
            {t('reports.metrics.remaining', { defaultValue: isArabic ? 'المتبقي' : 'Remaining' })}
          </span>
          <span className="text-base font-bold text-amber-400">
            {remainingCount}
          </span>
        </Card>

        {/* غير مرسل */}
        <Card className="p-3 text-center bg-slate-900 border-slate-800">
          <span className="text-[11px] text-slate-400 block font-semibold">
            {t('reports.metrics.unsent', { defaultValue: isArabic ? 'غير مرسل' : 'Unsent' })}
          </span>
          <span className="text-base font-bold text-red-400">
            {unsentCount}
          </span>
        </Card>
      </div>

      {/* زر الإرسال الجماعي التتابعي */}
      {unsentCount > 0 && (
        <Btn
          variant="primary"
          onClick={onBulkSend}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 border-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 rounded-lg transition-all"
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
