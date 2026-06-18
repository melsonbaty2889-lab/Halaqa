import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase'; 
import { C } from '../constants/colors';
import { 
  FaUserGraduate, 
  FaUserClock, 
  FaBookOpen, 
  FaAward, 
  FaWhatsapp, 
  FaReceipt, 
  FaMosque, 
  FaCheckCircle 
} from "react-icons/fa";

export default function Dashboard({ session, setActiveTab, preloadedDashboardData }) {
  const { t, i18n } = useTranslation();

  // أولاً: حالات التحكم الخاصة بلوحة السوبر أدمن (مأخوذة تماماً من AdminDashboard)
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // ثانياً: استيعاب البيانات المركزية للأكاديمية مع توفير قيم افتراضية ذكية
  const academyData = preloadedDashboardData || { 
    academyName: '', 
    role: 'teacher', // الرتبة الافتراضية في حال عدم التحديد
    stats: { students: 0, pending: 0, activeHalagas: 4, completedExams: 12 } 
  };

  // فحص نوع اللوحة المطلوب عرضها بناءً على رتبة الحساب المسجل
  const isSuperAdmin = academyData.role === 'super_admin';

  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

  const translateText = (key, arText, enText) => {
    if (i18n.exists(key)) return t(key);
    return isRtl ? arText : enText;
  };

  // تأثير جلب طلبات السوبر أدمن (يشتغل فقط لو كان الحساب سوبر أدمن)
  useEffect(() => {
    if (!isSuperAdmin) return;

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

  // دالة قبول وتفعيل الحساب التابعة للسوبر أدمن
  const handleApprove = async (profileId) => {
    setActionLoading(profileId);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'manager' }) 
        .eq('id', profileId);

      if (updateError) throw updateError;
      
      setPendingRequests(prev => prev.filter(req => req.id !== profileId));
      alert('🎉 تم تفعيل حساب الأكاديمية بنجاح!');
    } catch (err) {
      alert('❌ حدث خطأ أثناء التفعيل: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // مصفوفة الأزرار الذكية للإجراءات السريعة للأكاديمية
  const quickActions = [
    { 
      id: 'attendance', 
      label: translateText('action_attendance', 'رصد الحضور والتسميع', 'Recitation & Attendance'), 
      icon: <FaBookOpen />, 
      color: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
      shadow: 'rgba(37, 99, 235, 0.15)'
    },
    { 
      id: 'exams', 
      label: translateText('action_exams', 'اختبارات الأجزاء والسور', 'Surah & Juz Exams'), 
      icon: <FaAward />, 
      color: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)',
      shadow: 'rgba(180, 83, 9, 0.15)'
    },
    { 
      id: 'reports', 
      label: translateText('action_reports', 'تقارير أولياء الأمور', 'WhatsApp Reports'), 
      icon: <FaWhatsapp />, 
      color: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
      shadow: 'rgba(5, 150, 105, 0.15)'
    },
    { 
      id: 'payments', 
      label: translateText('action_payments', 'تحصيل الرسوم والاشتراكات', 'Collect Fees'), 
      icon: <FaReceipt />, 
      color: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
      shadow: 'rgba(124, 58, 237, 0.15)'
    },
  ];

  /* ------------------------------------------------------------- */
  /* 👑 أولاً: عرض لوحة تحكم السوبر أدمن (لو كانت الرتبة super_admin) */
  /* ------------------------------------------------------------- */
  if (isSuperAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#090F17', color: '#fff', padding: '30px', fontFamily: 'sans-serif', direction: 'rtl' }}>
        
        {/* الشريط العلوي للوحة التحكم */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '24px', color: '#fff', fontWeight: 'bold', margin: 0 }}>لوحة تحكم السوبر أدمن 👑</h1>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()} 
            style={{ background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', transition: '0.2s' }}
            onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
            onMouseOut={(e) => e.target.style.background = 'transparent'}
          >
            تسجيل الخروج 🚪
          </button>
        </div>

        {/* بطاقة إحصائيات الطلبات المعلقة */}
        <div style={{ background: '#111827', border: '1px solid #1E293B', padding: '20px', borderRadius: '12px', maxWidth: '350px', marginBottom: '30px' }}>
          <span style={{ color: '#9CA3AF', fontSize: '14px' }}>الطلبات المعلقة حالياً</span>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#C9A84C', marginTop: '5px' }}>
            {loadingAdmin ? '...' : pendingRequests.length}
          </div>
        </div>

        <h2 style={{ fontSize: '18px', color: '#C9A84C', marginBottom: '15px' }}>الطلبات الواردة:</h2>

        {loadingAdmin ? (
          <p style={{ color: '#9CA3AF' }}>جاري تحميل البيانات...</p>
        ) : pendingRequests.length === 0 ? (
          <div style={{ padding: '40px', background: '#111827', borderRadius: '12px', textAlign: 'center', border: '1px dashed #374151' }}>
            <p style={{ color: '#9CA3AF', margin: 0 }}>لا توجد طلبات انضمام معلقة حالياً. جاري انتظار طلبات جديدة! ✨</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {pendingRequests.map((req) => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111827', border: '1px solid #1E293B', padding: '20px', borderRadius: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', color: '#fff', margin: '0 0 5px 0' }}>{req.full_name || 'مسؤول جديد'}</h3>
                  <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>البريد الإلكتروني للطلب: <span style={{ color: '#fff' }}>{req.email || 'غير متوفر'}</span></p>
                </div>
                <button 
                  disabled={actionLoading !== null} 
                  onClick={() => handleApprove(req.id)} 
                  style={{ 
                    background: actionLoading === req.id ? '#065F46' : '#10B981', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '10px 22px', 
                    borderRadius: '6px', 
                    fontWeight: 'bold', 
                    cursor: actionLoading !== null ? 'not-allowed' : 'pointer',
                    transition: '0.2s'
                  }}
                >
                  {actionLoading === req.id ? 'جاري التفعيل...' : '✔ قبول وتفعيل'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* 🏫 ثانياً: عرض اللوحة التقليدية (للمعلم والمدير والأكاديميات) */
  /* ------------------------------------------------------------- */
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px 10px',
      fontFamily: "'Cairo', sans-serif",
      direction: isRtl ? 'rtl' : 'ltr' 
    }}>
      
      {/* 1️⃣ شريط الترحيب الذكي والفاخر */}
      <header style={{ 
        marginBottom: '30px', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
        paddingBottom: '25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ 
            color: '#fff', 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            {translateText('welcome_back', 'مرحباً بك مجدداً 👋', 'Welcome Back 👋')}
          </h1>
          
          {academyData.academyName ? (
            <p style={{ color: C.gold || '#C9A84C', fontSize: '1.1rem', margin: '6px 0 0 0', fontWeight: '500' }}>
              {academyData.academyName}
            </p>
          ) : (
            <div className="skeleton-line" style={{ width: '160px', height: '16px', borderRadius: '4px', marginTop: '10px' }}></div>
          )}
        </div>
      </header>

      {/* 2️⃣ شبكة الإجراءات السريعة المطورة */}
      <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '0.5px' }}>
        {translateText('quick_actions', 'الإجراءات السريعة للحلقة', 'Quick Operations')}
      </h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '15px', 
        marginBottom: '40px' 
      }}>
        {quickActions.map((action) => (
          <button 
            key={action.id}
            onClick={() => setActiveTab(action.id)} 
            className="premium-action-card"
            style={{ 
              background: action.color, 
              border: '1px solid rgba(255,255,255,0.05)', 
              borderRadius: '14px', 
              padding: '20px 16px', 
              color: '#fff', 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.25s ease',
              boxShadow: `0 10px 20px -5px ${action.shadow}`
            }}
          >
            <div style={{ fontSize: '24px', display: 'flex', alignItems: 'center' }}>{action.icon}</div>
            <span style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>{action.label}</span>
          </button>
        ))}
      </div>

      {/* 3️⃣ شبكة الإحصائيات الفاخرة */}
      <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '0.5px' }}>
        {translateText('academy_overview', 'التقرير العام للأكاديمية', 'Academy Performance')}
      </h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '15px' 
      }}>
        
        {/* بطاقة إجمالي الطلاب */}
        <div className="premium-stat-box" style={{ borderTop: `4px solid ${C.gold || '#C9A84C'}` }}>
          <div>
            <p className="stat-label">{translateText('total_students', 'إجمالي الطلاب المسجلين', 'Total Enrolled Students')}</p>
            <h2 className="stat-number">{academyData.stats.students}</h2>
          </div>
          <div className="stat-icon" style={{ color: C.gold || '#C9A84C' }}><FaUserGraduate /></div>
        </div>

        {/* بطاقة المستحقات المالية المعلقة */}
        <div className="premium-stat-box" style={{ borderTop: '4px solid #ef4444' }}>
          <div>
            <p className="stat-label">{translateText('pending_payments', 'المستحقات المالية المعلقة', 'Pending Due Fees')}</p>
            <h2 className="stat-number" style={{ color: academyData.stats.pending > 0 ? '#f87171' : '#fff' }}>{academyData.stats.pending}</h2>
          </div>
          <div className="stat-icon" style={{ color: '#ef4444' }}><FaUserClock /></div>
        </div>

        {/* بطاقة الحلقات النشطة اليوم */}
        <div className="premium-stat-box" style={{ borderTop: '4px solid #38bdf8' }}>
          <div>
            <p className="stat-label">{translateText('active_halagas', 'الحلقات النشطة اليوم', 'Active Halagas Today')}</p>
            <h2 className="stat-number">{academyData.stats.activeHalagas || 0}</h2>
          </div>
          <div className="stat-icon" style={{ color: '#38bdf8' }}><FaMosque /></div>
        </div>

        {/* بطاقة الاختبارات والأجزاء المنجزة */}
        <div className="premium-stat-box" style={{ borderTop: '4px solid #34d399' }}>
          <div>
            <p className="stat-label">{translateText('completed_exams', 'اختبارات الأجزاء الناجحة', 'Exams Passed (Month)')}</p>
            <h2 className="stat-number">{academyData.stats.completedExams || 0}</h2>
          </div>
          <div className="stat-icon" style={{ color: '#34d399' }}><FaCheckCircle /></div>
        </div>

      </div>

      <style>{`
        .premium-action-card:hover {
          transform: translateY(-4px);
          filter: brightness(1.1);
          box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.5);
        }
        .premium-action-card:active {
          transform: translateY(-1px);
        }
        .premium-stat-box {
          background: ${C.surface || '#111C2A'};
          padding: 22px 20px;
          border-radius: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.02);
          transition: transform 0.2s ease;
        }
        .premium-stat-box:hover {
          transform: scale(1.02);
        }
        .stat-label {
          color: #94a3b8;
          margin: 0 0 8px 0;
          font-size: 13px;
          font-weight: 600;
        }
        .stat-number {
          color: #fff;
          margin: 0;
          font-size: 2rem;
          font-weight: 800;
          font-family: sans-serif;
        }
        .stat-icon {
          font-size: 28px;
          opacity: 0.8;
          display: flex;
          align-items: center;
        }
        .skeleton-line {
          background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
          background-size: 200% 100%;
          animation: loading-shimmer 1.5s infinite;
        }
        @keyframes loading-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

    </div>
  );
}
