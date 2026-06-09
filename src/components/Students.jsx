import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import * as XLSX from 'xlsx';

export default function Students({ students, setStudents, academyId }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', phone: '' });

  // 1. فلترة الطلاب (عرض النشطين فقط)
  const activeStudents = students.filter(s => !s.is_archived);
  const filteredStudents = activeStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. نظام الأرشفة (بدلاً من الحذف النهائي)
  const handleArchive = async (id) => {
    if (!window.confirm(t('confirm_archive') || "هل تريد أرشفة هذا الطالب؟")) return;
    const { error } = await supabase.from('students').update({ is_archived: true }).eq('id', id);
    if (!error) setStudents(prev => prev.map(s => s.id === id ? { ...s, is_archived: true } : s));
  };

  // 3. تصدير Excel
  const exportToExcel = () => {
    const data = activeStudents.map(s => ({ "الاسم": s.name, "الهاتف": s.parent_phone, "المستوى": s.academic_level }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "Students_Report.xlsx");
  };

  return (
    <div style={{ padding: '20px', direction: 'rtl', color: '#fff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>{t('students')} ({activeStudents.length})</h2>
        <button onClick={exportToExcel} style={{ background: C.gold, border: 'none', padding: '8px 12px', borderRadius: '8px' }}>📥 Excel</button>
      </header>

      <input 
        placeholder="🔍 بحث..." 
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', marginBottom: '20px' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredStudents.map(s => (
          <div key={s.id} style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{s.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.parent_phone || '---'}</div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleArchive(s.id)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '5px 10px', borderRadius: '6px' }}>أرشفة</button>
              <a href={`https://wa.me/2${s.parent_phone}`} target="_blank" rel="noreferrer" style={{ fontSize: '1.2rem' }}>💬</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
