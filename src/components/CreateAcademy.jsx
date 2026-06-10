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
      // 1. إنشاء الأكاديمية وربطها بصاحب الحساب
      const { data: academy, error: academyError } = await supabase
        .from('academies')
        .insert([{ name, owner_id: session.user.id }])
        .select()
        .single();

      if (academyError) throw academyError;

      // 2. تحديث سجل الموظف ليرتبط بالأكاديمية الجديدة
      const { error: staffError } = await supabase
        .from('staff')
        .update({ academy_id: academy.id })
        .eq('user_id', session.user.id);

      if (staffError) throw staffError;

      // النجاح
      onAcademyCreated();
    } catch (err) {
      console.error('Error:', err);
      alert('حدث خطأ أثناء الإنشاء، يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      padding: '40px 20px', 
      textAlign: 'center', 
      direction: 'rtl', 
      minHeight: '100vh',
      background: '#0f172a',
      color: '#fff' 
    }}>
      <h2 style={{ color: C.gold, marginBottom: '20px' }}>🚀 أنشئ أكاديميتك الأولى</h2>
      <p style={{ color: '#94a3b8', marginBottom: '30px' }}>ابدأ رحلتك الإدارية المنظمة</p>
      
      <form 
        onSubmit={handleSubmit} 
        style={{ 
          maxWidth: '400px', 
          margin: '0 auto', 
          background: '#1e293b', 
          padding: '30px', 
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <input 
          type="text"
          placeholder="اسم الأكاديمية (مثلاً: دار القرآن)"
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
          type="submit"
          disabled={loading} 
          style={{ 
            width: '100%',
            padding: '14px', 
            background: loading ? '#475569' : C.gold, 
            color: '#000',
            fontWeight: 'bold',
            borderRadius: '10px', 
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s'
          }}
        >
          {loading ? 'جاري الإنشاء...' : 'حفظ وإنشاء الأكاديمية'}
        </button>
      </form>
    </div>
  );
}
