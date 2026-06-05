import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; 
import { C, g } from '../constants/colors'; // 🎨 الاعتماد الكامل على ألوان المنصة الموحدة

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState({ id: null, academy_id: null });
  
  // حقول الإدخال
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentSurah, setCurrentSurah] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. جلب بيانات المحفظ الحالي والأكاديمية التابع لها
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (staffError) throw staffError;
      
      if (staffData) {
        setCurrentTeacher(staffData);

        // 2. جلب طلاب هذه الأكاديمية فقط (مطابقة مع الـ RLS لضمان ظهور البيانات)
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('academy_id', staffData.academy_id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setStudents(data || []);
      }

    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error.message);
      alert('⚠️ تعذر جلب كشف الطلاب: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('برجاء كتابة اسم الطالب');
    setBtnLoading(true);

    try {
      const payload = {
        name: name.trim(),
        parent_phone: phone.trim(),
        current_surah: currentSurah.trim(),
        academy_id: currentTeacher?.academy_id,
        teacher_id: currentTeacher?.id
      };
      
      const { data, error } = await supabase
        .from('students')
        .insert([payload])
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        setStudents([data[0], ...students]);
      }

      // تصفير الحقول وإغلاق النافذة
      setName('');
      setPhone('');
      setCurrentSurah('');
      setShowModal(false);

    } catch (error) {
      alert('❌ فشل حفظ الطالب في السيرفر: ' + error.message);
    } finally {
      setBtnLoading(false);
    }
  };

  // 🚀 خاصية إرسال رسالة ترحيبية أو متابعة فورية لولي الأمر عبر الواتساب
  const sendWhatsAppMessage = (studentName, parentPhone) => {
    if (!parentPhone) return alert('لا يوجد رقم هاتف مسجل لهذا الطالب');
    
    // تنظيف الرقم من أي رموز زائدة وضمان الكود الدولي لمصر إن لم يكن موجوداً
    let formattedPhone = parentPhone.replace(/\D/g, '');
    if (formattedPhone.startsWith('01')) {
      formattedPhone = '2' + formattedPhone;
    }

    const message = encodeURIComponent(`السلام عليكم ورحمة الله وبركاته\nمعكم أكاديمية القرآن الكريم. نود إعلامكم بتسجيل الطالب المتميز/ة (${studentName}) معنا في الحلقة الذكية بنجاح، ونسأل الله له التوفيق والسداد. 🌸`);
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  return (
    <div style={{ padding: '24px', backgroundColor: C.bg, minHeight: '100vh', direction: 'rtl', textAlign: 'right', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* الرأس (Header) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: C.gold, margin: 0 }}>دليل الحلقات والمحفوظ</h1>
          <p style={{ color: C.muted, fontSize: '0.85rem', marginTop: '4px', margin: 0 }}>إدارة شؤون الطلاب الحالية وقائمة البيانات الحية</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: g.gold, color: '#1A1208', fontWeight: 'bold', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}
        >
          ➕ إضافة طالب للحلقة
        </button>
      </div>

      {/* جدول البيانات الفخم */}
      <div style={{ backgroundColor: C.surface, borderRadius: '14px', overflowX: 'auto', border: `1px solid ${C.border}`, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: C.muted, fontSize: '0.95rem' }}>جاري جلب كشوف الحلقات ومزامنتها سحابياً... ⏳</div>
        ) : students.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: C.muted, fontSize: '0.95rem' }}>الجدول فارغ حالياً في هذه الأكاديمية. اضغط على إضافة طالب لتجربة النظام!</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: C.gold, fontSize: '0.85rem', borderBottom: `1px solid ${C.border}` }}>
                <th style={{ padding: '16px' }}>اسم الطالب رباعي</th>
                <th style={{ padding: '16px' }}>الهاتف (ولي الأمر)</th>
                <th style={{ padding: '16px' }}>المحفوظ الحالي</th>
                <th style={{ padding: '16px' }}>تاريخ التسجيل</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>إجراءات التواصل</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '0.88rem', color: C.text }}>
              {students.map((student) => (
                <tr key={student.id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '16px', fontWeight: '600', color: '#F1F5F9' }}>{student.name}</td>
                  <td style={{ padding: '16px', color: '#CBD5E1' }}>{student.parent_phone || 'لا يوجد'}</td>
                  <td style={{ padding: '16px', color: '#10B981', fontWeight: 'bold' }}>📖 {student.current_surah || 'لم يحدد بعد'}</td>
                  <td style={{ padding: '16px', color: C.muted }}>
                    {new Date(student.created_at).toLocaleDateString('ar-EG')}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={() => sendWhatsAppMessage(student.name, student.parent_phone)}
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', color: '#10B981', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      💬 إرسال واتساب
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* النافذة المنبثقة لإضافة طالب (Modal) */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', width: '100%', maxWidth: '420px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: C.gold }}>تسجيل طالب جديد بالحلقة</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: C.muted, fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            
            <form onSubmit={handleRegisterStudent} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: C.muted, marginBottom: '6px', fontWeight: '500' }}>اسم الطالب رباعي *</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px', color: '#FFF', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="مثال: عاصم محمد مصطفى"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: C.muted, marginBottom: '6px', fontWeight: '500' }}>رقم هاتف ولي الأمر</label>
                <input 
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px', color: '#FFF', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="010XXXXXXXX"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: C.muted, marginBottom: '6px', fontWeight: '500' }}>السورة الحالية</label>
                <input 
                  type="text" value={currentSurah} onChange={(e) => setCurrentSurah(e.target.value)}
                  style={{ width: '100%', backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px', color: '#FFF', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="مثال: سورة الملك"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '12px' }}>
                <button 
                  type="submit" disabled={btnLoading}
                  style={{ width: '100%', background: g.gold, color: '#1A1208', fontWeight: 'bold', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  {btnLoading ? 'جاري الحفظ بالسيرفر... ⏳' : 'حفظ وتأكيد 💾'}
                </button>
                <button 
                  type="button" onClick={() => setShowModal(false)} 
                  style={{ width: '50%', backgroundColor: 'rgba(255,255,255,0.05)', color: C.text, padding: '10px', borderRadius: '8px', border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  إلغاء
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
