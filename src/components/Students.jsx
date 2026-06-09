import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';

export default function Students({ students, setStudents, academyId }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', phone: '' });

  // تصفية الطلاب
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // تحديث بيانات الطالب
  const handleUpdate = async (id) => {
    const { error } = await supabase.from('students')
      .update({ name: editData.name, parent_phone: editData.phone })
      .eq('id', id);
    
    if (!error) {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...editData } : s));
      setEditId(null);
    }
  };

  return (
    <div style={{ padding: '20px', direction: 'rtl' }}>
      <h2 style={{ color: '#fff', marginBottom: '20px' }}>{t('students')}</h2>

      {/* البحث */}
      <input 
        placeholder="🔍 بحث..." 
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', marginBottom: '20px' }}
      />

      {/* قائمة الطلاب */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredStudents.map(s => (
          <div key={s.id} style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editId === s.id ? (
              <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
                <input value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} style={{ flex: 1 }} />
                <button onClick={() => handleUpdate(s.id)} style={{ background: C.gold, border: 'none', borderRadius: '4px' }}>{t('save')}</button>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>
                  {s.name} 
                  {/* مؤشر الحالة المالية (دائرة ملونة) */}
                  <span style={{ marginLeft: '10px', display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: s.is_paid ? '#22c55e' : '#ef4444' }} title={s.is_paid ? 'مسدد' : 'متأخر'}></span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{s.parent_phone}</div>
              </div>
            )}
            
            {/* الأزرار */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setEditId(s.id); setEditData({ name: s.name, phone: s.parent_phone }); }} style={{ background: 'none', border: '1px solid #64748b', color: '#fff', padding: '5px 10px', borderRadius: '6px' }}>{t('edit')}</button>
              <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '5px 10px', borderRadius: '6px' }}>{t('delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
