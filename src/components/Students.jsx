import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [academyId, setAcademyId] = useState(null);
  
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [insertLoading, setInsertLoading] = useState(false);

  useEffect(() => {
    async function fetchStudentsData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: staffData } = await supabase
          .from('staff')
          .select('academy_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (staffData?.academy_id) {
          setAcademyId(staffData.academy_id);

          const { data: studentsList, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .eq('academy_id', staffData.academy_id)
            .order('name', { ascending: true });

          if (studentsError) throw studentsError;
          setStudents(studentsList || []);
        }
      } catch (error) {
        console.error('Error fetching students:', error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStudentsData();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim() || !academyId) return;

    try {
      setInsertLoading(true);
      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            name: newStudentName.trim(),
            parent_phone: newStudentPhone.trim() || null,
            academy_id: academyId
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setStudents(prev => [...prev, data[0]].sort((a, b) => a.name.localeCompare(b.name)));
        setNewStudentName('');
        setNewStudentPhone('');
        alert('تم تسجيل الطالب الجديد بنجاح 🎉');
      }
    } catch (error) {
      alert('خطأ أثناء إضافة الطالب: ' + error.message);
    } finally {
      setInsertLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', color: '#fff', direction: 'rtl', textAlign: 'right', fontFamily: "'Cairo', sans-serif" }}>
      
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>
          👥 إدارة شؤون وكشوف الطلاب
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
          إضافة طلاب الجدد، مراجعة البيانات والتحكم في كشوف الحلقة.
        </p>
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fbbf24', marginTop: 0, marginBottom: '16px' }}>➕ تسجيل طالب جديد بالحلقة</h3>
        <form onSubmit={handleAddStudent} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '0.85rem' }}>اسم الطالب رباعي</label>
            <input 
              type="text" 
              required
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="مثال: أحمد عبد الله عمر"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '0.85rem' }}>رقم هاتف ولي الأمر (اختياري)</label>
            <input 
              type="text" 
              value={newStudentPhone}
              onChange={(e) => setNewStudentPhone(e.target.value)}
              placeholder="05xxxxxxxx"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box', textAlign: 'left', direction: 'ltr' }}
            />
          </div>
          <button 
            type="submit"
            disabled={insertLoading}
            style={{ padding: '10px 24px', backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', height: '42px' }}
          >
            {insertLoading ? 'جاري الحفظ... ⏳' : 'تأكيد التسجيل'}
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', marginTop: 0, marginBottom: '16px' }}>📋 قوائم الطلاب المعتمدة حالياً</h3>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>جاري جلب السجلات... ⏳</p>
        ) : students.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>لا يوجد طلاب مسجلين في هذه الحلقة حالياً.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #475569', color: '#94a3b8', fontSize: '0.9rem' }}>
                  <th style={{ padding: '12px', textAlign: 'right' }}>م</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>اسم الطالب</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>رقم الهاتف</th>
                </tr>
              </thead>
              <tbody>
                {students.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #334155', fontSize: '0.95rem' }}>
                    <td style={{ padding: '12px', color: '#fbbf24' }}>{index + 1}</td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{item.name}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#cbd5e1', direction: 'ltr' }}>{item.parent_phone || 'غير مسجل'}</td>
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
