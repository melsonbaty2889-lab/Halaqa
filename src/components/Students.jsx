import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';

export default function Students({ students, setStudents, academyId }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [insertLoading, setInsertLoading] = useState(false);

  // البحث اللحظي (Optimistic & Live)
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setInsertLoading(true);
    
    const { data, error } = await supabase.from('students').insert([{ 
      name: formData.name.trim(), 
      parent_phone: formData.phone.trim() || null, 
      academy_id: academyId 
    }]).select();

    if (!error) {
      setStudents(prev => [...data, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
      setFormData({ name: '', phone: '' });
    }
    setInsertLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirm_delete') || "هل أنت متأكد؟")) return;
    await supabase.from('students').delete().eq('id', id);
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div style={{ padding: '20px', direction: 'rtl' }}>
      <h2 style={{ color: '#fff', marginBottom: '20px' }}>{t('students')}</h2>

      {/* 1. البطاقة الإحصائية الاحترافية */}
      <div style={{ background: C.surface, padding: '20px', borderRadius: '16px', marginBottom: '20px', textAlign: 'center', border: `1px solid ${C.gold}` }}>
        <div style={{ fontSize: '0.9rem', color: C.muted }}>{t('total_students')}</div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: C.gold }}>{students.length}</div>
      </div>

      {/* 2. البحث ومنطقة الإضافة */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
        <input 
          placeholder="🔍 بحث..." 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '12px', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
        />
        <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '10px' }}>
          <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder={t('fullName')} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
          <button type="submit" disabled={insertLoading} style={{ background: C.gold, padding: '0 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
        </form>
      </div>

      {/* 3. قائمة الطلاب العصرية */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredStudents.map(s => (
          <div key={s.id} style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{s.name}</div>
              <div style={{ fontSize: '0.85rem', color: C.muted }}>{s.parent_phone || 'لا يوجد هاتف'}</div>
            </div>
            <button onClick={() => handleDelete(s.id)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}>
              حذف
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
