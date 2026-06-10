import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';

const formatArabicNumber = (num) => new Intl.NumberFormat('ar-EG').format(num || 0);

export default function Dashboard({ session, setActiveTab }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ studentsCount: 0, staffCount: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      const userId = session?.user?.id;
      if (!userId) return;

      try {
        const { data: staffData } = await supabase
          .from('staff')
          .select('name, academies(id, name)')
          .eq('user_id', userId)
          .maybeSingle();

        if (staffData) {
          setProfile({ name: staffData.name, academyName: staffData.academies?.name });
          
          if (staffData.academies?.id) {
            const [{ count: studentCount }, { count: staffCount }] = await Promise.all([
              supabase.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', staffData.academies.id),
              supabase.from('staff').select('*', { count: 'exact', head: true }).eq('academy_id', staffData.academies.id)
            ]);
            setStats({ studentsCount: studentCount || 0, staffCount: staffCount || 0 });
          }
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [session]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: C.text }}>⏳ جاري تحميل البيانات...</div>;

  return (
    <div style={{ padding: isMobile ? '16px' : '32px', color: C.text, direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.75rem', color: C.gold, margin: 0 }}>نظام الإدارة المركزية</h2>
        <p style={{ color: C.muted }}>مرحباً {profile?.name || 'مستخدم'}، إليك ملخص الأداء لـ {profile?.academyName || 'الأكاديمية'}</p>
      </div>

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard title="إجمالي المسجلين" value={stats.studentsCount} icon="🎓" />
        <StatCard title="الكادر التعليمي" value={stats.staffCount} icon="👨‍💻" />
        <StatCard title="معدل الأداء" value="94%" icon="📈" color={C.green} />
      </div>

      {/* Smart Alerts */}
      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', marginBottom: '24px', borderRight: `4px solid ${C.gold}` }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>💡 تنبيهات ذكية تحتاج انتباهك</h3>
        <ul style={{ listStyle: 'none', padding: 0, color: C.muted, margin: 0 }}>
          <li style={{ marginBottom: '8px' }}>• هناك طلاب يحتاجون إلى مراجعة الحالة المالية.</li>
          <li>• سجل المتابعة اليومي متاح للتحديث.</li>
        </ul>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
        <button onClick={() => setActiveTab('students')} style={{ padding: '12px 24px', background: C.gold, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          📁 قاعدة بيانات الطلاب
        </button>
        <button onClick={() => setActiveTab('attendance')} style={{ padding: '12px 24px', background: C.card, color: C.text, border: `1px solid ${C.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          📊 تحليل المواظبة
        </button>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon, color = C.gold }) => (
  <div style={{ backgroundColor: C.card, padding: '20px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
    <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{icon}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color }}>{value}</div>
    <div style={{ fontSize: '0.8rem', color: C.muted }}>{title}</div>
  </div>
);
