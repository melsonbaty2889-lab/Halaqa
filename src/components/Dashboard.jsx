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
    // إضافة هذا الجزء للتعامل الأفضل مع النصوص التي تحتوي على HTML
    react: {
      useSuspense: false, 
    },
    interpolation: {
      escapeValue: false, 
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
