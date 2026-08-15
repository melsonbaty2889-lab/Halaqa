import React from 'react';
import { useTranslation } from 'react-i18next';
import { SendHorizontal } from 'lucide-react';

// استيراد المكونات القياسية ونظام الألوان الموحد
import { Card, Btn } from '@/components/UI/UI';
import { C } from '@/theme/colors';

export default function ReportMetrics({ 
  totalCount = 0, 
  completionPercentage = 0, 
  remainingCount = 0, 
  unsentCount = 0, 
  onBulkSend 
}) {
  const { t, i18n } = useTranslation();
  const isArabic = !i18n.language || i18n.language.startsWith('ar');

  // تنسيق الأرقام والنسب المئوية محلياً بحسب لغة/ثقافة المستخدم
  const formattedTotal = new Intl.NumberFormat(i18n.language).format(totalCount);
  const formattedPercentage = new Intl.NumberFormat(i18n.language, { 
    style: 'percent', 
    maximumFractionDigits: 0 
  }).format(completionPercentage / 100);
  const formattedRemaining = new Intl.NumberFormat(i18n.language).format(remainingCount);
  const formattedUnsent = new Intl.NumberFormat(i18n.language).format(unsentCount);

  return (
    <>
      {/* شبكة الإحصائيات الموحدة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
        
        {/* إجمالي الطلاب */}
        <Card style={{ padding: '12px 8px', textAlign: 'center', background: C.card, borderColor: C.border }}>
          <span style={{ fontSize: '0.72rem', color: C.textSub, display: 'block', fontWeight: 600 }}>
            {t('reports.metrics.total', { defaultValue: isArabic ? 'الإجمالي' : 'Total' })}
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: C.text, marginTop: '4px', display: 'block' }}>
            {formattedTotal}
          </span>
        </Card>

        {/* نسبة المرسل */}
        <Card style={{ padding: '12px 8px', textAlign: 'center', background: C.card, borderColor: C.border }}>
          <span style={{ fontSize: '0.72rem', color: C.textSub, display: 'block', fontWeight: 600 }}>
            {t('reports.metrics.sent', { defaultValue: isArabic ? 'المرسل' : 'Sent' })}
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: C.success, marginTop: '4px', display: 'block' }}>
            {formattedPercentage}
          </span>
        </Card>

        {/* المتبقي */}
        <Card style={{ padding: '12px 8px', textAlign: 'center', background: C.card, borderColor: C.border }}>
          <span style={{ fontSize: '0.72rem', color: C.textSub, display: 'block', fontWeight 600 }}>
            {t('reports.metrics.remaining', { defaultValue: isArabic ? 'المتبقي' : 'Remaining' })}
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: C.warning, marginTop: '4px', display: 'block' }}>
            {formattedRemaining}
          </span>
        </Card>

      </div>

      {/* زر الإرسال المتتابع الموحد */}
      {unsentCount > 0 && (
        <Btn
          variant="primary"
          onClick={onBulkSend}
          style={{
            width: '100%',
            marginBottom: '16px',
            padding: '12px',
            fontSize: '0.88rem',
            justifyContent: 'center',
            background: C.success,
            color: '#ffffff',
            border: 'none',
            fontWeight: 700
          }}
        >
          <SendHorizontal size={16} />
          <span>
            {t('reports.metrics.batch_send', { 
              count: formattedUnsent,
              defaultValue: isArabic 
                ? `بدء الإرسال المتتابع للمتبقين (${formattedUnsent})` 
                : `Batch Send Unsent (${formattedUnsent})` 
            })}
          </span>
        </Btn>
      )}
    </>
  );
}
