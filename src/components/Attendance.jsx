import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { Card, PageHeader, Btn } from './UI';

const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function Attendance({ students, academyId }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const fetchAttendance = useCallback(async () => {
    if (!academyId) return;
    setLoading(true);
    const { data: records, error } = await supabase
      .from('attendance')
      .select('id, student_id, status, notes')
      .eq('date', selectedDate)
      .eq('academy_id', academyId);

    const mapped = {};
    records?.forEach(r => {
      mapped[r.student_id] = { id: r.id, status: r.status, notes: r.notes || '' };
    });
    setAttendanceData(mapped);
    setLoading(false);
  }, [selectedDate, academyId]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const updateRecord = (studentId, updates) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: { ...prev[studentId], ...updates } }));
  };

  const saveAttendance = async () => {
    if (!academyId || !students) return;
    setBtnLoading(true);
    for (const s of students) {
      await supabase.rpc('upsert_attendance', {
        p_student_id: s.id,
        p_academy_id: academyId,
        p_date: selectedDate,
        p_status: attendanceData[s.id]?.status || 'غائب',
        p_notes: attendanceData[s.id]?.notes || ''
      });
    }
    setBtnLoading(false);
    alert('تم الحفظ بنجاح 🎉');
    fetchAttendance();
  };

  return (
    <div style={{ padding: isMobile ? '10px' : '24px' }}>
      <PageHeader title="📝 كشف الحضور" sub="سجل حضور الطلاب اليومي" />
      
      <div style={{ marginBottom: '20px' }}>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} 
          style={{ padding: '10px', borderRadius: '8px', width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #475569' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* 🛡️ إضافة علامة الاستفهام لحماية الخريطة التكرارية من الانهيار */}
        {students?.map(s => {
          const status = attendanceData[s.id]?.status || 'غائب';
          return (
            <div key={s.id} style={{ 
              background: '#1e293b', padding: '15px', borderRadius: '12px',
              display: 'flex', flexDirection: isMobile ? 'column' : 'row', 
              gap: '10px', alignItems: isMobile ? 'stretch' : 'center' 
            }}>
              <div style={{ flex: 1, fontWeight: 'bold' }}>{s.name}</div>
              
              <button 
                onClick={() => updateRecord(s.id, { status: status === 'حاضر' ? 'غائب' : 'حاضر' })}
                style={{ padding: '8px 16px', background: status === 'حاضر' ? '#10b981' : '#ef4444', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
              >
                {status}
              </button>
              
              <input 
                placeholder="ملاحظات..." 
                value={attendanceData[s.id]?.notes || ''} 
                onChange={(e) => updateRecord(s.id, { notes: e.target.value })}
                style={{ padding: '8px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569' }}
              />
            </div>
          );
        })}
      </div>

      <button onClick={saveAttendance} disabled={btnLoading} 
        style={{ marginTop: '20px', width: '100%', padding: '15px', background: '#fbbf24', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
      >
        {btnLoading ? 'جاري الحفظ...' : 'حفظ الكشف'}
      </button>
    </div>
  );
}
