import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { FaAward, FaMinus, FaPlus, FaCheckCircle, FaSearch, FaUserGraduation } from 'react-icons/fa';

export default function Exams({ students, academyId }) {
  // حالات إدارة واجهة الاختبارات
  const [selectedStudent, setSelectedStudent] = useState('');
  const [examType, setExamType] = useState('surah');
  const [examContent, setExamContent] = useState('');
  
  // عدادات الخصم المرنة
  const [fullErrors, setFullErrors] = useState(0);
  const [warnings, setWarnings] = useState(0);
  
  // مخارج الحروف والرسائل
  const [tajweedRating, setTajweedRating] = useState('excellent');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // قيم الخصم الافتراضية (سيتم ربطها بملف الإعدادات لاحقاً ديناميكياً)
  const errorPenalty = 5;
  const warningPenalty = 2;

  // حساب الدرجة تلقائياً حياً
  const calculatedScore = Math.max(0, 100 - (fullErrors * errorPenalty) - (warnings * warningPenalty));

  // إرسال وحفظ نتيجة الاختبار في قاعدة البيانات
  const handleSaveExam = async () => {
    if (!selectedStudent || !examContent.trim()) {
      setFeedbackMsg({ type: 'error', text: 'الرجاء اختيار الطالب وتحديد محتوى الاختبار أولاً.' });
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

      setFeedbackMsg({ type: 'success', text: 'تم اعتماد وتوثيق نتيجة اختبار الطالب بنجاح! 🎉' });
      
      // إعادة تصفير الاستمارة لاختبار طالب آخر
      setSelectedStudent('');
      setExamContent('');
      setFullErrors(0);
      setWarnings(0);
      setNotes('');
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: `فشل الحفظ: ${err.message || 'يرجى مراجعة صلاحيات RLS'}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
      
      {/* رأس القسم المطور */}
      <div style={{ backgroundColor: C.surface, padding: '20px', borderRadius: '12px', marginBottom: '20px', border: `1px solid ${C.border}` }}>
        <h2 style={{ color: C.gold, fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <FaAward /> لوحة رصد الاختبارات والترقيات القرآنية 🏆
        </h2>
        <p style={{ color: '#8A99AD', fontSize: '14px', marginTop: '8px', marginBottom: 0 }}>
          نظام تقييم معتمد مرن وملائم لكافة الأعمار والدول (الخطأ الكامل بـ {errorPenalty} درجات، والتنبيه بـ {warningPenalty} درجات).
        </p>
      </div>

      {/* لوحة إجراء الاختبار الحي */}
      <div style={{ backgroundColor: C.surface, padding: '25px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
        <h3 style={{ color: '#FFF', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaUserGraduation style={{ color: C.gold }} /> إجراء اختبار حي للطالب
        </h3>

        {/* تنبيهات النجاح أو الفشل */}
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
            <label style={{ display: 'block', color: '#BACCDD', marginBottom: '8px', fontSize: '14px' }}>اختر الطالب / الطالبة</label>
            <select 
              value={selectedStudent} 
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{ width: '100%', padding: '12px', backgroundColor: '#0D1622', border: `1px solid ${C.border}`, borderRadius: '8px', color: '#FFF', fontSize: '14px' }}
            >
              <option value="">-- اختر الطالب من الحلقة --</option>
              {students.map(std => (
                <option key={std.id} value={std.id}>{std.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#BACCDD', marginBottom: '8px', fontSize: '14px' }}>نوع التقييم</label>
            <select 
              value={examType} 
              onChange={(e) => setExamType(e.target.value)}
              style={{ width: '100%', padding: '12px', backgroundColor: '#0D1622', border: `1px solid ${C.border}`, borderRadius: '8px', color: '#FFF', fontSize: '14px' }}
            >
              <option value="surah">سورة قصيرة / كاملة</option>
              <option value="juz">اختبار جزء قرآن كامل</option>
              <option value="verses">آيات محددة</option>
            </select>
          </div>
        </div>

        {/* محتوى الاختبار */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', color: '#BACCDD', marginBottom: '8px', fontSize: '14px' }}>المحتوى المراد امتحانه</label>
          <input 
            type="text" 
            value={examContent}
            onChange={(e) => setExamContent(e.target.value)}
            placeholder="مثال: سورة النبأ، أو جزء عم كاملاً"
            style={{ width: '100%', padding: '12px', backgroundColor: '#0D1622', border: `1px solid ${C.border}`, borderRadius: '8px', color: '#FFF', fontSize: '14px' }}
          />
        </div>

        {/* عدادات رصد الأخطاء والتنبيهات حياً */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' }}>
          
          {/* عداد الخطأ الكامل */}
          <div style={{ backgroundColor: '#132235', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <span style={{ display: 'block', color: '#F87171', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>الخطأ الكامل (نسيان/تبديل)</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <button onClick={() => setFullErrors(prev => Math.max(0, prev - 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', backgroundColor: '#2D3748', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyCentet: 'center' }}><FaMinus style={{margin:'auto'}}/></button>
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFF', minWidth: '30px' }}>{fullErrors}</span>
              <button onClick={() => setFullErrors(prev => prev + 1)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', backgroundColor: '#EF4444', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyCentet: 'center' }}><FaPlus style={{margin:'auto'}}/></button>
            </div>
            <span style={{ display: 'block', color: '#6B7280', fontSize: '11px', marginTop: '8px' }}>(-{errorPenalty} درجات للواحد)</span>
          </div>

          {/* عداد الردة والتنبيه */}
          <div style={{ backgroundColor: '#132235', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <span style={{ display: 'block', color: '#F59E0B', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>الردة / التنبيه (الفتح)</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <button onClick={() => setWarnings(prev => Math.max(0, prev - 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', backgroundColor: '#2D3748', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyCentet: 'center' }}><FaMinus style={{margin:'auto'}}/></button>
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFF', minWidth: '30px' }}>{warnings}</span>
              <button onClick={() => setWarnings(prev => prev + 1)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', backgroundColor: '#F59E0B', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyCentet: 'center' }}><FaPlus style={{margin:'auto'}}/></button>
            </div>
            <span style={{ display: 'block', color: '#6B7280', fontSize: '11px', marginTop: '8px' }}>(-{warningPenalty} درجات للواحد)</span>
          </div>

        </div>

        {/* أداء التجويد ومخارج الحروف */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', color: '#BACCDD', marginBottom: '10px', fontSize: '14px' }}>مخارج الحروف والتجويد الفطري</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {[
              { id: 'excellent', label: 'ممتاز ومجود ✨' },
              { id: 'good', label: 'حسن التلاوة 👍' },
              { id: 'needs_work', label: 'بحاجة لضبط المخارج 🎯' }
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
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* الملاحظات والرسائل التشجيعية */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', color: '#BACCDD', marginBottom: '8px', fontSize: '14px' }}>عبارة ثناء ورسالة تشجيعية للطالب</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثال: أداء متميز ومبارك، زادك الله توفيقاً وثباتاً في صدرك."
            rows={3}
            style={{ width: '100%', padding: '12px', backgroundColor: '#0D1622', border: `1px solid ${C.border}`, borderRadius: '8px', color: '#FFF', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        {/* شاشة احتساب الدرجة الحية */}
        <div style={{
          backgroundColor: '#0A111A', padding: '20px', borderRadius: '10px', textAlign: 'center', marginBottom: '25px',
          border: `1px dashed ${calculatedScore >= 90 ? '#10B981' : calculatedScore >= 75 ? '#F59E0B' : '#EF4444'}`
        }}>
          <span style={{ color: '#BACCDD', fontSize: '15px' }}>الدرجة المستحقة المحتسبة حياً:</span>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: calculatedScore >= 90 ? '#10B981' : calculatedScore >= 75 ? '#F59E0B' : '#EF4444', marginTop: '5px' }}>
            {calculatedScore} / 100
          </div>
        </div>

        {/* زر اعتماد وحفظ النتيجة */}
        <button
          onClick={handleSaveExam}
          disabled={isSubmitting}
          style={{
            width: '100%', padding: '15px', backgroundColor: C.gold || '#C9A84C', color: '#000', border: 'none',
            borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: isSubmitting ? 0.6 : 1
          }}
        >
          <FaCheckCircle /> {isSubmitting ? 'جاري الحفظ وإصدار التقييم...' : 'اعتماد نتيجة الاختبار وإدراجها بـ لوحة الشرف 🚀'}
        </button>

      </div>

      {/* شريط البحث ومعاينة الشهادات السفلي */}
      <div style={{ backgroundColor: C.surface, padding: '20px', borderRadius: '12px', marginTop: '25px', border: `1px solid ${C.border}` }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <FaSearch style={{ position: 'absolute', right: '15px', color: '#657585' }} />
          <input 
            type="text" 
            placeholder="ابحث عن اسم طالب أو سورة لمعاينة الشهادات والنتائج المعتمدة السابقة..."
            style={{ width: '100%', padding: '12px 45px 12px 15px', backgroundColor: '#0D1622', border: `1px solid ${C.border}`, borderRadius: '8px', color: '#FFF', fontSize: '14px' }}
          />
        </div>
        <div style={{ textAlign: 'center', color: '#657585', padding: '30px 10px', fontSize: '14px' }}>
          لا يوجد اختبارات مسجلة بعد لهذا النطاق المختار.
        </div>
      </div>

    </div>
  );
}
