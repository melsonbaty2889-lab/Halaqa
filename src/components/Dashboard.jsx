import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C, g } from '../constants/colors'; // 🎨 استيراد الألوان الموحدة للمنصة

export default function Dashboard({ session, setActiveTab }) { // 👈 استقبلنا setActiveTab لتشغيل الأزرار السريعة
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

        // 2. جلب عدد الطلاب التابعين للأكاديمية (الـ RLS سيفلتر تلقائياً بناءً على الـ academy_id)
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

    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session]);

  if (loading) {
    return (
      <div style={{ ...styles.loading, color: C.gold }}>
        جاري مزامنة بيانات لوحة تحكم الأكاديمية سحابياً... ⏳
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* الشريط العلوي (Header) */}
      <header style={{ ...styles.header, borderBottom: `1px solid ${C.border}` }}>
        <div>
          {/* 👈 تم تعديل profile.name إلى full_name لمطابقة قاعدة البيانات */}
          <h1 style={{ ...styles.welcomeText, color: C.text }}>مرحباً، {profile?.full_name || 'يا هندسة'} 👋</h1>
          <p style={styles.roleBadge}>صلاحية الحساب الحالية: <span style={{color: C.gold}}>{profile?.role === 'admin' ? 'مدير الأكاديمية' : 'معلم الحلقة'}</span></p>
        </div>
        <button onClick={() => supabase.auth.signOut()} style={styles.logoutBtn}>
          تسجيل الخروج الأمن 🚪
        </button>
      </header>

      {/* كروت الإحصائيات الذكية (Stats Grid) */}
      <div style={styles.grid}>
        <div style={{ ...styles.card, backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
          <h3 style={{ ...styles.cardTitle, color: C.muted }}>إجمالي الطلاب المسجلين</h3>
          <p style={{ ...styles.cardValue, color: C.gold }}>{styles.formatNumber(stats.studentsCount)}</p>
          <span style={{ ...styles.cardSub, color: C.muted }}>طالب نشط في الحلقات الحالية</span>
        </div>

        <div style={{ ...styles.card, backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
          <h3 style={{ ...styles.cardTitle, color: C.muted }}>طاقم التدريس والمشرفين</h3>
          <p style={{ ...styles.cardValue, color: C.text }}>{styles.formatNumber(stats.staffCount)}</p>
          <span style={{ ...styles.cardSub, color: C.muted }}>معلم ومحفّظ مفعّل سحابياً</span>
        </div>

        <div style={{ ...styles.card, backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
          <h3 style={{ ...styles.cardTitle, color: C.muted }}>حالة ترخيص الـ SaaS</h3>
          <p style={{ ...styles.cardValue, color: '#10B981' }}>نشط الحساب</p>
          <span style={{ ...styles.cardSub, color: C.muted }}>Licensed to The Win Route © 2026</span>
        </div>
      </div>

      {/* قسم الإجراءات السريعة (Quick Actions) */}
      <div style={{ ...styles.actionsSection, backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
        <h3 style={{ color: C.text, margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>إجراءات إدارية سريعة</h3>
        <div style={styles.actionButtons}>
          {/* 👈 تم استبدال الـ alerts بتوجيه فوري وسلس للمستخدم بداخل الـ App الرئيسي */}
          <button style={{ ...styles.actionBtn, background: g.gold, color: '#1A1208' }} onClick={() => setActiveTab('students')}>
            ➕ إضافة وإدارة الطلاب
          </button>
          <button style={{ ...styles.actionBtn, backgroundColor: 'transparent', color: C.text, border: `1px solid ${C.border}` }} onClick={() => setActiveTab('students')}>
            📋 عرض كشوف الحلقات
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', direction: 'rtl', fontFamily: "'Cairo', sans-serif" },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', fontSize: '18px', fontFamily: "'Cairo'" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '25px' },
  welcomeText: { fontSize: '1.7rem', fontWeight: 800, margin: 0 },
  roleBadge: { fontSize: '0.85rem', color: '#94A3B8', marginTop: '6px', margin: 0 },
  logoutBtn: { padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #EF4444', color: '#EF4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontFamily: "'Cairo'", fontSize: '0.8rem', transition: 'all 0.2s' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' },
  card: { padding: '24px', borderRadius: '14px', textAlign: 'right' },
  cardTitle: { fontSize: '0.85rem', margin: '0 0 12px 0', fontWeight: 500 },
  cardValue: { fontSize: '2.2rem', fontWeight: 800, margin: '0 0 6px 0', lineHeight: 1 },
  cardSub: { fontSize: '0.75rem' },
  actionsSection: { padding: '24px', borderRadius: '14px' },
  actionButtons: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  actionBtn: { padding: '10px 20px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', fontFamily: "'Cairo'", transition: 'all 0.2s' },
  formatNumber: (num) => new Intl.NumberFormat('ar-EG').format(num) // تنسيق أرقام عربي احترافي للمظهر العام
};
