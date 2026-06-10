import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

export default function Students({ students, setStudents }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [loadingId, setLoadingId] = useState(null);

  const debouncedSearch = useMemo(
    () => debounce((value) => setSearchTerm(value), 300),
    []
  );

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.parent_phone?.includes(searchTerm)
  );

  const handleUpdate = async (id) => {
    setLoadingId(id);
    const { error } = await supabase.from('students')
      .update({ name: editData.name, parent_phone: editData.phone })
      .eq('id', id);
    
    if (!error) {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...editData } : s));
      setEditId(null);
    } else {
      alert("خطأ في التحديث: " + error.message);
    }
    setLoadingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الطالب؟")) return;
    setLoadingId(id);
    const { error } = await supabase.from('students').delete().eq('id', id);
    
    if (!error) {
      setStudents(prev => prev.filter(s => s.id !== id));
    } else {
      alert("خطأ في الحذف: " + error.message);
    }
    setLoadingId(null);
  };

  return (
    <div style={{ padding: '20px', direction: 'rtl' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ color: '#fff' }}>{t('students')}</h2>
        <div style={{ background: C.surface, padding: '8px 16px', borderRadius: '20px', color: '#fff' }}>
          {filteredStudents.length} / {students.length}
        </div>
      </header>

      <input 
        placeholder="🔍 بحث بالاسم أو الهاتف..." 
        onChange={(e) => debouncedSearch(e.target.value)}
        style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', marginBottom: '20px' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredStudents.map(s => (
          <div key={s.id} style={{ 
            background: '#1e293b', 
            padding: '16px', 
            borderRadius: '14px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            borderRight: `6px solid ${s.is_paid ? '#22c55e' : '#ef4444'}` 
          }}>
            <div style={{ flex: 1 }}>
              // ... (الاستيرادات والدالة المدمجة debounce كما هي)

{editId === s.id ? (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
    <input 
      value={editData.name} 
      onChange={(e) => setEditData({...editData, name: e.target.value})} 
      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #64748b', background: '#0f172a', color: '#fff', flex: 1 }} 
    />
    <button onClick={() => handleUpdate(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✅</button>
    <button onClick={() => setEditId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>❌</button>
  </div>
) : (
  <>
    <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.1rem' }}>{s.name}</div>
    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{s.parent_phone || '---'}</div>
  </>
)}

            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => { setEditId(s.id); setEditData({ name: s.name, phone: s.parent_phone }); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✏️</button>
              <button onClick={() => handleDelete(s.id)} disabled={loadingId === s.id} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: loadingId === s.id ? 0.5 : 1 }}>{loadingId === s.id ? '⌛' : '🗑️'}</button>
              <a href={`https://wa.me/2${s.parent_phone}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', fontSize: '1.2rem' }}>💬</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
