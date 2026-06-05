import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C, g } from '../constants/colors'; // استدعاء ملف الألوان والثوابت الخاص بك 🎨

const formatArabicNumber = (num) => new Intl.NumberFormat('ar-EG').format(num);

export default function Dashboard({ session, setActiveTab }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ studentsCount: 0, staffCount: 0 });
  
  // تتبع حجم الشاشة ديناميكياً لدعم الموبايل
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // الفحص عند تحميل الصفحة
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        if (!session?.user?.id) return;

        // 1. جلب بيانات الموظف المسجل حالياً من جدول staff
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (staffError) throw staffError;

        if (staffData) {
          setProfile(staffData);

          // 2. جلب طلاب هذه الأكاديمية المحددة فقط
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
        console.error("Error fetching dashboard data:", error.message);
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
      <div style={{ padding: '40px', textAlign: 'center', color: C.muted, direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
        جاري تحميل البيانات وتحديث المؤشرات... ⏳
      </div>
    );
  }

  return (
    <div style={{ 
      padding: isMobile ? '16px' : '24px', 
      color: C.text, 
      direction: 'rtl', 
      textAlign: 'right', 
      fontFamily: "'Cairo', sans-serif" 
    }}>
      
      {/* هيدر ترحيبي متجاوب */}
      <div style={{ marginBottom: '32px', borderBottom: `1px solid ${C.border}`, paddingBottom: '16px' }}>
        <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 'bold', color: C.gold, margin: 0 }}>
          🎛️ لوحة القيادة البانورامية
        </h2>
        <p style={{ color: C.muted, fontSize: '0.85rem', marginTop: '6px' }}>
          أهلاً بك: <span style={{ color: C.text, fontWeight: 'bold' }}>{profile?.name || 'المشرف العام'}</span>
        </p>
      </div>

      {/* كروت الإحصائيات المدمجة والمقاومة للانكماش */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        
        {/* كرت إجمالي الطلاب */}
        <div style={{ backgroundColor: C.card, padding: '24px', borderRadius: '12px', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: C.muted, fontSize: '0.9rem' }}>إجمالي الطلاب المسجلين</span>
            <span style={{ fontSize: '1.3rem' }}>👥</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: C.gold }}>
            {formatArabicNumber(stats.studentsCount)} <span style={{ fontSize: '0.9rem', color: C.muted, fontWeight: 'normal' }}>طالب</span>
          </div>
        </div>

        {/* كرت عدد المعلمين والمشرفين */}
        <div style={{ backgroundColor: C.card, padding: '24px', borderRadius: '12px', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: C.muted, fontSize: '0.9rem' }}>عدد المعلمين والمشرفين</span>
            <span style={{ fontSize: '1.3rem' }}>👨‍🏫</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: C.green }}>
            {formatArabicNumber(stats.staffCount)} <span style={{ fontSize: '0.9rem', color: C.muted, fontWeight: 'normal' }}>معلم</span>
          </div>
        </div>

      </div>

      {/* روابط الإدارة السريعة - أزرار مرنة وسهلة النقر بالإصبع */}
      <div style={{ backgroundColor: C.surface, padding: '24px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: C.text, marginTop: 0, marginBottom: '16px' }}>
          🚀 روابط الإدارة السريعة
        </h3>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
          <button 
            onClick={() => setActiveTab('students')}
            style={{ 
              padding: '12px 20px', 
              backgroundImage: g.gold, 
              color: C.bg, 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              fontSize: '0.9rem',
              width: isMobile ? '100%' : 'auto',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            👥 إدارة كشوف الطلاب
          </button>
          <button 
            onClick={() => setActiveTab('attendance')}
            style={{ 
              padding: '12px 20px', 
              backgroundColor: C.card, 
              color: C.text, 
              border: `1px solid ${C.border}`, 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              fontSize: '0.9rem',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            📝 تسجيل الحضور والغياب اليومي
          </button>
        </div>
      </div>

    </div>
  );
}
