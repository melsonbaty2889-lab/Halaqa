import React, { useState, useCallback, useMemo } from 'react';
import { 
  CreditCard, Smartphone, ShieldCheck, Copy, 
  Check, ArrowRight, ExternalLink, HelpCircle 
} from 'lucide-react';
import { useAcademy } from '@/context/AcademyContext';
import rawColors from '@/theme/colors.js';
import { getText } from '@/utils/textUtils';

// 🎨 كائن الألوان الموحد - بدون قيم صلبة بداخل المكون
const C = {
  ...rawColors,
  dark: {
    main: rawColors?.dark?.bg,
    card: rawColors?.dark?.card,
    border: rawColors?.dark?.cardBorder,
    surface: rawColors?.dark?.surface,
  },
  amber: {
    DEFAULT: rawColors?.amber?.DEFAULT,
    buttonStart: rawColors?.amber?.buttonStart,
    buttonEnd: rawColors?.amber?.buttonEnd,
    glow: rawColors?.amber?.buttonGlow,
    selectedBg: rawColors?.amber?.glowFocus,
  },
  emerald: {
    DEFAULT: rawColors?.emerald?.DEFAULT,
    glow: rawColors?.emerald?.logoGlow,
  },
  text: {
    title: rawColors?.text?.title,
    subtitle: rawColors?.text?.subtitle,
    body: rawColors?.text?.body,
    muted: rawColors?.text?.muted,
  },
  inputs: {
    bg: rawColors?.inputs?.bg,
    border: rawColors?.inputs?.border,
  }
};

// 💳 قائمة بوابات الدفع المستخرجة من مجلد /public/logos/
const PAYMENT_GATEWAYS = [
  {
    id: 'instapay',
    nameKey: 'payment.instapay',
    defaultName: 'أنستا باي',
    logo: '/logos/instapay.svg',
    type: 'instant',
    accountNumber: '01012345678',
    accountName: 'الحلقة الذكية - Smart Halaqa',
    badgeKey: 'payment.badge_fast',
    defaultBadge: 'الأسرع بمصر ⚡'
  },
  {
    id: 'vodafone',
    nameKey: 'payment.vodafone',
    defaultName: 'فودافون كاش',
    logo: '/logos/vodafone.png',
    type: 'wallet',
    accountNumber: '01000000000',
    accountName: 'محفظة فودافون كاش'
  },
  {
    id: 'fawry',
    nameKey: 'payment.fawry',
    defaultName: 'فوري',
    logo: '/logos/fawry.svg',
    type: 'kiosk',
    code: '99887766',
    accountName: 'رقم الخدمة الموحد'
  },
  {
    id: 'cards',
    nameKey: 'payment.cards',
    defaultName: 'بطاقة ائتمان / ميزة',
    logos: ['/logos/visa.svg', '/logos/mastercard.svg', '/logos/meeza.svg'],
    type: 'card'
  },
  {
    id: 'stc',
    nameKey: 'payment.stc',
    defaultName: 'مدى / STC Pay',
    logos: ['/logos/mada.svg', '/logos/stc_pay.svg'],
    type: 'gulf',
    accountNumber: 'SA9880000000000000000000'
  },
  {
    id: 'usdt',
    nameKey: 'payment.usdt',
    defaultName: 'عملات رقمية (TRC20)',
    logo: '/logos/usdt.svg',
    type: 'crypto',
    accountNumber: 'T9x...H8kL9sWq2zM'
  }
];

