/* src/components/Parents/ParentStudentLink.jsx */
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Link2, Search, Check, AlertCircle, UserCheck } from 'lucide-react';
import { formatName } from '@/utils/formatters';

export default function ParentStudentLink({ academyId }) {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [relationshipType, setRelationshipType] = useState('father');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let parentQuery = supabase.from('parents').select('id, name, phone');
      let studentQuery = supabase.from('students').select('id, name, parent_id');

      if (academyId) {
        parentQuery = parentQuery.eq('academy_id', academyId);
        studentQuery = studentQuery.eq('academy_id', academyId);
      }

      const [pRes, sRes] = await Promise.all([parentQuery, studentQuery]);

      if (pRes.data) setParents(pRes.data);
      if (sRes.data) setStudents(sRes.data);
    } catch (err) {
      console.error('خطأ في جلب البيانات:', err);
    } finally {
      setLoading(false);
    }
  }, [academyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // جلب الأبناء المربوطين من جدول student_guardians
  useEffect(() => {
    if (!selectedParentId) {
      setSelectedStudentIds([]);
      return;
    }

    async function loadGuardians() {
      const { data } = await supabase
        .from('student_guardians')
        .select('student_id, relationship_type')
        .eq('parent_id', selectedParentId);

      if (data) {
        setSelectedStudentIds(data.map(d => d.student_id));
        if (data.length > 0 && data[0].relationship_type) {
          setRelationshipType(data[0].relationship_type);
        }
      }
    }

    loadGuardians();
  }, [selectedParentId]);

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSaveLinks = async () => {
    if (!selectedParentId) {
      setStatusMsg({ type: 'error', text: 'يرجى اختيار ولي الأمر أولاً' });
      return;
    }

    try {
      setSaving(true);
      setStatusMsg(null);

      // 1. حذف العلاقات القديمة لولي الأمر في جدول student_guardians
      await supabase
        .from('student_guardians')
        .delete()
        .eq('parent_id', selectedParentId);

      // 2. إضافة العلاقات الجديدة
      if (selectedStudentIds.length > 0) {
        const guardiansData = selectedStudentIds.map(studentId => ({
          student_id: studentId,
          parent_id: selectedParentId,
          relationship_type: relationshipType,
        }));

        const { error: linkErr } = await supabase
          .from('student_guardians')
          .insert(guardiansData);

        if (linkErr) throw linkErr;

        // 3. تحديث parent_id المباشر في جدول students
        await supabase
          .from('students')
          .update({ parent_id: selectedParentId })
          .in('id', selectedStudentIds);
      }

      setStatusMsg({ type: 'success', text: 'تم تحديث روابط الأبناء بنجاح!' });
      fetchData();
    } catch (err) {
      console.error('خطأ في حفظ العمليات:', err);
      setStatusMsg({ type: 'error', text: 'حدث خطأ أثناء حفظ التغييرات: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const studentName = typeof s.name === 'object' ? (s.name?.ar || s.name?.en || '') : s.name;
    const formatted = formatName ? formatName(studentName, 'ar') : studentName;
    return formatted.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div dir="rtl" style={{ maxWidth: '800px', margin: '0 auto', color: '#F8FAFC', fontFamily: "'Cairo', sans-serif" }}>
      
      {statusMsg && (
        <div style={{ padding: '12px', borderRadius: '10px', marginBottom: '16px', background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: `1px solid ${statusMsg.type === 'success' ? '#10B981' : '#EF4444'}`, color: statusMsg.type === 'success' ? '#10B981' : '#EF4444', fontSize: '13px' }}>
          {statusMsg.text}
        </div>
      )}

      <div style={{ background: '#1E293B', padding: '16px', borderRadius: '14px', border: '1px solid #334155', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#CBD5E1', marginBottom: '8px', fontWeight: '700' }}>اختر ولي الأمر:</label>
          <select 
            value={selectedParentId} 
            onChange={(e) => setSelectedParentId(e.target.value)} 
            style={{ width: '100%', padding: '10px', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '13px', outline: 'none' }}
          >
            <option value="">-- اضغط لاختيار ولي أمر --</option>
            {parents.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#CBD5E1', marginBottom: '8px', fontWeight: '700' }}>صلة القرابة:</label>
          <select 
            value={relationshipType} 
            onChange={(e) => setRelationshipType(e.target.value)} 
            style={{ width: '100%', padding: '10px', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '13px', outline: 'none' }}
          >
            <option value="father">أب (Father)</option>
            <option value="mother">أم (Mother)</option>
            <option value="guardian">ولي أمر (Guardian)</option>
            <option value="uncle">عم/خال (Uncle)</option>
            <option value="other">آخر (Other)</option>
          </select>
        </div>
      </div>

      {selectedParentId && (
        <div style={{ background: '#1E293B', padding: '16px', borderRadius: '14px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC', margin: 0 }}>حدد الطلاب التابعين لولي الأمر:</h3>
            <span style={{ fontSize: '12px', color: '#F59E0B' }}>محدد ({selectedStudentIds.length})</span>
          </div>

          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input 
              type="text" 
              placeholder="بحث عن طالب..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              style={{ width: '100%', padding: '8px 32px 8px 10px', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
            />
            <Search size={15} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          </div>

          <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', paddingLeft: '4px' }}>
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => {
                const isSelected = selectedStudentIds.includes(student.id);
                const rawName = typeof student.name === 'object' ? (student.name?.ar || student.name?.en || '') : student.name;
                return (
                  <div 
                    key={student.id} 
                    onClick={() => toggleStudentSelection(student.id)}
                    style={{ padding: '10px 12px', background: isSelected ? 'rgba(245, 158, 11, 0.1)' : '#0F172A', border: `1px solid ${isSelected ? '#F59E0B' : '#334155'}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <span style={{ fontSize: '13px', color: isSelected ? '#F59E0B' : '#F8FAFC', fontWeight: isSelected ? '700' : 'normal' }}>
                      {formatName ? formatName(rawName, 'ar') : rawName}
                    </span>
                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: isSelected ? '#F59E0B' : 'transparent', border: `1px solid ${isSelected ? '#F59E0B' : '#64748B'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isSelected && <Check size={14} style={{ color: '#0F172A' }} />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '16px', color: '#94A3B8', fontSize: '12px' }}>لا يوجد طلاب مطابقين للبحث</div>
            )}
          </div>

          <button 
            type="button" 
            onClick={handleSaveLinks} 
            disabled={saving}
            style={{ width: '100%', padding: '10px', background: '#F59E0B', border: 'none', borderRadius: '8px', color: '#0F172A', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <UserCheck size={16} /> {saving ? 'جاري التحديث...' : 'حفظ عمليات الربط'}
          </button>
        </div>
      )}
    </div>
  );
}
