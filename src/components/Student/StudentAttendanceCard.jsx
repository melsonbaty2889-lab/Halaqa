// src/components/Student/StudentAttendanceCard.jsx
import React, { memo } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  UserCheck, 
  BookOpen, 
  BookMarked, 
  Award,
  Send,
  Sparkles
} from 'lucide-react';
import { sendWhatsAppAttendanceReport } from '@/utils/whatsappUtils';

// دالة مساعدة لفك واستخراج اسم الطالب أو السورة بأمان (دعم JSONB والنصوص)
const formatName = (nameData, isRtl) => {
  if (!nameData) return '';
  if (typeof nameData === 'string') return nameData;
  if (typeof nameData === 'object') {
    return isRtl 
      ? (nameData.ar || nameData.en || nameData.full_name || Object.values(nameData)[0] || '')
      : (nameData.en || nameData.ar || nameData.full_name || Object.values(nameData)[0] || '');
  }
  return String(nameData);
};

const StudentAttendanceCard = memo(({ student, record = {}, updateStudentField, selectedDate, isRtl, t }) => {
  const currentStatus = record.status || 'present';
  const isPresent = currentStatus === 'present' || currentStatus === 'late';
  
  // مصطلحات توجيهية رسمية معتمدة
  const quickNotes = isRtl 
    ? ['أداء متميز وتلاوة متقنة', 'تثبيت ومراجعة المتشابهات', 'إتقان أحكام التجويد', 'الالتزام بمخطط الحفظ']
    : ['Excellent Recitation', 'Review Similar Verses', 'Tajweed Mastery', 'On Track with Plan'];

  const studentName = formatName(student.name, isRtl);
  const studentSurah = formatName(student.current_surah || student.current_surah_name, isRtl);

  return (
    <div className="bg-card border border-border p-4 rounded-2xl flex flex-col gap-3.5 transition-all hover:border-accent/40 box-border shadow-sm">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-primary tracking-wide">{studentName}</span>
            {(student.parent_phone || student.phone) && (
              <button
                type="button"
                onClick={() => sendWhatsAppAttendanceReport(student, record, selectedDate, isRtl)}
                className="p-1 px-2.5 bg-success/10 hover:bg-success/20 border border-success/30 text-success rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3 h-3 text-success" /> 
                {isRtl ? "إرسال تقرير ولي الأمر" : "Share Progress"}
              </button>
            )}
          </div>
          <span className="text-[11px] font-bold text-accent block mt-0.5">
            {t('memorization_prefix') || (isRtl ? 'المسار التعليمي الحالي:' : 'Current Milestone:')} {studentSurah || (isRtl ? 'الربع ' + (student.current_quarter_index || 1) : 'Quarter ' + (student.current_quarter_index || 1))}
          </span>
        </div>
        
        {/* حالة الحضور */}
        <div className="grid grid-cols-2 sm:flex gap-1.5 w-full lg:w-auto justify-center lg:justify-end">
          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'present')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              currentStatus === 'present' 
                ? 'bg-success text-success-foreground border-success font-extrabold shadow-md' 
                : 'bg-card text-success border-border hover:bg-accent/10'
            }`}
          >
            <Check className="w-3.5 h-3.5" /> {t('present') || (isRtl ? 'حاضر' : 'Attended')}
          </button>

          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'absent')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              currentStatus === 'absent' 
                ? 'bg-danger text-danger-foreground border-danger font-extrabold shadow-md' 
                : 'bg-card text-danger border-border hover:bg-accent/10'
            }`}
          >
            <X className="w-3.5 h-3.5" /> {t('absent') || (isRtl ? 'غائب' : 'Absent')}
          </button>

          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'late')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              currentStatus === 'late' 
                ? 'bg-warning text-warning-foreground border-warning font-extrabold shadow-md' 
                : 'bg-card text-warning border-border hover:bg-accent/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> {t('late') || (isRtl ? 'متأخر' : 'Late')}
          </button>

          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'excused')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              currentStatus === 'excused' 
                ? 'bg-info text-info-foreground border-info font-extrabold shadow-md' 
                : 'bg-card text-info border-border hover:bg-accent/10'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> {t('excused') || (isRtl ? 'بعذر' : 'Excused')}
          </button>
        </div>
      </div>

      {isPresent && (
        <div className="bg-background/60 p-3.5 rounded-xl border border-border flex flex-col gap-3.5 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted font-bold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-accent" /> {isRtl ? "إنجاز الحفظ الجديد" : "New Assignment"}
              </label>
              <input 
                type="text" 
                placeholder={isRtl ? "تحديد المقرر..." : "Enter range..."}
                value={record.new_memorization || ''}
                onChange={(e) => updateStudentField(student.id, 'new_memorization', e.target.value)}
                className={`w-full p-2 bg-card border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-accent ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted font-bold flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5 text-success" /> {isRtl ? "خطة المراجعة والتثبيت" : "Revision Plan"}
              </label>
              <input 
                type="text" 
                placeholder={isRtl ? "تحديد ورد المراجعة..." : "Enter revision details..."}
                value={record.retention_assignment || ''}
                onChange={(e) => updateStudentField(student.id, 'retention_assignment', e.target.value)}
                className={`w-full p-2 bg-card border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-success ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[11px] text-muted font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-accent" /> {isRtl ? "مستوى الأداء والتقييم" : "Performance Rating"}
              </span>
              <div className="flex gap-1.5">
                {[
                  { value: 10, label: isRtl ? 'متقن' : 'Mastered' },
                  { value: 8, label: isRtl ? 'جيد جداً' : 'Advanced' },
                  { value: 6, label: isRtl ? 'قيد التحسين' : 'Developing' }
                ].map(grade => {
                  const isSelected = Number(record.session_grade || 10) === grade.value;
                  return (
                    <button
                      key={grade.value}
                      type="button"
                      onClick={() => updateStudentField(student.id, 'session_grade', grade.value)}
                      className={`flex-1 p-1.5 rounded-lg border text-[10px] font-extrabold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-accent text-accent-foreground border-accent shadow-sm'
                          : 'bg-card text-muted border-border hover:bg-accent/10'
                      }`}
                    >
                      {grade.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[11px] text-muted font-bold">{isRtl ? "التوصيات والتوجيهات" : "Instructor Feedback"}</span>
              <input 
                type="text" 
                placeholder={isRtl ? "إضافة ملاحظات تعليمية..." : "Add feedback..."}
                value={record.notes || ''}
                onChange={(e) => updateStudentField(student.id, 'notes', e.target.value)}
                className={`w-full p-2 bg-card border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-accent ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border">
            <span className="text-[10px] text-muted font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> {isRtl ? "توجيهات سريعة:" : "Quick Feedback:"}
            </span>
            {quickNotes.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => updateStudentField(student.id, 'notes', record.notes ? `${record.notes} - ${chip}` : chip)}
                className="p-1 px-2 bg-card hover:bg-accent/10 text-primary border border-border rounded-lg text-[10px] font-medium transition-all cursor-pointer"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

StudentAttendanceCard.displayName = 'StudentAttendanceCard';
export default StudentAttendanceCard;
