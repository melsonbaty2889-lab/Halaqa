import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Gift, Copy, Check, Share2, Users, Award, 
  Clock, DollarSign, Sparkles 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { colors as C } from '@/theme/colors.js';

export default function AffiliateRewards({ academyId, currency = 'USD' }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : true;

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeAcademies: 0,
    pendingRewards: 0,
    totalEarned: 0
  });

  useEffect(() => {
    async function loadReferralData() {
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
            .eq('referrer_academy_id', targetAcademyId);

          if (referrals) {
            const total = referrals.length;
            const active = referrals.filter(r => r.status === 'subscribed' || r.status === 'rewarded').length;
            const pending = referrals.filter(r => r.status === 'pending').reduce((sum, r) => sum + (Number(r.reward_amount) || 0), 0);
            const earned = referrals.filter(r => r.status === 'rewarded').reduce((sum, r) => sum + (Number(r.reward_amount) || 0), 0);

            setStats({
              totalReferrals: total,
              activeAcademies: active,
              pendingRewards: pending,
              totalEarned: earned
            });
          }
        }
      } catch (err) {
        console.error('Error fetching referral data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadReferralData();
  }, [academyId]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://halaqa.vercel.app';
  const referralLink = `${baseUrl}/signup?ref=${referralCode || 'E766D3D4'}`;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const msg = isRtl
      ? `انضم إلى منصة إدارة المقارئ والحلقات الذكية عبر الرابط التالي:\n${referralLink}`
      : `Join the Smart Halaqa platform using my referral link:\n${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div 
      style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Cairo', system-ui, sans-serif" }} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Hero Card */}
      <div style={{
        background: `linear-gradient(135deg, ${C.dark.card} 0%, ${C.dark.surface} 100%)`,
        border: `1px solid ${C.dark.border}`,
        borderRadius: '20px',
        padding: '24px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: C.brandEmerald?.bgGlow || 'rgba(16,185,129,0.1)', color: C.brandEmerald?.DEFAULT || '#10B981', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', width: 'fit-content', marginBottom: '14px' }}>
          <Gift size={14} />
          <span>{t('referrals.badge', 'برنامج الشركاء والإحالة')}</span>
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: C.text.title, margin: '0 0 8px 0' }}>
          {t('referrals.heroTitle', 'شارِك المنظومة واكسب مكافآت ورصيد مجاني')}
        </h2>
        <p style={{ color: C.text.muted, fontSize: '0.9rem', margin: '0 0 20px 0', lineHeight: '1.6', maxWidth: '650px' }}>
          {t('referrals.heroDesc', 'انشر رابط الإحالة الخاص بك للأكاديميات والمقارئ القرآنية، واحصل على رصيد مجاني وعمولات فورية مع كل اشتراك جديد.')}
        </p>

        {/* Link Box */}
        <div style={{
          background: C.dark.main,
          border: `1px solid ${C.dark.border}`,
          borderRadius: '14px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <span style={{ fontSize: '0.8rem', color: C.text.muted, fontWeight: 'bold' }}>
            {t('referrals.directLink', 'رابط الإحالة المباشر الخاص بك:')}
          </span>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              flex: 1,
              minWidth: '220px',
              background: C.dark.surface,
              border: `1px solid ${C.dark.border}`,
              borderRadius: '8px',
              padding: '10px 14px',
              color: C.text.body,
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              direction: 'ltr',
              textAlign: 'left'
            }}>
              {referralLink}
            </div>

            <button
              onClick={() => handleCopy(referralLink, 'link')}
              style={{
                padding: '10px 18px',
                background: C.primary.gradient,
                color: C.dark.main,
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {copiedLink ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedLink ? t('common.copied', 'تم النسخ') : t('common.copyLink', 'نسخ الرابط')}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              style={{
                padding: '10px 18px',
                background: '#25D366',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Share2 size={16} />
              <span>{t('common.whatsapp', 'واتساب')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* How it Works Stepper */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {[
          { step: '1', title: t('referrals.step1Title', 'شارك الرابط'), desc: t('referrals.step1Desc', 'أرسل الرابط أو كود الإحالة لزملائك وإدارات المقارئ') },
          { step: '2', title: t('referrals.step2Title', 'تسجيل الأكاديمية'), desc: t('referrals.step2Desc', 'تقوم الأكاديمية بإنشاء حسابها والاشتراك بالمنظومة') },
          { step: '3', title: t('referrals.step3Title', 'كسب المكافأة'), desc: t('referrals.step3Desc', 'ينزل الرصيد والمكافأة المباشرة في حسابك تلقائياً') }
        ].map((item, idx) => (
          <div key={idx} style={{ background: C.dark.card, border: `1px solid ${C.dark.border}`, padding: '14px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: C.brandEmerald?.bgGlow || 'rgba(16,185,129,0.1)', color: C.brandEmerald?.DEFAULT || '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {item.step}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: C.text.title }}>{item.title}</div>
              <div style={{ fontSize: '0.75rem', color: C.text.muted }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {[
          { label: t('referrals.totalReferrals', 'إجمالي الإحالات'), val: stats.totalReferrals, icon: Users, color: '#3B82F6' },
          { label: t('referrals.activeAcademies', 'أكاديميات مشتركة'), val: stats.activeAcademies, icon: Award, color: '#10B981' },
          { label: t('referrals.pendingRewards', 'مكافآت معلقة'), val: `${stats.pendingRewards} ${currency}`, icon: Clock, color: '#F59E0B' },
          { label: t('referrals.totalEarned', 'إجمالي المكتسب'), val: `${stats.totalEarned} ${currency}`, icon: DollarSign, color: '#8B5CF6' }
        ].map((m, i) => (
          <div key={i} style={{ background: C.dark.card, border: `1px solid ${C.dark.border}`, borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: C.text.muted, marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: C.text.title }}>{m.val}</div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${m.color}15`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <m.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Empty / Records Table Banner */}
      <div style={{
        background: C.dark.card,
        border: `1px solid ${C.dark.border}`,
        borderRadius: '16px',
        padding: '32px 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: C.dark.surface, border: `1px solid ${C.dark.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text.muted }}>
          <Sparkles size={22} />
        </div>
        <h3 style={{ color: C.text.title, margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
          {t('referrals.emptyTitle', 'سجل الإحالات والأرباح')}
        </h3>
        <p style={{ color: C.text.muted, fontSize: '0.85rem', margin: 0, maxWidth: '400px' }}>
          {t('referrals.emptyDesc', 'لم تقم بأي إحالات بعد. قم بمشاركة رابطك المباشر لبدء احتساب المكافآت تلقائياً.')}
        </p>
      </div>
    </div>
  );
}
