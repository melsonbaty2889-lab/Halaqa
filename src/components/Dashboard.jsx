/* src/components/Dashboard.jsx */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase'; 
import { C } from '../constants/colors';
import { 
  FaUserGraduate, FaUserClock, FaBookOpen, FaAward, 
  FaWhatsapp, FaReceipt, FaMosque, FaCheckCircle, FaShieldAlt 
} from "react-icons/fa";

export default function Dashboard({ session, setActiveTab, preloadedDashboardData }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');

  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // جلب البيانات الأساسية للوحة التحكم مع قيم افتراضية آمنة
  const academyData = preloadedDashboardData || { 
    academyName: '...', 
    role: 'teacher', 
    stats: { students: 0, pending: 0, activeHalagas: 0, completedExams: 0 } 
  };

  // التأكد من صلاحية السوبر أدمن بشكل دقيق
  const isSuperAdmin = academyData.role === 'super_admin' || academyData.role === 'admin';

  // حساب الترحيب الذكي بناءً على التوقيت الحالي واسم المستخدم مسحوباً من الـ session
  const getGreeting = () => {
    const hour = new Date().getHours();
    const userFullName = session?.user?.user_metadata?.name || session?.user?.user_metadata?.full_name || '';
    const nameSuffix = userFullName ? `، ${userFullName}` : '';
    
    if (hour < 12) {
      return isRtl ? `صباح الخير والبركة 👋${nameSuffix}` : `Good morning 👋${nameSuffix}`;
    } else {
      return isRtl ? `مساء الخير والأنوار 👋${nameSuffix}` : `Good evening 👋${nameSuffix}`;
    }
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
      alert(isRtl ? '🎉 تم تفعيل الحساب بنجاح!' : '🎉 Account activated successfully!');
    } catch (err) {
      alert((isRtl ? '❌ حدث خطأ أثناء التفعيل: ' : '❌ Activation error: ') + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // رندر متجاوب ومنساب يمنع تضارب الـ Layout الخارجي
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 4px 25px 4px', direction: isRtl ? 'rtl' : 'ltr' }}>
      {isSuperAdmin ? (
        <SuperAdminView 
          isRtl={isRtl}
          loadingAdmin={loadingAdmin}
          pendingRequests={pendingRequests}
          actionLoading={actionLoading}
          handleApprove={handleApprove}
          t={t}
        />
      ) : (
        <AcademyView 
          isRtl={isRtl}
          greeting={getGreeting()}
          academyData={academyData}
          setActiveTab={setActiveTab}
          t={t}
        />
      )}
    </div>
  );
}

// 👑 مكوّن واجهة السوبر أدمن المدمج بسلاسة (Super Admin View Component)
function SuperAdminView({ isRtl, loadingAdmin, pendingRequests, actionLoading, handleApprove, t }) {
  return (
    <div style={{ textAlign: 'start' }}>
      {/* رأس صفحة السوبر أدمن - متناسق مع الهيدر المطور */}
      <header style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '22px' }}>
        <h1 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaShieldAlt style={{ color: 'var(--gold)' }} />
          {isRtl ? 'لوحة تحكم إدارة المنصة' : 'Platform Control Panel'}
        </h1>
        <p style={{ color: '#657585', fontSize: '0.95rem', margin: '6px 0 0 0', fontWeight: '500' }}>
          {isRtl ? 'مراجعة وتفعيل طلبات الأكاديميات الجديدة فورياً' : 'Review and approve new academy setup requests'}
        </p>
      </header>

      {/* كرت إجمالي الطلبات المعلقة */}
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.02)', padding: '24px', borderRadius: '14px', maxWidth: '340px', marginBottom: '35px', boxShadow: 'var(--shadow)' }}>
        <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>
          {isRtl ? '📥 طلبات التسجيل المعلقة' : '📥 Pending Registrations'}
        </span>
        <div style={{ fontSize: '38px', fontWeight: '800', color: 'var(--gold)', marginTop: '8px', fontFamily: 'system-ui' }}>
          {loadingAdmin ? '...' : pendingRequests.length}
        </div>
      </div>

      {/* قائمة الطلبات */}
      <h2 style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: '700', marginBottom: '15px', textTransform: 'uppercase' }}>
        {isRtl ? '📋 قائمة الطلبات الحالية' : '📋 Current Requests List'}
      </h2>

      {loadingAdmin ? (
        <p style={{ color: '#657585', fontSize: '14px' }}>{isRtl ? 'جاري تحميل البيانات البرمجية...' : 'Loading system data...'}</p>
      ) : pendingRequests.length === 0 ? (
        <div style={{ padding: '50px 20px', background: 'var(--surface)', borderRadius: '14px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '14px' }}>
          {isRtl ? 'لا توجد طلبات تفعيل معلقة حالياً.. النظام مستقر ✨' : 'No pending requests available.. System clear ✨'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {pendingRequests.map((req) => (
            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.02)', padding: '20px', borderRadius: '14px', boxShadow: 'var(--shadow)' }}>
              <div style={{ textAlign: 'start' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 6px 0' }}>
                  {req.name || (isRtl ? 'مدير أكاديمية جديد' : 'New Academy Manager')}
                </h3>
                <p style={{ color: '#657585', fontSize: '13px', margin: 0, fontFamily: 'monospace' }}>
                  {req.email}
                </p>
              </div>
              <button 
                disabled={actionLoading !== null} 
                onClick={() => handleApprove(req.id)} 
                style={{ 
                  background: actionLoading === req.id ? '#065F46' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '10px 24px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: '700',
                  fontSize: '13px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
                  transition: 'opacity 0.2s ease'
                }}
              >
                {actionLoading === req.id ? (isRtl ? 'جاري التفعيل...' : 'Activating...') : (isRtl ? '✔ قبول وتفعيل الصلاحية' : '✔ Approve & Activate')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 🏫 مكوّن واجهة الأكاديمية (Academy Dashboard View Component)
function AcademyView({ isRtl, greeting, academyData, setActiveTab, t }) {
  return (
    <>
      {/* رأس الصفحة */}
      <header style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '22px', textAlign: 'start' }}>
        <h1 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: '700', margin: 0, whiteSpace: 'nowrap' }}>
          {greeting}
        </h1>
        <p style={{ color: 'var(--gold)', fontSize: '1.05rem', margin: '6px 0 0 0', fontWeight: '600' }}>
          {academyData.academyName}
        </p>
      </header>

      {/* ⚡ مركز العمليات الذكي */}
      <section style={{ marginBottom: '40px', textAlign: 'start' }}>
        <h2 style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: isRtl ? '0' : '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚡</span> {t('quick_actions')}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* حلقة التحضير اليومي */}
          <button onClick={() => setActiveTab('attendance')} className="premium-launchpad-card long-card" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="launchpad-icon-wrapper"><FaBookOpen /></div>
              <div style={{ textAlign: 'start' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{t('action_attendance')}</div>
                <div style={{ fontSize: '12px', color: '#93c5fd', marginTop: '2px' }}>{isRtl ? 'تسجيل الغياب والحفظ والمراجعة الفورية للحلقة الحالية' : 'Log attendance, memorization and reviews instantly'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '20px' }}>
              <span className="pulse-dot"></span>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap' }}>{isRtl ? 'جاهز' : 'Live'}</span>
            </div>
          </button>

          {/* كروت الاختبارات والتقارير */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <button onClick={() => setActiveTab('exams')} className="premium-launchpad-card grid-card" style={{ background: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)', border: 'none' }}>
              <div className="launchpad-icon-wrapper"><FaAward /></div>
              <span className="launchpad-grid-title">{t('action_exams')}</span>
            </button>

            <button onClick={() => setActiveTab('reports')} className="premium-launchpad-card grid-card" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)', border: 'none' }}>
              <div className="launchpad-icon-wrapper"><FaWhatsapp /></div>
              <span className="launchpad-grid-title">{t('action_reports')}</span>
            </button>
          </div>

          {/* العمليات المالية */}
          <button onClick={() => setActiveTab('payments')} className="premium-launchpad-card long-card" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="launchpad-icon-wrapper"><FaReceipt /></div>
              <div style={{ textAlign: 'start' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{t('action_payments')}</div>
                <div style={{ fontSize: '12px', color: '#ddd6fe', marginTop: '2px' }}>{isRtl ? 'متابعة الاشتراكات وحالات السداد الشهرية' : 'Manage subscriptions and monthly billing'}</div>
              </div>
            </div>
            {academyData.stats.pending > 0 && (
              <div style={{ background: '#ef4444', color: '#fff', minWidth: '22px', height: '22px', padding: '0 6px', borderRadius: '11px', display: 'flex', alignItems: 'center', justify-content: 'center', fontSize: '11px', fontWeight: '800', border: '2px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>
                {academyData.stats.pending}
              </div>
            )}
          </button>

        </div>
      </section>

      {/* 📊 قسم التقرير العام */}
      <section style={{ textAlign: 'start' }}>
        <h2 style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: isRtl ? '0' : '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📊</span> {t('academy_overview')}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
          <div className="premium-stat-box" style={{ borderTop: `4px solid var(--gold)` }}>
            <div style={{ textAlign: 'start' }}>
              <p className="stat-label">{t('total_students')}</p>
              <h2 className="stat-number">{academyData.stats.students}</h2>
            </div>
            <div className="stat-icon" style={{ color: 'var(--gold)' }}><FaUserGraduate /></div>
          </div>

          <div className="premium-stat-box" style={{ borderTop: '4px solid #ef4444' }}>
            <div style={{ textAlign: 'start' }}>
              <p className="stat-label">{t('pending_payments')}</p>
              <h2 className="stat-number">{academyData.stats.pending}</h2>
            </div>
            <div className="stat-icon" style={{ color: '#ef4444' }}><FaUserClock /></div>
          </div>

          <div className="premium-stat-box" style={{ borderTop: '4px solid #38bdf8' }}>
            <div style={{ textAlign: 'start' }}>
              <p className="stat-label">{t('active_halagas')}</p>
              <h2 className="stat-number">{academyData.stats.activeHalagas || 0}</h2>
            </div>
            <div className="stat-icon" style={{ color: '#38bdf8' }}><FaMosque /></div>
          </div>

          <div className="premium-stat-box" style={{ borderTop: '4px solid #34d399' }}>
            <div style={{ textAlign: 'start' }}>
              <p className="stat-label">{t('completed_exams')}</p>
              <h2 className="stat-number">{academyData.stats.completedExams || 0}</h2>
            </div>
            <div className="stat-icon" style={{ color: '#34d399' }}><FaCheckCircle /></div>
          </div>
        </div>
      </section>

      {/* الأنماط الحركية المتقدمة */}
      <style>{`
        .premium-launchpad-card { 
          border-radius: 14px; 
          color: #fff; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: space-between;
          padding: 16px 20px;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-launchpad-card:hover { 
          transform: translateY(-3px); 
          filter: brightness(1.12); 
          box-shadow: 0 6px 15px rgba(0,0,0,0.25); 
        }
        .long-card { width: 100%; box-sizing: border-box; }
        .grid-card { 
          flex-direction: column; 
          justify-content: center; 
          gap: 10px; 
          padding: 20px 10px;
        }
        .launchpad-icon-wrapper { font-size: 24px; display: flex; align-items: center; justify-content: center; }
        .launchpad-grid-title { font-size: 13px; font-weight: 700; text-align: center; white-space: nowrap; }
        
        .premium-stat-box { 
          background: var(--surface); 
          padding: 22px 20px; 
          border-radius: 14px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          border: 1px solid rgba(255, 255, 255, 0.02); 
          box-shadow: var(--shadow);
        }
        .stat-label { color: #94a3b8; margin: 0 0 6px 0; font-size: 13px; font-weight: 600; }
        .stat-number { color: #fff; margin: 0; font-size: 2.1rem; font-weight: 800; font-family: system-ui, -apple-system, sans-serif; letter-spacing: -0.5px; }
        .stat-icon { font-size: 26px; opacity: 0.85; display: flex; align-items: center; }

        .pulse-dot {
          width: 7px;
          height: 7px;
          background-color: #34d399;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7);
          animation: pulse 1.6s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
        }
      `}</style>
    </>
  );
}
