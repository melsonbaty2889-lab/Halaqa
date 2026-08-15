import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, RotateCcw, Copy, Check, Save, X, Edit, PhoneCall, Loader2 } from 'lucide-react';

// استيراد نظام الألوان والمكونات القياسية للمشروع
import { C } from '@/theme/colors';
import { Card, Btn, Input } from '@/components/UI/UI';

export default function StudentReportCard({
  student,
  record,
  isSent,
  parentPhone,
  isEditingPhone,
  tempPhoneValue,
  savingPhone,
  copiedId,
  safeString,
  onCopy,
  onSendWhatsApp,
  onResetSent,
  onStartEditPhone,
  onSavePhone,
  onCancelEditPhone,
  setTempPhoneValue
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isArabic = currentLang.startsWith('ar');

  const studentName = safeString(student?.name || student?.student_name);

  return (
    <Card 
      style={{ 
        background: C.card, 
        border: `1px solid ${isSent ? `${C.emerald}40` : C.border}`, 
        borderRadius: '10px', 
        padding: '12px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px' 
      }}
    >
      {/* الهيدر: اسم الطالب والرقم وخيارات التعديل */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: '700', fontSize: '0.85rem', color: C.text }}>{studentName}</span>
            {isSent && (
              <span style={{ 
                background: `${C.emerald}15`, 
                color: C.emerald, 
                padding: '2px 6px', 
                borderRadius: '4px', 
                fontSize: '0.65rem', 
                fontWeight: '700', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '3px' 
              }}>
                <CheckCircle2 size={10} /> 
                {t('reports.card.sent', { defaultValue: isArabic ? "مرسل" : "Sent" })}
              </span>
            )}
          </div>

          {/* نموذج إدخال/تعديل رقم الهاتف */}
          {isEditingPhone ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <Input
                type="tel"
                value={tempPhoneValue}
                onChange={(e) => setTempPhoneValue(e.target.value)}
                autoFocus
                style={{ 
                  padding: '2px 8px', 
                  fontSize: '0.75rem', 
                  width: '130px', 
                  borderColor: C.emerald 
                }}
              />
              <Btn 
                variant="primary" 
                onClick={() => onSavePhone(student.id)} 
                disabled={savingPhone} 
                style={{ 
                  padding: '4px 8px', 
                  fontSize: '0.7rem', 
                  background: C.emerald,
                  borderColor: C.emerald,
                  color: '#ffffff'
                }}
              >
                {savingPhone ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={10} />}
                {t('common.save', { defaultValue: isArabic ? "حفظ" : "Save" })}
              </Btn>
              <Btn 
                variant="outline" 
                onClick={onCancelEditPhone} 
                style={{ padding: '4px 6px' }}
              >
                <X size={12} style={{ color: C.textSub }} />
              </Btn>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.72rem', color: parentPhone ? C.textSub : C.warning }}>
                {parentPhone || t('reports.card.no_phone', { defaultValue: isArabic ? 'لا يوجد رقم' : 'No Phone' })}
              </span>
              <button 
                onClick={() => onStartEditPhone(student.id, parentPhone)} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: C.warning, 
                  padding: 0, 
                  fontSize: '0.7rem', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '2px',
                  fontWeight: 600
                }}
              >
                <Edit size={10} />
                {parentPhone 
                  ? t('common.edit', { defaultValue: isArabic ? "تعديل" : "Edit" }) 
                  : t('common.add', { defaultValue: isArabic ? "+ إضافة" : "+ Add" })}
              </button>
            </div>
          )}
        </div>

        {/* إعادة تعيين حالة الإرسال */}
        {isSent && (
          <button 
            onClick={() => onResetSent(student.id)} 
            title={t('reports.card.reset_sent', { defaultValue: isArabic ? "إعادة تعيين الحالة" : "Reset Status" })}
            style={{ background: 'transparent', border: 'none', color: C.textSub, cursor: 'pointer', padding: '2px' }}
          >
            <RotateCcw size={13} />
          </button>
        )}
      </div>

      {/* تفاصيل السجل والدرجات */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '6px', 
        background: C.bg, 
        padding: '6px 10px', 
        borderRadius: '6px', 
        textAlign: 'center', 
        fontSize: '0.72rem' 
      }}>
        <div>
          <span style={{ color: C.textSub, display: 'block', fontSize: '0.65rem' }}>
            {t('reports.card.memorization', { defaultValue: isArabic ? "حفظ" : "Mem" })}
          </span>
          <span style={{ color: C.text, fontWeight: '600' }}>
            {safeString(record?.new_memorization) || '---'}
          </span>
        </div>
        <div>
          <span style={{ color: C.textSub, display: 'block', fontSize: '0.65rem' }}>
            {t('reports.card.review', { defaultValue: isArabic ? "مراجعة" : "Rev" })}
          </span>
          <span style={{ color: C.text, fontWeight: '600' }}>
            {safeString(record?.review) || '---'}
          </span>
        </div>
        <div>
          <span style={{ color: C.textSub, display: 'block', fontSize: '0.65rem' }}>
            {t('reports.card.grade', { defaultValue: isArabic ? "تقييم" : "Grade" })}
          </span>
          <span style={{ color: C.warning, fontWeight: '700' }}>
            {safeString(record?.session_grade) || '---'}
          </span>
        </div>
      </div>

      {/* أزرار الإجراءات (نسخ وإرسال) */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <Btn 
          variant="outline" 
          onClick={() => onCopy(student, record)} 
          style={{ padding: '8px 12px', borderColor: C.border }}
        >
          {copiedId === student.id ? <Check size={14} style={{ color: C.emerald }} /> : <Copy size={14} style={{ color: C.textSub }} />}
        </Btn>

        {parentPhone ? (
          <Btn 
            variant="primary" 
            onClick={() => onSendWhatsApp(student, record)} 
            style={{ 
              flex: 1, 
              background: isSent ? C.card : C.warning, 
              color: isSent ? C.textSub : '#000000', 
              borderColor: isSent ? C.border : C.warning, 
              padding: '8px', 
              fontWeight: '700', 
              fontSize: '0.78rem',
              justifyContent: 'center'
            }}
          >
            {isSent 
              ? t('reports.card.resend', { defaultValue: isArabic ? "إعادة إرسال" : "Resend" }) 
              : t('reports.card.send_whatsapp', { defaultValue: isArabic ? "إرسال عبر الواتساب" : "Send WhatsApp" })}
          </Btn>
        ) : (
          <Btn 
            variant="outline" 
            onClick={() => onStartEditPhone(student.id, '')} 
            style={{ 
              flex: 1, 
              borderColor: `${C.warning}50`, 
              color: C.warning, 
              padding: '8px', 
              fontWeight: '600', 
              fontSize: '0.75rem', 
              justifyContent: 'center',
              borderStyle: 'dashed'
            }}
          >
            <PhoneCall size={12} />
            <span>{t('reports.card.add_phone', { defaultValue: isArabic ? "أضف رقم الهاتف" : "Add Phone" })}</span>
          </Btn>
        )}
      </div>
    </Card>
  );
}
