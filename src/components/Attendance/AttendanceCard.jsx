// src/components/Attendance/AttendanceCard.jsx
import React, { useState } from 'react';
import { 
  User, CheckCircle2, XCircle, Clock, 
  Send, Save, BookOpen, Star 
} from 'lucide-react';
import { formatName } from '@/utils/formatters';
import UI from '@/theme/styles';

const AttendanceCard = ({ student, onSaveAttendance, initialData = {}, t, isRtl }) => {
  const [status, setStatus] = useState(initialData.status || 'present');
  const [memorization, setMemorization] = useState(initialData.memorization || '');
  const [review, setReview] = useState(initialData.review || '');
  const [rating, setRating] = useState(initialData.rating || 5);
  const [notes, setNotes] = useState(initialData.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const attendanceData = {
        student_id: student.id,
        date: new Date().toISOString().split('T')[0],
        status,
        memorization,
        review,
        rating,
        notes,
      };
      await onSaveAttendance(attendanceData);
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
    setIsSaving(false);
  };

  const handleSendWhatsApp = () => {
    if (!student.phone) return;
    
    const cleanPhone = student.phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
    
    const message = `${t('attendance.whatsappReportTitle', 'تقرير الطالب')}: ${formatName(student.name)}
${t('attendance.statusLabel', 'حالة الحضور')}: ${status === 'present' ? 'حاضر ✅' : status === 'absent' ? 'غائب ❌' : 'مستأذن ⚠️'}
${t('attendance.newMemorization', 'الحفظ الجديد')}: ${memorization || '-'}
${t('attendance.review', 'المراجعة')}: ${review || '-'}
${t('attendance.rating', 'التقييم')}: ${'⭐'.repeat(rating)}
${t('attendance.notes', 'ملاحظات')}: ${notes || '-'}`;

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`${UI.card} space-y-4`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* هيدر الطالب */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-semantic-borderCard pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-semantic-surfaceInput border border-semantic-borderInput flex items-center justify-center text-semantic-textSecondary font-medium overflow-hidden shrink-0">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-semantic-textPrimary">{formatName(student.name)}</h3>
            <p className="text-xs text-semantic-textSecondary">{student.halaqa_name || ''}</p>
          </div>
        </div>

        {/* خيارات تحديد الحضور والغياب */}
        <div className="flex items-center gap-1.5 bg-semantic-surfaceInput/60 p-1 rounded-xl border border-semantic-borderInput">
          <button
            type="button"
            onClick={() => setStatus('present')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              status === 'present' 
                ? 'bg-semantic-successBg text-semantic-success border border-semantic-successBorder' 
                : 'text-semantic-textSecondary hover:text-semantic-textPrimary'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('attendance.present', 'حاضر')}
          </button>

          <button
            type="button"
            onClick={() => setStatus('absent')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              status === 'absent' 
                ? 'bg-semantic-dangerBg text-semantic-danger border border-semantic-danger/30' 
                : 'text-semantic-textSecondary hover:text-semantic-textPrimary'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            {t('attendance.absent', 'غائب')}
          </button>

          <button
            type="button"
            onClick={() => setStatus('excused')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              status === 'excused' 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                : 'text-semantic-textSecondary hover:text-semantic-textPrimary'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {t('attendance.excused', 'مستأذن')}
          </button>
        </div>
      </div>

      {/* تفاصيل الورد والتسميع (تظهر فقط عند الحضور) */}
      {status === 'present' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs text-semantic-textSecondary mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-semantic-actionPrimary" />
              {t('attendance.newMemorization', 'الحفظ الجديد')}
            </label>
            <input
              type="text"
              value={memorization}
              onChange={(e) => setMemorization(e.target.value)}
              placeholder=""
              className={UI.input}
            />
          </div>

          <div>
            <label className="block text-xs text-semantic-textSecondary mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              {t('attendance.review', 'المراجعة')}
            </label>
            <input
              type="text"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder=""
              className={UI.input}
            />
          </div>
        </div>
      )}

      {/* التقييم بالنجوم والملاحظات */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-semantic-textSecondary ml-2">{t('attendance.rating', 'التقييم')}:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-0.5 focus:outline-none transition-transform active:scale-125 cursor-pointer"
            >
              <Star 
                className={`w-4 h-4 ${
                  star <= rating ? 'text-amber-400 fill-amber-400' : 'text-semantic-textMuted'
                }`} 
              />
            </button>
          ))}
        </div>

        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder=""
          className={`${UI.input} flex-1`}
        />
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-semantic-borderCard">
        {student.phone && (
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-semantic-successBg text-semantic-success hover:bg-semantic-success/20 border border-semantic-successBorder rounded-xl text-xs font-medium transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {t('attendance.sendWhatsApp', 'إرسال للواتساب')}
          </button>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`${UI.btnPrimary} !w-auto px-4 py-1.5 text-xs`}
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? t('attendance.saving', 'جاري الحفظ...') : t('attendance.saveRating', 'حفظ التقييم')}
        </button>
      </div>
    </div>
  );
};

export default AttendanceCard;
