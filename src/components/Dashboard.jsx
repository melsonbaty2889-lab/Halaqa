import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase'; 
import { C } from '../constants/colors';
import { 
  FaUserGraduate, FaUserClock, FaBookOpen, FaAward, 
  FaWhatsapp, FaReceipt, FaMosque, FaCheckCircle 
} from "react-icons/fa";

// 🛠️ تم ضبط مسمى التقارير والرسوم لتوافق معايير الأنظمة العالمية
const QUICK_ACTIONS = [
  { id: 'attendance', ar: 'رصد الحضور والتسميع', en: 'Recitation & Attendance', icon: <FaBookOpen />, color: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' },
  { id: 'exams', ar: 'اختبارات الأجزاء والسور', en: 'Surah & Juz Exams', icon: <FaAward />, color: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)' },
  { id: 'reports', ar: 'تقارير أولياء الأمور', en: 'Parent Reports', icon: <FaWhatsapp />, color: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' },
  { id: 'payments', ar: 'تحصيل الرسوم والاشتراكات', en: 'Billing & Finance', icon: <FaReceipt />, color: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)' },
];

export default function Dashboard({ session, setActiveTab, preloadedDashboardData }) {
  const { t, i18n } = useTranslation();

  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // التأكد من استلام البيانات والـ role من MainApp
  const academyData = preloadedDashboardData || { 
    academyName: '...', 
    role: 'teacher', 
    stats: { students: 0, pending: 0, activeHalagas: 0, completedExams: 0 } 
  };

  const isSuperAdmin = academyData.role === 'super_admin' || academyData.role === 'admin';
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');

  const translateText = (key, arText, enText) => {
    if (i18n.exists(key)) return t(key);
    return isRtl ? arText : enText;
  };

  useEffect(() => {
    if (!isSuperAdmin) {
      setLoadingAdmin(false);
      return;
    }

    const fetchRequests = async () => {
      setLoadingAdmin(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['pending_manager', 'Pending manager', 'Pending Manager']) 
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPendingRequests(data || []);
      } catch (err) {
        console.error('Error fetching requests:', err.message);
      } finally {
        setLoadingAdmin(false);
      }
    };

    fetchRequests();
  }, [isSuperAdmin]);

  const handleApprove = async (profileId) => {
    actionLoading(profileId);
    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'manager', is_activated: true }) 
        .eq('id', profileId);

      if (profileError) throw profileError;

      const { error: subError } = await supabase
        .from('saas_subscriptions')
        .insert([{ 
            user_id: profileId, 
            status: 'active', 
            plan_duration: 'monthly',
            expires_at: expiresAt.toISOString(),
            payment_gateway: 'manual_admin_approval'
        }]);

      if (subError) throw subError;
      
      setPendingRequests(prev => prev.filter(req => req.id !== profileId));
      alert('🎉 تم تفعيل الحساب بنجاح!');
    } catch (err) {
      alert('❌ حدث خطأ أثناء التفعيل: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // 👑 واجهة السوبر أدمن (تتكيف ديناميكياً مع اتجاه اللغة المختار)
  if (isSuperAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#090F17', color: '#fff', padding: '30px', fontFamily: 'sans-serif', direction: isRtl ? 'rtl' : 'ltr' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: '20px', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {isRtl ? 'لوحة تحكم السوبر أدمن 👑' : 'Super Admin Dashboard 👑'}
          </h1>
          <button onClick={() => supabase.auth.signOut()} style={{ background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            {isRtl ? 'تسجيل الخروج 🚪' : 'Log Out 🚪'}
          </button>
        </div>

        <div style={{ background: '#111827', border: '1px solid #1E293B', padding: '20px', borderRadius: '12px', maxWidth: '350px', marginBottom: '30px' }}>
          <span style={{ color: '#9CA3AF', fontSize: '14px', fontWeight: '500' }}>
            {isRtl ? 'الطلبات المعلقة' : 'Pending Approvals'}
          </span>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#C9A84C', marginTop: '5px' }}>{loadingAdmin ? '...' : pendingRequests.length}</div>
        </div>

        {loadingAdmin ? <p style={{ color: '#9CA3AF' }}>{isRtl ? 'جاري تحميل البيانات...' : 'Loading data...'}</p> : pendingRequests.length === 0 ? 
          <div style={{ padding: '40px', background: '#111827', borderRadius: '12px', textAlign: 'center', border: '1px dashed #374151', color: '#9CA3AF' }}>
            {isRtl ? 'لا توجد طلبات معلقة حالياً ✨' : 'No pending requests available ✨'}
          </div> : 
          <div style={{ display: 'grid', gap: '15px' }}>
            {pendingRequests.map((req) => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111827', border: '1px solid #1E293B', padding: '20px', borderRadius: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', color: '#fff', margin: '0 0 5px 0' }}>{req.full_name || (isRtl ? 'مسؤول جديد' : 'New Manager')}</h3>
                  <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>{isRtl ? 'البريد:' : 'Email:'} {req.email}</p>
                </div>
                <button disabled={actionLoading !== null} onClick={() => handleApprove(req.id)} style={{ background: actionLoading === req.id ? '#065F46' : '#10B981', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  {actionLoading === req.id ? (isRtl ? 'جاري التفعيل...' : 'Activating...') : (isRtl ? '✔ قبول وتفعيل' : '✔ Approve & Activate')}
                </button>
              </div>
            ))}
          </div>
        }
      </div>
    );
  }

  // 🏫 الواجهة التقليدية المحسنة بالكامل للمستخدمين في الغرب والشرق
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 10px', direction: isRtl ? 'rtl' : 'ltr' }}>
      <header style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '25px', textAlign: 'start' }}>
        <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '700', margin: 0, letterSpacing: isRtl ? 'normal' : '0.3px' }}>
          {translateText('welcome_back', 'مرحباً بك مجدداً 👋', 'Welcome Back 👋')}
        </h1>
        <p style={{ color: C.gold || '#C9A84C', fontSize: '1.1rem', margin: '6px 0 0 0', fontWeight: '600', letterSpacing: isRtl ? 'normal' : '0.2px' }}>
          {academyData.academyName}
        </p>
      </header>

      {/* كروت الإجراءات السريعة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '40px' }}>
        {QUICK_ACTIONS.map((action) => (
          <button key={action.id} onClick={() => setActiveTab(action.id)} className="premium-action-card" style={{ background: action.color, borderRadius: '14px', padding: '24px 16px', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '26px', display: 'flex', alignItems: 'center' }}>{action.icon}</div>
            <span style={{ fontSize: '14px', fontWeight: '700', letterSpacing: isRtl ? 'normal' : '0.2px' }}>
              {isRtl ? action.ar : action.en}
            </span>
          </button>
        ))}
      </div>

      {/* 🛠️ كروت الإحصائيات بعد معالجة النصوص الثابتة والمحاذاة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
        <div className="premium-stat-box" style={{ borderTop: `4px solid ${C.gold || '#C9A84C'}` }}>
          <div style={{ textAlign: 'start' }}>
            <p className="stat-label">{isRtl ? 'إجمالي الطلاب' : 'Total Students'}</p>
            <h2 className="stat-number">{academyData.stats.students}</h2>
          </div>
          <div className="stat-icon"><FaUserGraduate /></div>
        </div>

        <div className="premium-stat-box" style={{ borderTop: '4px solid #ef4444' }}>
          <div style={{ textAlign: 'start' }}>
            <p className="stat-label">{isRtl ? 'المستحقات المعلقة' : 'Pending Dues'}</p>
            <h2 className="stat-number">{academyData.stats.pending}</h2>
          </div>
          <div className="stat-icon" style={{ color: '#ef4444' }}><FaUserClock /></div>
        </div>

        <div className="premium-stat-box" style={{ borderTop: '4px solid #38bdf8' }}>
          <div style={{ textAlign: 'start' }}>
            <p className="stat-label">{isRtl ? 'الحلقات النشطة' : 'Active Halaqas'}</p>
            <h2 className="stat-number">{academyData.stats.activeHalagas || 0}</h2>
          </div>
          <div className="stat-icon" style={{ color: '#38bdf8' }}><FaMosque /></div>
        </div>

        <div className="premium-stat-box" style={{ borderTop: '4px solid #34d399' }}>
          <div style={{ textAlign: 'start' }}>
            <p className="stat-label">{isRtl ? 'الاختبارات الناجحة' : 'Passed Exams'}</p>
            <h2 className="stat-number">{academyData.stats.completedExams || 0}</h2>
          </div>
          <div className="stat-icon" style={{ color: '#34d399' }}><FaCheckCircle /></div>
        </div>
      </div>

      <style>{`
        .premium-action-card { border: 1px solid rgba(255,255,255,0.03); transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .premium-action-card:hover { transform: translateY(-5px); filter: brightness(1.12); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
        .premium-stat-box { background: ${C.surface || '#111C2A'}; padding: 22px 20px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255, 255, 255, 0.02); }
        .stat-label { color: #94a3b8; margin: 0 0 6px 0; font-size: 13px; font-weight: 600; letter-spacing: ${isRtl ? 'normal' : '0.2px'}; }
        .stat-number { color: #fff; margin: 0; font-size: 2.2rem; font-weight: 800; font-family: system-ui, -apple-system, sans-serif; letter-spacing: -0.5px; }
        .stat-icon { font-size: 28px; opacity: 0.85; display: flex; alignItems: center; }
      `}</style>
    </div>
  );
}
