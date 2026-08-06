// src/components/Student/StudentAttendanceCard.jsx
import React, { memo } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  UserCheck, 
  BookOpen, 
  Book, 
  GraduationCap,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { sendWhatsAppAttendanceReport } from '@/utils/whatsappUtils';

// 🛠️ دالة مساعدة لفك واستخراج اسم الطالب أو السورة بأمان (دعم JSONB والنصوص)
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
  const quickNotes = ['ممتاز ومرتل ✨', 'تثبيت المتشابهات 🔁', 'مراجعة الورد جيداً 📖', 'تركيز في الأحكام 🎯'];

  const studentName = formatName(student.name, isRtl);
  const studentSurah = formatName(student.current_surah || student.current_surah_name, isRtl);

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 p-4 rounded-2xl flex flex-col gap-3.5 transition-all hover:border-slate-700/60 box-border shadow-sm">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white tracking-wide">{studentName}</span>
            {(student.parent_phone || student.phone) && (
              <button
                type="button"
                onClick={() => sendWhatsAppAttendanceReport(student, record, selectedDate, isRtl)}
                className="p-1 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> {isRtl ? "تقرير الواتساب" : "WhatsApp"}
              </button>
            )}
          </div>
          <span className="text-[11px] font-bold text-amber-500/80 block mt-0.5">
            {t('memorization_prefix') || 'مستوى الحفظ الحالي:'} {studentSurah || (isRtl ? 'الربع ' + (student.current_quarter_index || 1) : 'Quarter ' + (student.current_quarter_index || 1))}
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:flex gap-1.5 w-full lg:w-auto justify-center lg:justify-end">
          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'present')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              currentStatus === 'present' 
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-extrabold shadow-md shadow-emerald-500/10' 
                : 'bg-slate-950 text-emerald-400 border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            <Check className="w-3.5 h-3.5" /> {t('present') || 'حاضر'}
          </button>

          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'absent')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              currentStatus === 'absent' 
                ? 'bg-red-500 text-white border-red-500 font-extrabold shadow-md shadow-red-500/10' 
                : 'bg-slate-950 text-red-400 border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            <X className="w-3.5 h-3.5" /> {t('absent') || 'غائب'}
          </button>

          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'late')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              currentStatus === 'late' 
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-md shadow-amber-500/10' 
                : 'bg-slate-950 text-amber-400 border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> {t('late') || 'متأخر'}
          </button>

          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'excused')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              currentStatus === 'excused' 
                ? 'bg-blue-600 text-white border-blue-600 font-extrabold shadow-md shadow-blue-600/10' 
                : 'bg-slate-950 text-blue-400 border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> {t('excused') || 'معتذر'}
          </button>
        </div>
      </div>

      {isPresent && (
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/50 flex flex-col gap-3.5 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" /> {isRtl ? "ورد الحفظ الجديد" : "New Memorization"}
              </label>
              <input 
                type="text" 
                placeholder={isRtl ? "مثال: البقرة ١-١٥" : "e.g., Al-Baqarah 1-15"}
                value={record.new_memorization || ''}
                onChange={(e) => updateStudentField(student.id, 'new_memorization', e.target.value)}
                className={`w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/40 ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                <Book className="w-3.5 h-3.5 text-emerald-400" /> {isRtl ? "ورد المراجعة والربط" : "Retention & Revision"}
              </label>
              <input 
                type="text" 
                placeholder={isRtl ? "مثال: مراجعة آخر ٥ صفحات" : "e.g., Last 5 pages"}
                value={record.retention_assignment || ''}
                onChange={(e) => updateStudentField(student.id, 'retention_assignment', e.target.value)}
                className={`w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/40 ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-amber-500" /> {isRtl ? "التقييم اليومي" : "Daily Grade"}
              </span>
              <div className="flex gap-1.5">
                {[
                  { value: 10, label: isRtl ? 'ممتاز 🌟' : 'Excellent' },
                  { value: 8, label: isRtl ? 'جيد جداً 👍' : 'Very Good' },
                  { value: 6, label: isRtl ? 'يحتاج تحسين ⚠️' : 'Needs Work' }
                ].map(grade => {
                  const isSelected = Number(record.session_grade || 10) === grade.value;
                  return (
                    <button
                      key={grade.value}
                      type="button"
                      onClick={() => updateStudentField(student.id, 'session_grade', grade.value)}
                      className={`flex-1 p-1.5 rounded-lg border text-[10px] font-extrabold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {grade.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[11px] text-slate-400 font-bold">{isRtl ? "الملاحظات والتوجيه" : "Teacher Notes"}</span>
              <input 
                type="text" 
                placeholder={isRtl ? "اكتب ملاحظة..." : "Write a note..."}
                value={record.notes || ''}
                onChange={(e) => updateStudentField(student.id, 'notes', e.target.value)}
                className={`w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-slate-700 ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-900">
            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500/70" /> {isRtl ? "ملاحظات سريعة:" : "Quick Notes:"}
            </span>
            {quickNotes.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => updateStudentField(student.id, 'notes', record.notes ? `${record.notes} - ${chip}` : chip)}
                className="p-1 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-[10px] font-medium transition-all cursor-pointer"
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
