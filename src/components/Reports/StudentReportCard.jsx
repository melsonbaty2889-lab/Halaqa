import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, RotateCcw, Copy, Check, Save, X, Edit, PhoneCall, Loader2, MessageSquare } from 'lucide-react';
import { Card, Btn, Input } from '@/components/UI/UI';
import { UI } from '@/theme/styles'; // استيراد الأنماط الجاهزة المعتمدة

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
      className={`p-3.5 rounded-xl flex flex-col gap-3 border transition-all duration-200 ${
        isSent 
          ? 'bg-semantic-surfaceCard border-semantic-success/30 opacity-90' 
          : `${UI.card}`
      }`}
    >
      {/* الهيدر: اسم الطالب والرقم وخيارات التعديل */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-xs sm:text-sm text-semantic-textPrimary truncate">
              {studentName}
            </span>
            {isSent && (
              <span className="bg-semantic-successBg text-semantic-success border border-semantic-successBorder px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shrink-0">
                <CheckCircle2 size={10} /> 
                {t('reports.card.sent', { defaultValue: isArabic ? "مرسل" : "Sent" })}
              </span>
            )}
          </div>

          {/* نموذج إدخال/تعديل رقم الهاتف */}
          {isEditingPhone ? (
            <div className="flex items-center gap-1.5 mt-2">
              <Input
                type="tel"
                value={tempPhoneValue}
                onChange={(e) => setTempPhoneValue(e.target.value)}
                autoFocus
                className={`${UI.input} py-1 px-2 text-xs w-36`}
              />
              <Btn 
                onClick={() => onSavePhone(student.id)} 
                disabled={savingPhone} 
                className="py-1 px-2.5 text-[11px] bg-semantic-success hover:opacity-90 border-none text-semantic-textPrimary font-semibold rounded-lg flex items-center gap-1"
              >
                {savingPhone ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
                {t('common.save', { defaultValue: isArabic ? "حفظ" : "Save" })}
              </Btn>
              <Btn 
                variant="outline" 
                onClick={onCancelEditPhone} 
                className="p-1 border-semantic-borderInput hover:bg-semantic-surfaceSecondary rounded-lg text-semantic-textSecondary"
              >
                <X size={12} />
              </Btn>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-[11px] dir-ltr ${parentPhone ? 'text-semantic-textSecondary' : 'text-semantic-actionPrimary font-medium'}`}>
                {parentPhone || t('reports.card.no_phone', { defaultValue: isArabic ? 'لا يوجد رقم' : 'No Phone' })}
              </span>
              <button 
                onClick={() => onStartEditPhone(student.id, parentPhone)} 
                className="bg-transparent border-none text-semantic-actionPrimary p-0 text-[11px] cursor-pointer flex items-center gap-0.5 font-semibold hover:underline"
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
            className="bg-semantic-surfaceSecondary hover:bg-semantic-borderInput text-semantic-textSecondary hover:text-semantic-textPrimary border border-semantic-borderInput rounded-lg p-1.5 cursor-pointer transition-all"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>

      {/* تفاصيل السجل والدرجات - السطح الداخلي (Surface Input) */}
      <div className="grid grid-cols-3 gap-1.5 bg-semantic-surfaceInput border border-semantic-borderInput p-2.5 rounded-lg text-center text-xs">
        <div className="overflow-hidden">
          <span className="text-semantic-textSecondary block text-[10px] mb-0.5 font-medium">
            {t('reports.card.memorization', { defaultValue: isArabic ? "حفظ" : "Mem" })}
          </span>
          <span className="text-semantic-textPrimary font-semibold truncate block">
            {safeString(record?.new_memorization) || '---'}
          </span>
        </div>
        <div className="overflow-hidden">
          <span className="text-semantic-textSecondary block text-[10px] mb-0.5 font-medium">
            {t('reports.card.review', { defaultValue: isArabic ? "مراجعة" : "Rev" })}
          </span>
          <span className="text-semantic-textPrimary font-semibold truncate block">
            {safeString(record?.review) || '---'}
          </span>
        </div>
        <div className="overflow-hidden">
          <span className="text-semantic-textSecondary block text-[10px] mb-0.5 font-medium">
            {t('reports.card.grade', { defaultValue: isArabic ? "تقييم" : "Grade" })}
          </span>
          <span className="text-semantic-actionPrimary font-bold truncate block">
            {safeString(record?.session_grade) || '---'}
          </span>
        </div>
      </div>

      {/* أزرار الإجراءات (نسخ وإرسال) */}
      <div className="flex gap-2">
        <Btn 
          variant="outline" 
          onClick={() => onCopy(student, record)} 
          className="p-2 border-semantic-borderInput hover:bg-semantic-surfaceSecondary rounded-xl transition-all"
          title={t('reports.card.copy', { defaultValue: isArabic ? "نسخ التقرير" : "Copy Report" })}
        >
          {copiedId === student.id ? <Check size={14} className="text-semantic-success" /> : <Copy size={14} className="text-semantic-textSecondary" />}
        </Btn>

        {parentPhone ? (
          <Btn 
            onClick={() => onSendWhatsApp(student, record)} 
            className={`flex-1 py-2 font-bold text-xs justify-center gap-1.5 rounded-xl transition-all ${
              isSent 
                ? 'bg-semantic-surfaceSecondary text-semantic-textSecondary border-semantic-borderInput hover:bg-semantic-borderInput' 
                : 'bg-semantic-success hover:opacity-90 text-semantic-textPrimary border-none shadow-md shadow-semantic-success/10'
            }`}
          >
            <MessageSquare size={13} />
            <span>
              {isSent 
                ? t('reports.card.resend', { defaultValue: isArabic ? "إعادة إرسال" : "Resend" }) 
                : t('reports.card.send_whatsapp', { defaultValue: isArabic ? "إرسال عبر الواتساب" : "Send WhatsApp" })}
            </span>
          </Btn>
        ) : (
          <Btn 
            variant="outline" 
            onClick={() => onStartEditPhone(student.id, '')} 
            className="flex-1 border-dashed border-semantic-actionPrimary/50 text-semantic-actionPrimary py-2 font-semibold text-xs justify-center gap-1 hover:bg-semantic-actionPrimary/10 rounded-xl"
          >
            <PhoneCall size={12} />
            <span>{t('reports.card.add_phone', { defaultValue: isArabic ? "أضف رقم الهاتف" : "Add Phone" })}</span>
          </Btn>
        )}
      </div>
    </Card>
  );
}
