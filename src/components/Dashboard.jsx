import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

          // 3. الأكاديمية لنفس في المعلمين/الموظفين عدد جلب
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
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', direction: 'rtl' }}>
        جاري تحميل البيانات... ⏳
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', color: '#fff', direction: 'rtl', textAlign: 'right', fontFamily: "'Cairo', sans-serif" }}>
      
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>
          🎛️ لوحة القيادة البانورامية
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
          أهلاً بك: <span style={{ color: '#fff', fontWeight: 'bold' }}>{profile?.name || 'المشرف العام'}</span>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>إجمالي الطلاب المسجلين</span>
            <span>👥</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24' }}>
            {formatArabicNumber(stats.studentsCount)} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>طالب</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>عدد المعلمين والمشرفين</span>
            <span>👨‍🏫</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {formatArabicNumber(stats.staffCount)} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>معلم</span>
          </div>
        </div>

      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc', marginTop: 0, marginBottom: '16px' }}>
          🚀 روابط الإدارة السريعة
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button 
            onClick={() => setActiveTab('students')}
            style={{ padding: '10px 20px', backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            👥 إدارة كشوف الطلاب
          </button>
          <button 
            onClick={() => setActiveTab('attendance')}
            style={{ padding: '10px 20px', backgroundColor: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            📝 تسجيل الحضور والغياب اليومي
          </button>
        </div>
      </div>

    </div>
  );
}
