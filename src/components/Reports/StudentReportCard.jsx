// src/components/Reports/StudentReportCard.jsx
import React from 'react';
import { CheckCircle2, RotateCcw, Copy, Check, Save, X, Edit, PhoneCall, Loader2 } from 'lucide-react';

export default function StudentReportCard({
  student,
  record,
  isSent,
  parentPhone,
  isEditingPhone,
  tempPhoneValue,
  savingPhone,
  copiedId,
  isRtl,
  safeString,
  onCopy,
  onSendWhatsApp,
  onResetSent,
  onStartEditPhone,
  onSavePhone,
  onCancelEditPhone,
  setTempPhoneValue
}) {
  const studentName = safeString(student?.name || student?.student_name);

  return (
    <div style={{ background: '#0f172a', border: `1px solid ${isSent ? 'rgba(16, 185, 129, 0.25)' : '#1e293b'}`, borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: '600', fontSize: '12px', color: '#ffffff' }}>{studentName}</span>
            {isSent && (
              <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '1px 5px', borderRadius: '4px', fontSize: '9px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <CheckCircle2 size={9} /> {isRtl ? "مرسل" : "Sent"}
              </span>
            )}
          </div>

          {isEditingPhone ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <input
                type="tel"
                value={tempPhoneValue}
                onChange={(e) => setTempPhoneValue(e.target.value)}
                autoFocus
                style={{ background: '#090d16', border: '1px solid #10b981', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', outline: 'none', width: '120px' }}
              />
              <button onClick={() => onSavePhone(student.id)} disabled={savingPhone} style={{ background: '#10b981', border: 'none', color: '#090d16', padding: '3px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                {savingPhone ? <Loader2 size={9} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={9} />}
                {isRtl ? "حفظ" : "Save"}
              </button>
              <button onClick={onCancelEditPhone} style={{ background: '#1e293b', border: 'none', color: '#94a3b8', padding: '3px 5px', borderRadius: '4px', cursor: 'pointer' }}>
                <X size={10} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '10px', color: parentPhone ? '#64748b' : '#f59e0b' }}>
                {parentPhone || (isRtl ? 'لا يوجد رقم' : 'No Phone')}
              </span>
              <button onClick={() => onStartEditPhone(student.id, parentPhone)} style={{ background: 'transparent', border: 'none', color: '#f59e0b', padding: 0, fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Edit size={8} />
                {parentPhone ? (isRtl ? "تعديل" : "Edit") : (isRtl ? "+ إضافة" : "+ Add")}
              </button>
            </div>
          )}
        </div>

        {isSent && (
          <button onClick={() => onResetSent(student.id)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}>
            <RotateCcw size={11} />
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', background: '#090d16', padding: '5px 8px', borderRadius: '6px', textAlign: 'center', fontSize: '10px' }}>
        <div><span style={{ color: '#64748b', display: 'block' }}>{isRtl ? "حفظ" : "Mem"}</span><span style={{ color: '#f8fafc', fontWeight: '500' }}>{safeString(record?.new_memorization) || '---'}</span></div>
        <div><span style={{ color: '#64748b', display: 'block' }}>{isRtl ? "مراجعة" : "Rev"}</span><span style={{ color: '#f8fafc', fontWeight: '500' }}>{safeString(record?.review) || '---'}</span></div>
        <div><span style={{ color: '#64748b', display: 'block' }}>{isRtl ? "تقييم" : "Grade"}</span><span style={{ color: '#f59e0b', fontWeight: '600' }}>{safeString(record?.session_grade) || '---'}</span></div>
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={() => onCopy(student, record)} style={{ background: '#1e293b', border: 'none', color: '#cbd5e1', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>
          {copiedId === student.id ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
        </button>

        {parentPhone ? (
          <button onClick={() => onSendWhatsApp(student, record)} style={{ flex: 1, background: isSent ? '#1e293b' : '#f59e0b', color: isSent ? '#64748b' : '#090d16', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}>
            {isSent ? (isRtl ? "إعادة إرسال" : "Resend") : (isRtl ? "إرسال عبر الواتساب" : "Send WhatsApp")}
          </button>
        ) : (
          <button onClick={() => onStartEditPhone(student.id, '')} style={{ flex: 1, background: '#1e293b50', color: '#f59e0b', border: '1px dashed #f59e0b40', padding: '6px 10px', borderRadius: '6px', fontWeight: '600', fontSize: '10.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <PhoneCall size={11} />
            {isRtl ? "أضف رقم الهاتف" : "Add Phone"}
          </button>
        )}
      </div>
    </div>
  );
}
