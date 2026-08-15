import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, RotateCcw, Copy, Check, Save, X, Edit, PhoneCall, Loader2 } from 'lucide-react';
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
      className={`p-3 rounded-lg flex flex-col gap-2.5 border transition-all ${
        isSent ? 'border-emerald-500/40 bg-slate-900/90' : 'border-slate-800 bg-slate-900'
      }`}
    >
      {/* الهيدر: اسم الطالب والرقم وخيارات التعديل */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-slate-100">{studentName}</span>
            {isSent && (
              <span className="bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 size={10} /> 
                {t('reports.card.sent', { defaultValue: isArabic ? "مرسل" : "Sent" })}
              </span>
            )}
          </div>

          {/* نموذج إدخال/تعديل رقم الهاتف */}
          {isEditingPhone ? (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Input
                type="tel"
                value={tempPhoneValue}
                onChange={(e) => setTempPhoneValue(e.target.value)}
                autoFocus
                className="py-0.5 px-2 text-xs w-32 border-emerald-500"
              />
              <Btn 
                variant="primary" 
                onClick={() => onSavePhone(student.id)} 
                disabled={savingPhone} 
                className="py-1 px-2 text-[11px] bg-emerald-500 border-emerald-500 text-white"
              >
                {savingPhone ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
                {t('common.save', { defaultValue: isArabic ? "حفظ" : "Save" })}
              </Btn>
              <Btn 
                variant="outline" 
                onClick={onCancelEditPhone} 
                className="p-1"
              >
                <X size={12} className="text-slate-400" />
              </Btn>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-[11px] ${parentPhone ? 'text-slate-400' : 'text-amber-400'}`}>
                {parentPhone || t('reports.card.no_phone', { defaultValue: isArabic ? 'لا يوجد رقم' : 'No Phone' })}
              </span>
              <button 
                onClick={() => onStartEditPhone(student.id, parentPhone)} 
                className="bg-transparent border-none text-amber-400 p-0 text-[11px] cursor-pointer flex items-center gap-0.5 font-semibold hover:underline"
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
            className="bg-transparent border-none text-slate-400 cursor-pointer p-0.5 hover:text-slate-200 transition-colors"
          >
            <RotateCcw size={13} />
          </button>
        )}
      </div>

      {/* تفاصيل السجل والدرجات */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-2 rounded-md text-center text-xs">
        <div>
          <span className="text-slate-400 block text-[10px]">
            {t('reports.card.memorization', { defaultValue: isArabic ? "حفظ" : "Mem" })}
          </span>
          <span className="text-slate-200 font-semibold">
            {safeString(record?.new_memorization) || '---'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">
            {t('reports.card.review', { defaultValue: isArabic ? "مراجعة" : "Rev" })}
          </span>
          <span className="text-slate-200 font-semibold">
            {safeString(record?.review) || '---'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">
            {t('reports.card.grade', { defaultValue: isArabic ? "تقييم" : "Grade" })}
          </span>
          <span className="text-amber-400 font-bold">
            {safeString(record?.session_grade) || '---'}
          </span>
        </div>
      </div>

      {/* أزرار الإجراءات (نسخ وإرسال) */}
      <div className="flex gap-2">
        <Btn 
          variant="outline" 
          onClick={() => onCopy(student, record)} 
          className="p-2 border-slate-800"
        >
          {copiedId === student.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-slate-400" />}
        </Btn>

        {parentPhone ? (
          <Btn 
            variant="primary" 
            onClick={() => onSendWhatsApp(student, record)} 
            className={`flex-1 py-2 font-bold text-xs justify-center ${
              isSent 
                ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' 
                : 'bg-amber-500 text-slate-950 border-amber-500 hover:bg-amber-600'
            }`}
          >
            {isSent 
              ? t('reports.card.resend', { defaultValue: isArabic ? "إعادة إرسال" : "Resend" }) 
              : t('reports.card.send_whatsapp', { defaultValue: isArabic ? "إرسال عبر الواتساب" : "Send WhatsApp" })}
          </Btn>
        ) : (
          <Btn 
            variant="outline" 
            onClick={() => onStartEditPhone(student.id, '')} 
            className="flex-1 border-dashed border-amber-500/50 text-amber-400 py-2 font-semibold text-xs justify-center gap-1 hover:bg-amber-500/10"
          >
            <PhoneCall size={12} />
            <span>{t('reports.card.add_phone', { defaultValue: isArabic ? "أضف رقم الهاتف" : "Add Phone" })}</span>
          </Btn>
        )}
      </div>
    </Card>
  );
}
