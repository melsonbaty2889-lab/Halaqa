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
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    async function fetchAttendance() {
      if (!academyId) return;
      try {
        setLoading(true);
        const { data: attendanceRecords } = await supabase
          .from('attendance')
          .select('id, student_id, status, notes')
          .eq('date', selectedDate)
          .eq('academy_id', academyId);

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
        console.error(error.message);
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
    <div className="p-4 md:p-8 max-w-5xl mx-auto text-white" style={{ direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* الهيدر المتجاوب */}
      <div className="mb-6 border-b border-slate-700 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-amber-400 flex items-center gap-2">
            📝 دفتر الحضور والغياب الرقمي
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            رصد حضور وغياب طلاب الحلقة بدقة وبشكل فوري سحابياً.
          </p>
        </div>
        
        {/* أداة اختيار التاريخ المدمجة */}
        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center gap-3 self-start md:self-auto w-full md:w-auto justify-between md:justify-start">
          <label className="text-xs md:text-sm text-slate-400 whitespace-nowrap">التاريخ المستهدف:</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 rounded-lg border border-slate-600 bg-slate-900 text-white text-sm outline-none cursor-pointer focus:border-amber-400 w-full md:w-auto"
          />
        </div>
      </div>

      {/* منطقة عرض البيانات الرئيسية */}
      <div className="bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-700 shadow-xl">
        {loading ? (
          <div className="text-center text-slate-400 py-12 flex flex-col items-center gap-3">
            <span className="animate-spin text-2xl">⏳</span>
            <p className="text-sm font-medium">جاري مزامنة بيانات الكشف سحابياً...</p>
          </div>
        ) : students.length === 0 ? (
          <p className="text-center text-slate-400 py-12 text-sm">لا يوجد طلاب مسجلين في الأكاديمية حالياً.</p>
        ) : (
          <>
            {/* 1. نسخة الكمبيوتر (Desktop View) - تظهر فقط على الشاشات الكبيرة */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-600 text-amber-400 font-bold text-sm">
                    <th className="pb-3 pl-4">اسم الطالب</th>
                    <th className="pb-3 text-center px-4">الحالة اليومية</th>
                    <th className="pb-3 pr-4">ملاحظات الحفظ والأداء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {students.map((student) => {
                    const currentStatus = attendanceData[student.id]?.status;
                    return (
                      <tr key={student.id} className="hover:bg-slate-750/50 transition-colors">
                        <td className="py-4 pl-4 font-medium">{student.name}</td>
                        <td className="py-4 text-center px-4">
                          <div className="inline-flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700">
                            <button
                              onClick={() => handleStatusChange(student.id, 'حاضر')}
                              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${currentStatus === 'حاضر' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                              حاضر
                            </button>
                            <button
                              onClick={() => handleStatusChange(student.id, 'غائب')}
                              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${currentStatus === 'غائب' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                              غائب
                            </button>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <input
                            type="text"
                            placeholder="مثال: حفظ سورة الملك كاملة"
                            value={attendanceData[student.id]?.notes || ''}
                            onChange={(e) => handleNotesChange(student.id, e.target.value)}
                            className="p-2 w-full max-w-md rounded-lg border border-slate-600 bg-slate-900 text-white text-sm focus:border-amber-400 outline-none transition-all"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 2. نسخة الجوال (Mobile Card View) - تظهر فقط على الشاشات الصغيرة */}
            <div className="block md:hidden space-y-4">
              {students.map((student) => {
                const currentStatus = attendanceData[student.id]?.status;
                return (
                  <div key={student.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/70 space-y-3">
                    <div className="text-sm font-bold text-amber-100">{student.name}</div>
                    
                    {/* أزرار الحضور عريضة ومناسبة للمس */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStatusChange(student.id, 'حاضر')}
                        className={`py-2.5 rounded-lg text-xs font-bold transition-all border ${currentStatus === 'حاضر' ? 'bg-emerald-600 border-emerald-500 text-white shadow-md' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                      >
                        🟢 حاضر
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'غائب')}
                        className={`py-2.5 rounded-lg text-xs font-bold transition-all border ${currentStatus === 'غائب' ? 'bg-rose-600 border-rose-500 text-white shadow-md' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                      >
                        🔴 غائب
                      </button>
                    </div>

                    {/* خانة الملاحظات */}
                    <div>
                      <input
                        type="text"
                        placeholder="أضف ملاحظات الحفظ هنا..."
                        value={attendanceData[student.id]?.notes || ''}
                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        className="p-2.5 w-full rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:border-amber-400 outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* زر الحفظ الثابت والمتجاوب */}
            <button
              onClick={saveAttendance}
              disabled={btnLoading}
              className={`w-full mt-6 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-sm md:text-base shadow-lg hover:shadow-amber-400/10 transition-all flex items-center justify-center gap-2 ${btnLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {btnLoading ? (
                <><span>⏳</span> جاري حفظ السجلات سحابياً...</>
              ) : (
                <><span>💾</span> حفظ وتثبيت كشف الحضور</>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
