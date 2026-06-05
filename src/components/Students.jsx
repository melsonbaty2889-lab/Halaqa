import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C, g } from '../constants/colors'; // 🎨 الالتزام بهوية المنصة الفاخرة

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState({ id: null, academy_id: null });
  
  // حقول الإدخال (مدمجة ومطابقة للبنية البرمجية المستقرة)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentSurah, setCurrentSurah] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. جلب بيانات المستخدم المسجل حالياً بشكل آمن وضمان عدم انهيار الـ single()
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // استخدام maybeSingle لمنع انهيار التطبيق في حال عدم وجود سجل

      if (staffError) throw staffError;
      
      if (staffData) {
        setCurrentTeacher(staffData);

        // 2. جلب طلاب هذه الأكاديمية المحددة فقط (متوافق مع RLS لمنع قفل البيانات)
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
      alert('⚠️ خطأ أثناء جلب كشف الطلاب: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('برجاء كتابة اسم الطالب');
    setBtnLoading(true);

    try {
      // بناء الـ Payload ليتطابق بدقة مع حقول جدول السوبابيز المفعّل
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

      // تصفير الحقول بعد النجاح السحابي
      setName('');
      phone && setPhone('');
      currentSurah && setCurrentSurah('');

    } catch (error) {
      alert('❌ فشل حفظ الطالب في السيرفر: ' + error.message);
    } finally {
      setBtnLoading(false);
    }
  };

  // 🚀 خاصية المراسلة الفورية لولي الأمر بنقرة واحدة عبر الواتساب
  const sendWhatsAppMessage = (studentName, parentPhone) => {
    if (!parentPhone) return alert('لا يوجد رقم هاتف مسجل لهذا الطالب');
    
    let formattedPhone = parentPhone.replace(/\D/g, '');
    if (formattedPhone.startsWith('01')) {
      formattedPhone = '2' + formattedPhone; // إضافة الكود الدولي لمصر تلقائياً
    }

    const message = encodeURIComponent(`السلام عليكم ورحمة الله وبركاته\nمعكم أكاديمية القرآن الكريم. نود إعلامكم بتسجيل الطالب المتميز (${studentName}) معنا في الحلقة الذكية بنجاح. نسأل الله له التوفيق والبركة في حفظ كتابه. 🌸`);
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  return (
    <div style={{ padding: '24px', backgroundColor: C.bg, minHeight: '100vh', direction: 'rtl', textAlign: 'right', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* رأس الصفحة */}
      <div style={{ marginBottom: '32px', borderBottom: `1px solid ${C.border}`, paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: C.gold, margin: 0 }}>
          👥 دليل شؤون الطلاب وإدارة الحلقات
        </h2>
        <p style={{ color: C.muted, fontSize: '0.85rem', marginTop: '6px' }}>
          أضف طلابك وتابع محفوظهم الحالي وتواصل مع أولياء أمورهم فورياً من مكان واحد
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* قسم 1: نموذج إضافة طالب جديد (Form) */}
        <div style={{ backgroundColor: C.surface,  padding: '24px', borderRadius: '14px', border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: C.text, marginTop: 0, marginBottom: '20px' }}>
            تسجيل طالب جديد بالحلقة
          </h3>
          <form onSubmit={handleRegisterStudent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: C.muted, marginBottom: '6px' }}>اسم الطالب رباعي *</label>
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px', color: '#FFF', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="مثال: عاصم محمد مصطفى..."
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: C.muted, marginBottom: '6px' }}>رقم هاتف ولي الأمر</label>
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px', color: '#FFF', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="010XXXXXXXX"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: C.muted, marginBottom: '6px' }}>المحفوظ الحالي / السورة الحالية</label>
              <input
                type="text" value={currentSurah} onChange={(e) => setCurrentSurah(e.target.value)}
                style={{ width: '100%', backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px', color: '#FFF', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="مثال: سورة الملك أو الجزء الأول"
              />
            </div>
            <button
              type="submit" disabled={btnLoading}
              style={{ width: '100%', background: g.gold, color: '#1A1208', fontWeight: 'bold', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', marginTop: '8px', transition: 'all 0.2s' }}
            >
              {btnLoading ? 'جاري الحفظ بالسيرفر... ⏳' : '➕ حفظ الطالب بالحلقة السحابية'}
            </button>
          </form>
        </div>

        {/* قسم 2: كشف العرض وجدول البيانات (Table) */}
        <div style={{ lgColSpan: 2, backgroundColor: C.surface, padding: '24px', borderRadius: '14px', border: `1px solid ${C.border}`, overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: C.text, marginTop: 0, marginBottom: '20px' }}>
            قائمة طلاب الأكاديمية الحاليين
          </h3>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: C.muted }}>جاري قراءة كشوف الحلقات ومزامنتها سحابياً... ⏳</div>
          ) : students.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: C.muted }}>لا يوجد طلاب مسجلين حالياً في هذه الأكاديمية.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: C.gold, fontSize: '0.85rem', borderBottom: `1px solid ${C.border}` }}>
                  <th style={{ padding: '12px' }}>اسم الطالب رباعي</th>
                  <th style={{ padding: '12px' }}>الهاتف</th>
                  <th style={{ padding: '12px' }}>المحفوظ الحالي</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>إجراء سريع</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.88rem', color: C.text }}>
                {students.map((student) => (
                  <tr key={student.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '14px', fontWeight: '600', color: '#F1F5F9' }}>{student.name}</td>
                    <td style={{ padding: '14px', color: '#CBD5E1' }}>{student.parent_phone || 'غير مسجل'}</td>
                    <td style={{ padding: '14px', color: '#10B981', fontWeight: 'bold' }}>📖 {student.current_surah || 'لم يحدد'}</td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <button
                        onClick={() => sendWhatsAppMessage(student.name, student.parent_phone)}
                        style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', color: '#10B981', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        💬 واتساب ولي الأمر
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
