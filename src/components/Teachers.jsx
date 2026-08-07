/* src/components/Teachers.jsx */
import React, { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import AddStaffModal from '@/AddStaffModal.jsx';
import { 
  FaUserTie, FaPlus, FaSearch, FaTrash, 
  FaPhone, FaEnvelope, FaChalkboardTeacher, FaExclamationTriangle, FaSpinner 
} from 'react-icons/fa';

export default function Teachers({ teachers = [], setTeachers, academyId, halaqas = [] }) {
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // تصفية قالمة المعلمين بناءً على كلمة البحث
  const filteredTeachers = useMemo(() => {
    if (!searchTerm.trim()) return teachers;
    const query = searchTerm.toLowerCase();
    return teachers.filter(teacher => {
      const name = (teacher.name || teacher.full_name || '').toLowerCase();
      const email = (teacher.email || '').toLowerCase();
      const phone = (teacher.phone || '').toLowerCase();
      return name.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [teachers, searchTerm]);

  // تحديث القائمة فور إضافة معلم جديد
  const handleStaffAdded = async () => {
    if (!academyId) return;
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('academy_id', academyId);

      if (!error && data && setTeachers) {
        setTeachers(data);
      }
    } catch (err) {
      console.error("🚨 خطأ أثناء جلب قائمة المعلمين:", err);
    }
  };

  // حذف معلم من المنظومة
  const handleDeleteTeacher = async (teacherId, teacherName) => {
    if (!window.confirm(`هل أنت تأكد من حذف المعلم (${teacherName || 'المحدد'})؟`)) return;

    setDeletingId(teacherId);
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacherId);

      if (error) throw error;

      if (setTeachers) {
        setTeachers(prev => prev.filter(t => t.id !== teacherId));
      }
    } catch (err) {
      console.error("🚨 خطأ أثناء حذف المعلم:", err);
      alert("حدث خطأ أثناء محاولة حذف المعلم، يرجى المحاولة مرة أخرى.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ padding: '20px', color: '#fff', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Cairo', system-ui, sans-serif" }}>
      
      {/* 1. هيدر الصفحة والإحصائيات */}
      <div style={{ 
        background: '#1E293B', 
        padding: '24px', 
        borderRadius: '16px', 
        border: '1px solid #334155',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaUserTie /> الكادر التعليمي والمقرئين
          </h2>
          <p style={{ margin: '8px 0 0 0', color: '#94A3B8', fontSize: '14px' }}>
            إجمالي المقرئين والمعلمين النشطين: <strong style={{ color: '#C9A84C' }}>{teachers.length}</strong>
          </p>
        </div>

        {/* زر إضافة معلم جديد */}
        <button 
          onClick={() => setIsAddStaffOpen(true)}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #C9A84C, #A88934)',
            color: '#0F172A',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(201, 168, 76, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaPlus /> إضافة معلم / مدير جديد
        </button>
      </div>

      {/* 2. شريط البحث */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <FaSearch style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '16px', color: '#94A3B8' }} />
        <input 
          type="text"
          placeholder="ابحث باسم المعلم، البريد، أو رقم الهاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 45px 12px 16px',
            borderRadius: '10px',
            border: '1px solid #334155',
            background: '#111C2A',
            color: '#FFF',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* 3. شبكة عرض بطاقات المعلمين */}
      {filteredTeachers.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredTeachers.map((teacher) => {
            const assignedHalaqasCount = halaqas.filter(h => h.teacher_id === teacher.id).length;
            const teacherName = teacher.name || teacher.full_name || 'معلم بدون اسم';

            return (
              <div 
                key={teacher.id}
                style={{
                  background: '#111C2A',
                  border: '1px solid #1E293B',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }}
              >
                <div>
                  {/* رأس البطاقة */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38BDF8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}>
                        {teacherName.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#FFF' }}>{teacherName}</h3>
                        <span style={{ fontSize: '12px', color: '#C9A84C', fontWeight: 'bold' }}>
                          {teacher.role === 'admin' ? 'مدير أكاديمية' : 'مقرئ / معلم'}
                        </span>
                      </div>
                    </div>

                    {/* زر الحذف */}
                    <button 
                      onClick={() => handleDeleteTeacher(teacher.id, teacherName)}
                      disabled={deletingId === teacher.id}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '6px',
                        opacity: deletingId === teacher.id ? 0.5 : 1
                      }}
                      title="حذف المعلم"
                    >
                      {deletingId === teacher.id ? <FaSpinner className="fa-spin" /> : <FaTrash />}
                    </button>
                  </div>

                  {/* معلومات التواصل */}
                  <div style={{ fontSize: '13px', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {teacher.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaEnvelope style={{ color: '#64748B' }} />
                        <span style={{ direction: 'ltr' }}>{teacher.email}</span>
                      </div>
                    )}
                    {teacher.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaPhone style={{ color: '#64748B' }} />
                        <span style={{ direction: 'ltr' }}>{teacher.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* قدم البطاقة - الحلقات المسندة */}
                <div style={{
                  borderTop: '1px solid #1E293B',
                  paddingTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '13px'
                }}>
                  <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaChalkboardTeacher style={{ color: '#38BDF8' }} /> الحلقات المسندة:
                  </span>
                  <span style={{ background: '#1E293B', padding: '2px 10px', borderRadius: '12px', color: '#FFF', fontWeight: 'bold' }}>
                    {assignedHalaqasCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 4. الحالة الفارغة */
        <div style={{
          background: '#111C2A',
          border: '1px dashed #334155',
          borderRadius: '16px',
          padding: '40px 20px',
          textAlign: 'center',
          color: '#94A3B8'
        }}>
          <FaExclamationTriangle style={{ fontSize: '36px', color: '#F59E0B', marginBottom: '12px' }} />
          <h3 style={{ color: '#FFF', margin: '0 0 8px 0' }}>لا يوجد معلمون</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {searchTerm ? 'لم نجد أي نتائج تطابق بحثك.' : 'لم يتم إضافة أي معلمين إلى الأكاديمية بعد.'}
          </p>
        </div>
      )}

      {/* 5. مودال إضافة معلم جديد */}
      <AddStaffModal 
        isOpen={isAddStaffOpen} 
        onClose={() => setIsAddStaffOpen(false)} 
        onSuccess={() => {
          handleStaffAdded();
          setIsAddStaffOpen(false);
        }}
        academyId={academyId}
      />
    </div>
  );
}
