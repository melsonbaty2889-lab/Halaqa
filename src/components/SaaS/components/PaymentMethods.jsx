import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ShieldCheck, Copy, Check } from 'lucide-react';
import { useAcademy } from '@/context/AcademyContext';
import { UI } from '@/theme/styles';
import { getText } from '@/utils/textUtils';

// 💳 قائمة وسائل الدفع الشاملة مع تحديد العملات المدعومة لكل وسيلة
const ALL_PAYMENT_GATEWAYS = [
  // 1. وسائل عالمية - متاحة لجميع العملات والدول
  {
    id: 'global_cards',
    nameKey: 'payment.global_cards',
    defaultName: 'بطاقات ائتمان (Visa / MasterCard)',
    logos: ['/logos/visa.svg', '/logos/mastercard.svg'],
    type: 'card',
    currencies: ['EGP', 'SAR', 'USD']
  },

  // 2. وسائل إقليمية ومحلية للخليج والسعودية
  {
    id: 'apple_pay',
    nameKey: 'payment.apple_pay',
    defaultName: 'Apple Pay',
    logo: '/logos/applepay.svg',
    type: 'instant',
    badgeKey: 'payment.badge_fastest',
    defaultBadge: 'الأسرع ⚡',
    currencies: ['SAR', 'USD']
  },
  {
    id: 'mada',
    nameKey: 'payment.mada',
    defaultName: 'بطاقات مدى (Mada)',
    logo: '/logos/mada.svg',
    type: 'card',
    currencies: ['SAR']
  },
  {
    id: 'stc',
    nameKey: 'payment.stc',
    defaultName: 'STC Pay / المحافظ الخليجية',
    logo: '/logos/stc_pay.svg',
    type: 'wallet',
    currencies: ['SAR', 'USD']
  },
  {
    id: 'iban_gcc',
    nameKey: 'payment.iban',
    defaultName: 'تحويل بنكي مباشر (IBAN)',
    logo: '/logos/bank.svg',
    type: 'bank',
    accountNumber: 'SA8200000012345678901234',
    accountName: 'الحلقة الذكية - حساب الخليج',
    currencies: ['SAR', 'USD']
  },

  // 3. وسائل محلية لمصر
  {
    id: 'instapay',
    nameKey: 'payment.instapay',
    defaultName: 'أنستا باي (InstaPay)',
    logo: '/logos/instapay.svg',
    type: 'instant',
    accountNumber: 'username@instapay',
    accountName: 'الحلقة الذكية - Smart Halaqa',
    badgeKey: 'payment.badge_fast',
    defaultBadge: 'الأسرع بمصر ⚡',
    currencies: ['EGP']
  },
  {
    id: 'vodafone',
    nameKey: 'payment.vodafone',
    defaultName: 'فودافون كاش والمحافظ الذكية',
    logo: '/logos/vodafone.png',
    type: 'wallet',
    accountNumber: '01012345678',
    accountName: 'محفظة فودافون كاش',
    currencies: ['EGP']
  },
  {
    id: 'fawry',
    nameKey: 'payment.fawry',
    defaultName: 'فوري Pay',
    logo: '/logos/fawry.svg',
    type: 'kiosk',
    accountNumber: '987654321',
    accountName: 'رقم الخدمة الموحد',
    currencies: ['EGP']
  },

  // 4. وسائل عالمية إضافية للدولار
  {
    id: 'paypal',
    nameKey: 'payment.paypal',
    defaultName: 'PayPal',
    logo: '/logos/paypal.svg',
    type: 'instant',
    currencies: ['USD']
  }
];

