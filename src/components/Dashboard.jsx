import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';

export default function Dashboard({ session, setActiveTab }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ name: '', academyName: '', stats: { students: 0, pending: 0 } });

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.id) return;
      try {
        setLoading(true);
        // جلب بيانات المعلم والأكاديمية
        const { data: staff } = await supabase
          .from('staff')
          .select('name, academies(id, name)')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (staff?.academies) {
          // جلب الإحصائيات
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
    return (
      <div style={{ padding: 40, textAlign: 'center', color: C.text }}>
        {t('loading')}...
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 30 }}>
        {/* تم تحويل النصوص هنا لدالة t() */}
        <h1 style={{ color: C.gold, margin: 0 }}>{t('dashboard')}</h1>
        <p style={{ color: C.text }}>
          {t('welcome')}, {data.name} - {data.academyName}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        {/* بطاقة الطلاب */}
        <div style={{ background: C.surface, padding: 20, borderRadius: 12, border: `1px solid ${C.border || '#444'}` }}>
          <h3>{t('students')}</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.stats.students}</p>
        </div>

        {/* بطاقة المدفوعات المعلقة */}
        <div style={{ background: C.surface, padding: 20, borderRadius: 12, border: `1px solid ${C.border || '#444'}` }}>
          <h3>{t('unpaid')}</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: data.stats.pending > 0 ? 'red' : C.text }}>
            {data.stats.pending}
          </p>
          {data.stats.pending > 0 && (
            <button 
              onClick={() => setActiveTab('payments')} 
              style={{ background: C.gold, border: 'none', padding: '8px 15px', borderRadius: 5, cursor: 'pointer', fontWeight: 'bold' }}
            >
              {t('review_now')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
