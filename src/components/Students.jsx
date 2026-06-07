import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [academyId, setAcademyId] = useState(null);
  const [insertLoading, setInsertLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  // 1. جلب الطلاب
  const fetchStudents = useCallback(async (id) => {
    if (!id) return;
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('academy_id', id)
      .order('name', { ascending: true });
    
    if (error) console.error("Error fetching:", error);
    else setStudents(data || []);
    setLoading(false);
  }, []);

  // 2. التحقق من المستخدم وتحديد الأكاديمية
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('staff')
        .select('academy_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.academy_id) {
        setAcademyId(data.academy_id);
        fetchStudents(data.academy_id);
      } else {
        setLoading(false);
      }
    }
    init();
  }, [fetchStudents]);

  // 3. دالة الإضافة (محدثة بالكامل)
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("يجب كتابة اسم الطالب أولاً");
    if (!academyId) return alert("خطأ: لم يتم التعرف على الأكاديمية. يرجى تسجيل الخروج والدخول مجدداً.");

    setInsertLoading(true);
    
    const { data, error } = await supabase
      .from('students')
      .insert([{ 
        name: formData.name.trim(), 
        parent_phone: formData.phone.trim() || null, 
        academy_id: academyId 
      }])
      .select(); 

    if (error) {
      console.error("خطأ Supabase:", error);
      alert(`فشل التسجيل: ${error.message || 'تأكد من صلاحيات الإضافة'}`);
    } else {
      // تحديث الحالة بنجاح
      setStudents(prev => [...data, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
      setFormData({ name: '', phone: '' });
      alert("✅ تم إضافة الطالب بنجاح!");
    }
    setInsertLoading(false);
  };

  return (
    <div style={{ padding: '24px', direction: 'rtl', textAlign: 'right', fontFamily: "'Cairo', sans-serif" }}>
      <h2 style={{ color: '#fff', marginBottom: '24px' }}>👥 إدارة طلاب الحلقة</h2>
      
      {/* نموذج الإضافة */}
      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', marginBottom: '30px' }}>
        <h3 style={{ color: '#fbbf24', marginBottom: '16px', marginTop: 0 }}>➕ تسجيل طالب جديد</h3>
        <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <input 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="اسم الطالب"
            style={{ flex: 2, minWidth: '200px', padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
          />
          <input 
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="هاتف ولي الأمر"
            style={{ flex: 1, minWidth: '150px', padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
          />
          <button 
            type="submit" 
            disabled={insertLoading} 
            style={{ background: '#fbbf24', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {insertLoading ? 'جاري...' : 'تأكيد'}
          </button>
        </form>
      </div>

      {/* الجدول */}
      {loading ? (
        <p style={{ color: '#94a3b8', textAlign: 'center' }}>جاري تحميل البيانات...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', background: '#1e293b', borderRadius: '12px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#334155', textAlign: 'right' }}>
              <th style={{ padding: '16px' }}>الاسم</th>
              <th style={{ padding: '16px' }}>الهاتف</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? students.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '16px' }}>{item.name}</td>
                <td style={{ padding: '16px' }}>{item.parent_phone || 'غير مسجل'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="2" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>لا يوجد طلاب مسجلين بعد.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