export default function PaymentMethods({ onSelectPayment, selectedAmount = 0 }) {
  const { t } = useAcademy();
  const [selectedGateway, setSelectedGateway] = useState('instapay');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = useCallback((text, id) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const activeGateway = useMemo(() => {
    return PAYMENT_GATEWAYS.find(g => g.id === selectedGateway) || PAYMENT_GATEWAYS[0];
  }, [selectedGateway]);

  return (
    <div style={{
      width: '100%',
      maxWidth: '680px',
      marginInline: 'auto',
      background: C.dark?.card,
      border: `1px solid ${C.dark?.border}`,
      borderRadius: '20px',
      padding: '28px',
      boxShadow: `0 20px 40px ${C.dark?.surface}`,
      fontFamily: "'Cairo', system-ui, sans-serif"
    }}>
      {/* 🟢 العنوان الرئيسي */}
      <div style={{ textAlign: 'center', marginBlockEnd: '24px' }}>
        <h3 style={{ color: C.text?.title, fontSize: '1.25rem', fontWeight: 'bold', marginBlockEnd: '6px' }}>
          {getText(t, 'payment.title', 'اختر طريقة الدفع المناسبة')}
        </h3>
        <p style={{ color: C.text?.muted, fontSize: '0.875rem', margin: 0 }}>
          {getText(t, 'payment.subtitle', 'معاملات فورية ومشفرة بأعلى معايير الأمان')}
        </p>
      </div>

      {/* 💳 شبكة وسائل الدفع */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBlockEnd: '24px'
      }}>
        {PAYMENT_GATEWAYS.map((gateway) => {
          const isSelected = selectedGateway === gateway.id;
          const gatewayTitle = getText(t, gateway.nameKey, gateway.defaultName);

          return (
            <button
              key={gateway.id}
              onClick={() => setSelectedGateway(gateway.id)}
              aria-label={gatewayTitle}
              title={gatewayTitle}
              style={{
                background: isSelected ? C.amber?.selectedBg : C.inputs?.bg,
                border: `1.5px solid ${isSelected ? C.amber?.DEFAULT : C.inputs?.border}`,
                borderRadius: '12px',
                padding: '12px',
                minHeight: '80px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              {gateway.badgeKey && (
                <span style={{
                  position: 'absolute',
                  insetBlockStart: '-8px',
                  fontSize: '0.65rem',
                  background: C.amber?.DEFAULT,
                  color: C.text?.title,
                  paddingBlock: '2px',
                  paddingInline: '6px',
                  borderRadius: '10px',
                  fontWeight: 'bold'
                }}>
                  {getText(t, gateway.badgeKey, gateway.defaultBadge)}
                </span>
              )}

              {/* الشعارات المجمعة أو الشعار الفردي */}
              {gateway.logos ? (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {gateway.logos.map((logoPath, idx) => (
                    <img key={idx} src={logoPath} alt="payment gateway" style={{ height: '20px', objectFit: 'contain' }} />
                  ))}
                </div>
              ) : (
                <img src={gateway.logo} alt={gatewayTitle} style={{ height: '28px', maxWidth: '80px', objectFit: 'contain' }} />
              )}

              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: isSelected ? 'bold' : 'normal',
                color: isSelected ? C.amber?.DEFAULT : C.text?.body 
              }}>
                {gatewayTitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* 📝 تفاصيل الخيار المحدد */}
      {activeGateway && (
        <div style={{
          background: C.dark?.surface,
          border: `1px solid ${C.dark?.border}`,
          borderRadius: '14px',
          padding: '18px',
          marginBlockEnd: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: C.text?.muted }}>
              {getText(t, 'payment.details_for', 'بيانات التحويل لـ:')} <strong style={{ color: C.text?.title }}>{getText(t, activeGateway.nameKey, activeGateway.defaultName)}</strong>
            </span>
            <ShieldCheck size={18} style={{ color: C.emerald?.DEFAULT }} />
          </div>

          {activeGateway.accountNumber && (
            <div style={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              background: C.inputs?.bg,
              paddingBlock: '10px',
              paddingInline: '14px',
              borderRadius: '8px',
              border: `1px solid ${C.inputs?.border}`,
              marginBlockEnd: '8px'
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: '1rem', color: C.amber?.DEFAULT, fontWeight: 'bold' }}>
                {activeGateway.accountNumber}
              </span>
              <button
                onClick={() => handleCopy(activeGateway.accountNumber, 'num')}
                aria-label={getText(t, 'common.copy', 'نسخ')}
                title={getText(t, 'common.copy', 'نسخ')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: C.text?.muted,
                  cursor: 'pointer',
                  minHeight: '44px',
                  paddingInline: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem'
                }}
              >
                {copiedId === 'num' ? <Check size={14} style={{ color: C.emerald?.DEFAULT }} /> : <Copy size={14} />}
                {copiedId === 'num' ? getText(t, 'common.copied', 'تم النسخ') : getText(t, 'common.copy', 'نسخ')}
              </button>
            </div>
          )}

          {activeGateway.accountName && (
            <div style={{ fontSize: '0.8rem', color: C.text?.muted }}>
              {getText(t, 'payment.account_name_label', 'اسم الحساب:')} <strong style={{ color: C.text?.body }}>{activeGateway.accountName}</strong>
            </div>
          )}
        </div>
      )}

      {/* 🚀 زر التأكيد والمتابعة */}
      <button
        onClick={() => onSelectPayment && onSelectPayment(activeGateway)}
        aria-label={getText(t, 'payment.confirm_btn', 'متابعة عملية الدفع')}
        title={getText(t, 'payment.confirm_btn', 'متابعة عملية الدفع')}
        style={{
          width: '100%',
          padding: '14px',
          minHeight: '48px',
          background: C.gradients?.primaryBtn || `linear-gradient(180deg, ${C.amber?.buttonStart} 0%, ${C.amber?.buttonEnd} 100%)`,
          color: C.text?.title,
          border: 'none',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '0.95rem',
          cursor: 'pointer',
          boxShadow: `0 4px 15px ${C.amber?.glow}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <span>{getText(t, 'payment.confirm_btn', 'متابعة عملية الدفع')}</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
