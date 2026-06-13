import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ar: {
    translation: {
      // 1. مفاهيم عامة ونظام الملاحة
      welcome: "مرحباً بك في الحلقة الذكية",
      dashboard: "لوحة التحكم",
      students: "إدارة الطلاب",
      attendance: "سجل الحضور والغياب",
      payments: "الاشتراكات والمالية",
      settings: "الإعدادات العامة",
      logout: "تسجيل الخروج",
      loading: "جاري تحميل البيانات...",
      save: "حفظ التغييرات",
      actions: "الإجراءات",
      
      // 2. إحصائيات وتنبيهات لوحة التحكم (Dashboard)
      total_students: "إجمالي الطلاب المسجلين",
      attendance_rate: "معدل الحضور العام",
      pending_payments: "المستحقات المعلقة",
      smart_alerts: "التنبيهات الذكية",
      pending_payments_alert: "تنبيه: توجد اشتراكات مستحقة لم يتم سدادها بعد",
      review_now: "مراجعة السجل الآن",
      no_alerts: "لا توجد تنبيهات حالية، النظام مستقر تماماً!",

      // 3. حالات الحضور المتقدمة (Attendance Status)
      present: "حاضر",
      absent: "غائب",
      late: "متأخر",
      excused: "غائب بعذر",
      notes: "إضافة ملاحظات أو توجيهات...",
      save_attendance: "اعتماد وحفظ الكشف",

      // 4. الإدارة المالية الاحترافية (Professional Finance)
      total_collection: "إجمالي الإيرادات المحصلة",
      mark_paid: "تأكيد الدفع",
      mark_unpaid: "إلغاء السداد",
      send_whatsapp: "إرسال إشعار (واتساب) 💬",
      paid: "مدفوع",
      unpaid: "غير مدفوع",
      due_date: "تاريخ الاستحقاق",

      // 5. متابعة الأداء القرآني والتعليمي (Halaqa Academic Progress)
      memorization: "الحفظ الجديد",
      revision: "المراجعة (الماضي)",
      daily_grade: "تقييم اليوم",
      excellent: "ممتاز",
      good: "جيد",
      needs_improvement: "يحتاج إلى تركيز",

      // 6. شاشات تسجيل الدخول والاشتراك (Authentication)
      createAccount: "إنشاء حساب معلم/مشرف",
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      signUp: "تسجيل حساب جديد",
      signIn: "تسجيل الدخول",
      alreadyHaveAccount: "لديك حساب بالفعل؟",

      // 7. رسائل الخطأ والتحقق الاحترافية (Validation & Errors)
      errorLoading: "عذراً، فشل تحميل البيانات من الخادم",
      noStaffRecord: "هذا الحساب غير مسجل في نظام المعلمين",
      fieldRequired: "هذا الحقل مطلوب ولا يمكن تركه فارغاً",
      invalidEmail: "يرجى إدخال بريد إلكتروني صحيح",
      passwordTooShort: "كلمة المرور يجب ألا تقل عن 6 رموز",
    }
  },
  en: {
    translation: {
      // 1. General & Navigation
      welcome: "Welcome to Smart Halaqa",
      dashboard: "Dashboard",
      students: "Student Management",
      attendance: "Attendance Records",
      payments: "Subscriptions & Finance",
      settings: "General Settings",
      logout: "Log Out",
      loading: "Loading data...",
      save: "Save Changes",
      actions: "Actions",

      // 2. Dashboard Analytics & Alerts
      total_students: "Total Registered Students",
      attendance_rate: "Overall Attendance Rate",
      pending_payments: "Pending Receivables",
      smart_alerts: "Smart Alerts",
      pending_payments_alert: "Alert: There are due subscriptions pending payment",
      review_now: "Review records now",
      no_alerts: "No current alerts, everything is running smoothly!",

      // 3. Advanced Attendance Status
      present: "Present",
      absent: "Absent",
      late: "Late",
      excused: "Excused",
      notes: "Add notes or feedback...",
      save_attendance: "Approve & Save Attendance",

      // 4. Professional Finance
      total_collection: "Total Revenue Collected",
      mark_paid: "Confirm Payment",
      mark_unpaid: "Cancel Payment",
      send_whatsapp: "Send Notification (WhatsApp) 💬",
      paid: "Paid",
      unpaid: "Unpaid",
      due_date: "Due Date",

      // 5. Halaqa Academic Progress
      memorization: "New Memorization",
      revision: "Review (Past)",
      daily_grade: "Daily Grade",
      excellent: "Excellent",
      good: "Good",
      needs_improvement: "Needs Improvement",

      // 6. Authentication
      createAccount: "Create Teacher/Admin Account",
      fullName: "Full Name",
      email: "Email Address",
      password: "Password",
      signUp: "Register New Account",
      signIn: "Sign In",
      alreadyHaveAccount: "Already have an account?",

      // 7. Validation & Errors
      errorLoading: "Sorry, failed to load data from the server",
      noStaffRecord: "This account is not registered in the teachers system",
      fieldRequired: "This field is required",
      invalidEmail: "Please enter a valid email address",
      passwordTooShort: "Password must be at least 6 characters long",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en'],
    react: { useSuspense: false },
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// تغيير اتجاه واجهة المستخدم تلقائياً تبعاً للغة المحددة
i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;
