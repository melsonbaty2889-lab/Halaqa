import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const getTodayDate = () => new Date().toISOString().split('T')[0];

// ✅ FIX: الكومبوننت بتستقبل students و academyId من App.jsx
// مش بتجيب بياناتها لوحدها — وعملنا conversion كاملة من Tailwind لـ inline styles
export default function Attendance({ students, academyId }) {
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // جلب سجلات الحضور للتاريخ المحدد
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!academyId) return;
      setLoading(true);
      try {
        const { data: records } = await supabase
          .from('attendance')
          .select('id, student_id, status, notes')
          .eq('date', selectedDate)
          .eq('academy_id', academyId);

        const mapped = {};
        if (records) {
          records.forEach(r => {
            mapped[r.student_id] = { id: r.id, status: r.status, notes: r.notes || '' };
          });
        }
        setAttendanceData(mapped);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [selectedDate, academyId]);

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
      [studentId]: { ...prev[studentId], notes }
    }));
  };

  const saveAttendance = async () => {
    if (!academyId) return alert('خطأ في تحديد هوية الأكاديمية');
    setBtnLoading(true);
    try {
      const records = students.map(s => ({
        ...(attendanceData[s.id]?.id ? { id: attendanceData[s.id].id } : {}),
        student_id: s.id,
        academy_id: academyId,
        date: selectedDate,
        status: attendanceData[s.id]?.status || 'غائب',
        notes: attendanceData[s.id]?.notes || ''
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(records, { onConflict: 'id' });

      if (error) throw error;
      alert('تم حفظ كشف الحضور والغياب بنجاح 🎉');
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ: ' + err.message);
    } finally {
      setBtnLoading(false);
    }
  };

  // ========================
  // Styles (بدل Tailwind)
  // ========================
  const S = {
    container: {
      padding: isMobile ? 16 : 32,
      maxWidth: 960,
      margin: '0 auto',
      color: '#fff',
      direction: 'rtl',
      fontFamily: "'Cairo', sans-serif"
    },
    header: {
      marginBottom: 24,
      borderBottom: '1px solid #334155',
      paddingBottom: 16,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: 16
    },
    title: {
      fontSize: isMobile ? '1.2rem' : '1.5rem',
      fontWeight: 'bold',
      color: '#fbbf24',
      margin: 0
    },
    subtitle: { fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 },
    datePicker: {
      background: '#1e293b',
      padding: 12,
      borderRadius: 12,
      border: '1px solid #334155',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxSizing: 'border-box',
      width: isMobile ? '100%' : 'auto'
    },
    dateInput: {
      padding: '8px 12px',
      borderRadius: 8,
      border: '1px solid #475569',
      background: '#0f172a',
      color: '#fff',
      fontSize: '0.875rem',
      outline: 'none',
      cursor: 'pointer',
      fontFamily: "'Cairo'"
    },
    card: {
      background: '#1e293b',
      padding: isMobile ? 16 : 24,
      borderRadius: 16,
      border: '1px solid #334155',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
    },
    saveBtn: {
      width: '100%',
      marginTop: 24,
      padding: '14px',
      background: btnLoading ? '#92684a' : '#fbbf24',
      color: '#0c0a09',
      fontWeight: 'bold',
      borderRadius: 12,
      fontSize: isMobile ? '0.875rem' : '1rem',
      border: 'none',
      cursor: btnLoading ? 'not-allowed' : 'pointer',
      opacity: btnLoading ? 0.7 : 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontFamily: "'Cairo'"
    }
  };

  const statusBtn = (active, color) => ({
    padding: '6px 16px',
    borderRadius: 6,
    fontSize: '0.8rem',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Cairo'",
    background: active ? color : 'transparent',
    color: active ? '#fff' : '#94a3b8',
    transition: 'all 0.2s'
  });

  return (
    <div style={S.container}>

      {/* Header */}
      <div style={S.header}>
        <div>
          <h2 style={S.title}>📝 دفتر الحضور والغياب الرقمي</h2>
          <p style={S.subtitle}>رصد حضور وغياب طلاب الحلقة بدقة وبشكل فوري سحابياً.</p>
        </div>
        <div style={S.datePicker}>
          <label style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>التاريخ:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={S.dateInput}
          />
        </div>
      </div>

      {/* Content Card */}
      <div style={S.card}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '48px 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
            <p>جاري مزامنة بيانات الكشف سحابياً...</p>
          </div>
        ) : students.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '48px 0' }}>
            لا يوجد طلاب مسجلين في الأكاديمية حالياً.
          </p>
        ) : (
          <>
            {/* Desktop Table */}
            {!isMobile && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #475569', color: '#fbbf24', fontWeight: 'bold', fontSize: '0.875rem' }}>
                      <th style={{ paddingBottom: 12, paddingLeft: 16 }}>اسم الطالب</th>
                      <th style={{ paddingBottom: 12, textAlign: 'center' }}>الحالة اليومية</th>
                      <th style={{ paddingBottom: 12, paddingRight: 16 }}>ملاحظات الحفظ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const cur = attendanceData[student.id]?.status;
                      return (
                        <tr key={student.id} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ paddingTop: 16, paddingBottom: 16, paddingLeft: 16, fontWeight: 500 }}>
                            {student.name}
                          </td>
                          <td style={{ paddingTop: 16, paddingBottom: 16, textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: 8, background: '#0f172a', padding: 4, borderRadius: 8, border: '1px solid #334155' }}>
                              <button onClick={() => handleStatusChange(student.id, 'حاضر')} style={statusBtn(cur === 'حاضر', '#10b981')}>حاضر</button>
                              <button onClick={() => handleStatusChange(student.id, 'غائب')} style={statusBtn(cur === 'غائب', '#ef4444')}>غائب</button>
                            </div>
                          </td>
                          <td style={{ paddingTop: 16, paddingBottom: 16, paddingRight: 16 }}>
                            <input
                              type="text"
                              placeholder="مثال: حفظ سورة الملك كاملة"
                              value={attendanceData[student.id]?.notes || ''}
                              onChange={(e) => handleNotesChange(student.id, e.target.value)}
                              style={{ padding: '8px 12px', width: '100%', maxWidth: 380, borderRadius: 8, border: '1px solid #475569', background: '#0f172a', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Cairo'" }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile Cards */}
            {isMobile && (
              <div>
                {students.map((student) => {
                  const cur = attendanceData[student.id]?.status;
                  return (
                    <div key={student.id} style={{ background: 'rgba(15,23,42,0.6)', padding: 16, borderRadius: 12, border: '1px solid rgba(51,65,85,0.7)', marginBottom: 12 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fef3c7', marginBottom: 12 }}>{student.name}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                        <button onClick={() => handleStatusChange(student.id, 'حاضر')} style={{ ...statusBtn(cur === 'حاضر', '#059669'), padding: '10px', borderRadius: 8, border: `1px solid ${cur === 'حاضر' ? '#059669' : '#334155'}`, background: cur === 'حاضر' ? '#059669' : '#1e293b' }}>
                          🟢 حاضر
                        </button>
                        <button onClick={() => handleStatusChange(student.id, 'غائب')} style={{ ...statusBtn(cur === 'غائب', '#dc2626'), padding: '10px', borderRadius: 8, border: `1px solid ${cur === 'غائب' ? '#dc2626' : '#334155'}`, background: cur === 'غائب' ? '#dc2626' : '#1e293b' }}>
                          🔴 غائب
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="أضف ملاحظات الحفظ هنا..."
                        value={attendanceData[student.id]?.notes || ''}
                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        style={{ padding: 10, width: '100%', borderRadius: 8, border: '1px solid #475569', background: '#1e293b', color: '#fff', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Cairo'" }}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Save Button */}
            <button onClick={saveAttendance} disabled={btnLoading} style={S.saveBtn}>
              {btnLoading ? <><span>⏳</span> جاري حفظ السجلات سحابياً...</> : <><span>💾</span> حفظ وتثبيت كشف الحضور</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
