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

  // 1. التأكد من هوية المستخدم وجلب بيانات الطلاب (مرة واحدة فقط عند التحميل)
  useEffect(() => {
    async function fetchInitialData() {
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
        }
      } catch (error) {
        console.error("Error fetching initial data:", error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // 2. جلب سجلات الحضور فقط عند تغيير التاريخ أو الأكاديمية (منفصل وذكي)
  useEffect(() => {
    async function fetchAttendance() {
      if (!academyId) return;
      
      try {
        setLoading(true);
        const { data: attendanceRecords } = await supabase
          .from('attendance')
          .select('id, student_id, status, notes')
          .eq('date', selectedDate)
          .eq('academy_id', academyId); // تم حل ثغرة تسريب البيانات هنا ✅

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
      } catch (error) {
        console.error("Error fetching attendance:", error.message);
      } finally {
        setLoading(false);
      }
    }
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
    <div style={{ padding: '4vw', maxWidth: '1200px', margin: '0 auto', color: '#fff', direction: 'rtl', textAlign: 'right', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* الهيدر */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: 'calc(1.2rem + 1vw)', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>
          📝 دفتر الحضور والغياب الرقمي
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
          رصد حضور وغياب طلاب الحلقة بدقة وبشكل فوري سحابياً.
        </p>
      </div>

      {/* أداة اختيار التاريخ */}
      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
        <label style={{ color: '#94a3b8' }}>تاريخ اليوم المستهدف:</label>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', cursor: 'pointer' }}
        />
      </div>

      {/* منطقة عرض البيانات */}
      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>جاري تحميل البيانات... ⏳</p>
        ) : students.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>لا يوجد طلاب مسجلين في الأكاديمية حالياً.</p>
        ) : (
          <>
            {/* تصميم مرن: جدول للشاشات الكبيرة ويتحول تلقائياً لبطاقات مريحة للجوال بفضل التنسيق الذكي */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* هيدر افتراضي للجدول يختفي في الشاشات الصغيرة جداً عبر السكرول المتسامح */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 2fr', padding: '10px 12px', color: '#fbbf24', fontWeight: 'bold', borderBottom: '2px solid #475569', minWidth: '500px' }}>
                <div>اسم الطالب</div>
                <div style={{ textAlign: 'center' }}>الحالة اليومية</div>
                <div>ملاحظات الحفظ</div>
              </div>

              {students.map((student) => {
                const currentStatus = attendanceData[student.id]?.status;
                return (
                  <div 
                    key={student.id} 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '2fr 1.5fr 2fr', 
                      alignItems: 'center', 
                      padding: '12px', 
                      borderBottom: '1px solid #334155',
                      minWidth: '500px', // يضمن عدم تداخل العناصر عند صغر الشاشة بل يسمح بسكرول أفقي خفيف ومريح
                    }}
                  >
                    <div style={{ fontWeight: '500' }}>{student.name}</div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleStatusChange(student.id, 'حاضر')}
                        style={{ padding: '6px 16px', backgroundColor: currentStatus === 'حاضر' ? '#10b981' : '#334155', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', marginLeft: '8px', cursor: 'pointer', transition: '0.2s' }}
                      >
                        حاضر
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'غائب')}
                        style={{ padding: '6px 16px', backgroundColor: currentStatus === 'غائب' ? '#ef4444' : '#334155', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                      >
                        غائب
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="مثال: حفظ ربع حزب"
                        value={attendanceData[student.id]?.notes || ''}
                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        style={{ padding: '8px', width: '95%', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={saveAttendance}
              disabled={btnLoading}
              style={{ width: '100%', padding: '14px', backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: btnLoading ? 'not-allowed' : 'pointer', marginTop: '24px', transition: '0.2s' }}
            >
              {btnLoading ? 'جاري حفظ السجلات سحابياً... ⏳' : '💾 حفظ وتثبيت كشف الحضور'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
