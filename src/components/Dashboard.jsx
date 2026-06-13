import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { FaUserGraduate, FaUserClock, FaUserCheck } from "react-icons/fa";

export default function Dashboard({ session, setActiveTab }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ academyName: '', stats: { students: 0, pending: 0 } });

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

  if (loading) return <div style={{ padding: 40, color: C.text }}>{t('loading')}...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>Welcome Back</h1>
        <p style={{ color: C.gold, fontSize: '1.2rem' }}>{data.academyName}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: 40 }}>
        <button onClick={() => setActiveTab('attendance')} style={{ background: '#3b82f6', border: 'none', borderRadius: 15, padding: '20px', color: '#fff', cursor: 'pointer' }}>
          <FaUserCheck /> Scan Attendance
        </button>
        <button onClick={() => setActiveTab('students')} style={{ background: '#10b981', border: 'none', borderRadius: 15, padding: '20px', color: '#fff', cursor: 'pointer' }}>
          <FaUserGraduate /> Register Student
        </button>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        <div style={{ background: C.surface, padding: 25, borderRadius: 20, borderLeft: `6px solid ${C.gold}`, display: 'flex', justifyContent: 'space-between' }}>
          <div><p style={{ color: '#94a3b8' }}>Total Students</p><h2 style={{ color: '#fff' }}>{data.stats.students}</h2></div>
          <div style={{ fontSize: 30, color: C.gold }}><FaUserGraduate /></div>
        </div>
        <div style={{ background: C.surface, padding: 25, borderRadius: 20, borderLeft: `6px solid #ef4444`, display: 'flex', justifyContent: 'space-between' }}>
          <div><p style={{ color: '#94a3b8' }}>Pending Payments</p><h2 style={{ color: '#fff' }}>{data.stats.pending}</h2></div>
          <div style={{ fontSize: 30, color: '#ef4444' }}><FaUserClock /></div>
        </div>
      </div>
    </div>
  );
}
