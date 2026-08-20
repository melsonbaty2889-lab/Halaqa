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
    <div className="card-surface p-4 rounded-2xl flex flex-col gap-3.5 transition-all duration-200 hover:border-[rgba(255,255,255,0.18)] box-border shadow-main">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-[#FFFFFF] tracking-wide">{studentName}</span>
            {(student.parent_phone || student.phone) && (
              <button
                type="button"
                onClick={() => sendWhatsAppAttendanceReport(student, record, selectedDate, isRtl)}
                className="p-1 px-2.5 bg-[#09332C] hover:bg-[#0D5C4D] border border-[#0D5C4D] text-[#10B981] rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Send className="w-3 h-3 text-[#10B981]" /> 
                {isRtl ? "إرسال تقرير ولي الأمر" : "Share Progress"}
              </button>
            )}
          </div>
          <span className="text-[11px] font-bold text-[#E07A00] block mt-1">
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
                ? 'bg-[#10B981] text-[#FFFFFF] border-[#10B981] font-extrabold shadow-md' 
                : 'bg-[#0A101D] text-[#10B981] border-[#1B2738] hover:border-[#2E3E56]'
            }`}
          >
            <Check className="w-3.5 h-3.5" /> {t('present') || (isRtl ? 'حاضر' : 'Attended')}
          </button>

          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'absent')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              currentStatus === 'absent' 
                ? 'bg-[#EF4444] text-[#FFFFFF] border-[#EF4444] font-extrabold shadow-md' 
                : 'bg-[#0A101D] text-[#EF4444] border-[#1B2738] hover:border-[#2E3E56]'
            }`}
          >
            <X className="w-3.5 h-3.5" /> {t('absent') || (isRtl ? 'غائب' : 'Absent')}
          </button>

          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'late')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              currentStatus === 'late' 
                ? 'bg-[#E07A00] text-[#FFFFFF] border-[#E07A00] font-extrabold shadow-md' 
                : 'bg-[#0A101D] text-[#E07A00] border-[#1B2738] hover:border-[#2E3E56]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> {t('late') || (isRtl ? 'متأخر' : 'Late')}
          </button>

          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'excused')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              currentStatus === 'excused' 
                ? 'bg-[#3B82F6] text-[#FFFFFF] border-[#3B82F6] font-extrabold shadow-md' 
                : 'bg-[#0A101D] text-[#3B82F6] border-[#1B2738] hover:border-[#2E3E56]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> {t('excused') || (isRtl ? 'بعذر' : 'Excused')}
          </button>
        </div>
      </div>

      {isPresent && (
        <div className="bg-[#0A101D]/80 p-3.5 rounded-xl border border-[#1B2738] flex flex-col gap-3.5 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-[#94A3B8] font-bold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#E07A00]" /> {isRtl ? "إنجاز الحفظ الجديد" : "New Assignment"}
              </label>
              <input 
                type="text" 
                placeholder={isRtl ? "تحديد المقرر..." : "Enter range..."}
                value={record.new_memorization || ''}
                onChange={(e) => updateStudentField(student.id, 'new_memorization', e.target.value)}
                className={`app-input text-xs ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-[#94A3B8] font-bold flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5 text-[#10B981]" /> {isRtl ? "خطة المراجعة والتثبيت" : "Revision Plan"}
              </label>
              <input 
                type="text" 
                placeholder={isRtl ? "تحديد ورد المراجعة..." : "Enter revision details..."}
                value={record.retention_assignment || ''}
                onChange={(e) => updateStudentField(student.id, 'retention_assignment', e.target.value)}
                className={`app-input text-xs ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-[11px] text-[#94A3B8] font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#E07A00]" /> {isRtl ? "مستوى الأداء والتقييم" : "Performance Rating"}
              </span>
              <div className="flex gap-1.5">
                {[
                  { value: 10, label: isRtl ? 'متقن' : 'Mastered' },
                  { value: 8, label: isRtl ? 'جيد جداً' : 'Advanced' },
                  { value: 6, label: isRtl ? 'قيد التحسين' : 'Developing' }
                ].map(grade => {
                  const isSelected = Number(record.session_grade ?? 10) === grade.value;
                  return (
                    <button
                      key={grade.value}
                      type="button"
                      onClick={() => updateStudentField(student.id, 'session_grade', grade.value)}
                      className={`flex-1 p-2 rounded-xl border text-[11px] font-extrabold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-gradient-to-b from-[#E67E00] to-[#D97706] text-[#FFFFFF] border-[#E07A00] shadow-btn'
                          : 'bg-[#0A101D] text-[#94A3B8] border-[#1B2738] hover:border-[#2E3E56]'
                      }`}
                    >
                      {grade.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-[11px] text-[#94A3B8] font-bold">{isRtl ? "التوصيات والتوجيهات" : "Instructor Feedback"}</span>
              <input 
                type="text" 
                placeholder={isRtl ? "إضافة ملاحظات تعليمية..." : "Add feedback..."}
                value={record.notes || ''}
                onChange={(e) => updateStudentField(student.id, 'notes', e.target.value)}
                className={`app-input text-xs ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[rgba(255,255,255,0.08)]">
            <span className="text-[10px] text-[#94A3B8] font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E07A00]" /> {isRtl ? "توجيهات سريعة:" : "Quick Feedback:"}
            </span>
            {quickNotes.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => updateStudentField(student.id, 'notes', record.notes ? `${record.notes} - ${chip}` : chip)}
                className="p-1 px-2.5 bg-[#0A101D] hover:bg-[#162032] text-[#E2E8F0] border border-[#1B2738] hover:border-[#E07A00] rounded-lg text-[10px] font-medium transition-all cursor-pointer"
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
