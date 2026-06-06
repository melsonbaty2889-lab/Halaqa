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
      welcome: "Welcome to Smart Halaqa",
      dashboard: "Dashboard",
      students: "Students",
      attendance: "Attendance",
      payments: "Payments",
      settings: "Settings",
      logout: "Logout",
      loading: "Loading...",

      createAccount: "Create Teacher Account",
      fullName: "Full Name",
      email: "Email Address",
      password: "Password",
      signUp: "Sign Up",
      signIn: "Sign In",
      alreadyHaveAccount: "Already have an account?",

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
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
