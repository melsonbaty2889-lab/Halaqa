import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
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

      // 1. جلب بيانات المستخدم المسجل حالياً
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

        // 2. جلب طلاب هذه الأكاديمية المحددة فقط
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('academy_id', staffData.academy_id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setStudents(data || []);
      }

    } catch (error) {
      console.error('Error loading data:', error.message);
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

      // تصفير الحقول بعد النجاح
      setName('');
      setPhone('');
      setCurrentSurah('');

    } catch (error) {
      alert('فشل حفظ البيانات: ' + error.message);
    } finally {
      setBtnLoading(false);
    }
  };

  // خاصية المراسلة الفورية لولي الأمر عبر الواتساب
  const sendWhatsAppMessage = (studentName, parentPhone) => {
    if (!parentPhone) return alert('لا يوجد رقم هاتف مسجل لهذا الطالب');
    
    let formattedPhone = parentPhone.replace(/\D/g, '');
    if (formattedPhone.startsWith('01')) {
      formattedPhone = '2' + formattedPhone;
    }

    const message = encodeURIComponent(`السلام عليكم ورحمة الله وبركاته\nمعكم أكاديمية القرآن الكريم. نود إعلامكم بتسجيل الطالب المتميز (${studentName}) معنا في الحلقة بنجاح. نسأل الله له التوفيق والبركة. 🌸`);
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  return (
    <div style={{ padding: '20px', color: '#fff', direction: 'rtl', textAlign: 'right' }}>
      
      {/* رأس الصفحة */}
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
        <h2 style={{ fontSize: '24px', color: '#fbbf24', margin: '0 0 10px 0' }}>
          👥 دليل شؤون الطلاب وإدارة الحلقات
        </h2>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
          أضف طلابك وتابع محفوظهم الحالي وتواصل مع أولياء أمورهم فورياً من مكان واحد.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* قسم 1: نموذج إضافة طالب جديد */}
        <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#f8fafc' }}>تسجيل طالب جديد بالحلقة</h3>
          <form onSubmit={handleRegisterStudent}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '14px' }}>اسم الطالب رباعي *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                placeholder="مثال: عاصم محمد مصطفى..."
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '14px' }}>رقم هاتف ولي الأمر</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                placeholder="010XXXXXXXX"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '14px' }}>المحفوظ الحالي / السورة الحالية</label>
              <input
                type="text"
                value={currentSurah}
                onChange={(e) => setCurrentSurah(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                placeholder="مثال: سورة الملك"
              />
            </div>
            <button
              type="submit"
              disabled={btnLoading}
              style={{ width: '100%', padding: '12px', backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {btnLoading ? 'جاري الحفظ... ⏳' : '➕ حفظ الطالب بالحلقة السحابية'}
            </button>
          </form>
        </div>

        {/* قسم 2: جدول العرض */}
        <div style={{ flex: '2', minWidth: '300px', backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', overflowX: 'auto' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#f8fafc' }}>قائمة طلاب الأكاديمية الحاليين</h3>
          
          {loading ? (
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>جاري قراءة كشوف الحلقات سحابياً... ⏳</p>
          ) : students.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>لا يوجد طلاب مسجلين حالياً في هذه الأكاديمية.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #475569', color: '#fbbf24', textAlign: 'right' }}>
                  <th style={{ padding: '10px' }}>اسم الطالب</th>
                  <th style={{ padding: '10px' }}>الهاتف</th>
                  <th style={{ padding: '10px' }}>المحفوظ الحالي</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>إجراء سريع</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '12px', color: '#f8fafc' }}>{student.name}</td>
                    <td style={{ padding: '12px', color: '#cbd5e1' }}>{student.parent_phone || 'غير مسجل'}</td>
                    <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold' }}>📖 {student.current_surah || 'لم يحدد'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => sendWhatsAppMessage(student.name, student.parent_phone)}
                        style={{ padding: '5px 10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
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
