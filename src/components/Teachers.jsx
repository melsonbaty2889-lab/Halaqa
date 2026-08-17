// src/components/Teachers.jsx
import React, { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import AddStaffModal from './AddStaffModal.jsx';
import colors from '@/theme/colors';
import { Btn, Card, Input, Badge, PageHeader } from './UI/UI.jsx';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Trash2, 
  Phone, 
  Mail, 
  BookOpen, 
  AlertTriangle, 
  Loader2 
} from 'lucide-react';

export default function Teachers({ teachers = [], setTeachers, academyId, halaqas = [] }) {
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // تصفية قائمة المعلمين بناءً على كلمة البحث
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
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: "inherit" }}>
      
      {/* 1. ترويسة الصفحة والإحصائيات */}
      <PageHeader 
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={24} /> الكادر التعليمي والمقرئين
          </span>
        }
        sub={
          <>إجمالي المقرئين والمعلمين النشطين: <strong style={{ color: C.primary }}>{teachers.length}</strong></>
        }
        action={
          <Btn onClick={() => setIsAddStaffOpen(true)} variant="primary">
            <Plus size={16} /> إضافة معلم / مدير جديد
          </Btn>
        }
      />

      {/* 2. شريط البحث */}
      <div style={{ marginBottom: '20px' }}>
        <Input 
          type="text"
          placeholder="ابحث باسم المعلم، البريد، أو رقم الهاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: 0 }}
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
              <Card 
                key={teacher.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
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
                        background: `${C.primary}20`,
                        color: C.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}>
                        {teacherName.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', color: C.text, fontWeight: 700 }}>{teacherName}</h3>
                        <Badge color={teacher.role === 'admin' ? C.primary : C.success}>
                          {teacher.role === 'admin' ? 'مدير أكاديمية' : 'مقرئ / معلم'}
                        </Badge>
                      </div>
                    </div>

                    {/* زر الحذف */}
                    <button 
                      onClick={() => handleDeleteTeacher(teacher.id, teacherName)}
                      disabled={deletingId === teacher.id}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: C.danger,
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '6px',
                        opacity: deletingId === teacher.id ? 0.5 : 1,
                        transition: 'all 0.2s'
                      }}
                      title="حذف المعلم"
                    >
                      {deletingId === teacher.id ? <Loader2 size={18} className="spin-icon" /> : <Trash2 size={18} />}
                    </button>
                  </div>

                  {/* معلومات التواصل */}
                  <div style={{ fontSize: '13px', color: C.textSub, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {teacher.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={14} style={{ color: C.textSub }} />
                        <span style={{ direction: 'ltr' }}>{teacher.email}</span>
                      </div>
                    )}
                    {teacher.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={14} style={{ color: C.textSub }} />
                        <span style={{ direction: 'ltr' }}>{teacher.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* قدم البطاقة - الحلقات المسندة */}
                <div style={{
                  borderTop: `1px solid ${C.border}`,
                  paddingTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '13px'
                }}>
                  <span style={{ color: C.textSub, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={16} style={{ color: C.primary }} /> الحلقات المسندة:
                  </span>
                  <Badge color={C.primary}>
                    {assignedHalaqasCount}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* 4. الحالة الفارغة */
        <Card style={{ padding: '40px 20px', textAlign: 'center', color: C.textSub }}>
          <AlertTriangle size={36} style={{ color: C.warning || '#f59e0b', marginBottom: '12px' }} />
          <h3 style={{ color: C.text, margin: '0 0 8px 0' }}>لا يوجد معلمون</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {searchTerm ? 'لم نجد أي نتائج تطابق بحثك.' : 'لم يتم إضافة أي معلمين إلى الأكاديمية بعد.'}
          </p>
        </Card>
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
