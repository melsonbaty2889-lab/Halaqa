// src/utils/subscriptionUtils.js

/**
 * دالة موحدة لاستخراج وحساب حالة الاشتراك بناءً على بيانات المنظومة الحقيقية
 */
export function getAcademySubscriptionInfo(academy, t = (k) => k) {
  if (!academy) {
    return {
      isTrial: true,
      planTier: 'monthly',
      statusText: t('subscription.status.trial') || 'تجريبي',
      expiryDate: null,
      daysLeft: 0
    };
  }

  const rawSub = academy?.saas_subscriptions;
  const sub = Array.isArray(rawSub) ? rawSub[0] : rawSub;

  const isSubActive = sub && sub.status === 'active';
  const now = new Date();

  // تحديد تاريخ الانتهاء (حسابه بدقة وإهمال التداخلات القديمة)
  const targetExpiry = isSubActive
    ? sub?.expires_at
    : (sub?.trial_ends_at || academy?.trial_ends_at);

  // حساب الأيام المتبقية
  let daysLeft = 0;
  if (targetExpiry) {
    const diff = new Date(targetExpiry).getTime() - now.getTime();
    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // تحديد نص الحالة والمسمى بناءً على نوع الاشتراك والمدة
  let statusText = t('subscription.status.trial') || 'تجريبي';
  
  if (isSubActive) {
    if (sub?.plan_duration === 'yearly' || sub?.plan_tier === 'yearly') {
      statusText = t('subscription.plans.yearly.title') || 'الاستقرار الأكاديمي (سنوي)';
    } else {
      statusText = t('subscription.plans.monthly.title') || 'الوصول المرن (شهري)';
    }
  }

  return {
    isTrial: !isSubActive,
    planTier: sub?.plan_tier || 'monthly',
    planDuration: sub?.plan_duration || 'monthly',
    statusText,
    expiryDate: targetExpiry,
    daysLeft
  };
}
