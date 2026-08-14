// src/components/SaaS/components/SubscriptionStatus.jsx
import React from 'react';

export default function SubscriptionStatus({ status, isRTL }) {
  if (status !== 'pending_verification') return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-5 mb-8 text-center backdrop-blur-sm">
      <h3 className="text-amber-400 font-extrabold text-base mb-1.5">
        {isRTL ? 'طلب الاشتراك قيد المراجعة والتحقق' : 'Subscription Request Pending Review'}
      </h3>
      <p className="text-slate-300 text-xs leading-relaxed m-0">
        {isRTL 
          ? 'تم استلام إيصال التحويل الخاص بك بنجاح، ويقوم فريق الإدارة بمراجعته الآن. سيتم تفعيل ترخيص المنظومة فور الاعتماد.' 
          : 'Your receipt has been received and is being verified by admin. Your account will be activated automatically once approved.'}
      </p>
    </div>
  );
}
