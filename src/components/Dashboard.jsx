import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase'; 
import { C } from '../constants/colors';
import { 
  FaUserGraduate, FaUserClock, FaBookOpen, FaAward, 
  FaWhatsapp, FaReceipt, FaMosque, FaCheckCircle 
} from "react-icons/fa";

const QUICK_ACTIONS = [
  { id: 'attendance', ar: 'رصد الحضور والتسميع', en: 'Recitation & Attendance', icon: <FaBookOpen />, color: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' },
  { id: 'exams', ar: 'اختبارات الأجزاء والسور', en: 'Surah & Juz Exams', icon: <FaAward />, color: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)' },
  { id: 'reports', ar: 'تقارير أولياء الأمور', en: 'WhatsApp Reports', icon: <FaWhatsapp />, color: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' },
  { id: 'payments', ar: 'تحصيل الرسوم والاشتراكات', en: 'Collect Fees', icon: <FaReceipt />, color: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)' },
];

export default function Dashboard({ session, setActiveTab, preloadedDashboardData }) {
  const { t, i18n } = useTranslation();

  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // التأكد من وجود بيانات افتراضية لتجنب الخطأ
  const academyData = preloadedDashboardData || { 
    academyName: '...', 
    role: 'teacher', 
    stats: { students: 0, pending: 0, activeHalagas: 0, completedExams: 0 } 
  };

  const isSuperAdmin = academyData.role === 'super_admin';
  const isRtl = i18n.language === 'ar';

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
    setActionLoading(profileId);
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

  // 👑 واجهة السوبر أدمن
  if (isSuperAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#090F17', color: '#fff', padding: '30px', fontFamily: 'sans-serif', direction: 'rtl' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: '20px', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>لوحة تحكم السوبر أدمن 👑</h1>
          <button onClick={() => supabase.auth.signOut()} style={{ background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>تسجيل الخروج 🚪</button>
        </div>

        <div style={{ background: '#111827', border: '1px solid #1E293B', padding: '20px', borderRadius: '12px', maxWidth: '350px', marginBottom: '30px' }}>
          <span style={{ color: '#9CA3AF', fontSize: '14px' }}>الطلبات المعلقة</span>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#C9A84C', marginTop: '5px' }}>{loadingAdmin ? '...' : pendingRequests.length}</div>
        </div>

        {loadingAdmin ? <p style={{ color: '#9CA3AF' }}>جاري تحميل البيانات...</p> : pendingRequests.length === 0 ? 
          <div style={{ padding: '40px', background: '#111827', borderRadius: '12px', textAlign: 'center', border: '1px dashed #374151' }}>لا توجد طلبات معلقة حالياً ✨</div> : 
          <div style={{ display: 'grid', gap: '15px' }}>
            {pendingRequests.map((req) => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111827', border: '1px solid #1E293B', padding: '20px', borderRadius: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', color: '#fff', margin: '0 0 5px 0' }}>{req.full_name || 'مسؤول جديد'}</h3>
                  <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>البريد: {req.email}</p>
                </div>
                <button disabled={actionLoading !== null} onClick={() => handleApprove(req.id)} style={{ background: actionLoading === req.id ? '#065F46' : '#10B981', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '6px', cursor: 'pointer' }}>
                  {actionLoading === req.id ? 'جاري التفعيل...' : '✔ قبول وتفعيل'}
                </button>
              </div>
            ))}
          </div>
        }
      </div>
    );
  }

  // 🏫 الواجهة التقليدية
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 10px', fontFamily: "'Cairo', sans-serif", direction: isRtl ? 'rtl' : 'ltr' }}>
      <header style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '25px' }}>
        <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>{translateText('welcome_back', 'مرحباً بك مجدداً 👋', 'Welcome Back 👋')}</h1>
        <p style={{ color: C.gold || '#C9A84C', fontSize: '1.1rem', margin: '6px 0 0 0', fontWeight: '500' }}>{academyData.academyName}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '40px' }}>
        {QUICK_ACTIONS.map((action) => (
          <button key={action.id} onClick={() => setActiveTab(action.id)} className="premium-action-card" style={{ background: action.color, borderRadius: '14px', padding: '20px 16px', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>{action.icon}</div>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{isRtl ? action.ar : action.en}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
        <div className="premium-stat-box" style={{ borderTop: `4px solid ${C.gold || '#C9A84C'}` }}>
          <div><p className="stat-label">إجمالي الطلاب</p><h2 className="stat-number">{academyData.stats.students}</h2></div>
          <div className="stat-icon"><FaUserGraduate /></div>
        </div>
        <div className="premium-stat-box" style={{ borderTop: '4px solid #ef4444' }}>
          <div><p className="stat-label">المستحقات المعلقة</p><h2 className="stat-number">{academyData.stats.pending}</h2></div>
          <div className="stat-icon" style={{ color: '#ef4444' }}><FaUserClock /></div>
        </div>
        <div className="premium-stat-box" style={{ borderTop: '4px solid #38bdf8' }}>
          <div><p className="stat-label">الحلقات النشطة</p><h2 className="stat-number">{academyData.stats.activeHalagas || 0}</h2></div>
          <div className="stat-icon" style={{ color: '#38bdf8' }}><FaMosque /></div>
        </div>
        <div className="premium-stat-box" style={{ borderTop: '4px solid #34d399' }}>
          <div><p className="stat-label">الاختبارات الناجحة</p><h2 className="stat-number">{academyData.stats.completedExams || 0}</h2></div>
          <div className="stat-icon" style={{ color: '#34d399' }}><FaCheckCircle /></div>
        </div>
      </div>

      <style>{`
        .premium-action-card { border: 1px solid rgba(255,255,255,0.05); transition: all 0.25s ease; }
        .premium-action-card:hover { transform: translateY(-4px); filter: brightness(1.1); }
        .premium-stat-box { background: ${C.surface || '#111C2A'}; padding: 22px 20px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255, 255, 255, 0.02); }
        .stat-label { color: #94a3b8; margin: 0 0 8px 0; font-size: 13px; font-weight: 600; }
        .stat-number { color: #fff; margin: 0; font-size: 2rem; font-weight: 800; }
        .stat-icon { font-size: 28px; opacity: 0.8; }
      `}</style>
    </div>
  );
}
