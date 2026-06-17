import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { 
  FaAward, 
  FaMinus, 
  FaPlus, 
  FaCheckCircle, 
  FaSearch, 
  FaGraduationCap, 
  FaSpinner, 
  FaCalendarAlt 
} from 'react-icons/fa';

export default function Exams({ students, academyId }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');

  // 🌍 أوزان الخصم الديناميكية (Dynamic SaaS Settings)
  // القيمة الافتراضية هي (5 و 2) وتتحدث تلقائياً حسب إعدادات الأكاديمية من السيرفر
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
        .order('created_at', { ascending: false });

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

  // 3️⃣ 💾 دالة اعتماد وحفظ نتيجة الاختبار الحي في السيرفر
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
      const { error } = await supabase
        .from('exams')
        .insert([{
          student_id: selectedStudent,
          academy_id: academyId,
          exam_type: examType,
          exam_content: examContent.trim(),
          full_errors: fullErrors,
          warnings: warnings,
          tajweed_rating: tajweedRating,
          score: calculatedScore,
          notes: notes.trim(),
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setFeedbackMsg({ 
        type: 'success', 
        text: isRtl ? 'تم اعتماد وتوثيق نتيجة اختبار الطالب بنجاح! 🎉' : 'Student exam result certified and documented successfully! 🎉' 
      });
      
      // تصفير استمارة الإدخال
      setSelectedStudent('');
      setExamContent('');
      setFullErrors(0);
      setWarnings(0);
      setNotes('');
      
      // تحديث الجدول السفلي فوراً حياً بدون ريفريش كامل للصفحة
      fetchExamLogs();
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ 
        type: 'error', 
        text: isRtl ? `فشل الحفظ: ${err.message || 'يرجى مراجعة صلاحيات الـ RLS'}` : `Save failed: ${err.message}` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔍 تصفية السجل بناءً على مربع البحث السفلي (اسم الطالب أو السورة)
  const filteredLogs = examLogs.filter(log => {
    const studentName = log.students?.name?.toLowerCase() || '';
    const content = log.exam_content?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return studentName.includes(query) || content.includes(query);
  });

  return (
    <div style={{ fontFamily: "'Cairo', sans-serif", direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* 👑 رأس القسم المطور والمعمم دولياً */}
      <div style={{ backgroundColor: C.surface, padding: '20px', borderRadius: '12px', marginBottom: '20px', border: `1px solid ${C.border}` }}>
        <h2 style={{ color: C.gold, fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <FaAward /> {isRtl ? 'لوحة رصد الاختبارات والترقيات القرآنية 🏆' : 'Quranic Exams & Promotions Panel 🏆'}
        </h2>
        <p style={{ color: '#8A99AD', fontSize: '14px', marginTop: '8px', marginBottom: 0 }}>
          {isRtl 
            ? `نظام تقييم مرن ملائم لكافة الأعمار والدول. (وزن الخطأ الحالي: ${mistakeWeight} درجات | وزن التنبيه الحالي: ${promptWeight} درجات).` 
            : `Flexible assessment system for all ages and countries. (Current error weight: ${mistakeWeight} | Current warning weight: ${promptWeight}).`
          }
        </p>
      </div>

      {/* 📝 استمارة إجراء التقييم الحي */}
      <div style={{ backgroundColor: C.surface, padding: '25px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
        <h3 style={{ color: '#FFF', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaUserGraduation style={{ color: C.gold }} /> {isRtl ? 'إجراء اختبار حي للطالب / الطالبة' : 'Conduct Live Student Exam'}
        </h3>

        {feedbackMsg.text && (
          <div style={{
            padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold',
            backgroundColor: feedbackMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: feedbackMsg.type === 'success' ? '#10B981' : '#EF4444',
            border: `1px solid ${feedbackMsg.type === 'success' ? '#10B981' : '#EF4444'}`
          }}>
            {feedbackMsg.text}
          </div>
        )}

        {/* اختيارات الطالب ونوع التقييم */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#BACCDD', marginBottom: '8px', fontSize: '14px' }}>{isRtl ? 'اختر الطالب / الطالبة' : 'Select Student'}</label>
            <select 
              value={selectedStudent} 
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{ width: '100%', padding: '12px', backgroundColor: '#0D1622', border: `1px solid ${C.border}`, borderRadius: '8px', color: '#FFF', fontSize: '14px', textAlign: isRtl ? 'right' : 'left' }}
            >
              <option value="">{isRtl ? '-- اختر الطالب من الحلقة --' : '-- Select student from list --'}</option>
              {students.map(std => (
                <option key={std.id} value={std.id}>{std.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#BACCDD', marginBottom: '8px', fontSize: '14px' }}>{isRtl ? 'نوع التقييم' : 'Assessment Type'}</label>
            <select 
              value={examType} 
              onChange={(e) => setExamType(e.target.value)}
              style={{ width: '100%', padding: '12px', backgroundColor: '#0D1622', border: `1px solid ${C.border}`, borderRadius: '8px', color: '#FFF', fontSize: '14px', textAlign: isRtl ? 'right' : 'left' }}
            >
              <option value="surah">{isRtl ? 'سورة قصيرة / كاملة' : 'Short / Full Surah'}</option>
              <option value="juz">{isRtl ? 'اختبار جزء قرآن كامل' : 'Full Quranic Juz'}</option>
              <option value="verses">{isRtl ? 'آيات محددة' : 'Specific Verses'}</option>
            </select>
          </div>
        </div>

        {/* محتوى الاختبار */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', color: '#BACCDD', marginBottom: '8px', fontSize: '14px' }}>{isRtl ? 'المحتوى المراد امتحانه' : 'Exam Content'}</label>
          <input 
            type="text" 
            value={examContent}
            onChange={(e) => setExamContent(e.target.value)}
            placeholder={isRtl ? "مثال: سورة النبأ، أو جزء عم كاملاً" : "e.g., Surah An-Naba, or Juz Amma"}
            style={{ width: '100%', padding: '12px', backgroundColor: '#0D1622', border: `1px solid ${C.border}`, borderRadius: '8px', color: '#FFF', fontSize: '14px' }}
          />
        </div>

        {/* عدادات رصد الأخطاء الحية بالتزامن مع الأوزان الديناميكية */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' }}>
          
          <div style={{ backgroundColor: '#132235', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <span style={{ display: 'block', color: '#F87171', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>{isRtl ? 'الخطأ الكامل (نسيان/تبديل)' : 'Full Error (Forgotten/Swapped)'}</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <button type="button" onClick={() => setFullErrors(prev => Math.max(0, prev - 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', backgroundColor: '#2D3748', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaMinus style={{margin:'auto'}}/></button>
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFF', minWidth: '30px' }}>{fullErrors}</span>
              <button type="button" onClick={() => setFullErrors(prev => prev + 1)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', backgroundColor: '#EF4444', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPlus style={{margin:'auto'}}/></button>
            </div>
            <span style={{ display: 'block', color: '#6B7280', fontSize: '11px', marginTop: '8px' }}>(-{mistakeWeight} {isRtl ? 'درجات للواحد' : 'points each'})</span>
          </div>

          <div style={{ backgroundColor: '#132235', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <span style={{ display: 'block', color: '#F59E0B', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>{isRtl ? 'الردة / التنبيه (الفتح)' : 'Warning / Prompt'}</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <button type="button" onClick={() => setWarnings(prev => Math.max(0, prev - 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', backgroundColor: '#2D3748', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaMinus style={{margin:'auto'}}/></button>
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFF', minWidth: '30px' }}>{warnings}</span>
              <button type="button" onClick={() => setWarnings(prev => prev + 1)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', backgroundColor: '#F59E0B', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPlus style={{margin:'auto'}}/></button>
            </div>
            <span style={{ display: 'block', color: '#6B7280', fontSize: '11px', marginTop: '8px' }}>(-{promptWeight} {isRtl ? 'درجات للواحد' : 'points each'})</span>
          </div>

        </div>

        {/* أداء التجويد ومخارج الحروف */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', color: '#BACCDD', marginBottom: '10px', fontSize: '14px' }}>{isRtl ? 'مخارج الحروف والتجويد الفطري' : 'Tajweed & Articulation Quality'}</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {[
              { id: 'excellent', ar: 'ممتاز ومجود ✨', en: 'Excellent & Tajweed ✨' },
              { id: 'good', ar: 'حسن التلاوة 👍', en: 'Good Recitation 👍' },
              { id: 'needs_work', ar: 'بحاجة لضبط المخارج 🎯', en: 'Needs Articulation Work 🎯' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTajweedRating(item.id)}
                style={{
                  padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: 'all 0.2s ease',
                  backgroundColor: tajweedRating === item.id ? (C.gold || '#C9A84C') : '#132235',
                  color: tajweedRating === item.id ? '#000' : C.text
                }}
              >
                {isRtl ? item.ar : item.en}
              </button>
            ))}
          </div>
        </div>

        {/* الملاحظات والرسائل التشجيعية */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', color: '#BACCDD', marginBottom: '8px', fontSize: '14px' }}>{isRtl ? 'عبارة ثناء ورسالة تشجيعية للطالب' : 'Praise & Motivational Message to Student'}</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isRtl ? "مثال: أداء متميز ومبارك، زادك الله توفيقاً وثباتاً." : "e.g., Outstanding performance, may Allah bless and grant you steadfastness."}
            rows={3}
            style={{ width: '100%', padding: '12px', backgroundColor: '#0D1622', border: `1px solid ${C.border}`, borderRadius: '8px', color: '#FFF', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        {/* شاشة احتساب الدرجة الحية */}
        <div style={{
          backgroundColor: '#0A111A', padding: '20px', borderRadius: '10px', textAlign: 'center', marginBottom: '25px',
          border: `1px dashed ${calculatedScore >= 90 ? '#10B981' : calculatedScore >= 75 ? '#F59E0B' : '#EF4444'}`
        }}>
          <span style={{ color: '#BACCDD', fontSize: '15px' }}>{isRtl ? 'الدرجة المستحقة المحتسبة حياً:' : 'Live Calculated Score:'}</span>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: calculatedScore >= 90 ? '#10B981' : calculatedScore >= 75 ? '#F59E0B' : '#EF4444', marginTop: '5px' }}>
            {calculatedScore} / 100
          </div>
        </div>

        {/* زر اعتماد وحفظ النتيجة الفوري */}
        <button
          onClick={handleSaveExam}
          disabled={isSubmitting}
          style={{
            width: '100%', padding: '15px', backgroundColor: C.gold || '#C9A84C', color: '#000', border: 'none',
            borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: isSubmitting ? 0.6 : 1
          }}
        >
          <FaCheckCircle /> {isSubmitting ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'اعتماد نتيجة الاختبار وإدراجها بـ لوحة الشرف 🚀' : 'Certify Exam & Include in Honor Roll 🚀')}
        </button>

      </div>

      {/* 🔍 شريط البحث وجدول عرض سجل الشهادات والاختبارات السابقة */}
      <div style={{ backgroundColor: C.surface, padding: '20px', borderRadius: '12px', marginTop: '25px', border: `1px solid ${C.border}` }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <FaSearch style={{ position: 'absolute', right: isRtl ? '15px' : 'auto', left: !isRtl ? '15px' : 'auto', color: '#657585' }} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? "ابحث عن اسم طالب أو سورة لمعاينة الشهادات والنتائج المعتمدة السابقة..." : "Search by student name or surah to view previous certified certificates..."}
            style={{ width: '100%', padding: isRtl ? '12px 45px 12px 15px' : '12px 15px 12px 45px', backgroundColor: '#0D1622', border: `1px solid ${C.border}`, borderRadius: '8px', color: '#FFF', fontSize: '14px' }}
          />
        </div>

        {loadingLogs ? (
          <div style={{ textAlign: 'center', color: C.gold, padding: '20px' }}>
            <FaSpinner className="animate-spin" style={{ marginRight: '8px' }} /> {isRtl ? 'جاري تحميل السجل البنيوي...' : 'Loading logs...'}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#657585', padding: '30px 10px', fontSize: '14px' }}>
            {isRtl ? 'لا يوجد اختبارات مسجلة تطابق بحثك حالياً.' : 'No recorded exams match your search currently.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px', textAlign: isRtl ? 'right' : 'left' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}`, color: '#BACCDD' }}>
                  <th style={{ padding: '12px' }}>{isRtl ? 'الطالب' : 'Student'}</th>
                  <th style={{ padding: '12px' }}>{isRtl ? 'المحتوى' : 'Content'}</th>
                  <th style={{ padding: '12px' }}>{isRtl ? 'الدرجة' : 'Score'}</th>
                  <th style={{ padding: '12px' }}>{isRtl ? 'التجويد' : 'Tajweed'}</th>
                  <th style={{ padding: '12px' }}><FaCalendarAlt /> {isRtl ? 'التاريخ' : 'Date'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: `1px solid ${C.border}`, color: '#FFF' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{log.students?.name || isRtl ? 'طالب محذوف' : 'Deleted Student'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ backgroundColor: '#1E293B', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', marginLeft: '6px' }}>
                        {log.exam_type === 'surah' ? (isRtl ? 'سورة' : 'Surah') : log.exam_type === 'juz' ? (isRtl ? 'جزء' : 'Juz') : (isRtl ? 'آيات' : 'Verses')}
                      </span>
                      {log.exam_content}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: log.score >= 90 ? '#10B981' : log.score >= 75 ? '#F59E0B' : '#EF4444' }}>
                      {log.score} / 100
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      {log.tajweed_rating === 'excellent' ? ' ممتاز ✨' : log.tajweed_rating === 'good' ? 'حسن 👍' : 'ضبط مخارج 🎯'}
                    </td>
                    <td style={{ padding: '12px', color: '#657585', fontSize: '12px' }}>
                      {new Date(log.created_at).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
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
