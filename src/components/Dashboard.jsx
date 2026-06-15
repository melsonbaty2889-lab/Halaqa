import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { FaUserGraduate, FaUserClock, FaUserCheck, FaArrowLeft } from "react-icons/fa";

export default function Dashboard({ session, setActiveTab }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ academyName: '', stats: { students: 0, pending: 0 } });

  // 🔒 البنية الأساسية لجلب البيانات من Supabase (لم يتم تغييرها مطلقاً لضمان استقرار النظام)
  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.id) return;
      const { data: staff } = await supabase.from('staff').select('academies(id, name)').eq('user_id', session.user.id).maybeSingle();
      if (staff?.academies) {
        const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', staff.academies.id);
        const { count: pendingCount } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('academy_id', staff.academies.id).eq('status', 'pending');
        setData({ academyName: staff.academies.name, stats: { students: studentCount || 0, pending: pendingCount || 0 } });
      }
      setLoading(false);
    }
    fetchData();
  }, [session]);

  if (loading) return <div style={{ padding: 40, color: C.text, textAlign: 'center', fontFamily: 'sans-serif' }}>{t('loading')}...</div>;

  return (
    <div style={{ 
      maxWidth: '100%', 
      margin: '0 auto', 
      padding: '10px 5px',
      fontFamily: 'sans-serif',
      direction: 'rtl' // تضمن المحاذاة الصحيحة للغة العربية
    }}>
      
      {/* 🌟 الهيدر العلوي المحسن بصرياً */}
      <header style={{ marginBottom: '30px', borderBottom: '1px solid #1e293b', paddingBottom: '15px' }}>
        <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>
          {t('welcome_back', { defaultValue: 'مرحباً بك مجدداً' })}
        </h1>
        <p style={{ color: C.gold, fontSize: '1.1rem', margin: '5px 0 0 0', fontWeight: '500' }}>
          {data.academyName}
        </p>
      </header>

      {/* ⚡ أزرار الإجراءات السريعة بتصميم شبكي متجاوب وتأثيرات بصرية احترافية */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
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
          {t('scan_attendance', { defaultValue: 'فحص الحضور والغياب' })}
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
          {t('register_student', { defaultValue: 'تسجيل طالب جديد' })}
        </button>
      </div>

      {/* 📊 كروت الإحصائيات والأرقام الرئيسية محاذية بدقة متناهية */}
      <div style={{ display: 'grid', gap: '15px' }}>
        
        {/* كرت إجمالي الطلاب */}
        <div style={{ 
          background: C.surface, 
          padding: '20px 25px', 
          borderRadius: '16px', 
          borderRight: `5px solid ${C.gold}`, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div>
            <p style={{ color: '#94a3b8', margin: '0 0 5px 0', fontSize: '14px', fontWeight: '500' }}>
              {t('total_students', { defaultValue: 'إجمالي الطلاب بالعملية التعليمية' })}
            </p>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{data.stats.students}</h2>
          </div>
          <div style={{ fontSize: '26px', color: C.gold, opacity: 0.9 }}><FaUserGraduate /></div>
        </div>

        {/* كرت الاشتراكات المعلقة */}
        <div style={{ 
          background: C.surface, 
          padding: '20px 25px', 
          borderRadius: '16px', 
          borderRight: `5px solid #ef4444`, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div>
            <p style={{ color: '#94a3b8', margin: '0 0 5px 0', fontSize: '14px', fontWeight: '500' }}>
              {t('pending_payments', { defaultValue: 'الاشتراكات المالية المعلقة' })}
            </p>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{data.stats.pending}</h2>
          </div>
          <div style={{ fontSize: '26px', color: '#ef4444', opacity: 0.9 }}><FaUserClock /></div>
        </div>

      </div>

      {/* إضافة كود CSS خفيف محلي لتحسين تجربة التفاعل والـ Hover على الأزرار */}
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
