import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';

export default function Students({ students, setStudents }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', phone: '' });

  // تصفية الطلاب
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.parent_phone && s.parent_phone.includes(searchTerm))
  );

  // دالة تحديث البيانات
  const handleUpdate = async (id) => {
    const { error } = await supabase.from('students')
      .update({ name: editData.name, parent_phone: editData.phone })
      .eq('id', id);
    if (!error) {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...editData } : s));
      setEditId(null);
    } else {
      alert("خطأ في التحديث: " + error.message);
    }
  };

  // دالة الحذف
  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الطالب؟")) return;
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (!error) {
      setStudents(prev => prev.filter(s => s.id !== id));
    } else {
      alert("خطأ في الحذف: " + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', direction: 'rtl' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ color: '#fff' }}>{t('students')}</h2>
        <div style={{ background: C.surface, padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', color: '#fff' }}>
          {students.length} {t('total_students')}
        </div>
      </header>

      <input 
        placeholder={t('search_placeholder') || "🔍 بحث بالاسم أو الهاتف..."} 
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', marginBottom: '20px' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredStudents.map(s => (
          <div key={s.id} style={{ background: '#1e293b', padding: '16px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRight: `4px solid ${s.is_paid ? '#22c55e' : '#ef4444'}` }}>
            <div style={{ flex: 1 }}>
              {editId === s.id ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} style={{ padding: '5px', borderRadius: '4px' }} />
                  <button onClick={() => handleUpdate(s.id)} style={{ background: C.gold, border: 'none', cursor: 'pointer', padding: '5px 10px' }}>✅</button>
                </div>
              ) : (
                <>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>{s.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.parent_phone || '---'}</div>
                </>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setEditId(s.id); setEditData({ name: s.name, phone: s.parent_phone }); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✏️</button>
              <button onClick={() => handleDelete(s.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
              <a href={`https://wa.me/2${s.parent_phone}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#25D366', fontSize: '1.2rem' }}>💬</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
