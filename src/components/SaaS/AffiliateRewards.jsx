// src/components/SaaS/AffiliateRewards.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Copy, Check, Share2, Users, Award, 
  Sparkles, Percent, Tag, ShieldCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { colors as C } from '@/theme/colors.js';

export default function AffiliateRewards({ academyId, currency = 'USD', isRtl: isRtlProp, currentLang: currentLangProp }) {
  const { i18n } = useTranslation();
  
  const isRtl = isRtlProp !== undefined ? isRtlProp : (i18n?.dir ? i18n.dir() === 'rtl' : true);
  const currentLang = currentLangProp || i18n?.language || 'ar';
  const isEn = currentLang.startsWith('en');

  const [copiedLink, setCopiedLink] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeAcademies: 0,
    pendingDiscount: 0,
    totalDiscountEarned: 0
  });

  const labels = {
    badge: isEn ? "Partner Program" : "برنامج شركاء النجاح",
    heroTitle: isEn ? "Refer Academies, Lower Your Renewal" : "ادعُ المقارئ واخصِم من اشتراكك",
    heroDesc: isEn 
      ? "Get direct discount credits on your next platform invoice for every academy that joins through you." 
      : "احصل على خصومات فورية تُطبّق تلقائياً على فاتورة تجديدك القادمة لكل أكاديمية تنضم عن طريقك.",
    directLink: isEn ? "Your Referral Link" : "رابط الإحالة المباشر",
    copyLink: isEn ? "Copy" : "نسخ",
    copied: isEn ? "Copied!" : "تم النسخ",
    whatsapp: isEn ? "Share via WhatsApp" : "مشاركة عبر واتساب",
    step1Title: isEn ? "1. Share" : "1. شارك",
    step1Desc: isEn ? "Send link to directors." : "أرسل رابطك للمديرين",
    step2Title: isEn ? "2. Subscribe" : "2. اشتركوا",
    step2Desc: isEn ? "Academy starts a plan." : "تسجل الأكاديمية بالمنظومة",
    step3Title: isEn ? "3. Save" : "3. وفّر",
    step3Desc: isEn ? "Discount applied automatically." : "يُخصم التخفيض من فاتورتك",
    totalReferrals: isEn ? "Total Referrals" : "إجمالي الإحالات",
    activeAcademies: isEn ? "Active Academies" : "أكاديميات مشتركة",
    pendingDiscount: isEn ? "Next Renewal Discount" : "خصم التجديد القادم",
    totalDiscountEarned: isEn ? "Total Savings" : "إجمالي الوفر",
    emptyTitle: isEn ? "No Referrals Yet" : "لا توجد إحالات بعد",
    emptyDesc: isEn 
      ? "Share your custom link to start unlocking instant discounts on your upcoming invoices." 
      : "شارك رابطك المباشر مع زملائك لبدء تخفيض قيمة اشتراكك القادم تلقائياً."
  };

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

          // تطبيق المبدأ المتوازن: جلب كل حقول جدول الإحالات الرئيسي saas_referrals
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
              pendingDiscount: pending,
              totalDiscountEarned: earned
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

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://smart-halaqa.vercel.app';
  const referralLink = `${baseUrl}/signup?ref=${referralCode || 'REF-27TJK2'}`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const msg = isEn
      ? `Join Smart Halaqa to manage your Quranic Academy with an exclusive discount using my link:\n${referralLink}`
      : `السلام عليكم، أدعوك لتجربة "منظومة الحلقة الذكية" لإدارة الحلقات والمقارئ القرآنية مع الحصول على خصم خاص عبر رابطي:\n${referralLink}`;
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
        <div style={{ position: 'absolute', top: '-40px', left: isRtl ? '-40px' : 'auto', right: isRtl ? 'auto' : '-40px', width: '120px', height: '120px', background: '#10B981', opacity: 0.15, filter: 'blur(50px)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Top Tag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
            <Tag size={12} />
            <span>{labels.badge}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>{isEn ? 'Automatic Discount' : 'تطبيق تلقائي للخصم'}</span>
          </div>
        </div>

        {/* Heading */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC', margin: '0 0 6px 0', lineHeight: '1.3' }}>
          {labels.heroTitle}
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '0.825rem', margin: '0 0 16px 0', lineHeight: '1.5' }}>
          {labels.heroDesc}
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
            {labels.directLink}
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
                shrink: 0,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
              }}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? labels.copied : labels.copyLink}</span>
            </button>
          </div>

          <button
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
            <span>{labels.whatsapp}</span>
          </button>
        </div>
      </div>

      {/* 🟢 2. COMPACT STEPS (HORIZONTAL FLOW) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {[
          { step: '1', title: labels.step1Title, desc: labels.step1Desc },
          { step: '2', title: labels.step2Title, desc: labels.step2Desc },
          { step: '3', title: labels.step3Title, desc: labels.step3Desc }
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
            <div style={{ fontSize: '0.725rem', color: '#94A3B8', marginBottom: '2px' }}>{labels.totalReferrals}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC' }}>{stats.totalReferrals}</div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={18} />
          </div>
        </div>

        {/* أكاديميات مشتركة */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '16px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.725rem', color: '#94A3B8', marginBottom: '2px' }}>{labels.activeAcademies}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC' }}>{stats.activeAcademies}</div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={18} />
          </div>
        </div>

        {/* خصم التجديد القادم */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.725rem', color: '#FBBF24', marginBottom: '2px' }}>{labels.pendingDiscount}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FBBF24' }}>{stats.pendingDiscount} {currency}</div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Percent size={18} />
          </div>
        </div>

        {/* إجمالي الوفر */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '16px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.725rem', color: '#C084FC', marginBottom: '2px' }}>{labels.totalDiscountEarned}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#C084FC' }}>{stats.totalDiscountEarned} {currency}</div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} />
          </div>
        </div>

      </div>

      {/* 🟢 4. EMPTY RECORDS CARD */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid rgba(30, 41, 59, 0.8)',
        borderRadius: '20px',
        padding: '24px 16px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(51, 65, 85, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
          <Sparkles size={18} />
        </div>
        <h3 style={{ color: '#E2E8F0', margin: 0, fontSize: '0.9rem', fontWeight: '700' }}>
          {labels.emptyTitle}
        </h3>
        <p style={{ color: '#64748B', fontSize: '0.775rem', margin: 0, maxWidth: '320px', lineHeight: '1.4' }}>
          {labels.emptyDesc}
        </p>
      </div>

    </div>
  );
}
