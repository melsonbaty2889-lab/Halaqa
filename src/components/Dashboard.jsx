import React, { useState, useEffect, useRef } from 'react'; // 🌟 تم إضافة useRef هنا للصمام
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { FaUserGraduate, FaUserClock, FaUserCheck, FaGlobe } from "react-icons/fa";

export default function Dashboard({ session, setActiveTab }) {
  // 🌐 استخراج تابع الترجمة (t) وكائن التحكم باللغة (i18n)
  const { t, i18n } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ academyName: '', stats: { students: 0, pending: 0 } });

  // 📐 معرفة اللغة الحالية ودعم الاتجاه الهندسي المناسب للواجهة تلقائياً (RTL / LTR)
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

  // 🔒 صمام الأمان الذكي لمنع وميض تكرار جلب البيانات داخل الداشبورد
  const isDashboardFetched = useRef(false);

  // 🧠 دالة ذكية لفحص الجمل وترجمتها فوراً لتأمين الواجهة من ملفات الـ JSON الفارغة
  const translateText = (key, arText, enText) => {
    if (i18n.exists(key)) return t(key);
    return isRtl ? arText : enText;
  };

  // 🔄 دالة تبديل اللغة الفورية
  const toggleLanguage = () => {
    const nextLang = currentLang === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  // 🔒 البنية الأساسية المحسنة والمؤمنة بالكامل لجلب البيانات من Supabase
  useEffect(() => {
    // إذا تم القفل مسبقاً، نخرج فوراً لمنع التكرار والوميض
    if (isDashboardFetched.current) return;

    async function fetchData() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      // تفعيل القفل فوراً عند بداية التشغيل الأول للداشبورد
      isDashboardFetched.current = true;

      try {
        // 1️⃣ جلب بيانات الأكاديمية المرتبطة بالمعلم
        const { data: staff, error: staffError } = await supabase
          .from('staff')
          .select('academies(id, name)')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (staffError) throw staffError;

        if (staff?.academies) {
          const academyId = staff.academies.id;

          // 🚀 [تطوير احترافي]: جلب إحصائيات الطلاب والمستحقات "بالتوازي والتزامن" لتسريع الاستجابة للنصف!
          const [studentsResult, paymentsResult] = await Promise.all([
            supabase.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
            supabase.from('payments').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('status', 'pending')
          ]);

          setData({ 
            academyName: staff.academies.name, 
            stats: { 
              students: studentsResult.count || 0, 
              pending: paymentsResult.count || 0 
            } 
          });
        }
      } catch (error) {
        console.error("🚨 خطأ في جلب بيانات الداشبورد:", error);
      } finally {
        // 🛡️ [تطوير حرج]: ضمان إغلاق شاشة التحميل حتى لو فشل الاتصال بالسيرفر لمنع تجمّد التطبيق
        setLoading(false); 
      }
    }

    fetchData();
  }, [session]);

  // 🌟 [تحديث الهوية البصرية]: واجهة تحميل ذهبية مطابقة تماماً لشاشة MainApp وبها Spinner انسيابي متحرك
  if (loading) {
    return (
      <div style={{ 
        minHeight: '60vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        color: C.gold || '#C9A84C', 
        fontFamily: 'sans-serif',
        gap: '15px'
      }}>
        {/* حلقة حركة دائرية ناعمة ذهبية متناسقة */}
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(201, 168, 76, 0.1)',
          borderTop: `3px solid ${C.gold || '#C9A84C'}`,
          borderRadius: '50%',
          animation: 'spinDash 0.8s linear infinite'
        }}></div>
        <style>{`
          @keyframes spinDash {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <span>{translateText('loading_stats', 'جاري تحميل الإحصائيات...', 'Loading statistics...')}</span>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '100%', 
      margin: '0 auto', 
      padding: '10px 5px',
      fontFamily: 'sans-serif',
      direction: isRtl ? 'rtl' : 'ltr' // قلب اتجاه الصفحة كاملاً بسلاسة هندسية عند تغيير اللغة
    }}>
      
      {/* 🌟 الهيدر العلوي المحسن بمسافة أمان علوية تمنع التداخل مع زر القائمة ☰ */}
      <header style={{ 
        marginBottom: '35px', 
        borderBottom: '1px solid #1e293b', 
        paddingBottom: '20px',
        paddingTop: '45px', // مسافة حشو علوية لحماية النص من زر الهامبرغر العائم على الجوال
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 'bold', margin: 0 }}>
            {translateText('welcome_back', 'مرحباً بك مجدداً 👋', 'Welcome Back 👋')}
          </h1>
          <p style={{ color: C.gold, fontSize: '1.05rem', margin: '5px 0 0 0', fontWeight: '500' }}>
            {data.academyName}
          </p>
        </div>

        {/* 🌐 زر تغيير اللغة الاحترافي العائم والمؤمن بمتغير الألوان الصحيح C.surface */}
        <button 
          onClick={toggleLanguage}
          style={{
            background: C.surface || '#111C2A', 
            border: '1px solid #334155',
            color: C.gold,
            padding: '8px 14px',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            marginTop: '5px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = C.gold}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#334155'}
        >
          <FaGlobe />
          <span>{currentLang === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </header>

      {/* ⚡ أزرار الإجراءات السريعة المتجاوبة مع الشاشات الصغيرة */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '15px', 
        marginBottom: '35px' 
      }}>
        <button 
          onClick={() => setActiveTab('attendance')} 
          className="dashboard-btn"
          style={{ 
            background: '#2563eb', 
            border: 'none', 
            borderRadius: '12px', 
            padding: '16px', 
            color: '#fff', 
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'transform 0.2s, background-color 0.2s',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
          }}
        >
          <FaUserCheck size={20} />
          {translateText('scan_attendance', 'فحص الحضور والغياب', 'Scan Attendance')}
        </button>
        
        <button 
          onClick={() => setActiveTab('students')} 
          className="dashboard-btn"
          style={{ 
            background: '#059669', 
            border: 'none', 
            borderRadius: '12px', 
            padding: '16px', 
            color: '#fff', 
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'transform 0.2s, background-color 0.2s',
            boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)'
          }}
        >
          <FaUserGraduate size={20} />
          {translateText('register_student', 'تسجيل طالب جديد', 'Register Student')}
        </button>
      </div>

      {/* 📊 كروت الإحصائيات مع قلب اتجاه الـ Border التمييزي تلقائياً بحسب اتجاه القراءة */}
      <div style={{ display: 'grid', gap: '15px' }}>
        
        {/* كرت إجمالي الطلاب بالنصوص المصقولة والمحسنة عالمياً */}
        <div style={{ 
          background: C.surface, 
          padding: '20px 25px', 
          borderRadius: '16px', 
          borderRight: isRtl ? `5px solid ${C.gold}` : 'none', 
          borderLeft: !isRtl ? `5px solid ${C.gold}` : 'none', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div>
            <p style={{ color: '#94a3b8', margin: '0 0 5px 0', fontSize: '13px', fontWeight: '500' }}>
              {translateText('total_students', 'إجمالي الطلاب بالحلقة', 'Total Students')}
            </p>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{data.stats.students}</h2>
          </div>
          <div style={{ fontSize: '26px', color: C.gold, opacity: 0.9 }}><FaUserGraduate /></div>
        </div>

        {/* كرت الاشتراكات المعلقة بالنصوص المصقولة والمحسنة عالمياً */}
        <div style={{ 
          background: C.surface, 
          padding: '20px 25px', 
          borderRadius: '16px', 
          borderRight: isRtl ? `5px solid #ef4444` : 'none', 
          borderLeft: !isRtl ? `5px solid #ef4444` : 'none', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div>
            <p style={{ color: '#94a3b8', margin: '0 0 5px 0', fontSize: '13px', fontWeight: '500' }}>
              {translateText('pending_payments', 'المستحقات المالية المعلقة', 'Pending Payments')}
            </p>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{data.stats.pending}</h2>
          </div>
          <div style={{ fontSize: '26px', color: '#ef4444', opacity: 0.9 }}><FaUserClock /></div>
        </div>

      </div>

      {/* تأثيرات التفاعل البصري الفخم */}
      <style>{`
        .dashboard-btn:hover {
          transform: translateY(-2px);
          opacity: 0.95;
        }
        .dashboard-btn:active {
          transform: translateY(0);
        }
      `}</style>

    </div>
  );
}
