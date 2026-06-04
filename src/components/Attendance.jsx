const Attendance = ({ students, academyId }) => {
  // الحصول على تاريخ اليوم بتنسيق (YYYY-MM-DD) كقيمة افتراضية
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [attendanceData, setAttendanceData] = useState({}); // لتخزين حالة كل طالب { student_id: { status, notes, id } }
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  // 📡 جلب سجلات الحضور القديمة إذا كان المعلم قد رصد هذا اليوم مسبقاً
  useEffect(() => {
    const fetchAttendanceForDate = async () => {
      if (!academyId || !selectedDate) return;
      setLoadingRecords(true);
      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('id, student_id, status, notes')
          .eq('date', selectedDate);

        if (error) throw error;

        // تحويل المصفوفة القادمة من السيرفر إلى Object لسهولة القراءة والتعديل في الواجهة
        const mappedRecords = {};
        data.forEach(record => {
          mappedRecords[record.student_id] = {
            id: record.id,
            status: record.status,
            notes: record.notes || ""
          };
        });
        setAttendanceData(mappedRecords);
      } catch (err) {
        console.error("خطأ في جلب سجل الحضور:", err.message);
      } finally {
        setLoadingRecords(false);
      }
    };

    fetchAttendanceForDate();
  }, [selectedDate, academyId]);

  // 🔄 دالة سريعة لتغيير حالة الطالب عند الضغط على أزرار الرصد
  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: prev[studentId]?.status === status ? null : status // إذا ضغط مرتين يلغي الاختيار
      }
    }));
  };

  // 📝 دالة لتعديل الملاحظات الفردية لكل طالب (مثل: تأخر نصف ساعة / استئذن مبكراً)
  const handleNotesChange = (studentId, notes) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes: notes
      }
    }));
  };

  // 💾 دالة الحفظ السحابي الجماعي الذكي (Bulk Upsert)
  const saveAttendance = async () => {
    if (!academyId) return alert("خطأ في تحديد هوية الأكاديمية.");
    
    setBtnLoading(true);
    
    // تجهيز المصفوفة للإرسال إلى قاعدة البيانات
    const recordsToSave = students.map(student => {
      const record = attendanceData[student.id];
      return {
        ...(record?.id ? { id: record.id } : {}), // إذا كان السجل موجوداً مسبقاً نمرر الـ id ليقوم بالتحديث بدلاً من الإضافة
        student_id: student.id,
        academy_id: academyId,
        date: selectedDate,
        status: record?.status || 'حاضر', // افتراضياً حاضر إذا لم يحدد المعلم غير ذلك
        notes: record?.notes || ""
      };
    });

    try {
      const { error } = await supabase
        .from('attendance')
        .upsert(recordsToSave, { onConflict: 'id' }); // الاعتماد على الـ id لمنع التكرار

      if (error) throw error;
      alert("تم حفظ ومزامنة سجل الحضور لليوم بنجاح! 🎉");
    } catch (err) {
      alert("حدث خطأ أثناء الحفظ سحابياً: " + err.message);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="دفتر الحضور والغياب الرقمي"
        sub="رصد ومتابعة انضباط الطلاب اليومي"
        action={
          <Btn onClick={saveAttendance} disabled={btnLoading || students.length === 0}>
            {btnLoading ? "جاري الحفظ سحابياً... ⏳" : "💾 حفظ سجل اليوم بالكامل"}
          </Btn>
        }
      />

      {/* شريط التحكم بالتاريخ واليوم */}
      <Card style={{ marginBottom: 20, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: C.gold, fontSize: '1.1rem' }}>📅 تاريخ كشف الرصد:</span>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: C.bg,
              border: `1px solid ${C.border}`,
              color: C.text,
              fontFamily: "'Cairo'",
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>
        <div style={{ fontSize: '0.85rem', color: C.muted }}>
          إجمالي طلاب الحلقة المقيدين: <span style={{ color: C.gold, fontWeight: 'bold' }}>{students.length} طالب</span>
        </div>
      </Card>

      {/* واجهة عرض الطلاب ورصدهم */}
      {loadingRecords ? (
        <div style={{ textCenter: 'center', color: C.gold, padding: 40, textAlign: 'center' }}>
          جاري سحب سجلات هذا اليوم من السيرفر السحابي... 🔄
        </div>
      ) : students.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40, color: C.muted }}>
          لا يوجد طلاب مسجلين في أكاديميتك حالياً لرصدهم. توجه لقسم "دليل الطلاب" لإضافة طلابك أولاً.
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {students.map((student) => {
            const currentStatus = attendanceData[student.id]?.status || null;
            const currentNotes = attendanceData[student.id]?.notes || "";

            return (
              <Card key={student.id} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, color: C.text, fontSize: '1rem', fontWeight: 700 }}>{student.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: C.muted }}>المستوى: {student.juz || "لم يحدد جزء"}</span>
                  </div>
                  
                  {/* أزرار الرصد الثلاثية الذكية */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleStatusChange(student.id, 'حاضر')}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: "'Cairo'", fontSize: '0.8rem', fontWeight: 700,
                        background: currentStatus === 'حاضر' || currentStatus === null ? '#10B981' : 'rgba(255,255,255,0.02)',
                        color: currentStatus === 'حاضر' || currentStatus === null ? '#fff' : C.muted,
                        opacity: currentStatus === 'حاضر' || currentStatus === null ? 1 : 0.4,
                        transition: 'all 0.2s'
                      }}
                    >
                      ✓ حاضر
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'غائب')}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: "'Cairo'", fontSize: '0.8rem', fontWeight: 700,
                        background: currentStatus === 'غائب' ? '#EF4444' : 'rgba(255,255,255,0.02)',
                        color: currentStatus === 'غائب' ? '#fff' : C.muted,
                        opacity: currentStatus === 'غائب' ? 1 : 0.4,
                        transition: 'all 0.2s'
                      }}
                    >
                      ✕ غائب
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'متأخر')}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: "'Cairo'", fontSize: '0.8rem', fontWeight: 700,
                        background: currentStatus === 'متأخر' ? '#F59E0B' : 'rgba(255,255,255,0.02)',
                        color: currentStatus === 'متأخر' ? '#1A1208' : C.muted,
                        opacity: currentStatus === 'متأخر' ? 1 : 0.4,
                        transition: 'all 0.2s'
                      }}
                    >
                      ⏳ متأخر
                    </button>
                  </div>
                </div>

                {/* حقل كتابة الملاحظات لكل طالب */}
                <input
                  value={currentNotes}
                  onChange={(e) => handleNotesChange(student.id, e.target.value)}
                  placeholder="ملاحظة سريعة لحصة اليوم (مثال: حفظ ربعين ممتاز / لم يحفظ الجيد)..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.15)',
                    border: `1px solid ${C.border}`,
                    color: C.text,
                    fontSize: '0.8rem',
                    fontFamily: "'Cairo'",
                    outline: 'none'
                  }}
                />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