export default function PaymentMethods({ region = 'EGP', onSelectPayment }) {
  const { t } = useAcademy();

  // 1. توحيد رمز العملة والمنطقة
  const normalizedCurrency = useMemo(() => {
    const curr = String(region || '').toUpperCase();
    if (curr === 'EGYPT' || curr === 'EGP') return 'EGP';
    if (curr === 'GCC' || curr === 'SAR') return 'SAR';
    return 'USD';
  }, [region]);

  // 2. تصفية وسائل الدفع بحسب مرونة العملات المتاحة
  const availableGateways = useMemo(() => {
    return ALL_PAYMENT_GATEWAYS.filter(gateway => 
      gateway.currencies.includes(normalizedCurrency)
    );
  }, [normalizedCurrency]);

  const [selectedGatewayId, setSelectedGatewayId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // 3. تحديث خيار الدفع المباشر عند تغيير العملة
  useEffect(() => {
    if (availableGateways.length > 0) {
      const defaultGateway = availableGateways[0];
      setSelectedGatewayId(defaultGateway.id);
      if (typeof onSelectPayment === 'function') {
        onSelectPayment(defaultGateway);
      }
    }
  }, [normalizedCurrency, availableGateways]);

  const activeGateway = useMemo(() => {
    return availableGateways.find(g => g.id === selectedGatewayId) || availableGateways[0];
  }, [availableGateways, selectedGatewayId]);

  const handleSelectGateway = useCallback((gateway) => {
    setSelectedGatewayId(gateway.id);
    if (typeof onSelectPayment === 'function') {
      onSelectPayment(gateway);
    }
  }, [onSelectPayment]);

  // 4. دالة نسخ آمنة ومحمية
  const handleCopy = useCallback(async (text, id) => {
    if (!text) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, []);

  return (
    <div className="w-full space-y-5 font-cairo">
      <div className="text-center space-y-1">
        <h3 className={`${UI.title} text-lg sm:text-xl font-bold m-0`}>
          {getText(t, 'payment.title', 'اختر طريقة الدفع المناسبة')}
        </h3>
        <p className={`${UI.subtitle} text-xs sm:text-sm m-0`}>
          {getText(t, 'payment.subtitle', 'معاملات فورية ومشفرة بأعلى معايير الأمان')}
        </p>
      </div>

      {/* شبكة بوابات الدفع الديناميكية */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {availableGateways.map((gateway) => {
          const isSelected = activeGateway?.id === gateway.id;
          const gatewayTitle = getText(t, gateway.nameKey, gateway.defaultName);

          return (
            <button
              key={gateway.id}
              type="button"
              onClick={() => handleSelectGateway(gateway)}
              aria-pressed={isSelected}
              aria-label={gatewayTitle}
              title={gatewayTitle}
              className={`relative flex flex-col items-center justify-center gap-2 p-3 min-h-[85px] rounded-xl cursor-pointer transition-all duration-200 border ${
                isSelected 
                  ? 'bg-semantic-bgMain border-semantic-actionPrimary shadow-lg shadow-emerald-500/10 ring-2 ring-semantic-actionPrimary' 
                  : 'bg-semantic-bgCard/40 border-semantic-borderCard hover:border-semantic-borderInput opacity-80 hover:opacity-100'
              }`}
            >
              {gateway.badgeKey && (
                <span className="absolute -top-2.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-semantic-actionPrimary text-semantic-bgMain shadow-sm">
                  {getText(t, gateway.badgeKey, gateway.defaultBadge)}
                </span>
              )}

              {gateway.logos ? (
                <div className="flex items-center gap-1.5">
                  {gateway.logos.map((logoPath, idx) => (
                    <img key={idx} src={logoPath} alt="gateway logo" className="h-5 object-contain" />
                  ))}
                </div>
              ) : (
                <img src={gateway.logo} alt={gatewayTitle} className="h-7 max-w-[80px] object-contain" />
              )}

              <span className={`text-xs text-center leading-tight ${
                isSelected 
                  ? 'font-bold text-semantic-actionPrimary' 
                  : 'font-semibold text-semantic-textSecondary'
              }`}>
                {gatewayTitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* تفاصيل بيانات التحويل للوسيلة المختارة */}
      {activeGateway && (activeGateway.accountNumber || activeGateway.accountName) && (
        <div className="bg-semantic-bgMain border border-semantic-borderCard rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-semantic-textSecondary">
              {getText(t, 'payment.details_for', 'بيانات التحويل لـ:')} <strong className="text-semantic-textPrimary">{getText(t, activeGateway.nameKey, activeGateway.defaultName)}</strong>
            </span>
            <ShieldCheck size={18} className="text-semantic-success" />
          </div>

          {activeGateway.accountNumber && (
            <div className="flex items-center justify-between bg-semantic-bgCard border border-semantic-borderInput px-3.5 py-2.5 rounded-lg">
              <span className="font-mono text-sm sm:text-base font-bold text-semantic-actionPrimary tracking-wider dir-ltr select-all">
                {activeGateway.accountNumber}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(activeGateway.accountNumber, 'num')}
                aria-label={getText(t, 'common.copy', 'نسخ')}
                title={getText(t, 'common.copy', 'نسخ')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-semantic-textSecondary hover:text-semantic-textPrimary transition-colors bg-semantic-bgMain rounded-md border border-semantic-borderCard cursor-pointer"
              >
                {copiedId === 'num' ? <Check size={14} className="text-semantic-success" /> : <Copy size={14} />}
                <span>{copiedId === 'num' ? getText(t, 'common.copied', 'تم النسخ') : getText(t, 'common.copy', 'نسخ')}</span>
              </button>
            </div>
          )}

          {activeGateway.accountName && (
            <div className="text-xs text-semantic-textSecondary">
              {getText(t, 'payment.account_name_label', 'اسم الحساب:')} <strong className="text-semantic-textPrimary">{activeGateway.accountName}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
