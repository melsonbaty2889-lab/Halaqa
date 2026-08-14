import React from 'react';

export default function RegionSelector({ region, setRegion, isRTL }) {
  const regions = [
    { id: 'egypt', label: isRTL ? 'جمهورية مصر العربية' : 'Egypt', currency: 'EGP', flag: '🇪🇬' },
    { id: 'gcc', label: isRTL ? 'المملكة العربية السعودية والخليج' : 'Saudi Arabia & GCC', currency: 'SAR', flag: '🇸🇦' },
    { id: 'global', label: isRTL ? 'النطاق الدولي وباقي العالم' : 'Global / International', currency: 'USD', flag: '🌐' }
  ];

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 mb-8 text-center max-w-xl mx-auto shadow-2xl">
      <h3 className="text-[#E2E8F0] font-bold text-sm mb-1">
        {isRTL ? 'حدد النطاق الجغرافي للأسعار ووسائل الدفع:' : 'Select Region & Currency:'}
      </h3>
      <p className="text-[#94A3B8] text-xs mb-4">
        {isRTL ? 'سيتم تعديل العملة ووسائل الدفع المتاحة تلقائياً' : 'Currency and payment options will adjust automatically'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {regions.map((item) => {
          const isSelected = region === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setRegion(item.id)}
              className={`flex items-center justify-between sm:flex-col sm:justify-center p-3 rounded-xl font-bold text-xs transition-all duration-200 gap-2 border ${
                isSelected
                  ? 'bg-[#1E293B] border-[#D97706] text-[#F8FAFC] shadow-md shadow-[rgba(217,119,6,0.15)] ring-1 ring-[#D97706]'
                  : 'bg-[#090F16] border-[#223147] text-[#94A3B8] hover:border-[#334155] hover:text-[#CBD5E1]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{item.flag}</span>
                <span>{item.label}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                isSelected ? 'bg-[#D97706] text-white' : 'bg-[#1E293B] text-[#94A3B8]'
              }`}>
                {item.currency}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
