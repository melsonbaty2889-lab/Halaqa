import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';

export default function CreateAcademy({ session, onAcademyCreated }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // 1. Validation
    const trimmedName = name.trim();
    if (!trimmedName) {
      return setError('اسم الأكاديمية مطلوب');
    }
    if (trimmedName.length < 3) {
      return setError('اسم الأكاديمية يجب أن يكون 3 أحرف على الأقل');
    }

    setLoading(true);

    try {
      // 2. Create academy
      const { data: academy, error: academyError } = await supabase
        .from('academies')
        .insert([{ name: trimmedName, owner_id: session.user.id }])
        .select()
        .single();

      if (academyError) {
        // Handle duplicate name error specifically
        if (academyError.code === '23505') {
          throw new Error('اسم الأكاديمية مستخدم بالفعل. اختر اسماً آخر');
        }
        throw academyError;
      }

      // 3. Link staff to new academy
      const { error: staffError } = await supabase
        .from('staff')
        .update({ academy_id: academy.id })
        .eq('user_id', session.user.id);

      if (staffError) {
        // Critical: If this fails, delete the orphan academy to avoid inconsistent state
        await supabase.from('academies').delete().eq('id', academy.id);
        throw new Error('فشل ربط حسابك بالأكاديمية. تم إلغاء العملية');
      }

      // Success
      onAcademyCreated();
    } catch (err) {
      console.error('CreateAcademy Error:', err);
      setError(err.message || 'حدث خطأ أثناء الإنشاء، يرجى المحاولة لاحقاً');
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
      color: '#fff',
      fontFamily: "'Cairo', sans-serif"
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
            marginBottom: '16px',
            borderRadius: '10px',
            border: '1px solid #334155',
            background: '#0f172a',
            color: '#fff',
            boxSizing: 'border-box',
            fontFamily: 'inherit'
          }}
          required
          disabled={loading}
        />

        {error && (
          <p style={{ color: '#EF4444', fontSize: '0.85rem', marginBottom: '16px', margin: '0 0 16px 0' }}>
            {error}
          </p>
        )}

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
            transition: 'background 0.3s',
            fontFamily: 'inherit'
          }}
        >
          {loading ? 'جاري الإنشاء...' : 'حفظ وإنشاء الأكاديمية'}
        </button>
      </form>
    </div>
  );
}
