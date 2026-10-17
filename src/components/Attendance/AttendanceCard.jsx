// src/components/Attendance/AttendanceCard.jsx
import React from 'react';
import { 
  User, CheckCircle2, XCircle, Clock, 
  Send, BookOpen, Star, MessageSquare 
} from 'lucide-react';
import { formatName } from '@/utils/formatters';
import UI from '@/theme/styles';

const AttendanceCard = ({ 
  student, 
  data = {}, 
  onChangeField, 
  t, 
  isRtl 
}) => {
  const status = data.status || 'present';
  const memorization = data.new_memorization || '';
  const review = data.retention_assignment || '';
  const grade = data.session_grade ?? 10; // من 10
  const rating = Math.round(grade / 2) || 5; // تحويل الدرجة لنجوم (1-5)
  const notes = data.notes || '';

  // تحديث حالة الحضور
  const handleStatusChange = (newStatus) => {
    onChangeField(student.id, 'status', newStatus);
  };

  // إرسال تقرير الواتساب
  const handleSendMessaging = () => {
    if (!student.phone) return;
    
    const cleanPhone = student.phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
    
    const statusText = 
      status === 'present' ? t('attendance.present', 'حاضر') : 
      status === 'absent' ? t('attendance.absent', 'غائب') : 
      t('attendance.excused', 'مستأذن');

    const message = `*${t('attendance.reportTitle', 'تقرير الأداء الأكاديمي')}*
----------------------------------
*${t('attendance.studentName', 'الطالب')}:* ${formatName(student.name)}
*${t('attendance.attendanceStatus', 'حالة الحضور')}:* ${statusText}
${status === 'present' ? `*${t('attendance.newMemorization', 'الحفظ الجديد')}:* ${memorization \vert{}\vert{} '-'}\n*${t('attendance.retentionReview', 'المراجعة والتثبيت')}:* ${review \vert{}\vert{} '-'}\n*${t('attendance.dailyRating', 'التقييم اليومي')}:* ${'⭐'.repeat(rating)} (${rating}/5)` : ''}
*${t('attendance.instructorNotes', 'ملاحظات المعلم')}:* ${notes || '-'}`;

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`${UI.card} space-y-3.5 transition-all duration-200`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1️⃣ هيدر الطالب + أزرار تحديد الحضور */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-semantic-borderCard pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-semantic-surfaceInput border border-semantic-borderInput flex items-center justify-center text-semantic-textSecondary font-medium overflow-hidden shrink-0">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-semantic-textPrimary text-sm">{formatName(student.name)}</h3>
            {student.halaqa_name && (
              <p className="text-[11px] text-semantic-textMuted">{student.halaqa_name}</p>
            )}
          </div>
        </div>

        {/* خيارات تحديد الحضور والغياب */}
        <div className="flex items-center gap-1 bg-semantic-surfaceInput/60 p-1 rounded-xl border border-semantic-borderInput">
          <button
            type="button"
            onClick={() => handleStatusChange('present')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            onClick={() => handleStatusChange('absent')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            onClick={() => handleStatusChange('excused')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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

      {/* 2️⃣ تفاصيل التسميع والورد (تظهر فقط للحاضرين) */}
      {status === 'present' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
            <div>
              <label className="block text-[11px] font-semibold text-semantic-textSecondary mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-semantic-actionPrimary" />
                {t('attendance.newMemorization', 'الحفظ الجديد')}
              </label>
              <input
                type="text"
                value={memorization}
                onChange={(e) => onChangeField(student.id, 'new_memorization', e.target.value)}
                placeholder={t('attendance.memorizationPlaceholder', 'مثال: سورة البقرة (1-15)')}
                className={UI.input}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-semantic-textSecondary mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                {t('attendance.retentionReview', 'المراجعة والتثبيت')}
              </label>
              <input
                type="text"
                value={review}
                onChange={(e) => onChangeField(student.id, 'retention_assignment', e.target.value)}
                placeholder={t('attendance.reviewPlaceholder', 'مثال: الجزء الأول كاملاً')}
                className={UI.input}
              />
            </div>
          </div>

          {/* التقييم بالنجوم والملاحظات */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-semibold text-semantic-textSecondary">{t('attendance.dailyRating', 'التقييم')}:</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => onChangeField(student.id, 'session_grade', star * 2)}
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
            </div>

            <div className="flex-1 relative">
              <input
                type="text"
                value={notes}
                onChange={(e) => onChangeField(student.id, 'notes', e.target.value)}
                placeholder={t('attendance.notesPlaceholder', 'ملاحظات الأداء اليومي...')}
                className={UI.input}
              />
            </div>

            {student.phone && (
              <button
                type="button"
                onClick={handleSendMessaging}
                title={t('attendance.shareReport', 'إرسال التقرير')}
                className="self-end sm:self-center p-2 rounded-xl bg-semantic-successBg text-semantic-success hover:bg-semantic-success/20 border border-semantic-successBorder transition-all cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </>
      ) : (
        /* 3️⃣ في حالة الغياب أو الاستئذان: إظهار حقل ملاحظات الغياب فقط */
        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1">
            <input
              type="text"
              value={notes}
              onChange={(e) => onChangeField(student.id, 'notes', e.target.value)}
              placeholder={
                status === 'absent' 
                  ? t('attendance.absentReasonPlaceholder', 'سبب الغياب (إن وجد)...')
                  : t('attendance.excusedReasonPlaceholder', 'تفاصيل إذن الغياب...')
              }
              className={UI.input}
            />
          </div>

          {student.phone && (
            <button
              type="button"
              onClick={handleSendMessaging}
              className="p-2 rounded-xl bg-semantic-surfaceInput text-semantic-textSecondary hover:text-semantic-textPrimary border border-semantic-borderInput transition-all cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceCard;
