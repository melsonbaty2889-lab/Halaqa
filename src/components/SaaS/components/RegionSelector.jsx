// src/components/SaaS/components/RegionSelector.jsx
import React from 'react';

export default function RegionSelector({ region, setRegion, isRTL }) {
  const regions = [
    { id: 'egypt', name: isRTL ? 'جمهورية مصر العربية' : 'Egypt' },
    { id: 'gcc', name: isRTL ? 'المملكة العربية السعودية والخليج' : 'Saudi Arabia & GCC' },
    { id: 'global', name: isRTL ? 'النطاق الدولي وباقي العالم' : 'Global / International' }
  ];

  return (
    <div className="mb-8 bg-slate-900/80 p-5 rounded-2xl border border-slate-800/80">
      <label className="block text-slate-400 mb-3.5 font-bold text-center text-xs">
        {isRTL ? 'حدد النطاق الجغرافي لتفعيل بروتوكولات الدفع المتوافقة مع منطقتك:' : 'Select Region for Localized Gateways:'}
      </label>
      <div className="flex flex-wrap gap-2.5 justify-center">
        {regions.map((r) => {
          const isActive = region === r.id;
          return (
            <button 
              key={r.id} 
              onClick={() => setRegion(r.id)} 
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                isActive 
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-sm' 
                  : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700'
              }`}
            >
              {r.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
