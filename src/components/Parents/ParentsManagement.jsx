/* src/components/Parents/ParentsManagement.jsx */
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, UserPlus, Link2, Edit3 } from 'lucide-react';

import ParentModal from './ParentModal';
import ParentStudentLink from './ParentStudentLink';

export default function ParentsManagement({ academyId }) {
  const [activeTab, setActiveTab] = useState('list');
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parentToEdit, setParentToEdit] = useState(null);

  const fetchParents = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from('parents').select('*').order('created_at', { ascending: false });
      if (academyId) query = query.eq('academy_id', academyId);

      const { data, error } = await query;
      if (error) throw error;
      if (data) setParents(data);
    } catch (err) {
      console.error('خطأ في جلب الأولياء:', err.message);
    } finally {
      setLoading(false);
    }
  }, [academyId]);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const handleOpenAdd = () => {
    setParentToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (parent) => {
    setParentToEdit(parent);
    setIsModalOpen(true);
  };

  return (
    <div dir="rtl" style={{ maxWidth: '800px', margin: '0 auto', padding: '16px', color: '#F8FAFC', fontFamily: "'Cairo', sans-serif" }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#F59E0B', margin: 0 }}>شؤون أولياء الأمور</h2>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0 0' }}>إدارة بيانات الأولياء وربطهم بالطلاب المحفظين</p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          style={{ padding: '10px 14px', background: '#F59E0B', border: 'none', borderRadius: '10px', color: '#0F172A', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <UserPlus size={16} /> إضافة ولي أمر
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#1E293B', padding: '4px', borderRadius: '10px', border: '1px solid #334155' }}>
        <button
          onClick={() => setActiveTab('list')}
          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: activeTab === 'list' ? '#0F172A' : 'transparent', color: activeTab === 'list' ? '#F59E0B' : '#94A3B8', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Users size={15} /> قائمة الأولياء
        </button>
        <button
          onClick={() => setActiveTab('link')}
          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: activeTab === 'link' ? '#0F172A' : 'transparent', color: activeTab === 'link' ? '#F59E0B' : '#94A3B8', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Link2 size={15} /> ربط الأبناء
        </button>
      </div>

      {activeTab === 'list' ? (
        <div style={{ background: '#1E293B', borderRadius: '14px', border: '1px solid #334155', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#0F172A', color: '#94A3B8', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '12px' }}>الاسم</th>
                  <th style={{ padding: '12px' }}>رقم الهاتف</th>
                  <th style={{ padding: '12px' }}>البريد الإلكتروني</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>⏳ جاري التحميل...</td></tr>
                ) : parents.length > 0 ? (
                  parents.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#F8FAFC' }}>{p.name}</td>
                      <td style={{ padding: '12px', color: '#CBD5E1' }}>{p.phone}</td>
                      <td style={{ padding: '12px', color: '#CBD5E1' }}>{p.email || 'غير مدخل'}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button onClick={() => handleOpenEdit(p)} style={{ background: '#0F172A', border: '1px solid #334155', color: '#3B82F6', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                          <Edit3 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>لا يوجد أولياء أمور مسجلين</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <ParentStudentLink academyId={academyId} />
      )}

      <ParentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        parentToEdit={parentToEdit}
        academyId={academyId}
        onSaved={fetchParents}
      />
    </div>
  );
}
