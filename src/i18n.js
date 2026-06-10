import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ar: {
    translation: {
      // عام
      welcome: "مرحباً بك في الحلقة الذكية",
      dashboard: "لوحة التحكم",
      students: "الطلاب",
      attendance: "الحضور والغياب",
      payments: "المدفوعات",
      settings: "الإعدادات",
      logout: "تسجيل الخروج",
      loading: "جاري التحميل...",
      save: "حفظ",
      
      // إضافات لوحة التحكم الذكية
      total_students: "إجمالي الطلاب",
      attendance_rate: "معدل الحضور",
      pending_payments: "مدفوعات معلقة",
      smart_alerts: "تنبيهات ذكية",
      pending_payments_alert: "يوجد طلاب لديهم دفعات متأخرة",
      review_now: "راجع السجل الآن",
      no_alerts: "لا توجد تنبيهات حالية، كل شيء يسير بشكل جيد!",

      // الحضور والمدفوعات
      present: "حاضر",
      absent: "غائب",
      notes: "ملاحظات...",
      save_attendance: "حفظ الكشف",
      total_collection: "إجمالي التحصيل",
      mark_paid: "قبض",
      mark_unpaid: "إلغاء",
      send_whatsapp: "واتساب 💬",
      paid: "مسدد",
      unpaid: "معلّق",

      // SignUp & Login
      createAccount: "إنشاء حساب معلم",
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      signUp: "إنشاء حساب",
      signIn: "تسجيل الدخول",
      alreadyHaveAccount: "لديك حساب بالفعل؟",

      // Error Messages
      errorLoading: "حدث خطأ أثناء تحميل البيانات",
      noStaffRecord: "لم يتم العثور على حسابك في جدول المعلمين",
    }
  },
  en: {
    translation: {
      // General
      welcome: "Welcome to Smart Halaqa",
      dashboard: "Dashboard",
      students: "Students",
      attendance: "Attendance",
      payments: "Payments",
      settings: "Settings",
      logout: "Logout",
      loading: "Loading...",
      save: "Save",

      // Smart Dashboard Additions
      total_students: "Total Students",
      attendance_rate: "Attendance Rate",
      pending_payments: "Pending Payments",
      smart_alerts: "Smart Alerts",
      pending_payments_alert: "There are students with pending payments",
      review_now: "Review now",
      no_alerts: "No current alerts, everything is running smoothly!",

      // Attendance & Payments
      present: "Present",
      absent: "Absent",
      notes: "Notes...",
      save_attendance: "Save Attendance",
      total_collection: "Total Collection",
      mark_paid: "Pay",
      mark_unpaid: "Cancel",
      send_whatsapp: "WhatsApp 💬",
      paid: "Paid",
      unpaid: "Pending",

      // SignUp & Login
      createAccount: "Create Teacher Account",
      fullName: "Full Name",
      email: "Email Address",
      password: "Password",
      signUp: "Sign Up",
      signIn: "Sign In",
      alreadyHaveAccount: "Already have an account?",

      // Error Messages
      errorLoading: "Error loading data",
      noStaffRecord: "No staff record found for your account",
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

export default i18n;
