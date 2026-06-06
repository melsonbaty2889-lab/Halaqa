import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C, g } from '../constants/colors';

const formatArabicNumber = (num) => new Intl.NumberFormat('ar-EG').format(num || 0);

export default function Dashboard({ session, setActiveTab }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ studentsCount: 0, staffCount: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
  const userId = session?.user?.id;
  if (!userId) return;

  setLoading(true);
  try {
    
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('name, academies(id, name)') 
      .eq('user_id', userId)
      .maybeSingle();

    if (staffError || !staffData) throw new Error('تعذر الوصول لبيانات الأكاديمية');

    const academy = staffData.academies;
    
    setProfile({ name: staffData.name, academyName: academy?.name });

    if (academy?.id) {
      const [{ count: studentCount }, { count: teachersCount }] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', academy.id),
        supabase.from('staff').select('*', { count: 'exact', head: true }).eq('academy_id', academy.id)
      ]);

      setStats({ studentsCount: studentCount || 0, staffCount: teachersCount || 0 });
    }
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    setLoading(false);
  }
}

    fetchDashboardData();
  }, [session]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: C.muted, direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
        جاري تحميل البيانات وتحديث المؤشرات... ⏳
      </div>
    );
  }

  if (!profile?.academyName) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
        <h3 style={{ color: C.text }}>أهلاً بك يا {profile?.name || 'مستخدم'}!</h3>
        <p style={{ color: C.muted }}>لم يتم ربط حسابك بأي أكاديمية بعد.</p>
        <button 
           onClick={() => setActiveTab('create-academy')} // قمت بتعديلها لتغيير التبويب لصفحة الإنشاء
           style={{ padding: '12px 24px', backgroundColor: C.gold, color: C.bg, borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          إنشاء أكاديميتك الأولى الآن 🚀
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ padding: isMobile ? '16px' : '24px', color: C.text, direction: 'rtl', textAlign: 'right', fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ marginBottom: '32px', borderBottom: `1px solid ${C.border}`, paddingBottom: '16px' }}>
        <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 'bold', color: C.gold, margin: 0 }}>
          🎛️ لوحة القيادة البانورامية
        </h2>
        <p style={{ color: C.muted, fontSize: '0.85rem', marginTop: '6px' }}>
          أهلاً بك: <span style={{ color: C.text, fontWeight: 'bold' }}>{profile?.name || 'المشرف العام'}</span>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: C.card, padding: '24px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: C.muted }}>إجمالي الطلاب</span>
            <span>👥</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: C.gold }}>
            {formatArabicNumber(stats.studentsCount)} <span style={{ fontSize: '0.9rem', color: C.muted }}>طالب</span>
          </div>
        </div>

        <div style={{ backgroundColor: C.card, padding: '24px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: C.muted }}>عدد الموظفين</span>
            <span>👨‍🏫</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: C.green }}>
            {formatArabicNumber(stats.staffCount)} <span style={{ fontSize: '0.9rem', color: C.muted }}>معلم</span>
          </div>
        </div>
      </div>

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
