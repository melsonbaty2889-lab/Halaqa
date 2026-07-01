import React, { useState, useEffect } from 'react'; 
import { supabase } from '../lib/supabase';
import { sessionService } from '../lib/sessionService'; 
import { useTranslation } from 'react-i18next';
import { 
  FaAward, 
  FaMinus, 
  FaPlus, 
  FaCheckCircle, 
  FaSearch, 
  FaGraduationCap, 
  FaSpinner, 
  FaCalendarAlt,
  FaFileCertificate,
  FaPrint
} from 'react-icons/fa';

export default function Exams({ students, academyId }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');

  // 🌍 أوزان الخصم الديناميكية (Dynamic SaaS Settings)
  const [mistakeWeight, setMistakeWeight] = useState(5);
  const [promptWeight, setPromptWeight] = useState(2);

  // 📝 حالات إدارة واجهة نموذج الاختبار الحالي
  const [selectedStudent, setSelectedStudent] = useState('');
  const [examType, setExamType] = useState('surah');
  const [examContent, setExamContent] = useState('');
  const [fullErrors, setFullErrors] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const [tajweedRating, setTajweedRating] = useState('excellent');
  const [notes, setNotes] = useState('');

  // 📊 حالات جلب السجل والتخزين والبحث السفلي
  const [examLogs, setExamLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // 🧮 حساب الدرجة المستحقة تلقائياً حياً بناءً على الأوزان الديناميكية
  const calculatedScore = Math.max(0, 100 - (fullErrors * mistakeWeight) - (warnings * promptWeight));

  // 1️⃣ 🌟 تأثير جلب إعدادات الأكاديمية الخاصة بالأوزان والخصومات ديناميكياً
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
          if (data.mistake_weight) setMistakeWeight(data.mistake_weight);
          if (data.prompt_weight) setPromptWeight(data.prompt_weight);
        }
      } catch (err) {
        console.error("🚨 خطأ في جلب أوزان الأكاديمية الديناميكية:", err);
      }
    }
    fetchAcademySettings();
  }, [academyId]);

  // 2️⃣ 📜 تأثير جلب سجل الاختبارات السابقة المعتمدة للأكاديمية
  const fetchExamLogs = async () => {
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
  };

  useEffect(() => {
    fetchExamLogs();
  }, [academyId]);

  // 3️⃣ 💾 دالة اعتماد وحفظ نتيجة الاختبار الحي عبر الخدمة الموحدة
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
      const result = await sessionService.saveStudentExam({
        studentId: selectedStudent,
        academyId: academyId,
        examType: examType,
        examTarget: examContent.trim(),
        mistakes: fullErrors,
        prompts: warnings,
        tajweedGrade: tajweedRating,
        finalScore: calculatedScore,
        notes: notes.trim()
      });

      if (!result.success) throw new Error(result.error);

      setFeedbackMsg({ 
        type: 'success', 
        text: isRtl ? 'تم اعتماد الاختبار بنجاح وإدراج النتيجة في لوحة الشرف! 🎉' : 'Exam certified successfully and added to honor roll! 🎉' 
      });
      
      // تصفير النموذج للحصص القادمة
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

  // محاكي طباعة الشهادة للطالب المتفوق
  const handlePrintCertificate = (log) => {
    alert(isRtl 
      ? `جاري تجهيز شهادة التقدير الكبرى للطالب: ${log.students?.name} لنجاحه في اختبار ${log.exam_target} بمعدل ${log.final_score}%` 
      : `Generating formal certificate for ${log.students?.name} for passing ${log.exam_target} with score ${log.final_score}%`
    );
  };

  const filteredLogs = examLogs.filter(log => {
    const studentName = log.students?.name?.toLowerCase() || '';
    const content = log.exam_target?.toLowerCase() || ''; 
    const query = searchQuery.toLowerCase();
    return studentName.includes(query) || content.includes(query);
  });

  return (
    <div className="text-slate-100 p-1 font-sans" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* هيدر اللوحة التوضيحي الفاخر */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md mb-6">
        <h2 className="text-xl md:text-2xl font-extrabold text-amber-400 flex items-center gap-3 margin-0">
          <FaAward className="text-amber-500" /> {isRtl ? 'لوحة رصد الاختبارات والترقيات القرآنية الرسمية' : 'Quranic Exams & Milestones Panel'}
        </h2>
        <p className="text-xs text-slate-400 mt-2 font-medium">
          {isRtl 
            ? `نظام التقييم والاختبارات الكبرى للأجزاء والسور (وزن خطأ الحفظ: ${mistakeWeight} درجات | وزن تنبيه الفتح: ${promptWeight} درجات).` 
            : `Formal evaluation tracking for juz and milestones. (Error weight: ${mistakeWeight} | Warning weight: ${promptWeight}).`
          }
        </p>
      </div>

      {/* نموذج إجراء الاختبار الحي */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur-md">
        <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <FaGraduationCap className="text-amber-400 text-lg" /> {isRtl ? 'عقد لجنة اختبار وإصدار تقييم موثق' : 'Conduct Official Live Exam'}
        </h3>

        {/* رسائل التغذية الراجعة */}
        {feedbackMsg.text && (
          <div className={`p-4 rounded-xl mb-5 text-xs font-bold border ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {feedbackMsg.text}
          </div>
        )}

        {/* حقول الاختيار التفاعلية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">{isRtl ? 'اختر الطالب الخاضع للاختبار' : 'Select Student'}</label>
            <select 
              value={selectedStudent} 
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/40"
            >
              <option value="">{isRtl ? '-- ابحث واختر الطالب --' : '-- Select student --'}</option>
              {students.map(std => (
                <option key={std.id} value={std.id}>{std.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">{isRtl ? 'مستوى ونوع الاختبار الرسمي' : 'Assessment Scope'}</label>
            <select 
              value={examType} 
              onChange={(e) => setExamType(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/40"
            >
              <option value="surah">{isRtl ? 'سورة قصيرة / كاملة' : 'Short / Full Surah'}</option>
              <option value="juz">{isRtl ? 'اختبار جزء قرآن كامل (مثال: جزء عم)' : 'Full Quranic Juz'}</option>
              <option value="verses">{isRtl ? 'مجموعة آيات محددة ومقاطع' : 'Specific Verses'}</option>
            </select>
          </div>
        </div>

        {/* محتوى الاختبار */}
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

        {/* لوحة العدادات المتقدمة للأخطاء والتنبيهات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <div className="p-4 rounded-xl border border-red-500/10 bg-slate-950/40 text-center">
            <span className="block text-xs font-bold text-red-400 mb-3">{isRtl ? 'الخطأ الكامل (نسيان/تبديل كلمة)' : 'Full Errors (Deductions)'}</span>
            <div className="flex items-center justify-center gap-4">
              <button type="button" onClick={() => setFullErrors(prev => Math.max(0, prev - 1))} className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"><FaMinus size={11} /></button>
              <span className="text-xl font-extrabold text-white min-w-[24px]">{fullErrors}</span>
              <button type="button" onClick={() => setFullErrors(prev => prev + 1)} className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-colors"><FaPlus size={11} /></button>
            </div>
            <span className="block text-[10px] text-slate-500 mt-2">(-{mistakeWeight} {isRtl ? 'درجات للخطأ' : 'pts each'})</span>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/10 bg-slate-950/40 text-center">
            <span className="block text-xs font-bold text-amber-400 mb-3">{isRtl ? 'الردة / التنبيه (مساعدة الفتح للشيخ)' : 'Warnings / Prompts Given'}</span>
            <div className="flex items-center justify-center gap-4">
              <button type="button" onClick={() => setWarnings(prev => Math.max(0, prev - 1))} className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"><FaMinus size={11} /></button>
              <span className="text-xl font-extrabold text-white min-w-[24px]">{warnings}</span>
              <button type="button" onClick={() => setWarnings(prev => prev + 1)} className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center transition-colors"><FaPlus size={11} /></button>
            </div>
            <span className="block text-[10px] text-slate-500 mt-2">(-{promptWeight} {isRtl ? 'درجات للتنبيه' : 'pts each'})</span>
          </div>
        </div>

        {/* تقييم التجويد */}
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
                className={`p-3 text-xs font-bold rounded-xl border transition-all ${
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

        {/* عبارة الثناء والتقدير */}
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

        {/* شاشة احتساب النتيجة المباشرة الذكية */}
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

        {/* زر الاعتماد النهائي */}
        <button
          onClick={handleSaveExam}
          disabled={isSubmitting}
          className="w-full p-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 text-slate-950 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/5 active:scale-[0.99] transition-all"
        >
          <FaCheckCircle /> {isSubmitting ? (isRtl ? 'جاري توثيق الدرجة...' : 'Certifying...') : (isRtl ? 'اعتماد نتيجة الاختبار الحالية وإدراجها بلوحة الشرف 🚀' : 'Certify Official Exam & Log to Registry 🚀')}
        </button>
      </div>

      {/* 📊 جدول سجل التقييمات والاختبارات الكبرى السابق */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md mt-6">
        
        {/* محرك البحث السريع */}
        <div className="relative mb-4 flex items-center">
          <FaSearch className={`absolute ${isRtl ? 'right-4' : 'left-4'} text-slate-500 text-xs`} />
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
            <FaSpinner className="animate-spin" /> {isRtl ? 'جاري تحميل سجل اللجان والشهادات...' : 'Loading matrix logs...'}
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
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/30 transition-colors text-slate-200">
                    <td className="py-3.5 px-3 font-bold text-white">{log.students?.name || (isRtl ? 'طالب غير متوفر' : 'N/A')}</td>
                    <td className="py-3.5 px-3">
                      <span className="bg-slate-900 border border-slate-800 text-[10px] px-1.5 py-0.5 rounded text-slate-400 mx-1">
                        {log.exam_type === 'surah' ? (isRtl ? 'سورة' : 'Surah') : log.exam_type === 'juz' ? (isRtl ? 'جزء' : 'Juz') : (isRtl ? 'آيات' : 'Verses')}
                      </span>
                      <span className="text-slate-300">{log.exam_target}</span>
                    </td>
                    <td className={`py-3.5 px-3 text-center font-extrabold ${log.final_score >= 90 ? 'text-emerald-400' : log.final_score >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                      {log.final_score}%
                    </td>
                    <td className="py-3.5 px-3 text-center text-[11px] text-slate-400">
                      {log.tajweed_grade === 'excellent' ? 'امتياز ومجود ✨' : log.tajweed_grade === 'good' ? 'حسن التلاوة 👍' : 'ضبط مخارج 🎯'}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                      {log.date ? new Date(log.date).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US') : '—'}
                    </td>
                    {/* ميزة توليد وطباعة الشهادة المضافة للمتفوقين */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => handlePrintCertificate(log)}
                        disabled={log.final_score < 75}
                        className={`p-1.5 rounded-lg border text-[10px] font-bold inline-flex items-center gap-1.5 transition-all active:scale-90 ${
                          log.final_score >= 90 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500 hover:text-slate-950' 
                            : 'bg-slate-950 text-slate-600 border-slate-900 disabled:opacity-20'
                        }`}
                        title={isRtl ? "طباعة شهادة التقدير الرسمية" : "Print Official Milestone Certificate"}
                      >
                        <FaPrint size={11} />
                        <span>{isRtl ? 'الشهادة' : 'Cert'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
