import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [academyId, setAcademyId] = useState(null);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  useEffect(() => {
    async function initAttendance() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: staffData } = await supabase
          .from('staff')
          .select('academy_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (staffData?.academy_id) {
          setAcademyId(staffData.academy_id);

          const { data: studentsList } = await supabase
            .from('students')
            .select('*')
            .eq('academy_id', staffData.academy_id)
            .order('name', { ascending: true });

          setStudents(studentsList || []);

          const { data: attendanceRecords } = await supabase
            .from('attendance')
            .select('id, student_id, status, notes')
            .eq('date', selectedDate);

          const mappedRecords = {};
          if (attendanceRecords) {
            attendanceRecords.forEach(record => {
              mappedRecords[record.student_id] = {
                id: record.id,
                status: record.status,
                notes: record.notes || ''
              };
            });
          }
          setAttendanceData(mappedRecords);
        }
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    initAttendance();
  }, [selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: prev[studentId]?.status === status ? null : status
      }
    }));
  };

  const handleNotesChange = (studentId, notes) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes: notes
      }
    }));
  };

  const saveAttendance = async () => {
    if (!academyId) return alert('خطأ في تحديد هوية الأكاديمية');
    setBtnLoading(true);

    try {
      const recordsToSave = students.map(student => ({
        id: attendanceData[student.id]?.id || undefined,
        student_id: student.id,
        academy_id: academyId,
        date: selectedDate,
        status: attendanceData[student.id]?.status || 'غائب',
        notes: attendanceData[student.id]?.notes || ''
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(recordsToSave, { onConflict: 'id' });

      if (error) throw error;
      alert('تم حفظ كشف الحضور والغياب بنجاح 🎉');
    } catch (error) {
      alert('حدث خطأ أثناء الحفظ: ' + error.message);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', color: '#fff', direction: 'rtl', textAlign: 'right', fontFamily: "'Cairo', sans-serif" }}>
      
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>
          📝 دفتر الحضور والغياب الرقمي
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
          رصد حضور وغياب طلاب الحلقة بدقة وبشكل فوري سحابياً.
        </p>
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px' }}>
        <label style={{ marginLeft: '10px', color: '#94a3b8' }}>تاريخ اليوم المستهدف:</label>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }}
        />
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>جاري تحميل كشف الطلاب... ⏳</p>
        ) : students.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>لا يوجد طلاب مسجلين في الأكاديمية حالياً.</p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #475569', color: '#fbbf24' }}>
                    <th style={{ padding: '12px', textAlign: 'right' }}>اسم الطالب</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>الحالة اليومية</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>ملاحظات الحفظ</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const currentStatus = attendanceData[student.id]?.status;
                    return (
                      <tr key={student.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '12px' }}>{student.name}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleStatusChange(student.id, 'حاضر')}
                            style={{ padding: '6px 12px', backgroundColor: currentStatus === 'حاضر' ? '#10b981' : '#334155', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginLeft: '5px', cursor: 'pointer' }}
                          >
                            حاضر
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.id, 'غائب')}
                            style={{ padding: '6px 12px', backgroundColor: currentStatus === 'غائب' ? '#ef4444' : '#334155', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            غائب
                          </button>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <input
                            type="text"
                            placeholder="مثال: حفظ ربع حزب"
                            value={attendanceData[student.id]?.notes || ''}
                            onChange={(e) => handleNotesChange(student.id, e.target.value)}
                            style={{ padding: '6px', width: '90%', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              onClick={saveAttendance}
              disabled={btnLoading}
              style={{ width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}
            >
              {btnLoading ? 'جاري حفظ السجلات سحابياً... ⏳' : '💾 حفظ وتثبيت كشف الحضور'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
