import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { FaUserGraduate, FaUserClock, FaUserCheck, FaMoneyBillWave } from "react-icons/fa";

export default function Dashboard({ session, setActiveTab }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ name: '', academyName: '', stats: { students: 0, pending: 0 } });

  // استعادة المنطق الأصلي لجلب البيانات
  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.id) return;
      try {
        setLoading(true);
        const { data: staff } = await supabase
          .from('staff')
          .select('name, academies(id, name)')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (staff?.academies) {
          const { count: studentCount } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('academy_id', staff.academies.id);

          const { count: pendingCount } = await supabase
            .from('payments')
            .select('*', { count: 'exact', head: true })
            .eq('academy_id', staff.academies.id)
            .eq('status', 'pending');

          setData({
            name: staff.name,
            academyName: staff.academies.name,
            stats: { students: studentCount || 0, pending: pendingCount || 0 }
          });
        }
      } catch (err) { console.error("Dashboard Error:", err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [session]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: C.text }}>{t('loading')}...</div>;

  return (
    <div style={{ padding: '24px', direction: 'ltr', maxWidth: '600px' }}>
      {/* 1. الترحيب */}
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>Welcome Back, Director</h1>
        <p style={{ color: C.gold, fontSize: '1.2rem' }}>{data.academyName}</p>
      </header>

      {/* 2. الإجراءات السريعة - بتنسيق Grid كما في الصورة */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '40px' }}>
        <ActionButton label="Scan Attendance" color="#3b82f6" icon={<FaUserCheck />} onClick={() => setActiveTab('attendance')} />
        <ActionButton label="Register Student" color="#10b981" icon={<FaUserGraduate />} onClick={() => setActiveTab('students')} />
      </div>

      {/* 3. بطاقات الإحصائيات - بحدود جانبية ملونة */}
      <div style={{ display: 'grid', gap: '15px' }}>
        <MetricCard label="Total Students" value={data.stats.students} icon={<FaUserGraduate />} border={C.gold} />
        <MetricCard label="Pending Payments" value={data.stats.pending} icon={<FaUserClock />} border={C.red} sub="Overdue payments" />
      </div>
    </div>
  );
}

// مكونات مساعدة بتصميم احترافي
function ActionButton({ label, color, icon, onClick }) {
  return (
    <button onClick={onClick} style={{ background: color, border: 'none', borderRadius: 15, padding: '20px', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      {icon} <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{label}</span>
    </button>
  );
}

function MetricCard({ label, value, border, icon, sub }) {
  return (
    <div style={{ background: C.surface, padding: 25, borderRadius: 20, borderLeft: `6px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ margin: 0, color: '#94a3b8' }}>{label}</p>
        <h2 style={{ margin: '5px 0', fontSize: '1.8rem', color: '#fff' }}>{value}</h2>
        {sub && <p style={{ color: C.red, fontSize: '0.8rem', margin: 0 }}>{sub}</p>}
      </div>
      <div style={{ fontSize: 30, color: border }}>{icon}</div>
    </div>
  );
}
