import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  GraduationCap, 
  Loader2, 
  LogOut, 
  Globe, 
  Coins, 
  Calendar, 
  Clock,
  AlertTriangle, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  Sliders,
  Sparkles,
  ChevronDown,
  X,
  Search
} from 'lucide-react';

// ==========================================
// 1. الإعدادات المرجعية للتوسع المستقبلي
// ==========================================
const CONFIGS = {
  currencies: [
    { code: 'EGP', symbol: 'EGP', name: 'الجنيه المصري', country: 'مصر' },
    { code: 'SAR', symbol: 'SAR', name: 'الريال السعودي', country: 'السعودية' },
    { code: 'USD', symbol: '$', name: 'الدولار الأمريكي', country: 'دولي' },
    { code: 'AED', symbol: 'AED', name: 'الدرهم الإماراتي', country: 'الإمارات' },
    { code: 'EUR', symbol: '€', name: 'اليورو الأوروبي', country: 'أوروبا' },
    { code: 'KWD', symbol: 'KWD', name: 'الدينار الكويتي', country: 'الكويت' },
    { code: 'QAR', symbol: 'QAR', name: 'الريال القطري', country: 'قطر' },
  ],
  languages: [
    { code: 'ar', name: 'العربية', dir: 'rtl', flag: '🇪🇬' },
    { code: 'en', name: 'English', dir: 'ltr', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', dir: 'ltr', flag: '🇫🇷' },
  ],
  calendars: [
    { code: 'gregorian', name: 'ميلادي (Gregorian)' },
    { code: 'hijri', name: 'هجري (Hijri)' },
  ],
  timezones: [
    { code: 'Africa/Cairo', label: 'القاهرة (GMT+2)', offset: '+02:00' },
    { code: 'Asia/Riyadh', label: 'الرياض (GMT+3)', offset: '+03:00' },
    { code: 'Asia/Dubai', label: 'دبي (GMT+4)', offset: '+04:00' },
    { code: 'Europe/London', label: 'لندن (GMT+0)', offset: '+00:00' },
    { code: 'America/New_York', label: 'نيويورك (GMT-5)', offset: '-05:00' },
    { code: 'UTC', label: 'التوقيت العالمي (UTC)', offset: '+00:00' },
  ]
};

export default function CreateAcademy({ session, onAcademyCreated, onLogout }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);

  // حالة التحقق من الـ Slug
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(null);

  // بيانات النموذج المرتبطة
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    language_code: 'ar',
    calendar_type: 'gregorian'
  });

  // حالة النافذة المنبثقة والبحث
  const [activeModal, setActiveModal] = useState(null); // 'currency' | 'calendar_type' | 'timezone' | 'language_code' | null
  const [searchQuery, setSearchQuery] = useState('');

  // ------------------------------------------
  // الربط التلقائي والذكاء عند إدخال البيانات
  // ------------------------------------------
  
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

  // تصفية الخيارات بناءً على بحث المستخدم داخل القائمة المنبثقة
  const filteredModalOptions = useMemo(() => {
    if (!activeModal) return [];
    const query = searchQuery.trim().toLowerCase();

    if (activeModal === 'currency') {
      return CONFIGS.currencies.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.code.toLowerCase().includes(query) || 
        c.country.toLowerCase().includes(query)
      );
    }
    if (activeModal === 'language_code') {
      return CONFIGS.languages.filter(l => 
        l.name.toLowerCase().includes(query) || 
        l.code.toLowerCase().includes(query)
      );
    }
    if (activeModal === 'timezone') {
      return CONFIGS.timezones.filter(t => 
        t.label.toLowerCase().includes(query) || 
        t.code?.toLowerCase().includes(query)
      );
    }
    if (activeModal === 'calendar_type') {
      return CONFIGS.calendars.filter(c => 
        c.name.toLowerCase().includes(query)
      );
    }
    return [];
  }, [activeModal, searchQuery]);

  // إغلاق المودال وتحديد القيمة
  const handleSelectOption = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setActiveModal(null);
    setSearchQuery('');
  };

  // التنقل بين الخطوات مع التحقق
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

  // ------------------------------------------
  // الحفظ والإنشاء في Supabase
  // ------------------------------------------
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

      // 2. تحديث الملف الشخصي بـ role: 'admin'
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

      // 3. إضافة سجل الطاقم الإداري
      setStatusMessage('جاري ربط حسابكم الإداري بالأكاديمية...');
      const { error: staffError } = await supabase
        .from('staff')
        .upsert({ 
          user_id: userId, 
          academy_id: createdAcademyId,
          name: session?.user?.user_metadata?.full_name || formData.name.trim(),
          role: 'admin',
        }, { onConflict: 'user_id,academy_id' });

      if (staffError) console.warn('Staff record warning:', staffError.message);

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

      // 5. تحديث الجلسة والتحويل
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

  // الحصول على المسميات المعروضة بسهولة
  const activeCurrencyObj = CONFIGS.currencies.find(c => c.code === formData.currency);
  const activeLangObj = CONFIGS.languages.find(l => l.code === formData.language_code);
  const activeTimezoneObj = CONFIGS.timezones.find(t => t.code === formData.timezone);
  const activeCalendarObj = CONFIGS.calendars.find(c => c.code === formData.calendar_type);

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
        maxWidth: '580px',
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

        {/* شريط التقدم / Steps */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', padding: '0 10px' }}>
          {[
            { num: 1, title: 'بيانات الأكاديمية', icon: Building2 },
            { num: 2, title: 'الإعدادات الإقليمية', icon: Sliders },
            { num: 3, title: 'المراجعة والإنشاء', icon: Sparkles },
          ].map((s) => {
            const IconComponent = s.icon;
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1, position: 'relative' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
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

        {/* النموذج */}
        <form onSubmit={handleSubmit}>
          
          {/* الخطوة 1: البيانات */}
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
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'block' }}>
                  سيكون رابط أكاديميتك: <code style={{ color: '#C9A84C' }}>{formData.slug || 'slug'}.smart-halaqa.com</code>
                </span>
              </div>
            </div>
          )}

          {/* الخطوة 2: الإعدادات والإقليم */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                
                {/* العملة الرسمية */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                    <Coins size={15} color="#C9A84C" /> العملة الرسمية
                  </label>
                  <button 
                    type="button" 
                    className="custom-select-trigger"
                    onClick={() => { setActiveModal('currency'); setSearchQuery(''); }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <span style={{ color: '#C9A84C', fontWeight: 'bold' }}>{activeCurrencyObj?.symbol}</span>
                      <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{activeCurrencyObj?.name}</span>
                    </span>
                    <ChevronDown size={16} color="#64748B" />
                  </button>
                </div>

                {/* التقويم المعتمد */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                    <Calendar size={15} color="#C9A84C" /> التقويم المعتمد
                  </label>
                  <button 
                    type="button" 
                    className="custom-select-trigger"
                    onClick={() => { setActiveModal('calendar_type'); setSearchQuery(''); }}
                  >
                    <span>{activeCalendarObj?.name}</span>
                    <ChevronDown size={16} color="#64748B" />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                
                {/* المنطقة الزمنية */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                    <Clock size={15} color="#C9A84C" /> المنطقة الزمنية
                  </label>
                  <button 
                    type="button" 
                    className="custom-select-trigger"
                    onClick={() => { setActiveModal('timezone'); setSearchQuery(''); }}
                  >
                    <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {activeTimezoneObj?.label}
                    </span>
                    <ChevronDown size={16} color="#64748B" />
                  </button>
                </div>

                {/* اللغة الأساسية */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                    <Globe size={15} color="#C9A84C" /> اللغة الأساسية
                  </label>
                  <button 
                    type="button" 
                    className="custom-select-trigger"
                    onClick={() => { setActiveModal('language_code'); setSearchQuery(''); }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{activeLangObj?.flag}</span>
                      <span>{activeLangObj?.name}</span>
                    </span>
                    <ChevronDown size={16} color="#64748B" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* الخطوة 3: التلخيص والتأكيد */}
          {step === 3 && (
            <div style={{ background: '#0c1520', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h4 style={{ color: '#C9A84C', margin: '0 0 14px 0', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> ملخص بيانات الأكاديمية الإقليمية:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>اسم الأكاديمية:</span>
                  <span style={{ fontWeight: '700', color: '#fff' }}>{formData.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>الرابط الفريد (Slug):</span>
                  <span style={{ fontWeight: '700', direction: 'ltr', color: '#C9A84C' }}>{formData.slug}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>العملة الرسمية:</span>
                  <span>{activeCurrencyObj?.name} ({activeCurrencyObj?.code})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>التقويم المعتمد:</span>
                  <span>{activeCalendarObj?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>المنطقة الزمنية:</span>
                  <span>{activeTimezoneObj?.label}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>اللغة الأساسية:</span>
                  <span>{activeLangObj?.flag} {activeLangObj?.name}</span>
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

      {/* ==========================================
          2. النافذة المنبثقة الذكية (Custom Modal)
         ========================================== */}
      {activeModal && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            
            {/* الهيدر */}
            <div style={{ 
              padding: '16px 20px', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: '#090F16'
            }}>
              <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '15px', fontWeight: 'bold' }}>
                {activeModal === 'currency' && 'اختر العملة الرسمية'}
                {activeModal === 'calendar_type' && 'اختر نوع التقويم'}
                {activeModal === 'timezone' && 'اختر المنطقة الزمنية'}
                {activeModal === 'language_code' && 'اختر اللغة الأساسية'}
              </h3>
              <button 
                type="button"
                onClick={() => setActiveModal(null)} 
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* حقل البحث داخل المودال (للتوسع المستقبلي) */}
            {(activeModal === 'currency' || activeModal === 'timezone') && (
              <div style={{ padding: '12px 16px', background: '#0d1824', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="#64748B" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="بحث..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 36px 8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: '#0c1520',
                      color: '#fff',
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            {/* قائمة الخيارات */}
            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {filteredModalOptions.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  لا توجد نتائج تطابق البحث
                </div>
              ) : (
                filteredModalOptions.map((opt) => {
                  const itemValue = opt.code || opt.value;
                  const isSelected = formData[activeModal] === itemValue;

                  return (
                    <div 
                      key={itemValue}
                      className={`option-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(activeModal, itemValue)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {opt.flag && <span>{opt.flag}</span>}
                        {opt.symbol && <span style={{ color: '#C9A84C', fontWeight: 'bold', width: '35px' }}>{opt.symbol}</span>}
                        <span>{opt.name || opt.label}</span>
                      </div>

                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: `2px solid ${isSelected ? '#C9A84C' : '#475569'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isSelected ? '#C9A84C' : 'transparent'
                      }}>
                        {isSelected && <Check size={12} color="#0c1520" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}

      {/* التنسيقات */}
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
        .custom-select-trigger {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: #0c1520;
          color: #fff;
          font-size: 13px;
          display: flex;
          alignItems: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s ease;
          box-sizing: border-box;
          font-family: inherit;
        }
        .custom-select-trigger:hover {
          border-color: #C9A84C;
        }
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(6px);
          display: flex;
          alignItems: flex-end;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }
        @media (min-width: 640px) {
          .modal-backdrop {
            align-items: center;
          }
        }
        .modal-card {
          background: #152332;
          border: 1px solid rgba(201, 168, 76, 0.25);
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          animation: slideUp 0.25s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .option-item {
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #E2E8F0;
          font-size: 13px;
          cursor: pointer;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background 0.2s ease;
        }
        .option-item:last-child {
          border-bottom: none;
        }
        .option-item:hover, .option-item.selected {
          background: rgba(201, 168, 76, 0.12);
          color: #C9A84C;
        }
        .spin { animation: spin 1s linear infinite; } 
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
