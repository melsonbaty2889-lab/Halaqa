import React, { useState, useEffect } from 'react';
import { Card, Input } from './UI/UI.jsx';
import { Building2, Save, Globe, Clock, Calendar, Mail, Phone, ShieldCheck, Database, RefreshCw, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Settings({ currentAcademyId, isRtl = true }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    logo_url: '',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    language_code: 'ar',
    calendar_type: 'gregorian',
    weekend_days: ['friday', 'saturday']
  });

  // جلب بيانات الأكاديمية عند تحميل الصفحة
  useEffect(() => {
    if (currentAcademyId) {
      fetchAcademySettings();
    }
  }, [currentAcademyId]);

  const fetchAcademySettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('academies')
        .select('*')
        .eq('id', currentAcademyId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: typeof data.name === 'object' ? data.name?.ar || JSON.stringify(data.name) : data.name || '',
          slug: data.slug || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          website: data.website || '',
          logo_url: data.logo_url || '',
          currency: data.currency || 'EGP',
          timezone: data.timezone || 'Africa/Cairo',
          language_code: data.language_code || 'ar',
          calendar_type: data.calendar_type || 'gregorian',
          weekend_days: data.weekend_days || ['friday', 'saturday']
        });
      }
    } catch (err) {
      console.error('Error fetching academy data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');

      const payload = {
        ...formData,
        name: { ar: formData.name }, // حفظ Name كـ jsonb لدعم اللغات
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('academies')
        .update(payload)
        .eq('id', currentAcademyId);

      if (error) throw error;

      setSuccessMsg('تم حفظ التغييرات وبدء المزامنة السحابية بنجاح!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleWeekendDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      weekend_days: prev.weekend_days.includes(day)
        ? prev.weekend_days.filter((d) => d !== day)
        : [...prev.weekend_days, day]
    }));
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
        <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 12px' }} />
        <p>جاري تحميل إعدادات الأكاديمية...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', color: '#e2e8f0', direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#fbbf24', fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building2 size={26} /> إعدادات المنظومة وحفظ البيانات
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px' }}>
          إدارة ترخيص الأكاديمية، البيانات التأسيسية، وخيارات التزامن السحابي للغرفة الأكاديمية.
        </p>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#4ade80', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Basic Info Section */}
        <Card style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ color: '#38bdf8', fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} /> الهوية والبيانات الأساسية
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>اسم الأكاديمية / المقرأة *</label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أكاديمية الفرقان التجريبية"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>المعرّف الفريد (Slug)</label>
              <Input
                type="text"
                disabled
                value={formData.slug}
                placeholder="al-furqan"
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>رابط اللوجو (Logo URL)</label>
              <Input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>الموقع الإلكتروني</label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://academy.com"
              />
            </div>
          </div>
        </Card>

        {/* Contact Info Section */}
        <Card style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ color: '#38bdf8', fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={20} /> قنوات التواصل والروابط
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>البريد الإلكتروني للتواصل</label>
              <Input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="info@academy.com"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>رقم الهاتف / الواتساب</label>
              <Input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+201000000000"
              />
            </div>
          </div>
        </Card>

        {/* System Regional Preferences */}
        <Card style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ color: '#38bdf8', fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} /> التفضيلات والإعدادات الإقليمية
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>العُملة الرئيسية</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
              >
                <option value="EGP">جنيه مصري (EGP)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="AED">درهم إماراتي (AED)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>المنطقة الزمنية</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
              >
                <option value="Africa/Cairo">توقيت القاهرة (GMT+2/3)</option>
                <option value="Asia/Riyadh">توقيت مكة المكرمة (GMT+3)</option>
                <option value="UTC">التوقيت العالمي (UTC)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>نوع التقويم</label>
              <select
                value={formData.calendar_type}
                onChange={(e) => setFormData({ ...formData, calendar_type: e.target.value })}
                style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
              >
                <option value="gregorian">ميلادي</option>
                <option value="hijri">هجري</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>أيام العطلة الأسبوعية</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { id: 'friday', label: 'الجمعة' },
                { id: 'saturday', label: 'السبت' },
                { id: 'sunday', label: 'الأحد' },
                { id: 'thursday', label: 'الخميس' }
              ].map((day) => {
                const isSelected = formData.weekend_days.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleWeekendDay(day.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: isSelected ? '1px solid #f59e0b' : '1px solid #334155',
                      background: isSelected ? 'rgba(245, 158, 11, 0.2)' : '#0f172a',
                      color: isSelected ? '#fbbf24' : '#94a3b8',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

                {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
              color: '#0f172a',
              fontWeight: '700',
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>

      </form>
    </div>
  );
}
