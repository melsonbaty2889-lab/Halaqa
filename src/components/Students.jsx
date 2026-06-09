import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next'; // 1. إضافة الترجمة
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';

export default function Students() {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [academyId, setAcademyId] = useState(null);
  const [insertLoading, setInsertLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [searchTerm, setSearchTerm] = useState(''); // ميزة البحث

  // إضافة خاصية تحديد حجم الشاشة للموبايل
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStudents = useCallback(async (id) => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('academy_id', id)
      .order('name', { ascending: true });
    
    if (error) console.error("Error:", error);
    else setStudents(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('staff').select('academy_id').eq('user_id', user.id).maybeSingle();
      if (data?.academy_id) {
        setAcademyId(data.academy_id);
        fetchStudents(data.academy_id);
      }
    }
    init();
  }, [fetchStudents]);

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
    if (!window.confirm("حذف الطالب؟")) return;
    await supabase.from('students').delete().eq('id', id);
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: C.text, marginBottom: '24px' }}>{t('students')}</h2>
      
      {/* Search & Add Section */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px', marginBottom: '20px' }}>
        <input 
          placeholder="🔍 بحث..." 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', background: C.surface, color: C.text, border: '1px solid #475569' }}
        />
        <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '10px', flex: 1 }}>
          <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder={t('fullName')} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: C.surface, color: C.text, border: '1px solid #475569' }} />
          <button type="submit" style={{ background: C.gold, padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>+</button>
        </form>
      </div>

      {/* Responsive View */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredStudents.map(s => (
            <div key={s.id} style={{ background: C.surface, padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <div><strong>{s.name}</strong><br/>{s.parent_phone}</div>
              <button onClick={() => handleDelete(s.id)} style={{ color: '#ef4444', border: 'none', background: 'none' }}>حذف</button>
            </div>
          ))}
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: C.surface, borderRadius: '12px', overflow: 'hidden' }}>
          <thead><tr style={{ background: '#334155' }}><th>الاسم</th><th>الهاتف</th><th>الإجراءات</th></tr></thead>
          <tbody>
            {filteredStudents.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '16px' }}>{s.name}</td>
                <td style={{ padding: '16px' }}>{s.parent_phone}</td>
                <td style={{ padding: '16px' }}><button onClick={() => handleDelete(s.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>حذف</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
