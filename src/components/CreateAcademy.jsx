import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  GraduationCap, 
  Loader2, 
  LogOut, 
  Globe, 
  Coins, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  Sliders,
  Sparkles
} from 'lucide-react';

export default function CreateAcademy({ session, onAcademyCreated, onLogout }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);

  // حالة التحقق من الرابط الفريد (Slug)
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    language_code: 'ar',
    calendar_type: 'gregorian'
  });

  // توليد الرابط الفريد تلقائياً من الاسم
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

  // التحقق التلقائي اللحظي من توفر الـ Slug
  useEffect(() => {
    if (!formData.slug || formData.slug.trim().length < 3) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSlugChecking(true);
      try {
        const { data } = await supabase
          .from('academies')
          .select('id')
          .eq('slug', formData.slug.trim().toLowerCase())
          .maybeSingle();

        setSlugAvailable(!data);
      } catch (err) {
        console.error('Error checking slug:', err);
      } finally {
        setSlugChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.slug]);

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (formData.name.trim().length < 3) {
        setError('اسم الأكاديمية يجب أن يتكون من 3 أحرف على الأقل.');
        return;
      }
      if (!formData.slug.trim()) {
        setError('يرجى تحديد رابط فريد (Slug) بالأحرف الإنجليزية.');
        return;
      }
      if (slugAvailable === false) {
        setError('هذا الرابط الفريد مستخدم بالفعل، يرجى اختياره بشكل مختلف.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStatusMessage('جاري إنشاء الأكاديمية وتهيئة السجلات...');

    let createdAcademyId = null;

    try {
      const userId = session?.user?.id;
      if (!userId) throw new Error('جلسة المستخدم غير صالحة. يرجى إعادة تسجيل الدخول.');

      // 1. إدراج الأكاديمية
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
          throw new Error('هذا الرابط الفريد (Slug) مستخدم بالفعل، يرجى اختيار رابط آخر.');
        }
        throw academyError;
      }

      createdAcademyId = academy.id;

      // 2. تحديث ملف المستخدم بـ role: 'admin'
      setStatusMessage('جاري ضبط الصلاحيات والملف الشخصي...');
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          academy_id: createdAcademyId,
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // 3. إضافة سجل الإدارة بـ role: 'admin'
      setStatusMessage('جاري ربط حسابكم الإداري بالأكاديمية...');
      const { error: staffError } = await supabase
        .from('staff')
        .upsert({ 
          user_id: userId, 
          academy_id: createdAcademyId,
          name: session?.user?.user_metadata?.full_name || formData.name.trim(),
          role: 'admin',
        }, { onConflict: 'user_id,academy_id' });

      if (staffError) console.warn('Staff record creation warning:', staffError.message);

      // 4. إدراج الاشتراك التجريبي
      const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('saas_subscriptions').insert([{
        academy_id: createdAcademyId,
        payer_id: userId,
        plan_tier: 'trial',
        status: 'trialing',
        trial_ends_at: trialEndDate,
        currency: formData.currency
      }]);

      // 5. تحديث الجلسة بالبيانات الجديدة
      setStatusMessage('جاري إنهاء التأسيس والتحويل للوحة التحكم...');
      await supabase.auth.updateUser({
        data: { academy_id: createdAcademyId, role: 'admin' }
      });

      await supabase.auth.refreshSession();

      if (onAcademyCreated) onAcademyCreated(createdAcademyId);
    } catch (err) {
      console.error('CreateAcademy Error:', err);
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
      padding: '24px 16px',
      direction: 'rtl',
      fontFamily: "'Cairo', system-ui, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: 'rgba(21, 35, 50, 0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(201, 168, 76, 0.25)',
        borderRadius: '24px',
        padding: '36px 28px',
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
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '700'
            }}
          >
            <LogOut size={15} /> خروج
          </button>
        )}

        {/* الهيدر */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '70px',
            height: '70px',
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.2) 0%, rgba(201, 168, 76, 0.05) 100%)',
            border: '1px solid rgba(201, 168, 76, 0.4)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(201, 168, 76, 0.15)'
          }}>
            <GraduationCap size={36} color="#C9A84C" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: '0 0 6px 0' }}>
            تأسيس أكاديميتك الذكية
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
            خطوات بسيطة لإطلاق منظومتك التعليمية وإدارتها عالمياً
          </p>
        </div>

        {/* شريط Progress / Steps */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', padding: '0 10px' }}>
          {[
            { num: 1, title: 'البيانات', icon: Building2 },
            { num: 2, title: 'الإعدادات', icon: Sliders },
            { num: 3, title: 'التأكيد', icon: Sparkles },
          ].map((s) => {
            const IconComponent = s.icon;
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1, position: 'relative' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: isDone ? '#C9A84C' : isActive ? 'rgba(201, 168, 76, 0.2)' : '#0c1520',
                  border: `2px solid ${isDone || isActive ? '#C9A84C' : 'rgba(255, 255, 255, 0.1)'}`,
                  color: isDone ? '#0c1520' : isActive ? '#C9A84C' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}>
                  {isDone ? <Check size={18} /> : <IconComponent size={18} />}
                </div>
                <span style={{ fontSize: '11px', color: isActive || isDone ? '#fff' : '#64748b', fontWeight: isActive ? '700' : '500' }}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* نموذج الخطوات */}
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                  اسم الأكاديمية <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="مثال: أكاديمية الفرقان القرآنية" 
                  required 
                  value={formData.name} 
                  onChange={handleNameChange} 
                  className="custom-input"
                />
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                  <span>الرابط الفريد (Slug) <span style={{ color: '#ef4444' }}>*</span></span>
                  {slugChecking && <span style={{ color: '#C9A84C', fontSize: '11px' }}>جاري التحقق...</span>}
                  {!slugChecking && slugAvailable === true && <span style={{ color: '#10b981', fontSize: '11px' }}>متوفر ✓</span>}
                  {!slugChecking && slugAvailable === false && <span style={{ color: '#ef4444', fontSize: '11px' }}>غير متوفر ✕</span>}
                </label>
                <input 
                  type="text" 
                  placeholder="alfurqan-academy" 
                  required 
                  value={formData.slug} 
                  onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} 
                  className="custom-input"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                    <Coins size={15} color="#C9A84C" /> العملة الرسمية
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
                    <option value="EUR">اليورو الأوروبي (EUR)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                    <Calendar size={15} color="#C9A84C" /> التقويم المعتمد
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
                    <Globe size={15} color="#C9A84C" /> المنطقة الزمنية
                  </label>
                  <select 
                    value={formData.timezone} 
                    onChange={(e) => setFormData(p => ({ ...p, timezone: e.target.value }))} 
                    className="custom-input"
                  >
                    <option value="Africa/Cairo">القاهرة (GMT+2)</option>
                    <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                    <option value="Asia/Dubai">دبي (GMT+4)</option>
                    <option value="Europe/London">لندن (GMT+0)</option>
                    <option value="UTC">التوقيت العالمي (UTC)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
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
            </div>
          )}

          {step === 3 && (
            <div style={{ background: '#0c1520', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h4 style={{ color: '#C9A84C', margin: '0 0 14px 0', fontSize: '14px', fontWeight: '700' }}>مراجعة تفاصيل التأسيس:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>الاسم:</span>
                  <span style={{ fontWeight: '700' }}>{formData.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>الرابط الفريد:</span>
                  <span style={{ fontWeight: '700', direction: 'ltr' }}>{formData.slug}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>العملة / التقويم:</span>
                  <span>{formData.currency} / {formData.calendar_type === 'gregorian' ? 'ميلادي' : 'هجري'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>المنطقة الزمنية:</span>
                  <span>{formData.timezone}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              marginTop: '16px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '12px 14px',
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

          {/* أزرار التنقل */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            {step > 1 && (
              <button 
                type="button" 
                onClick={() => setStep(p => p - 1)}
                disabled={loading}
                style={{
                  padding: '12px 20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ArrowRight size={16} /> السابق
              </button>
            )}

            {step < 3 ? (
              <button 
                type="button" 
                onClick={handleNextStep}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #C9A84C 0%, #A58230 100%)',
                  color: '#0c1520',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '800',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                التالي <ArrowLeft size={16} />
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={loading} 
                style={{
                  flex: 1,
                  padding: '14px',
                  background: loading ? '#334155' : 'linear-gradient(135deg, #C9A84C 0%, #A58230 100%)',
                  color: '#0c1520',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '800',
                  fontSize: '14px',
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
                    <span>تأكيد وإنشاء الأكاديمية</span>
                  </>
                )}
              </button>
            )}
          </div>
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
