import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';

export default function CreateAcademy({ session, onAcademyCreated }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    // 1. إنشاء سجل الأكاديمية الجديد
    const { data: academy, error: academyError } = await supabase
      .from('academies')
      .insert([{ name, owner_id: session.user.id }])
      .select()
      .single();

    if (academyError) {
      alert('خطأ في إنشاء الأكاديمية');
      setLoading(false);
      return;
    }

    // 2. ربط الموظف بهذه الأكاديمية الجديدة
    await supabase
      .from('staff')
      .update({ academy_id: academy.id })
      .eq('user_id', session.user.id);

    setLoading(false);
    onAcademyCreated(); 
  }

  return (
    <div style={{ padding: 40, textAlign: 'center', direction: 'rtl' }}>
      <h2 style={{ color: C.gold }}>🚀 أنشئ أكاديميتك الأولى</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '20px auto' }}>
        <input 
          placeholder="اسم الأكاديمية"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: 12, marginBottom: 10, borderRadius: 8 }}
          required
        />
        <button disabled={loading} style={{ padding: '12px 24px', background: C.gold, borderRadius: 8, border: 'none' }}>
          {loading ? 'جاري الإنشاء...' : 'حفظ الأكاديمية'}
        </button>
      </form>
    </div>
  );
}
