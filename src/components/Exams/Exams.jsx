// src/components/Exams.jsx
import React, { useState, useEffect, useCallback } from 'react'; 
import { supabase } from '@/lib/supabase';
import { sessionService } from '@/lib/sessionService'; 
import { useTranslation } from 'react-i18next';
import CertificateModal from '@/components/Certificates/CertificateModal'; // 👈 استدعاء نافذة الشهادة
import { 
  Award, 
  Minus, 
  Plus, 
  CheckCircle2, 
  Search, 
  GraduationCap, 
  Loader2,
  Printer
} from 'lucide-react';

export default function Exams({ students = [], academyId }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');

  const formatStudentName = useCallback((nameData) => {
    if (!nameData) return '';
    if (typeof nameData === 'string') return nameData;
    if (typeof nameData === 'object') {
      return isRtl 
        ? (nameData.ar || nameData.en || nameData.full_name || Object.values(nameData)[0] || '')
        : (nameData.en || nameData.ar || nameData.full_name || Object.values(nameData)[0] || '');
    }
    return String(nameData);
  }, [isRtl]);

  const [mistakeWeight, setMistakeWeight] = useState(5);
  const [promptWeight, setPromptWeight] = useState(2);

  const [selectedStudent, setSelectedStudent] = useState('');
  const [examType, setExamType] = useState('surah');
  const [examContent, setExamContent] = useState('');
  const [fullErrors, setFullErrors] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const [tajweedRating, setTajweedRating] = useState('excellent');
  const [notes, setNotes] = useState('');

  const [examLogs, setExamLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // 🎓 حالات التحكم في نافذة الشهادة (Modal)
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [selectedCertData, setSelectedCertData] = useState(null);

  const calculatedScore = Math.max(0, 100 - (fullErrors * mistakeWeight) - (warnings * promptWeight));

  useEffect(() => {
    async function fetchAcademySettings() {
      if (!academyId) return;
      try {
        const { data, error } = await supabase
          .from('academies')
          .select('mistake_weight, prompt_weight')
          .eq('id', academyId)
          .maybeSingle();

        if (!error && data) {
          if (data.mistake_weight !== undefined && data.mistake_weight !== null) setMistakeWeight(Number(data.mistake_weight));
          if (data.prompt_weight !== undefined && data.prompt_weight !== null) setPromptWeight(Number(data.prompt_weight));
        }
      } catch (err) {
        console.error("🚨 خطأ في جلب أوزان الأكاديمية الديناميكية:", err);
      }
    }
    fetchAcademySettings();
  }, [academyId]);

  const fetchExamLogs = useCallback(async () => {
    if (!academyId) return;
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          students (name)
        `)
        .eq('academy_id', academyId)
        .order('date', { ascending: false });

      if (error) throw error;
      if (data) setExamLogs(data);
    } catch (err) {
      console.error("🚨 خطأ في جلب سجل الاختبارات السابقة:", err);
    } finally {
      setLoadingLogs(false);
    }
  }, [academyId]);

  useEffect(() => {
    fetchExamLogs();
  }, [fetchExamLogs]);

  const handleSaveExam = async () => {
    if (!selectedStudent || !examContent.trim()) {
      setFeedbackMsg({ 
        type: 'error', 
        text: isRtl ? 'الرجاء اختيار الطالب وتحديد محتوى الاختبار أولاً.' : 'Please select a student and specify the exam content first.' 
      });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg({ type: '', text: '' });

    try {
      const combinedNotes = notes.trim() 
        ? `${examContent.trim()} - ${notes.trim()}` 
        : examContent.trim();

      const result = await sessionService.saveStudentExam({
        studentId: selectedStudent,
        academyId: academyId,
        examType: examType,
        mistakes: fullErrors,
        prompts: warnings,
        tajweedGrade: tajweedRating,
        finalScore: calculatedScore,
        notes: combinedNotes
      });

      if (!result.success) throw new Error(result.error);

      setFeedbackMsg({ 
        type: 'success', 
        text: isRtl ? 'تم اعتماد الاختبار بنجاح وإدراج النتيجة في لوحة الشرف! 🎉' : 'Exam certified successfully and added to honor roll! 🎉' 
      });
      
      setSelectedStudent('');
      setExamContent('');
      setFullErrors(0);
      setWarnings(0);
      setNotes('');
      
      fetchExamLogs();
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ 
        type: 'error', 
        text: `Error: ${err.message}` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🎓 دالة إنشاء/جلب الشهادة وفتح Modal الشهادة مباشرةً
  const handlePrintCertificate = async (log) => {
    try {
      const studentName = formatStudentName(log.students?.name) || (isRtl ? 'الطالب' : 'Student');
      const studentId = log.student_id;
      const curriculumId = log.curriculum_id || log.id; 

      let certCode = `CERT-${log.id.substring(0, 6).toUpperCase()}`;

      // 1. فحص وجود كود موثق بجدول الشهادات إن وجد
      if (studentId && log.curriculum_id) {
        const { data: existingCert } = await supabase
          .from('certificates')
          .select('verification_code')
          .eq('student_id', studentId)
          .eq('curriculum_id', log.curriculum_id)
          .maybeSingle();

        if (existingCert?.verification_code) {
          certCode = existingCert.verification_code;
        } else {
          const { error: insertError } = await supabase
            .from('certificates')
            .insert([{
              student_id: studentId,
              curriculum_id: log.curriculum_id,
              verification_code: certCode
            }]);
          if (insertError) console.warn('لم يتم إضافة الشهادة لقاعدة البيانات، سيتم عرضها فقط:', insertError);
        }
      }

      // 2. تزويد النافذة ببيانات الشهادة وفتحها
      setSelectedCertData({
        studentName,
        examTarget: log.exam_target || log.notes || 'اختبار القرآن الكريم',
        score: log.final_score,
        date: log.date ? new Date(log.date.replace(/-/g, '/')).toLocaleDateString('ar-EG') : new Date().toLocaleDateString('ar-EG'),
        verificationCode: certCode,
        academyName: 'أكاديمية تحفيظ القرآن الكريم',
        tajweedGrade: log.tajweed_grade
      });

      setIsCertModalOpen(true);

    } catch (err) {
      console.error('🚨 خطأ أثناء فتح الشهادة:', err);
    }
  };

  const filteredLogs = examLogs.filter(log => {
    const studentName = formatStudentName(log.students?.name).toLowerCase();
    const content = (log.exam_target || log.notes || '').toLowerCase(); 
    const query = searchQuery.toLowerCase().trim();
    return studentName.includes(query) || content.includes(query);
  });

  return (
    <div className="text-slate-100 p-1 font-sans" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* هيدر اللوحة */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md mb-6">
        <h2 className="text-xl md:text-2xl font-extrabold text-amber-400 flex items-center gap-3 m-0">
          <Award className="text-amber-500 w-6 h-6" /> {isRtl ? 'لوحة رصد الاختبارات والترقيات القرآنية الرسمية' : 'Quranic Exams & Milestones Panel'}
        </h2>
        <p className="text-xs text-slate-400 mt-2 font-medium">
          {isRtl 
            ? `نظام التقييم والاختبارات الكبرى للأجزاء والسور (وزن خطأ الحفظ: ${mistakeWeight} درجات | وزن تنبيه الفتح: ${promptWeight} درجات).` 
            : `Formal evaluation tracking for juz and milestones. (Error weight: ${mistakeWeight} | Warning weight: ${promptWeight}).`
          }
        </p>
      </div>

      {/* نموذج إجراء الاختبار */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur-md">
        <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <GraduationCap className="text-amber-400 w-5 h-5" /> {isRtl ? 'عقد لجنة اختبار وإصدار تقييم موثق' : 'Conduct Official Live Exam'}
        </h3>

        {feedbackMsg.text && (
          <div className={`p-4 rounded-xl mb-5 text-xs font-bold border ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {feedbackMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">{isRtl ? 'اختر الطالب الخاضع للاختبار' : 'Select Student'}</label>
            <select 
              value={selectedStudent} 
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/40"
              style={{ backgroundColor: '#020617' }}
            >
              <option value="">{isRtl ? '-- ابحث واختر الطالب --' : '-- Select student --'}</option>
              {students.map(std => (
                <option key={std.id} value={std.id}>
                  {formatStudentName(std.name)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">{isRtl ? 'مستوى ونوع الاختبار الرسمي' : 'Assessment Scope'}</label>
            <select 
              value={examType} 
              onChange={(e) => setExamType(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/40"
              style={{ backgroundColor: '#020617' }}
            >
              <option value="surah">{isRtl ? 'سورة قصيرة / كاملة' : 'Short / Full Surah'}</option>
              <option value="juz">{isRtl ? 'اختبار جزء قرآن كامل (مثال: جزء عم)' : 'Full Quranic Juz'}</option>
              <option value="verses">{isRtl ? 'مجموعة آيات محددة ومقاطع' : 'Specific Verses'}</option>
            </select>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-400 mb-2">{isRtl ? 'المحتوى الدقيق للجنة الاختبار' : 'Exam Content / Target'}</label>
          <input 
            type="text" 
            value={examContent}
            onChange={(e) => setExamContent(e.target.value)}
            placeholder={isRtl ? "مثال: سورة البقرة كاملة، أو ربع يس" : "e.g., Al-Baqarah Complete, or Juz Amma"}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/40"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <div className="p-4 rounded-xl border border-red-500/10 bg-slate-950/40 text-center">
            <span className="block text-xs font-bold text-red-400 mb-3">{isRtl ? 'الخطأ الكامل (نسيان/تبديل كلمة)' : 'Full Errors (Deductions)'}</span>
            <div className="flex items-center justify-center gap-4">
              <button type="button" onClick={() => setFullErrors(prev => Math.max(0, prev - 1))} className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
              <span className="text-xl font-extrabold text-white min-w-[24px]">{fullErrors}</span>
              <button type="button" onClick={() => setFullErrors(prev => prev + 1)} className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-colors cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <span className="block text-[10px] text-slate-500 mt-2">(-{mistakeWeight} {isRtl ? 'درجات للخطأ' : 'pts each'})</span>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/10 bg-slate-950/40 text-center">
            <span className="block text-xs font-bold text-amber-400 mb-3">{isRtl ? 'الردة / التنبيه (مساعدة الفتح للشيخ)' : 'Warnings / Prompts Given'}</span>
            <div className="flex items-center justify-center gap-4">
              <button type="button" onClick={() => setWarnings(prev => Math.max(0, prev - 1))} className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
              <span className="text-xl font-extrabold text-white min-w-[24px]">{warnings}</span>
              <button type="button" onClick={() => setWarnings(prev => prev + 1)} className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center transition-colors cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <span className="block text-[10px] text-slate-500 mt-2">(-{promptWeight} {isRtl ? 'درجات للتنبيه' : 'pts each'})</span>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-400 mb-3">{isRtl ? 'جودة الأداء النغمي والتجويد الفطري' : 'Tajweed & Articulation Standard'}</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'excellent', ar: 'ممتاز ومجود ✨', en: 'Excellent & Tajweed ✨' },
              { id: 'good', ar: 'حسن التلاوة والأداء 👍', en: 'Good Recitation 👍' },
              { id: 'needs_work', ar: 'بحاجة لضبط المخارج والمدود 🎯', en: 'Needs Articulation Work 🎯' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTajweedRating(item.id)}
                className={`p-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  tajweedRating === item.id 
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/10' 
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                }`}
              >
                {isRtl ? item.ar : item.en}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-400 mb-2">{isRtl ? 'عبارة ثناء ورسالة تقديرية تظهر بالشهادة' : 'Praise & Certification Note'}</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isRtl ? "مثال: أداء راسخ وتلاوة يملؤها الخشوع، بارك الله في حفظك." : "e.g., Profound performance and serene recitation, may Allah bless your memory."}
            rows={2}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/40 resize-none font-sans"
          />
        </div>

        <div className={`p-4 rounded-xl text-center mb-6 border border-dashed ${
          calculatedScore >= 90 ? 'border-emerald-500/30 bg-emerald-500/5' : calculatedScore >= 75 ? 'border-amber-500/30 bg-amber-500/5' : 'border-red-500/30 bg-red-500/5'
        }`}>
          <span className="text-xs text-slate-400 font-bold">{isRtl ? 'الدرجة المستحقة الإجمالية للاختبار:' : 'Live Dynamic Score Matched:'}</span>
          <div className={`text-3xl font-extrabold mt-1.5 ${
            calculatedScore >= 90 ? 'text-emerald-400' : calculatedScore >= 75 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {calculatedScore} / 100
          </div>
        </div>

        <button
          onClick={handleSaveExam}
          disabled={isSubmitting}
          className="w-full p-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 text-slate-950 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/5 active:scale-[0.99] transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" /> {isSubmitting ? (isRtl ? 'جاري توثيق الدرجة...' : 'Certifying...') : (isRtl ? 'اعتماد نتيجة الاختبار الحالية وإدراجها بلوحة الشرف 🚀' : 'Certify Official Exam & Log to Registry 🚀')}
        </button>
      </div>

      {/* سجل التقييمات والشهادات */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md mt-6">
        <div className="relative mb-4 flex items-center">
          <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} text-slate-500 w-4 h-4`} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? "ابحث باسم الطالب أو السورة لاستعراض الشهادات المعتمدة..." : "Search certified records by name or surah..."}
            className={`w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-slate-700 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
          />
        </div>

        {loadingLogs ? (
          <div className="text-center text-amber-400 py-6 text-xs font-bold flex items-center justify-center gap-2">
            <Loader2 className="animate-spin w-4 h-4" /> {isRtl ? 'جاري تحميل سجل اللجان والشهادات...' : 'Loading matrix logs...'}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center text-slate-500 py-8 text-xs">
            {isRtl ? 'لا توجد اختبارات كبرى مسجلة تطابق مدخلاتك حالياً.' : 'No grand exams indexed for this query currently.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-400 font-bold">
                  <th className="pb-3 px-3">{isRtl ? 'الطالب' : 'Student'}</th>
                  <th className="pb-3 px-3">{isRtl ? 'المستوى ونطاق التميز' : 'Target Scope'}</th>
                  <th className="pb-3 px-3 text-center">{isRtl ? 'الدرجة الموثقة' : 'Score Card'}</th>
                  <th className="pb-3 px-3 text-center">{isRtl ? 'التجويد والأداء' : 'Tajweed Line'}</th>
                  <th className="pb-3 px-3 text-center">{isRtl ? 'تاريخ اللجنة' : 'Date'}</th>
                  <th className="pb-3 px-3 text-center">{isRtl ? 'الشهادة' : 'Certificate'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 font-medium">
                {filteredLogs.map(log => {
                  const studentName = formatStudentName(log.students?.name) || (isRtl ? 'طالب غير متوفر' : 'N/A');
                  const examTarget = log.exam_target || log.notes || '—';

                  return (
                    <tr key={log.id} className="hover:bg-slate-900/30 transition-colors text-slate-200">
                      <td className="py-3.5 px-3 font-bold text-white">{studentName}</td>
                      <td className="py-3.5 px-3">
                        <span className="bg-slate-900 border border-slate-800 text-[10px] px-1.5 py-0.5 rounded text-slate-400 mx-1">
                          {log.exam_type === 'surah' ? (isRtl ? 'سورة' : 'Surah') : log.exam_type === 'juz' ? (isRtl ? 'جزء' : 'Juz') : (isRtl ? 'آيات' : 'Verses')}
                        </span>
                        <span className="text-slate-300">{examTarget}</span>
                      </td>
                      <td className={`py-3.5 px-3 text-center font-extrabold ${log.final_score >= 90 ? 'text-emerald-400' : log.final_score >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                        {log.final_score}%
                      </td>
                      <td className="py-3.5 px-3 text-center text-[11px] text-slate-400">
                        {log.tajweed_grade === 'excellent' ? 'امتياز ومجود ✨' : log.tajweed_grade === 'good' ? 'حسن التلاوة 👍' : 'ضبط مخارج 🎯'}
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {log.date ? new Date(log.date.replace(/-/g, '/')).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US') : '—'}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handlePrintCertificate(log)}
                          disabled={Number(log.final_score) < 75}
                          className={`p-1.5 rounded-lg border text-[10px] font-bold inline-flex items-center gap-1.5 transition-all active:scale-90 cursor-pointer ${
                            Number(log.final_score) >= 90 
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500 hover:text-slate-950' 
                              : 'bg-slate-950 text-slate-600 border-slate-900 disabled:opacity-20'
                          }`}
                          title={isRtl ? "عرض وطباعة شهادة التقدير" : "View & Print Certificate"}
                        >
                          <Printer className="w-3 h-3" />
                          <span>{isRtl ? 'عرض الشهادة' : 'View Cert'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🎓 استدعية نافذة الشهادة الموثقة مع Modal */}
      <CertificateModal 
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        certData={selectedCertData}
        isRtl={isRtl}
      />

    </div>
  );
}
