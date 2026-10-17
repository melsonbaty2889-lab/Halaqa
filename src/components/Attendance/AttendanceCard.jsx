// src/components/Attendance/AttendanceCard.jsx
import React from 'react';
import { 
  User, CheckCircle2, XCircle, Clock, 
  Send, BookOpen, Star, FileText, Award, Sparkles 
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
  const lessonActivity = data.lesson_activity || '';
  const grade = data.session_grade ?? 10;
  const rating = Math.round(grade / 2) || 5;
  const notes = data.notes || '';

  const track = student.track || student.halaqa_track || 'hifz';

  const handleStatusChange = (newStatus) => {
    onChangeField(student.id, 'status', newStatus);
  };

  const handleSendMessaging = () => {
    if (!student.phone) return;
    
    const cleanPhone = student.phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
    
    const statusText = 
      status === 'present' ? t('attendance.present', 'حاضر') : 
      status === 'absent' ? t('attendance.absent', 'غائب') : 
      t('attendance.excused', 'مستأذن');

    const memText = memorization || '-';
    const revText = review || '-';
    const lessonText = lessonActivity ? `\n*${t('attendance.curriculumLesson', 'الدرس التربوي')}:* ${lessonActivity}` : '';
    const notesText = notes || '-';
    const starsStr = '⭐'.repeat(rating);

    const presentDetails = status === 'present' 
      ? `*${t('attendance.newMemorization', 'الحفظ الجديد')}:* ${memText}\n*${t('attendance.retentionReview', 'المراجعة والتثبيت')}:* ${revText}${lessonText}\n*${t('attendance.dailyRating', 'التقييم')}:* ${starsStr} (${rating}/5)\n`
      : '';

    const message = `*${t('attendance.reportTitle', 'تقرير الأداء الأكاديمي')}*
----------------------------------
*${t('attendance.studentName', 'الطالب')}:* ${formatName(student.name)}
*${t('attendance.attendanceStatus', 'حالة الحضور')}:* ${statusText}
${presentDetails}*${t('attendance.instructorNotes', 'ملاحظات المعلم')}:* ${notesText}`;

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const renderTrackFields = () => {
    switch (track) {
      case 'muraja':
        return (
          <div className="w-full">
            <label className="block text-xs font-semibold text-semantic-textSecondary mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              {t('attendance.retentionReview', 'مقدار المراجعة والتثبيت')}
            </label>
            <input
              type="text"
              value={review}
              onChange={(e) => onChangeField(student.id, 'retention_assignment', e.target.value)}
              placeholder={t('attendance.enterReviewAmount', 'أدخل نطاق المراجعة والتثبيت...')}
              className={UI.input}
            />
          </div>
        );

      case 'tilawah':
        return (
          <div className="w-full">
            <label className="block text-xs font-semibold text-semantic-textSecondary mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-semantic-actionPrimary" />
              {t('attendance.tilawahAmount', 'مقدار التلاوة وتصحيح القراءة')}
            </label>
            <input
              type="text"
              value={memorization}
              onChange={(e) => onChangeField(student.id, 'new_memorization', e.target.value)}
              placeholder={t('attendance.enterTilawahAmount', 'أدخل مقدار التلاوة والصفحات...')}
              className={UI.input}
            />
          </div>
        );

      case 'general':
      case 'hifz':
      default:
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-semantic-textSecondary mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-semantic-actionPrimary" />
                  {t('attendance.newMemorization', 'الحفظ الجديد')}
                </label>
                <input
                  type="text"
                  value={memorization}
                  onChange={(e) => onChangeField(student.id, 'new_memorization', e.target.value)}
                  placeholder={t('attendance.enterMemorizationAmount', 'أدخل مقدار الحفظ الجديد...')}
                  className={UI.input}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-semantic-textSecondary mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  {t('attendance.retentionReview', 'المراجعة والتثبيت')}
                </label>
                <input
                  type="text"
                  value={review}
                  onChange={(e) => onChangeField(student.id, 'retention_assignment', e.target.value)}
                  placeholder={t('attendance.enterReviewAmount', 'أدخل نطاق المراجعة والتثبيت...')}
                  className={UI.input}
                />
              </div>
            </div>

            {track === 'general' && (
              <div>
                <label className="block text-xs font-semibold text-semantic-textSecondary mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  {t('attendance.curriculumLesson', 'المنهج المساند (سيرة / فقه / أذكار)')}
                </label>
                <input
                  type="text"
                  value={lessonActivity}
                  onChange={(e) => onChangeField(student.id, 'lesson_activity', e.target.value)}
                  placeholder={t('attendance.enterLessonActivity', 'أدخل تفاصيل الدرس التربوي أو المساند...')}
                  className={UI.input}
                />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`p-4 rounded-2xl bg-semantic-surfaceCard border-2 transition-all duration-200 ${
      status === 'present' ? 'border-semantic-successBorder/40' : status === 'absent' ? 'border-semantic-danger/30' : 'border-amber-500/30'
    }`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-semantic-borderCard pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-semantic-surfaceInput border border-semantic-borderInput flex items-center justify-center text-semantic-textSecondary font-medium overflow-hidden shrink-0 shadow-inner">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-semantic-textPrimary" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-semantic-textPrimary text-base">{formatName(student.name)}</h3>
            {student.halaqa_name && (
              <p className="text-xs text-semantic-textSecondary">{student.halaqa_name}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-semantic-surfaceInput p-1.5 rounded-2xl border border-semantic-borderInput w-full sm:w-auto justify-between sm:justify-start">
          <button
            type="button"
            onClick={() => handleStatusChange('present')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              status === 'present' 
                ? 'bg-semantic-successBg text-semantic-success border border-semantic-successBorder shadow-md' 
                : 'text-semantic-textSecondary hover:text-semantic-textPrimary'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {t('attendance.present', 'حاضر')}
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange('absent')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              status === 'absent' 
                ? 'bg-semantic-dangerBg text-semantic-danger border border-semantic-danger/40 shadow-md' 
                : 'text-semantic-textSecondary hover:text-semantic-textPrimary'
            }`}
          >
            <XCircle className="w-4 h-4" />
            {t('attendance.absent', 'غائب')}
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange('excused')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              status === 'excused' 
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md' 
                : 'text-semantic-textSecondary hover:text-semantic-textPrimary'
            }`}
          >
            <Clock className="w-4 h-4" />
            {t('attendance.excused', 'مستأذن')}
          </button>
        </div>
      </div>

      {status === 'present' ? (
        <div className="space-y-3 pt-3">
          {renderTrackFields()}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <div className="flex items-center gap-2 shrink-0 bg-semantic-surfaceInput/50 px-3 py-2 rounded-xl border border-semantic-borderInput">
              <span className="text-xs font-semibold text-semantic-textSecondary">{t('attendance.dailyRating', 'التقييم')}:</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => onChangeField(student.id, 'session_grade', star * 2)}
                    className="p-1 focus:outline-none transition-transform active:scale-125 cursor-pointer"
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

            <div className="flex-1">
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
                className="self-end sm:self-center p-2.5 rounded-xl bg-semantic-successBg text-semantic-success hover:bg-semantic-success/20 border border-semantic-successBorder transition-all cursor-pointer shrink-0 flex items-center gap-1 text-xs font-bold"
              >
                <Send className="w-4 h-4" />
                <span className="hidden md:inline">{t('attendance.whatsapp', 'واتساب')}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 pt-3">
          <div className="flex-1">
            <input
              type="text"
              value={notes}
              onChange={(e) => onChangeField(student.id, 'notes', e.target.value)}
              placeholder={
                status === 'absent' 
                  ? t('attendance.absentReasonPlaceholder', 'أدخل سبب الغياب (اختياري)...')
                  : t('attendance.excusedReasonPlaceholder', 'أدخل تفاصيل إذن الاستئذان...')
              }
              className={UI.input}
            />
          </div>

          {student.phone && (
            <button
              type="button"
              onClick={handleSendMessaging}
              className="p-2.5 rounded-xl bg-semantic-surfaceInput text-semantic-textSecondary hover:text-semantic-textPrimary border border-semantic-borderInput transition-all cursor-pointer shrink-0 flex items-center gap-1 text-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceCard;
