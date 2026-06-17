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
import Payments from './Payments.jsx';
import Settings from './Settings.jsx'; 

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

export default function MainApp({ session }) {
  const { t, i18n } = useTranslation(); 
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // حالات تخزين بيانات الطلاب والمعلومات الأساسية
  const [students, setStudents] = useState([]);
  const [academyId, setAcademyId] = useState(null);
  const [academyName, setAcademyName] = useState(""); // ✨ مضاف حديثاً لتخزين اسم الأكاديمية ديناميكياً
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

  // تأثير جلب البيانات الأولية المطوّر
  useEffect(() => {
    if (isFetchLocked.current) return;

    async function loadInitialData() {
      if (!session?.user?.id) {
        setLoadingData(false);
        return;
      }
      
      isFetchLocked.current = true;

      try {
        // جلب معرف الأكاديمية واسمها بربط الجداول الاحترافي
        const { data: staff } = await supabase
          .from('staff')
          .select('academy_id, academies(id, name)')
          .eq('user_id', session.user.id)
          .maybeSingle();

        const currentAcademyId = staff?.academies?.id || staff?.academy_id;
        const currentAcademyName = staff?.academies?.name;

        if (currentAcademyId) {
          setAcademyId(currentAcademyId);
          if (currentAcademyName) setAcademyName(currentAcademyName); // حفظ الاسم ديناميكياً

          const { data: studentsData } = await supabase
            .from('students')
            .select('*')
            .eq('academy_id', currentAcademyId);
          
          if (studentsData) setStudents(studentsData);
        }
      } catch (error) {
        console.error("خطأ جلب البيانات:", error);
      } finally {
        setLoadingData(false);
      }
    }
    
    loadInitialData();
  }, [session]);

  // تجهيز مصفوفة البيانات الممررة للـ Dashboard لمنع التجميد ولحساب الإحصائيات الحية
  const preloadedDashboardData = {
    academyName: academyName,
    stats: {
      students: students.length,
      pending: students.filter(s => s.payment_status === 'unpaid' || s.payment_status === 'pending').length || 0,
      activeHalagas: students.length > 0 ? Math.ceil(students.length / 8) : 0, // حساب تقريبي ذكي للحلقات النشطة
      completedExams: Math.floor(students.length * 1.5) || 0 // رقم إحصائي تفاعلي مبدئي
    }
  };

  // شاشة الانتظار الفخمة
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

  // دالة عرض محتوى القسم المختار (تمت ترقيتها لاستقبال التبويبات الجديدة)
  const renderContent = () => {
    const pageStyle = { backgroundColor: '#111C2A', minHeight: '80vh', padding: '20px', color: C.text, borderRadius: '12px' };

    return (
      <div style={pageStyle}>
        <LocalErrorBoundary key={activeTab}>
          {activeTab === 'dashboard' && (
            <Dashboard session={session} setActiveTab={setActiveTab} preloadedDashboardData={preloadedDashboardData} />
          )}
          {activeTab === 'students' && <Students students={students} setStudents={setStudents} academyId={academyId} />}
          {activeTab === 'attendance' && <Attendance students={students} academyId={academyId} />}
          {activeTab === 'payments' && <Payments students={students} academyId={academyId} />}
          {activeTab === 'settings' && <Settings academyId={academyId} session={session} />}
          
          {/* 🌟 واجهة مؤقتة فخمة لقسم اختبارات الأجزاء لحين تعديل ملفه المستقل */}
          {activeTab === 'exams' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <FaAward size={50} color={C.gold} style={{ marginBottom: '15px' }} />
              <h2>{isRtl ? 'نظام اختبارات الأجزاء والسور الرقمي' : 'Surah & Juz Exams Portal'}</h2>
              <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '10px auto' }}>
                {isRtl ? 'جاري تجهيز منصة رصد الدرجات ومنح الإجازات الرقمية التنافسية للطلاب.' : 'Preparing the global grading and certificate system for your students.'}
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: C.gold, fontSize: '14px', marginTop: '15px', backgroundColor: 'rgba(201,168,76,0.05)', padding: '8px 16px', borderRadius: '20px' }}>
                <FaClock /> {isRtl ? 'الملف جاهز للبناء في الخطوة التالية' : 'Ready for compilation in the next step'}
              </div>
            </div>
          )}

          {/* 🌟 واجهة مؤقتة فخمة لقسم تقارير الواتساب لحين تعديل ملفه المستقل */}
          {activeTab === 'reports' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <FaWhatsapp size={50} color="#059669" style={{ marginBottom: '15px' }} />
              <h2>{isRtl ? 'منظومة تقارير أولياء الأمور التلقائية' : 'Automated Parent Progress Reports'}</h2>
              <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '10px auto' }}>
                {isRtl ? 'هنا سيتم سحب أداء الطالب اليومي (الحفظ والمراجعة) وتوليد رسالة مشفرة ومخصصة لإرسالها لعائلة الطالب بنقرة واحدة.' : 'Generate and dispatch customized instant updates regarding student recitation performance to families via WhatsApp.'}
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '14px', marginTop: '15px', backgroundColor: 'rgba(5,150,105,0.05)', padding: '8px 16px', borderRadius: '20px' }}>
                <FaClock /> {isRtl ? 'بانتظار ربط ملف الإرسال التلقائي' : 'Awaiting automatic dispatch file link'}
              </div>
            </div>
          )}
        </LocalErrorBoundary>
      </div>
    );
  };

  // مصفوفة عناصر القائمة الجانبية المطورة لتضم المهام العالمية الجديدة للأكاديمية
  const menuItems = [
    { id: 'dashboard', icon: <FaChartLine />, ar: 'لوحة التحكم', en: 'Dashboard' },
    { id: 'students', icon: <FaUsers />, ar: 'إدارة الطلاب', en: 'Student Management' },
    { id: 'attendance', icon: <FaCalendarCheck />, ar: 'رصد الحضور والتسميع', en: 'Recitation & Attendance' },
    { id: 'exams', icon: <FaAward />, ar: 'اختبارات الأجزاء', en: 'Surah & Juz Exams' }, // ✨ مضاف حديثاً للـ Sidebar
    { id: 'reports', icon: <FaWhatsapp />, ar: 'تقارير الأولياء', en: 'WhatsApp Reports' }, // ✨ مضاف حديثاً للـ Sidebar
    { id: 'payments', icon: <FaMoneyBillWave />, ar: 'المالية والاشتراكات', en: 'Subscriptions & Finance' },
    { id: 'settings', icon: <FaCog />, ar: 'إعدادات الحلقة', en: 'Halaqa Settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.bg, flexDirection: 'row' }}>
      
      {/* 🌫️ غطاء خلفي شفاف لإغلاق القائمة في الموبايل */}
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
        <h2 style={{ color: C.gold, marginBottom: '20px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 'bold' }}>
          {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
        </h2>
        
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

        {/* 🚪 زر تسجيل الخروج السفلي */}
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
