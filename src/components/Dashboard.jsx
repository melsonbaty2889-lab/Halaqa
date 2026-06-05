import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C, g } from '../constants/colors'; // استيراد الألوان الموحدة للمنصة لضمان عدم وجود تعارض

// دالة Runtime مساعدة خارج الكائن لتفادي تعارض الـ Render
const formatArabicNumber = (num) => new Intl.NumberFormat('ar-EG').format(num);

export default function Dashboard({ session, setActiveTab }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ studentsCount: 0, staffCount: 0 });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        if (!session?.user?.id) return;

        // 1. جلب جدول من حالياً السجل الموظف بيانات جلب staff
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (staffError) throw staffError;

        if (staffData) {
          setProfile(staffData);

          // 2. جلب عدد الطلاب التابعين لنفس الأكاديمية
          const { count: studentCount, error: studentError } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('academy_id', staffData.academy_id);

          if (studentError) throw studentError;

          // 3. جلب عدد المعلمين/الموظفين في نفس الأكاديمية
          const { count: teachersCount, error: teachersError } = await supabase
            .from('staff')
            .select('*', { count: 'exact', head: true })
            .eq('academy_id', staffData.academy_id);

          if (teachersError) throw teachersError;

          setStats({
            studentsCount: studentCount || 0,
            staffCount: teachersCount || 0
          });
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات لوحة التحكم:", error.message);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', direction: 'rtl' }}>
        جاري تحميل بيانات لوحة القيادة ومزامنة الإحصائيات... ⏳
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', color: '#fff', direction: 'rtl', textAlign: 'right', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* ترحيب الإدارة */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>
          🎛️ لوحة القيادة البانورامية
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
          أهلاً بك فضيلة الشيخ: <span style={{ color: '#fff', fontWeight: 'bold' }}>{profile?.name || 'المشرف العام'}</span> الإحصائيات الفورية لأكاديميتك المربوطة سحابياً.
        </p>
      </div>

      {/* كروت الإحصائيات السريعة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* كارت الطلاب */}
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>إجمالي الطلاب المسجلين</span>
            <span style={{ fontSize: '1.5rem' }}>👥</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24' }}>
            {formatArabicNumber(stats.studentsCount)} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 'normal' }}>طالب</span>
          </div>
        </div>

        {/* كارت الطاقم والأساتذة */}
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>عدد المعلمين والمشرفين</span>
            <span style={{ fontSize: '1.5rem' }}>👨‍🏫</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {formatArabicNumber(stats.staffCount)} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 'normal' }}>معلم</span>
          </div>
        </div>

      </div>

      {/* قسم الإجراءات السريعة المقترحة */}
      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc', marginTop: 0, marginBottom: '16px' }}>
          🚀 روابط الإدارة السريعة
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button 
            onClick={() => setActiveTab('students')}
            style={{ padding: '10px 20px', backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
          >
            👥 إدارة كشوف الطلاب
          </button>
          <button 
            onClick={() => setActiveTab('attendance')}
            style={{ padding: '10px 20px', backgroundColor: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
          >
            📝 تسجيل الحضور والغياب اليومي
          </button>
        </div>
      </div>

    </div>
  );
}
