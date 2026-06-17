import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { 
  FaAward, 
  FaPlus, 
  FaMinus, 
  FaCheckCircle, 
  FaStar, 
  FaBookOpen, 
  FaTrophy, 
  FaSearch,
  FaGlobeAxial
} from 'react-icons/fa';

export default function Exams({ students, academyId }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  // 🌍 أوزان الخصم الديناميكية (Dynamic SaaS Settings)
  // القيمة الافتراضية هي النظام المصري (5 و 2) وتتغير تلقائياً حسب الأكاديمية
  const [mistakeWeight, setMistakeWeight] = useState(5);
  const [promptWeight, setPromptWeight] = useState(2);

  // حالات التحكم بالنموذج
  const [selectedStudent, setSelectedStudent] = useState('');
  const [examType, setExamType] = useState('surah'); 
  const [examTarget, setExamTarget] = useState(''); 
  
  // عدادات الاختبار
  const [mistakes, setMistakes] = useState(0); 
  const [prompts, setPrompts] = useState(0);   
  const [tajweedGrade, setTajweedGrade] = useState('excellent'); 
  const [notes, setNotes] = useState('');

  // حالات جلب السجل والتخزين
  const [examLogs, setExamLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 🌟 جلب إعدادات الأكاديمية الخاصة بالأوزان والخصومات ديناميكياً
  useEffect(() => {
    async function fetchAcademySettings() {
      if (!academyId) return;
      try {
        // نحاول جلب الأوزان لو كانت مضافة في جدول الأكاديميات
        const { data, error } = await supabase
          .from('academies')
          .select('mistake_weight, prompt_weight')
          .eq('id', academyId)
          .maybeSingle();

        if (data) {
          if (data.mistake_weight !== null) setMistakeWeight(Number(data.mistake_weight));
          if (data.prompt_weight !== null) setPromptWeight(Number(data.prompt_weight));
        }
      } catch (err) {
        console.log("ℹ️ تم استخدام النظام الافتراضي (الكتاتيب)، لم يتم العثور على أوزان مخصصة في جدول الأكاديمية بعد.");
      }
    }
    fetchAcademySettings();
  }, [academyId]);

  // 🧮 حساب الدرجة النهائية ديناميكياً بناءً على أوزان الدولة المحددة
  const calculateScore = () => {
    let baseScore = 100;
    baseScore -= (mistakes * mistakeWeight); 
    baseScore -= (prompts * promptWeight);  
    return Math.max(baseScore, 0); 
  };

  // جلب سجل الاختبارات السابقة
  useEffect(() => {
    async function fetchExams() {
      if (!academyId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('exams')
          .select('*, students(name)')
          .eq('academy_id', academyId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setExamLogs(data || []);
      } catch (err) {
        console.error("🚨 خطأ أثناء جلب سجل الاختبارات:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExams();
  }, [academyId]);

  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !examTarget) {
      alert(isRtl ? "الرجاء اختيار الطالب وتحديد محتوى الاختبار" : "Please select student and specify content");
      return;
    }

    setIsSaving(true);
    const finalScore = calculateScore();

    try {
      const examRecord = {
        student_id: selectedStudent,
        academy_id: academyId,
        exam_type: examType,
        exam_target: examTarget,
        mistakes: mistakes,
        prompts: prompts,
        tajweed_grade: tajweedGrade,
        final_score: finalScore,
        notes: notes,
        date: new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('exams')
        .insert([examRecord])
        .select('*, students(name)');

      if (error) throw error;

      if (data && data[0]) {
        setExamLogs(prev => [data[0], ...prev]);
      }

      setSelectedStudent('');
      setExamTarget('');
      setMistakes(0);
      setPrompts(0);
      setNotes('');
      setTajweedGrade('excellent');
      
      alert(isRtl ? "🎉 تم تسجيل التقييم بنجاح وإدراجه في لوحة شرف الطفل!" : "Exam recorded successfully!");

    } catch (err) {
      console.error("🚨 فشل حفظ سجل الاختبار:", err);
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredLogs = examLogs.filter(log => 
    log.students?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.exam_target?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* رأس الصفحة */}
      <div style={{ marginBottom: '25px', textAlign: isRtl ? 'right' : 'left' }}>
        <h2 style={{ color: C.gold || '#C9A84C', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
          {isRtl ? "لوحة رصد الاختبارات والترقيات القرآنية 🏆" : "Quranic Exams & Promotions Portal 🏆"}
        </h2>
        <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '13px' }}>
          {isRtl ? `نظام تقييم مرن (حساب الخصم الحالي: الخطأ بـ ${mistakeWeight} درجات وعتب الفتح بـ ${promptWeight} درجات)` : `Flexible grading system (Current rule: Error = -${mistakeWeight}, Prompt = -${promptWeight})`}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 992 ? '1fr' : '1fr 1.2fr', gap: '20px', alignItems: 'start' }}>
        
        {/* القسم الأول: استمارة رصد اختبار حي */}
        <div style={{ background: C.surface || '#111C2A', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaBookOpen color={C.gold} /> {isRtl ? "إجراء اختبار حي للطفل" : "Live Child Examination"}
          </h3>
          
          <form onSubmit={handleSaveExam} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* اختيار الطالب */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8' }}>{isRtl ? "اختر الطالب" : "Select Student"}</label>
              <select 
                value={selectedStudent} 
                onChange={(e) => setSelectedStudent(e.target.value)}
                style={{ background: '#0F172A', border: '1px solid #233247', color: '#fff', padding: '10px', borderRadius: '8px', outline: 'none', fontSize: '13px' }}
              >
                <option value="">{isRtl ? "-- اختر الطفل من الحلقة --" : "-- Select from Halaqa --"}</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* نوع المحتوى والنطاق */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>{isRtl ? "نوع التقييم" : "Exam Scope"}</label>
                <select 
                  value={examType} 
                  onChange={(e) => setExamType(e.target.value)}
                  style={{ background: '#0F172A', border: '1px solid #233247', color: '#fff', padding: '10px', borderRadius: '8px', outline: 'none', fontSize: '13px' }}
                >
                  <option value="surah">{isRtl ? "سورة قصيرة / كاملة" : "Surah"}</option>
                  <option value="verses">{isRtl ? "آيات محددة" : "Specific Verses"}</option>
                  <option value="juz">{isRtl ? "جزء كامل" : "Full Juz"}</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>{isRtl ? "المحتوى المراد امتحانه" : "Target Component"}</label>
                <input 
                  type="text" 
                  placeholder={examType === 'surah' ? (isRtl ? "مثال: سورة النبأ" : "e.g., Surah An-Naba") : (isRtl ? "مثال: العلق من 1 لـ 5" : "e.g., Al-Alaq 1-5")}
                  value={examTarget}
                  onChange={(e) => setExamTarget(e.target.value)}
                  style={{ background: '#0F172A', border: '1px solid #233247', color: '#fff', padding: '10px', borderRadius: '8px', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* عدادات رصد الأخطاء التفاعلية السريعة (تعتمد في الحساب على الأوزان الديناميكية للـ SaaS) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: '700' }}>{isRtl ? "الخطأ الكامل (نسيان/تبديل)" : "Full Mistakes"}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button type="button" onClick={() => setMistakes(m => Math.max(0, m - 1))} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#233247', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaMinus size={10}/></button>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', minWidth: '20px', textAlign: 'center' }}>{mistakes}</span>
                  <button type="button" onClick={() => setMistakes(m => m + 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#EF4444', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPlus size={10}/></button>
                </div>
                <span style={{ fontSize: '10px', color: '#64748b' }}>(-{mistakeWeight} {isRtl ? "درجات" : "points"})</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#F59E0B', fontWeight: '700' }}>{isRtl ? "الردة / التنبيه (الفتح)" : "Prompts / Helps"}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button type="button" onClick={() => setPrompts(p => Math.max(0, p - 1))} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#233247', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaMinus size={10}/></button>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', minWidth: '20px', textAlign: 'center' }}>{prompts}</span>
                  <button type="button" onClick={() => setPrompts(p => p + 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#F59E0B', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPlus size={10}/></button>
                </div>
                <span style={{ fontSize: '10px', color: '#64748b' }}>(-{promptWeight} {isRtl ? "درجة" : "points"})</span>
              </div>

            </div>

            {/* تقييم أحكام التجويد ومخارج الحروف للأطفال */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8' }}>{isRtl ? "مخارج الحروف والتجويد الفطري" : "Makharij & Tajweed Grade"}</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'excellent', text: isRtl ? 'ممتاز ومجود ✨' : 'Excellent' },
                  { id: 'good', text: isRtl ? 'حسن التلاوة 👍' : 'Good' },
                  { id: 'fair', text: isRtl ? 'بحاجة لضبط المخارج 🎯' : 'Needs Work' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTajweedGrade(item.id)}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '6px', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                      background: tajweedGrade === item.id ? C.gold : 'rgba(255,255,255,0.03)',
                      color: tajweedGrade === item.id ? '#000' : '#94a3b8'
                    }}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </div>

            {/* ملاحظة المحفظ والتشجيع */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8' }}>{isRtl ? "رسالة تشجيعية للطفل" : "Encouragement Note"}</label>
              <input 
                type="text" 
                placeholder={isRtl ? "مثال: بطل متميز، بارك الله في لوحك" : "e.g., Quran champion, blessed job"}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ background: '#0F172A', border: '1px solid #233247', color: '#fff', padding: '10px', borderRadius: '8px', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            {/* لوحة عرض النتيجة الحية */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0F172A', padding: '12px 16px', borderRadius: '10px', border: '1px dashed rgba(201,168,76,0.3)' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>{isRtl ? "الدرجة المستحقة المحتسبة حياً:" : "Live Calculated Score:"}</span>
              <span style={{ fontSize: '20px', fontWeight: '900', color: calculateScore() >= 90 ? '#10B981' : calculateScore() >= 75 ? '#F59E0B' : '#EF4444' }}>
                {calculateScore()} / 100
              </span>
            </div>

            {/* زر الاعتماد النهائي */}
            <button
              type="submit"
              disabled={isSaving}
              style={{ width: '100%', padding: '12px', background: C.gold, color: '#000', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
            >
              <FaAward /> {isSaving ? (isRtl ? "جاري الحفظ وإصدار التقييم..." : "Issuing Grade...") : (isRtl ? "اعتماد نتيجة الاختبار وإدراجها بـ لوحة الشرف 🚀" : "Approve & Log Exam 🚀")}
            </button>

          </form>
        </div>

        {/* القسم الثاني: لوحة الشرف وسجل الاختبارات السابق */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: C.surface, padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
            <FaSearch color="#64748b" size={13} />
            <input 
              type="text" 
              placeholder={isRtl ? "ابحث عن اسم طفل أو سورة لمعاينة الشهادات..." : "Search child name or surah..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '13px', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '540px', overflowY: 'auto', paddingRight: '4px' }}>
            {loading ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px', fontSize: '13px' }}>{isRtl ? "جاري تحميل لوحة درجات الكتاتيب..." : "Loading Kuttab scores..."}</p>
            ) : filteredLogs.length === 0 ? (
              <p style={{ color: '#94a3b8', opacity: 0.5, textAlign: 'center', padding: '30px', fontSize: '13px' }}>{isRtl ? "لا يوجد اختبارات مسجلة بعد لهذا النطاق." : "No registered exams yet."}</p>
            ) : (
              filteredLogs.map(log => {
                const isExcellent = log.final_score >= 90;
                return (
                  <div key={log.id} style={{ 
                    background: C.surface || '#111C2A', padding: '14px', borderRadius: '12px', border: isExcellent ? `1px solid rgba(16, 185, 129, 0.2)` : '1px solid rgba(255,255,255,0.02)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px'
                  }}>
                    <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: '#fff' }}>{log.students?.name}</span>
                        {isExcellent && <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}><FaTrophy size={9}/> {isRtl ? "حامي المصحف الصغير 👑" : "Elite"}</span>}
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                        {isRtl ? "اختبار في:" : "Examined:"} <span style={{ color: C.gold, fontWeight: '600' }}>{log.exam_target}</span> 
                        <span style={{ margin: '0 6px', color: '#334155' }}>|</span> 
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{log.date}</span>
                      </p>
                      {log.notes && <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#10B981', fontStyle: 'italic' }}>📌 {log.notes}</p>}
                    </div>

                    <div style={{ 
                      background: isExcellent ? 'rgba(16, 185, 129, 0.08)' : log.final_score >= 75 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      color: isExcellent ? '#10B981' : log.final_score >= 75 ? '#F59E0B' : '#EF4444',
                      padding: '8px 12px', borderRadius: '10px', textAlign: 'center', minWidth: '55px', border: `1px solid ${isExcellent ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)'}`
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '900' }}>{log.final_score}</div>
                      <div style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', marginTop: '1px' }}>{isRtl ? 'درجة' : 'Score'}</div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
