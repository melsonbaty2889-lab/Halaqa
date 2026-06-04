import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard({ session }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ studentsCount: 0, staffCount: 0 });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // 1. جلب بيانات الموظف المسجل حالياً من جدول staff
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (staffError) throw staffError;
        setProfile(staffData);

        // 2. جلب عدد الطلاب التابعين للأكاديمية (الـ RLS سيفلتر تلقائياً)
        const { count: studentCount, error: studentError } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });

        if (studentError) throw studentError;

        // 3. جلب عدد الموظفين/المعلمين في نفس الأكاديمية
        const { count: teachersCount, error: teachersError } = await supabase
          .from('staff')
          .select('*', { count: 'exact', head: true })
          .eq('academy_id', staffData.academy_id);

        if (teachersError) throw teachersError;

        setStats({
          studentsCount: studentCount || 0,
          staffCount: teachersCount || 0
        });

      } catch (error) {
        console.error("خطأ في جلب بيانات لوحة التحكم:", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [session]);

  if (loading) {
    return <div style={styles.loading}>جاري تحميل إحصائيات أكاديميتك... 🔄</div>;
  }

  return (
    <div style={styles.container}>
      {/* الشريط العلوي (Header) */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.welcomeText}>مرحباً، {profile?.name || 'يا هندسة'} 👋</h1>
          <p style={styles.roleBadge}>صلاحية الحساب: {profile?.role === 'admin' ? 'مدير المنصة' : 'معلم'}</p>
        </div>
        <button onClick={() => supabase.auth.signOut()} style={styles.logoutBtn}>
          تسجيل الخروج 🚪
        </button>
      </header>

      {/* كروت الإحصائيات (Stats Grid) */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>إجمالي الطلاب مسجلين</h3>
          <p style={styles.cardValue}>{stats.studentsCount}</p>
          <span style={styles.cardSub}>طالب نشط في الحلقات</span>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>طاقم التدريس والمشرفين</h3>
          <p style={styles.cardValue}>{stats.staffCount}</p>
          <span style={styles.cardSub}>معلم إداري مفعّل</span>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>حالة خطة الـ SaaS</h3>
          <p style={{ ...styles.cardValue, color: '#2e7d32' }}>نشط</p>
          <span style={styles.cardSub}>الباقة التجريبية المميزة</span>
        </div>
      </div>

      {/* قسم الإجراءات السريعة (Quick Actions) */}
      <div style={styles.actionsSection}>
        <h3>إجراءات سريعة</h3>
        <div style={styles.actionButtons}>
          <button style={styles.actionBtn} onClick={() => alert('افتح شاشة إضافة الطلاب هنا')}>
            ➕ إضافة طالب جديد
          </button>
          <button style={{ ...styles.actionBtn, backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ccc' }} onClick={() => alert('افتح شاشة جدول الطلاب')}>
            📋 عرض جدول الطلاب
          </button>
        </div>
      </div>
    </div>
  );
}

// تصميم بريميوم هادئ وبسيط ومتناسق
const styles = {
  container: { padding: '30px', maxWidth: '1200px', margin: '0 auto', direction: 'rtl', fontFamily: 'sans-serif' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', fontSize: '18px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #eee', paddingBottom: '20px' },
  welcomeText: { fontSize: '26px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 },
  roleBadge: { fontSize: '14px', color: '#666', marginTop: '5px', marginText: 0 },
  logoutBtn: { padding: '10px 16px', backgroundColor: '#fff', border: '1px solid #ff4d4f', color: '#ff4d4f', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' },
  card: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eef0f2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', textAlign: 'right' },
  cardTitle: { fontSize: '14px', color: '#666', margin: '0 0 10px 0' },
  cardValue: { fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 5px 0' },
  cardSub: { fontSize: '12px', color: '#999' },
  actionsSection: { backgroundColor: '#fafafa', padding: '24px', borderRadius: '12px', border: '1px solid #eee' },
  actionButtons: { display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' },
  actionBtn: { padding: '12px 20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }
};
