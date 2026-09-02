// src/constants/studentConstants.js

export const STUDENT_STATUS_KEYS = [
  { value: 'active', labelKey: 'status_active', defaultAr: 'نشط', defaultEn: 'Active' },
  { value: 'paused', labelKey: 'status_paused', defaultAr: 'موقوف', defaultEn: 'Paused' },
  { value: 'inactive', labelKey: 'status_inactive', defaultAr: 'غير نشط', defaultEn: 'Inactive' },
];

export const GENDER_KEYS = [
  { value: 'male', labelKey: 'gender_male', defaultAr: 'ذكر', defaultEn: 'Male' },
  { value: 'female', labelKey: 'gender_female', defaultAr: 'أنثى', defaultEn: 'Female' },
];

export const PAYMENT_PLAN_KEYS = [
  { value: 'monthly', labelKey: 'plan_monthly', defaultAr: 'اشتراك شهري', defaultEn: 'Monthly Subscription' },
  { value: 'per_hour', labelKey: 'plan_per_hour', defaultAr: 'بالساعة', defaultEn: 'Per Hour' },
  { value: 'free', labelKey: 'plan_free', defaultAr: 'مجاني / منحة', defaultEn: 'Free / Scholarship' },
];
