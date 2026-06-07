import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function Attendance({ students, academyId }) {
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  // دالة لجلب بيانات الحضور
  const fetchAttendance = useCallback(async () => {
    if (!academyId) return;
    setLoading(true);
    const { data: records, error } = await supabase
      .from('attendance')
      .select('id, student_id, status, notes')
      .eq('date', selectedDate)
      .eq('academy_id', academyId);

    if (error) console.error('خطأ جلب الحضور:', error.message);
    
    const mapped = {};
    records?.forEach(r => {
      mapped[r.student_id] = { id: r.id, status: r.status, notes: r.notes || '' };
    });
    setAttendanceData(mapped);
    setLoading(false);
  }, [selectedDate, academyId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const updateRecord = (studentId, updates) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], ...updates }
    }));
  };

  const saveAttendance = async () => {
    if (!academyId) return;
    setBtnLoading(true);
    
    const records = students.map(s => ({
      ...(attendanceData[s.id]?.id ? { id: attendanceData[s.id].id } : {}),
      student_id: s.id,
      academy_id: academyId,
      date: selectedDate,
      status: attendanceData[s.id]?.status || 'غائب',
      notes: attendanceData[s.id]?.notes || ''
    }));

    const { error } = await supabase.from('attendance').upsert(records);
    
    setBtnLoading(false);
    if (error) alert('خطأ في الحفظ: ' + error.message);
    else alert('تم الحفظ بنجاح 🎉');
  };

  return (
    <div style={{ padding: '24px', direction: 'rtl', fontFamily: "'Cairo', sans-serif", color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>📝 كشف الحضور</h2>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ padding: '8px', borderRadius: '8px' }} />
      </div>

      {loading ? <p>جاري التحميل...</p> : (
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
          {students.map(s => (
            <div key={s.id} style={{ display: 'flex', gap: '15px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #334155' }}>
              <div style={{ flex: 1 }}>{s.name}</div>
              <button 
                onClick={() => updateRecord(s.id, { status: attendanceData[s.id]?.status === 'حاضر' ? 'غائب' : 'حاضر' })}
                style={{ padding: '8px 16px', background: attendanceData[s.id]?.status === 'حاضر' ? '#10b981' : '#ef4444', border: 'none', borderRadius: '6px', color: '#fff' }}
              >
                {attendanceData[s.id]?.status || 'غائب'}
              </button>
              <input 
                placeholder="ملاحظات..." 
                value={attendanceData[s.id]?.notes || ''} 
                onChange={(e) => updateRecord(s.id, { notes: e.target.value })}
                style={{ padding: '8px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569' }}
              />
            </div>
          ))}
          <button onClick={saveAttendance} disabled={btnLoading} style={{ marginTop: '20px', width: '100%', padding: '12px', background: '#fbbf24', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
            {btnLoading ? 'جاري الحفظ...' : 'حفظ الكشف'}
          </button>
        </div>
      )}
    </div>
  );
}
