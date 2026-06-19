import React, { useState, useEffect, useRef } from "react"; 
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { 
  FaChartLine, 
  FaUsers, 
  FaCalendarCheck, 
  FaMoneyBillWave, 
  FaBars, 
  FaSignOutAlt, 
  FaCog, 
  FaAward, 
  FaWhatsapp, 
  FaClock 
} from "react-icons/fa";

// استيراد المكونات الداخلية للأقسام
import Dashboard from './Dashboard.jsx';
import Students from './Students.jsx';
import Attendance from './Attendance.jsx';
import Exams from './Exams.jsx'; 
import Payments from './Payments.jsx';
import Settings from './Settings.jsx'; 
import Reports from './Reports.jsx';

// 🛡️ درع الحماية الذكي للمكونات الداخلية
class LocalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("🚨 خطأ في المكون الداخلي:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', backgroundColor: '#2A161A', border: '1px solid #EF4444', borderRadius: '12px', color: '#FCA5A5', marginTop: '20px', textAlign: 'right' }}>
          <h3 style={{ color: '#F87171', marginBottom: '10px' }}>⚠️ عذراً، حدث خطأ برمجي داخل هذا القسم</h3>
          <p style={{ fontSize: '14px', opacity: 0.9, backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', fontFamily: 'monospace' }}>
            السبب: {this.state.error?.message || "خطأ غير معروف"}
          </p>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ marginTop: '15px', padding: '8px 16px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            إعادة المحاولة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MainApp({ session, userRole, trialDaysLeft }) {
  const { t, i18n } = useTranslation(); 
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  
  // حالات تخزين بيانات الطلاب والمعلومات الأساسية
  const [students, setStudents] = useState([]);
  const [academyId, setAcademyId] = useState(null);
  const [academyName, setAcademyName] = useState(""); 
  const [completedExamsCount, setCompletedExamsCount] = useState(0); 
  const [loadingData, setLoadingData] = useState(true);

  // معرفة اتجاه اللغة الحالية
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');

  // صمام الأمان الاحترافي لمنع تكرار جلب البيانات
  const isFetchLocked = useRef(false);

  // 1️⃣ مراقبة حجم الشاشة ديناميكياً
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2️⃣ ضبط اتجاه الصفحة بالكامل تلقائياً
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language || 'ar';
  }, [isRtl, i18n.language]);

  // 3️⃣ جلب البيانات الأولية المطوّر والمربوط بقاعدة البيانات حياً
  useEffect(() => {
    if (isFetchLocked.current) return;

    async function loadInitialData() {
      if (!session?.user?.id) {
        setLoadingData(false);
        return;
      }
      
      isFetchLocked.current = true;

      try {
        const { data: staff } = await supabase
          .from('staff')
          .select('academy_id, academies(id, name)')
          .eq('user_id', session.user.id)
          .maybeSingle();

        const currentAcademyId = staff?.academies?.id || staff?.academy_id;
        const currentAcademyName = staff?.academies?.name;

        if (currentAcademyId) {
          setAcademyId(currentAcademyId);
          if (currentAcademyName) setAcademyName(currentAcademyName); 

          // جلب مصفوفة الطلاب الحية
          const { data: studentsData } = await supabase
            .from('students')
            .select('*')
            .eq('academy_id', currentAcademyId);
          
          if (studentsData) setStudents(studentsData);

          // استعلام حي لحساب إجمالي عدد الاختبارات الفعلية
          const { count: examsCount, error: examsError } = await supabase
            .from('exams')
            .select('*', { count: 'exact', head: true })
            .eq('academy_id', currentAcademyId);

          if (!examsError && examsCount !== null) {
            setCompletedExamsCount(examsCount);
          }
        }
      } catch (error) {
        console.error("خطأ جلب البيانات داخل MainApp:", error);
      } finally {
        setLoadingData(false);
      }
    }
    
    loadInitialData();
  }, [session]);

  // تجهيز مصفوفة البيانات الممررة للـ Dashboard
  const preloadedDashboardData = {
    academyName: academyName,
    stats: {
      students: students.length,
      pending: students.filter(s => s.payment_status === 'unpaid' || s.payment_status === 'pending').length || 0,
      activeHalagas: students.length > 0 ? Math.ceil(students.length / 8) : 0, 
      completedExams: completedExamsCount 
    }
  };

  // شاشة الانتظار الداخلية الفخمة
  if (loadingData) {
    return (
      <div style={{ 
        color: C.gold || '#C9A84C', 
        backgroundColor: '#0C1520', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '1.2rem',
        fontFamily: "'Cairo', sans-serif",
        gap: '18px'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          border: '3px solid rgba(201, 168, 76, 0.1)',
          borderTop: `3px solid ${C.gold || '#C9A84C'}`,
          borderRadius: '50%',
          animation: 'spinLive 0.8s linear infinite'
        }}></div>
        <style>{`
          @keyframes spinLive {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <span>{isRtl ? 'جاري تحميل البيانات...' : 'Loading data...'}</span>
      </div>
    );
  }

  // دالة عرض محتوى القسم المختار
  const renderContent = () => {
    const pageStyle = { backgroundColor: '#111C2A', minHeight: '80vh', padding: '20px', color: C.text, borderRadius: '12px' };

    return (
      <div style={pageStyle}>
        <LocalErrorBoundary key={activeTab}>
          {activeTab === 'dashboard' && (
            <Dashboard session={session} setActiveTab={setActiveTab} preloadedDashboardData={preloadedDashboardData} />
          )}
          {activeTab === 'students' && (
            <Students students={students} setStudents={setStudents} academyId={academyId} />
          )}
          {activeTab === 'attendance' && <Attendance students={students} academyId={academyId} />}
          {activeTab === 'exams' && <Exams students={students} academyId={academyId} />}
          {activeTab === 'payments' && <Payments students={students} academyId={academyId} />}
          {activeTab === 'settings' && <Settings academyId={academyId} session={session} />}
          {activeTab === 'reports' && <Reports students={students} academyId={academyId} />}
        </LocalErrorBoundary>
      </div>
    );
  };

  const menuItems = [
    { id: 'dashboard', icon: <FaChartLine />, ar: 'لوحة التحكم', en: 'Dashboard' },
    { id: 'students', icon: <FaUsers />, ar: 'إدارة الطلاب', en: 'Student Management' },
    { id: 'attendance', icon: <FaCalendarCheck />, ar: 'رصد الحضور والتسميع', en: 'Recitation & Attendance' },
    { id: 'exams', icon: <FaAward />, ar: 'اختبارات الأجزاء', en: 'Surah & Juz Exams' }, 
    { id: 'reports', icon: <FaWhatsapp />, ar: 'تقارير الأولياء', en: 'WhatsApp Reports' }, 
    { id: 'payments', icon: <FaMoneyBillWave />, ar: 'المالية والاشتراكات', en: 'Subscriptions & Finance' },
    { id: 'settings', icon: <FaCog />, ar: 'إعدادات الحلقة', en: 'Halaqa Settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.bg, flexDirection: 'row', width: '100%' }}>
      
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', top: 0, bottom: 0, left: 0, right: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1999,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* 🏢 القائمة الجانبية (Sidebar) */}
      <aside style={{ 
        width: 260, 
        background: C.surface, 
        height: '100vh', 
        padding: '20px', 
        display: !isMobile || sidebarOpen ? 'flex' : 'none',
        flexDirection: 'column',
        position: isMobile ? 'fixed' : 'relative',
        right: isMobile && isRtl ? 0 : 'auto',
        left: isMobile && !isRtl ? 0 : 'auto',
        top: 0,
        zIndex: 2000,
        boxShadow: C.shadow,
        transition: 'all 0.3s ease'
      }}>
        <h2 style={{ color: C.gold, marginBottom: '5px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 'bold' }}>
          {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
        </h2>

        {/* ⏳ عداد الأيام التجريبية الذكي المحفّز للدفع - يظهر فقط للمشرفين غير الأدمن الرئيسي */}
        {userRole !== 'admin' && trialDaysLeft > 0 && (
          <div style={{ 
            backgroundColor: 'rgba(201, 168, 76, 0.08)', 
            color: C.gold || '#C9A84C', 
            padding: '8px 12px', 
            borderRadius: '8px', 
            fontSize: '12px', 
            textAlign: 'center', 
            marginBottom: '15px', 
            marginTop: '10px',
            border: '1px solid rgba(201, 168, 76, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <FaClock />
            <span>{isRtl ? `متبقي ${trialDaysLeft} أيام تجريبية` : `${trialDaysLeft} trial days left`}</span>
          </div>
        )}
        
        <nav style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 15, flex: 1, overflowY: 'auto' }}>
          {menuItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => { setActiveTab(item.id); if(isMobile) setSidebarOpen(false); }}
              style={{ 
                background: activeTab === item.id ? (C.gold || '#C9A84C') : 'transparent', 
                color: activeTab === item.id ? '#000' : C.text, 
                padding: '11px 15px', borderRadius: 8, border: 'none', cursor: 'pointer', 
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', fontSize: '14px',
                fontWeight: activeTab === item.id ? '700' : '500',
                textAlign: isRtl ? 'right' : 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>{item.icon}</span> 
              <span>{isRtl ? item.ar : item.en}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={() => supabase.auth.signOut()} 
          style={{ 
            background: 'transparent', border: '1px solid ' + C.danger, 
            color: C.danger, padding: '11px', borderRadius: '8px', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '14px', marginTop: '15px'
          }}
        >
          <FaSignOutAlt /> {isRtl ? 'تسجيل الخروج' : 'Log Out'}
        </button>
      </aside>

      {/* 💻 منطقة عرض المحتوى الرئيسي */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '15px', width: '100%' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', padding: '5px' }}>
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              style={{ padding: '10px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <FaBars size={18} />
            </button>
          )}
          
          <div style={{ fontSize: '13px', color: '#657585', fontWeight: '500' }}>
            {isRtl ? 'لوحة المتابعة' : 'Management Portal'} / {isRtl ? menuItems.find(m => m.id === activeTab)?.ar : menuItems.find(m => m.id === activeTab)?.en}
          </div>
        </div>

        {renderContent()}
      </main>

    </div>
  );
}
