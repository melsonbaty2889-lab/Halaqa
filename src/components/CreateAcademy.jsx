import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';

export default function CreateAcademy({ session, onAcademyCreated }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. إنشاء سجل الأكاديمية الجديد
      const { data: academy, error: academyError } = await supabase
        .from('academies')
        .insert([{ name, owner_id: session.user.id }])
        .select()
        .single();

      if (academyError) throw academyError;

      // 2. ربط الموظف بهذه الأكاديمية الجديدة
      // نفترض أن جدول staff يحتوي على السجل الخاص بالمستخدم بالفعل
      const { error: staffError } = await supabase
        .from('staff')
        .update({ academy_id: academy.id })
        .eq('user_id', session.user.id);

      if (staffError) throw staffError;

      // نجاح العملية
      onAcademyCreated(); 
      
    } catch (err) {
      console.error('Error creating academy:', err);
      alert('خطأ في إنشاء الأكاديمية: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', direction: 'rtl', color: '#fff' }}>
      <h2 style={{ color: C.gold, marginBottom: '20px' }}>🚀 أنشئ أكاديميتك الأولى</h2>
      <p style={{ color: '#94a3b8', marginBottom: '30px' }}>ابدأ رحلتك الإدارية اليوم</p>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto', background: '#1e293b', padding: '30px', borderRadius: '16px' }}>
        <input 
          placeholder="اسم الأكاديمية"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '14px', 
            marginBottom: '20px', 
            borderRadius: '10px', 
            border: '1px solid #334155',
            background: '#0f172a',
            color: '#fff',
            boxSizing: 'border-box'
          }}
          required
        />
        <button 
          disabled={loading} 
          style={{ 
            width: '100%',
            padding: '14px', 
            background: loading ? '#64748b' : C.gold, 
            color: '#000',
            fontWeight: 'bold',
            borderRadius: '10px', 
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s'
          }}
        >
          {loading ? 'جاري الإعداد...' : 'حفظ وإنشاء الأكاديمية'}
        </button>
      </form>
    </div>
  );
}
