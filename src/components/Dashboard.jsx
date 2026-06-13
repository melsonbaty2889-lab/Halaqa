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
      } catch (err) { console.error("Dashboard Error:", err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [session]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: C.text }}>{t('loading')}...</div>;

  return (
    <div style={{ padding: '24px', direction: 'rtl', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* 1. الترحيب بلمسة شخصية */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ color: C.gold, fontSize: '0.9rem', marginBottom: '8px', opacity: 0.8 }}>{t('welcome_back')}</p>
        <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>{data.name}</h1>
        <p style={{ color: '#94a3b8' }}>{data.academyName}</p>
      </div>

      {/* 2. مركز العمليات السريع (Action Center) */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ color: '#fff', marginBottom: '15px', fontSize: '1rem' }}>{t("إجراءات سريعة")}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <ActionButton icon={<FaUserCheck />} label={t('attendance')} onClick={() => setActiveTab('attendance')} gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" />
          <ActionButton icon={<FaMoneyBillWave />} label={t('payments')} onClick={() => setActiveTab('payments')} gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" />
        </div>
      </div>

      {/* 3. بطاقات الإحصائيات (Metrics) */}
      <div style={{ display: 'grid', gap: '15px' }}>
        <MetricCard icon={<FaUserGraduate />} label={t('students')} value={data.stats.students} color={C.gold} />
        <MetricCard icon={<FaUserClock />} label={t('unpaid')} value={data.stats.pending} color="#ef4444" isAlert={data.stats.pending > 0} />
      </div>
    </div>
  );
}

// مكوّن مساعد للأزرار
function ActionButton({ icon, label, onClick, gradient }) {
  return (
    <button onClick={onClick} style={{ background: gradient, color: '#fff', padding: '15px', borderRadius: '16px', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
      <div style={{ fontSize: '20px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{label}</div>
    </button>
  );
}

// مكوّن مساعد للبطاقات
function MetricCard({ icon, label, value, color, isAlert }) {
  return (
    <div style={{ background: isAlert ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '20px', border: `1px solid ${isAlert ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ color: color }}>{icon}</div>
        <span style={{ color: isAlert ? '#ef4444' : '#94a3b8' }}>{label}</span>
      </div>
      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isAlert ? '#ef4444' : '#fff' }}>{value}</span>
    </div>
  );
}
