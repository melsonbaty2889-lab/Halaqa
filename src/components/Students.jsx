import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors'; // مفترض استخدام ملف الألوان الخاص بك

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [academyId, setAcademyId] = useState(null);
  const [insertLoading, setInsertLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  // دالة لجلب الطلاب مع استخدام useCallback لتثبيت الدالة
  const fetchStudents = useCallback(async (id) => {
    if (!id) return;
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('academy_id', id)
      .order('name', { ascending: true });
    
    if (error) console.error(error);
    else setStudents(data || []);
    setLoading(false);
  }, []);

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

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !academyId) return;

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
      alert('خطأ أثناء إضافة الطالب');
    } else {
      setStudents(prev => [...prev, ...data].sort((a, b) => a.name.localeCompare(b.name)));
      setFormData({ name: '', phone: '' });
    }
    setInsertLoading(false);
  };

  return (
    <div style={{ padding: '24px', direction: 'rtl', textAlign: 'right' }}>
      {/* قسم العناوين (يمكنك استخدامه كما هو) */}
      
      {/* نموذج الإضافة */}
      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', marginBottom: '30px' }}>
        <h3 style={{ color: '#fbbf24', marginBottom: '16px' }}>➕ تسجيل طالب جديد</h3>
        <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '15px' }}>
          <input 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="اسم الطالب"
            style={{ flex: 2, padding: '10px', borderRadius: '6px', border: 'none' }}
          />
          <input 
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="هاتف ولي الأمر"
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none' }}
          />
          <button type="submit" disabled={insertLoading} style={{ background: '#fbbf24', padding: '10px 20px', borderRadius: '6px', border: 'none' }}>
            {insertLoading ? '...' : 'تأكيد'}
          </button>
        </form>
      </div>

      {/* الجدول */}
      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #475569' }}>
            <th style={{ padding: '12px', textAlign: 'right' }}>الاسم</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>الهاتف</th>
          </tr>
        </thead>
        <tbody>
          {students.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '12px' }}>{item.name}</td>
              <td style={{ padding: '12px' }}>{item.parent_phone || 'غير مسجل'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
