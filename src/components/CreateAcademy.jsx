/* src/components/CreateAcademy.jsx */
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { FaGraduationCap, FaSpinner, FaSignOutAlt } from 'react-icons/fa';

export default function CreateAcademy({ session, onAcademyCreated, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    language_code: 'ar',
    calendar_type: 'gregorian'
  });

  const handleNameChange = (e) => {
    const nameVal = e.target.value;
    const suggestedSlug = nameVal
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0621-\u064A\s]/g, '')
      .replace(/\s+/g, '-');

    setFormData(prev => ({ ...prev, name: nameVal, slug: suggestedSlug }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatusMessage('جاري تأسيس سجلات الأكاديمية...');

    try {
      // 1. إنشاء الأكاديمية
      const { data: academy, error: academyError } = await supabase
        .from('academies')
        .insert([{
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          currency: formData.currency,
          timezone: formData.timezone,
          language_code: formData.language_code,
          calendar_type: formData.calendar_type,
          owner_id: session.user.id
        }])
        .select()
        .single();

      if (academyError) {
        if (academyError.code === '23505') throw new Error('هذا الرابط (Slug) مستخدم بالفعل، يرجى اختيار رابط آخر.');
        throw academyError;
      }

      // 2. ربط الموظف (المسؤول) بالأكاديمية
      setStatusMessage('جاري ربط حسابكم الإداري بالمنظومة...');
      const { error: staffError } = await supabase
        .from('staff')
        .update({ academy_id: academy.id })
        .eq('user_id', session.user.id);

      if (staffError) {
        await supabase.from('academies').delete().eq('id', academy.id);
        throw new Error('فشل ربط الحساب. تم إلغاء العملية.');
      }

      // 3. تحديث البيانات الوصفية (Metadata)
      setStatusMessage('جاري تهيئة لوحة التحكم السحابية...');
      await supabase.auth.updateUser({ data: { academy_id: academy.id } });
      await supabase.auth.refreshSession();

      onAcademyCreated();
    } catch (err) {
      console.error('CreateAcademy Error:', err);
      setError(err.message || 'حدث خطأ غير متوقع أثناء التأسيس.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '20px', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px', background: '#1e293b', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <FaGraduationCap style={{ fontSize: '40px', color: '#C9A84C', marginBottom: '10px' }} />
          <h2 style={{ color: '#fff', fontSize: '22px' }}>تأسيس الأكاديمية</h2>
        </div>

        <input type="text" placeholder="اسم الأكاديمية" required value={formData.name} onChange={handleNameChange} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
        <input type="text" placeholder="الرابط الفريد (Slug)" required value={formData.slug} onChange={(e) => setFormData(p => ({...p, slug: e.target.value}))} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
        
        <select value={formData.currency} onChange={(e) => setFormData(p => ({...p, currency: e.target.value}))} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', background: '#0f172a', color: '#fff' }}>
          <option value="EGP">الجنيه المصري (EGP)</option>
          <option value="SAR">الريال السعودي (SAR)</option>
          <option value="USD">الدولار الأمريكي (USD)</option>
        </select>

        {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '15px' }}>{error}</p>}
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#475569' : '#C9A84C', color: '#000', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
          {loading ? (
             <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
               <FaSpinner className="spin" /> {statusMessage}
             </span>
          ) : 'حفظ وإنشاء الأكاديمية'}
        </button>
      </form>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
