import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  GraduationCap, 
  Loader2, 
  LogOut, 
  Globe, 
  Coins, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';

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
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-');

    setFormData(prev => ({ ...prev, name: nameVal, slug: suggestedSlug }));
  };

  const handleSlugChange = (e) => {
    const cleanSlug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/\s+/g, '-');

    setFormData(prev => ({ ...prev, slug: cleanSlug }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (formData.name.trim().length < 3) {
      setError('اسم الأكاديمية يجب أن يتكون من 3 أحرف على الأقل.');
      return;
    }

    if (!formData.slug.trim()) {
      setError('يرجى تحديد رابط فريد (Slug) بالأحرف الإنجليزية.');
      return;
    }

    setLoading(true);
    setStatusMessage('جاري إنشاء الأكاديمية وتهيئة السجلات...');

    let createdAcademyId = null;

    try {
      const userId = session?.user?.id;
      if (!userId) throw new Error('جلسة المستخدم غير صالحة. يرجى إعادة تسجيل الدخول.');

      // 1. إدراج الأكاديمية (الاسم يمرر كـ JSONB لدعم تعدد اللغات)
      const { data: academy, error: academyError } = await supabase
        .from('academies')
        .insert([{
          name: { ar: formData.name.trim(), en: formData.name.trim() },
          slug: formData.slug.trim().toLowerCase(),
          currency: formData.currency,
          timezone: formData.timezone,
          language_code: formData.language_code,
          calendar_type: formData.calendar_type,
          owner_id: userId,
          is_active: true
        }])
        .select()
        .single();

      if (academyError) {
        if (academyError.code === '23505') {
          throw new Error('هذا الرابط الفريد (Slug) مستخدم بالفعل، يرجى كتابة اسم أو رابط آخر.');
        }
        throw academyError;
      }

      createdAcademyId = academy.id;

      // 2. تحديث البروفايل الأساسي في جدول profiles أولاً
      setStatusMessage('جاري ضبط الصلاحيات والملف الشخصي...');
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          academy_id: createdAcademyId,
          role: 'owner',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // 3. إضافة سجل الإدارة في جدول staff
      setStatusMessage('جاري ربط حسابكم الإداري بالأكاديمية...');
      const { error: staffError } = await supabase
        .from('staff')
        .upsert({ 
          user_id: userId, 
          academy_id: createdAcademyId,
          name: session?.user?.user_metadata?.full_name || formData.name.trim(),
          role: 'owner',
        }, { onConflict: 'id' });

      if (staffError) console.warn('Staff record creation warning:', staffError.message);

      // 4. إنشاء فترة تجريبية تلقائية في جدول saas_subscriptions
      await supabase.from('saas_subscriptions').insert([{
        academy_id: createdAcademyId,
        payer_id: userId,
        plan_tier: 'trial',
        status: 'trialing',
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        currency: formData.currency
      }]);

      // 5. تحديث الـ Metadata في Auth Session
      setStatusMessage('جاري إنهاء التأسيس والتحويل للوحة التحكم...');
      await supabase.auth.updateUser({
        data: { academy_id: createdAcademyId, role: 'owner' }
      });

      await supabase.auth.refreshSession();

      if (onAcademyCreated) onAcademyCreated(createdAcademyId);
    } catch (err) {
      console.error('CreateAcademy Process Error:', err);
      
      // التراجع وحذف الأكاديمية في حال حدوث خطأ أثناء الخطوات
      if (createdAcademyId) {
        await supabase.from('academies').delete().eq('id', createdAcademyId);
      }
      setError(err.message || 'حدث خطأ غير متوقع أثناء تأسيس الأكاديمية.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top, #111e2e 0%, #0c1520 100%)',
      padding: '20px',
      direction: 'rtl',
      fontFamily: "'Cairo', system-ui, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '540px',
        background: 'rgba(21, 35, 50, 0.90)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(201, 168, 76, 0.25)',
        borderRadius: '24px',
        padding: '40px 32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        position: 'relative'
      }}>
        {onLogout && (
          <button
            onClick={onLogout}
            type="button"
            title="تسجيل الخروج"
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              borderRadius: '10px',
              padding: '8px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '700',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={16} /> خروج
          </button>
        )}

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '76px',
            height: '76px',
            margin: '0 auto 18px',
            background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.2) 0%, rgba(201, 168, 76, 0.05) 100%)',
            border: '1px solid rgba(201, 168, 76, 0.4)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(201, 168, 76, 0.15)'
          }}>
            <GraduationCap size={40} color="#C9A84C" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: '0 0 8px 0' }}>
            تأسيس الأكاديمية
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
            قم بإعداد المنظومة السحابية وتخصيص هوية أكاديميتك القرآنية
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
              اسم الأكاديمية <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="text" 
              placeholder="مثال: أكاديمية النور للقرآن الكريم" 
              required 
              value={formData.name} 
              onChange={handleNameChange} 
              className="custom-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
              الرابط الفريد (Slug) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="text" 
              placeholder="alnoor-academy" 
              required 
              value={formData.slug} 
              onChange={handleSlugChange} 
              className="custom-input"
              style={{ direction: 'ltr', textAlign: 'left' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                <Coins size={16} color="#C9A84C" /> العملة الرسمية
              </label>
              <select 
                value={formData.currency} 
                onChange={(e) => setFormData(p => ({ ...p, currency: e.target.value }))} 
                className="custom-input"
              >
                <option value="EGP">الجنيه المصري (EGP)</option>
                <option value="SAR">الريال السعودي (SAR)</option>
                <option value="USD">الدولار الأمريكي (USD)</option>
                <option value="AED">الدرهم الإماراتي (AED)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                <Calendar size={16} color="#C9A84C" /> التقويم المعتمد
              </label>
              <select 
                value={formData.calendar_type} 
                onChange={(e) => setFormData(p => ({ ...p, calendar_type: e.target.value }))} 
                className="custom-input"
              >
                <option value="gregorian">ميلادي (Gregorian)</option>
                <option value="hijri">هجري (Hijri)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                <Globe size={16} color="#C9A84C" /> المنطقة الزمنية
              </label>
              <select 
                value={formData.timezone} 
                onChange={(e) => setFormData(p => ({ ...p, timezone: e.target.value }))} 
                className="custom-input"
              >
                <option value="Africa/Cairo">القاهرة (GMT+2)</option>
                <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                <option value="Asia/Dubai">دبي (GMT+4)</option>
                <option value="UTC">التوقيت العالمي (UTC)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                اللغة الأساسية
              </label>
              <select 
                value={formData.language_code} 
                onChange={(e) => setFormData(p => ({ ...p, language_code: e.target.value }))} 
                className="custom-input"
              >
                <option value="ar">العربية (Arabic)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '12px 16px',
              borderRadius: '12px',
              color: '#f87171',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            style={{
              width: '100%',
              padding: '15px',
              marginTop: '12px',
              background: loading ? '#334155' : 'linear-gradient(135deg, #C9A84C 0%, #A58230 100%)',
              color: '#0c1520',
              borderRadius: '12px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '800',
              fontSize: '15px',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(201, 168, 76, 0.25)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin" /> 
                <span>{statusMessage}</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>تأسيس وإنشاء الأكاديمية</span>
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        .custom-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: #0c1520;
          color: #fff;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .custom-input:focus {
          border-color: #C9A84C;
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
        }
        .spin { animation: spin 1s linear infinite; } 
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
