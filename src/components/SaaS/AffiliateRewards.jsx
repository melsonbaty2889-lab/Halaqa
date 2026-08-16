import React, { useState } from 'react';
import { 
  Gift, Copy, Check, Share2, Users, Award, 
  Clock, DollarSign, HelpCircle, ArrowUpRight 
} from 'lucide-react';
import { colors as C } from '@/theme/colors.js';

export default function AffiliateRewards({ referralCode = "E766D3D4", currency = "SAR" }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const referralLink = `https://halaqa.vercel.app/signup?ref=${referralCode}`;

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
    const text = encodeURIComponent(`انضم إلى منصة إدارة المقارئ والحلقات الذكية عبر الرابط التالي واحصل على مزايا خاصة:\n${referralLink}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', direction: 'rtl', fontFamily: "'Cairo', system-ui, sans-serif" }}>
      
      {/* 1. Hero Card / Promo Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.dark.card} 0%, ${C.dark.surface} 100%)`,
        border: `1px solid ${C.dark.border}`,
        borderRadius: '20px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: C.brandEmerald?.DEFAULT || '#10B981', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '12px' }}>
              <Gift size={14} /> برنامج الشركاء والإحالة
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: C.text.title, margin: '0 0 8px 0' }}>
              شارِك المنظومة واكسب مكافآت ورصيد مجاني
            </h2>
            <p style={{ color: C.text.muted, fontSize: '0.9rem', margin: '0 0 20px 0', lineHeight: '1.6' }}>
              انشر رابط الإحالة الخاص بك للأكاديميات والمقارئ القرآنية، واحصل على رصيد مجاني وعمولات فورية مع كل اشتراك جديد.
            </p>
          </div>
        </div>

        {/* Link & Code Controls */}
        <div style={{
          background: C.dark.main,
          border: `1px solid ${C.dark.border}`,
          borderRadius: '14px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <span style={{ fontSize: '0.8rem', color: C.text.muted, fontWeight: 'bold' }}>رابط الإحالة المباشر الخاص بك:</span>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Display Link input */}
            <div style={{
              flex: 1,
              minWidth: '200px',
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
              {copiedLink ? 'تم النسخ' : 'نسخ الرابط'}
            </button>

            <button
              onClick={handleShareWhatsApp}
              style={{
                padding: '10px 16px',
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
              <Share2 size={16} /> واتساب
            </button>
          </div>
        </div>
      </div>

      {/* 2. Steps Guide */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {[
          { step: '1', title: 'شارك الرابط', desc: 'أرسل الرابط أو كود الإحالة لزملائك وإدارات المقارئ' },
          { step: '2', title: 'تسجيل الأكاديمية', desc: 'تقوم الأكاديمية بإنشاء حسابها والاشتراك بالمنظومة' },
          { step: '3', title: 'كسب المكافأة', desc: 'ينزل الرصيد والمكافأة المباشرة في حسابك تلقائياً' }
        ].map((item, idx) => (
          <div key={idx} style={{ background: C.dark.card, border: `1px solid ${C.dark.border}`, padding: '14px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: C.brandEmerald?.bgGlow || 'rgba(16,185,129,0.1)', color: C.primary.DEFAULT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {item.step}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: C.text.title }}>{item.title}</div>
              <div style={{ fontSize: '0.75rem', color: C.text.muted }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {[
          { label: 'إجمالي الإحالات', val: '0', icon: Users, color: '#3B82F6' },
          { label: 'أكاديميات مشتركة', val: '0', icon: Award, color: '#10B981' },
          { label: 'مكافآت معلقة', val: `0 ${currency}`, icon: Clock, color: '#F59E0B' },
          { label: 'إجمالي المكتسب', val: `0 ${currency}`, icon: DollarSign, color: '#8B5CF6' }
        ].map((m, i) => (
          <div key={i} style={{ background: C.dark.card, border: `1px solid ${C.dark.border}`, borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: C.text.muted, marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: C.text.title }}>{m.val}</div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${m.color}15`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <m.icon size={22} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
