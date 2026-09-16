// src/components/SaaS/AffiliateRewards.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Award, 
  Sparkles, 
  Percent, 
  Tag, 
  ShieldCheck,
  Loader2,
  Building2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AffiliateRewards({ academyId, currency = 'USD', isRtl: isRtlProp, currentLang: currentLangProp }) {
  const { t, i18n } = useTranslation();
  
  const currentLang = currentLangProp || i18n?.language || 'ar';
  
  // اللغات التي تكتب من اليمين إلى اليسار (العربية والأوردو)
  const rtlLanguages = ['ar', 'ur'];
  const isRtl = isRtlProp !== undefined 
    ? isRtlProp 
    : rtlLanguages.some(lang => currentLang.startsWith(lang));

  const [copiedLink, setCopiedLink] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [referralList, setReferralList] = useState([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeAcademies: 0,
    pendingDiscount: 0,
    totalDiscountEarned: 0
  });

  const loadReferralData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let targetAcademyId = academyId;
      if (!targetAcademyId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('academy_id')
          .eq('id', user.id)
          .maybeSingle();
        targetAcademyId = profile?.academy_id;
      }

      if (targetAcademyId) {
        const { data: academy } = await supabase
          .from('academies')
          .select('referral_code, id')
          .eq('id', targetAcademyId)
          .maybeSingle();

        if (academy?.referral_code) {
          setReferralCode(academy.referral_code);
        } else {
          const generatedCode = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
          await supabase
            .from('academies')
            .update({ referral_code: generatedCode })
            .eq('id', targetAcademyId);
          setReferralCode(generatedCode);
        }

        const { data: referrals } = await supabase
          .from('saas_referrals')
          .select('*')
          .eq('referrer_academy_id', targetAcademyId)
          .order('created_at', { ascending: false });

        if (referrals) {
          setReferralList(referrals);
          const total = referrals.length;
          const active = referrals.filter(r => r.status === 'subscribed' || r.status === 'rewarded').length;
          const pending = referrals.filter(r => r.status === 'pending').reduce((sum, r) => sum + (Number(r.reward_amount) || 0), 0);
          const earned = referrals.filter(r => r.status === 'rewarded').reduce((sum, r) => sum + (Number(r.reward_amount) || 0), 0);

          setStats({
            totalReferrals: total,
            activeAcademies: active,
            pendingDiscount: pending,
            totalDiscountEarned: earned
          });
        }
      }
    } catch (err) {
      console.error('🚨 Error fetching referral data:', err);
    } finally {
      setLoading(false);
    }
  }, [academyId]);

  useEffect(() => {
    loadReferralData();
  }, [loadReferralData]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://smart-halaqa.vercel.app';
  const referralLink = `${baseUrl}/signup?ref=${referralCode || 'REF-27TJK2'}`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const msg = `${t('affiliate.whatsappShareMessage', 'أدعوك لتجربة المنظومة مع الحصول على خصم خاص عبر الرابط التالي:')}\n${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        fontFamily: "'Cairo', system-ui, -apple-system, sans-serif",
        maxWidth: '800px',
        margin: '0 auto',
        padding: '12px 8px'
      }} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* 🟢 1. HERO SECTION & WALLET BANNER */}
      <div style={{
        background: `linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(6,78,59,0.4) 100%)`,
        border: `1px solid rgba(16, 185, 129, 0.25)`,
        borderRadius: '24px',
        padding: '20px 18px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient Glow Effects */}
        <div style={{ 
          position: 'absolute', 
          top: '-40px', 
          left: isRtl ? '-40px' : 'auto', 
          right: isRtl ? 'auto' : '-40px', 
          width: '120px', 
          height: '120px', 
          background: '#10B981', 
          opacity: 0.15, 
          filter: 'blur(50px)', 
          borderRadius: '50%', 
          pointerEvents: 'none' 
        }} />

        {/* Top Tag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
            <Tag size={12} />
            <span>{t('affiliate.badge', 'برنامج شركاء النجاح')}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>{t('affiliate.autoDiscount', 'تطبيق تلقائي للخصم')}</span>
          </div>
        </div>

        {/* Heading */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC', margin: '0 0 6px 0', lineHeight: '1.3' }}>
          {t('affiliate.heroTitle', 'ادعُ المقارئ واخصِم من اشتراكك')}
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '0.825rem', margin: '0 0 16px 0', lineHeight: '1.5' }}>
          {t('affiliate.heroDesc', 'احصل على خصومات فورية تُطبّق تلقائياً على فاتورة تجديدك القادمة لكل أكاديمية تنضم عن طريقك.')}
        </p>

        {/* Link Box Container */}
        <div style={{
          background: 'rgba(2, 6, 23, 0.7)',
          border: '1px solid rgba(51, 65, 85, 0.8)',
          borderRadius: '16px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>
            {t('affiliate.directLink', 'رابط الإحالة المباشر')}
          </span>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{
              flex: 1,
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.6)',
              borderRadius: '10px',
              padding: '8px 12px',
              color: '#CBD5E1',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              direction: 'ltr',
              textAlign: 'left'
            }}>
              {referralLink}
            </div>

            <button
              type="button"
              onClick={() => handleCopy(referralLink)}
              style={{
                padding: '9px 14px',
                background: '#10B981',
                color: '#022C22',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
              }}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? t('affiliate.copied', 'تم النسخ') : t('affiliate.copyLink', 'نسخ')}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(37, 211, 102, 0.12)',
              border: '1px solid rgba(37, 211, 102, 0.3)',
              color: '#25D366',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '2px'
            }}
          >
            <Share2 size={15} />
            <span>{t('affiliate.whatsapp', 'مشاركة عبر واتساب')}</span>
          </button>
        </div>
      </div>

      {/* 🟢 2. COMPACT STEPS (HORIZONTAL FLOW) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {[
          { step: '1', title: t('affiliate.step1Title', '1. شارك'), desc: t('affiliate.step1Desc', 'أرسل رابطك للمديرين') },
          { step: '2', title: t('affiliate.step2Title', '2. اشتركوا'), desc: t('affiliate.step2Desc', 'تسجل الأكاديمية بالمنظومة') },
          { step: '3', title: t('affiliate.step3Title', '3. وفّر'), desc: t('affiliate.step3Desc', 'يُخصم التخفيض من فاتورتك') }
        ].map((item, idx) => (
          <div key={idx} style={{ 
            background: 'rgba(15, 23, 42, 0.6)', 
            border: '1px solid rgba(51, 65, 85, 0.5)', 
            padding: '10px 8px', 
            borderRadius: '14px', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '4px'
          }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: '#34D399', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: '800',
              fontSize: '0.75rem'
            }}>
              {item.step}
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.75rem', color: '#F1F5F9' }}>{item.title}</div>
            <div style={{ fontSize: '0.65rem', color: '#64748B', lineHeight: '1.2' }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* 🟢 3. METRICS BENTO GRID (2x2) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        
        {/* إجمالي الإحالات */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '16px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.725rem', color: '#94A3B8', marginBottom: '2px' }}>{t('affiliate.totalReferrals', 'إجمالي الإحالات')}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC' }}>{stats.totalReferrals}</div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={18} />
          </div>
        </div>

        {/* أكاديميات مشتركة */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '16px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.725rem', color: '#94A3B8', marginBottom: '2px' }}>{t('affiliate.activeAcademies', 'أكاديميات مشتركة')}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC' }}>{stats.activeAcademies}</div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={18} />
          </div>
        </div>

        {/* خصم التجديد القادم */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.725rem', color: '#FBBF24', marginBottom: '2px' }}>{t('affiliate.pendingDiscount', 'خصم التجديد القادم')}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FBBF24' }}>{stats.pendingDiscount} {currency}</div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Percent size={18} />
          </div>
        </div>

        {/* إجمالي الوفر */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '16px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.725rem', color: '#C084FC', marginBottom: '2px' }}>{t('affiliate.totalDiscountEarned', 'إجمالي الوفر')}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#C084FC' }}>{stats.totalDiscountEarned} {currency}</div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} />
          </div>
        </div>

      </div>

      {/* 🟢 4. RECORDS SECTION (LIST / EMPTY STATE) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid rgba(30, 41, 59, 0.8)',
        borderRadius: '20px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '24px 0', color: '#34D399', fontSize: '0.8rem', fontWeight: '600' }}>
            <Loader2 size={18} className="animate-spin" />
            <span>{t('affiliate.loading', 'جاري تحميل سجل الإحالات...')}</span>
          </div>
        ) : referralList.length === 0 ? (
          <div style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 0'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(51, 65, 85, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <Sparkles size={18} />
            </div>
            <h3 style={{ color: '#E2E8F0', margin: 0, fontSize: '0.9rem', fontWeight: '700' }}>
              {t('affiliate.emptyTitle', 'لا توجد إحالات بعد')}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.775rem', margin: 0, maxWidth: '320px', lineHeight: '1.4' }}>
              {t('affiliate.emptyDesc', 'شارك رابطك المباشر مع زملائك لبدء تخفيض قيمة اشتراكك القادم تلقائياً.')}
            </p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: '700', marginBottom: '12px' }}>
              <Building2 size={16} className="text-emerald-400" />
              <span>{t('affiliate.recordsTitle', 'سجل الأكاديميات المُحالة')}</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.75rem', textAlign: isRtl ? 'right' : 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: '#64748B', borderBottom: '1px solid rgba(51, 65, 85, 0.5)' }}>
                    <th style={{ padding: '8px', fontWeight: '700' }}>{t('affiliate.table.academy', 'الأكاديمية / المستخدم')}</th>
                    <th style={{ padding: '8px', fontWeight: '700' }}>{t('affiliate.table.status', 'الحالة')}</th>
                    <th style={{ padding: '8px', fontWeight: '700' }}>{t('affiliate.table.reward', 'قيمة الخصم')}</th>
                    <th style={{ padding: '8px', fontWeight: '700', textAlign: 'center' }}>{t('affiliate.table.date', 'التاريخ')}</th>
                  </tr>
                </thead>
                <tbody>
                  {referralList.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(30, 41, 59, 0.4)', color: '#E2E8F0' }}>
                      <td style={{ padding: '10px 8px', fontWeight: '600' }}>
                        {item.referred_academy_name || item.referred_email || t('affiliate.defaultAcademyName', 'أكاديمية مجاورة')}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontSize: '0.675rem',
                          fontWeight: '700',
                          background: item.status === 'rewarded' ? 'rgba(139, 92, 246, 0.15)' : item.status === 'subscribed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: item.status === 'rewarded' ? '#C084FC' : item.status === 'subscribed' ? '#34D399' : '#FBBF24',
                          border: `1px solid ${item.status === 'rewarded' ? 'rgba(139, 92, 246, 0.3)' : item.status === 'subscribed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                        }}>
                          {item.status === 'rewarded' 
                            ? t('affiliate.status.rewarded', 'تم الخصم') 
                            : item.status === 'subscribed' 
                              ? t('affiliate.status.subscribed', 'مشترك نشط') 
                              : t('affiliate.status.pending', 'قيد الانتظار')}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: '700', color: '#FBBF24' }}>
                        {Number(item.reward_amount) || 0} {currency}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#64748B', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString(currentLang) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
