import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { FaUserGraduate, FaUserClock, FaUserCheck, FaMoneyBillWave } from "react-icons/fa";

export default function Dashboard({ session, setActiveTab }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ name: '', academyName: '', stats: { students: 0, pending: 0 } });

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
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.text }}>{t('loading')}...</div>;
  }

  return (
    <div style={{ padding: 24, direction: 'rtl' }}>
      {/* قسم الترحيب */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ color: C.gold, margin: 0 }}>{t('dashboard')}</h1>
        <p style={{ color: C.text }}>{t('welcome')}, {data.name} - {data.academyName}</p>
      </div>

      {/* شريط الإجراءات السريعة */}
      <div style={{ marginBottom: 30 }}>
        <h3 style={{ color: C.text, marginBottom: 15, fontSize: '1.1rem' }}>{t("إجراءات سريعة")}</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('attendance')} style={{ background: '#3b82f6', color: '#fff', padding: '12px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <FaUserCheck /> {t('attendance')}
          </button>
          <button onClick={() => setActiveTab('payments')} style={{ background: '#10b981', color: '#fff', padding: '12px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <FaMoneyBillWave /> {t('payments')}
          </button>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
        {/* بطاقة الطلاب */}
        <div style={{ background: C.surface, padding: 20, borderRadius: 16, borderRight: `5px solid ${C.gold}`, display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '30px', color: C.gold }}><FaUserGraduate /></div>
          <div>
            <h3 style={{ margin: 0 }}>{t('students')}</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0 0 0' }}>{data.stats.students}</p>
          </div>
        </div>

        {/* بطاقة المدفوعات المعلقة */}
        <div style={{ background: C.surface, padding: 20, borderRadius: 16, borderRight: `5px solid ${data.stats.pending > 0 ? '#ef4444' : '#64748b'}`, display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '30px', color: data.stats.pending > 0 ? '#ef4444' : '#64748b' }}><FaUserClock /></div>
          <div>
            <h3 style={{ margin: 0 }}>{t('unpaid')}</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0 0 0' }}>{data.stats.pending}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
