/* src/i18n.js */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ar: {
    translation: {
      // 1. مفاهيم عامة ونظام الملاحة
      welcome: "مرحباً بك في الحلقة الذكية",
      welcome_back: "مرحباً بك مجدداً 👋",
      dashboard: "لوحة التحكم",
      students: "إدارة الطلاب",
      attendance: "سجل الحضور والغياب",
      payments: "الاشتراكات والمالية",
      settings: "الإعدادات العامة",
      logout: "تسجيل الخروج",
      loading: "جاري تحميل البيانات...",
      save: "حفظ التغييرات",
      actions: "الإجراءات",
      cancel: "إلغاء",
      
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
      forgotPassword: "استعادة كلمة المرور",
      sendResetLink: "إرسال رابط الحماية",
      checkYourEmail: "برجاء مراجعة بريدك الإلكتروني لتفعيل الرابط",
      backToLogin: "العودة لتسجيل الدخول",
      enterEmailParagraph: "أدخل بريدك الإلكتروني المسجل لإرسال رابط آمن لإعادة تعيين كلمة السر.",
      sendingStatus: "جاري الإرسال...",

      // 7. رسائل الخطأ والتحقق الاحترافية (Validation & Errors)
      errorLoading: "عذراً، فشل تحميل البيانات من الخادم",
      noStaffRecord: "هذا الحساب غير مسجل في نظام المعلمين",
      fieldRequired: "هذا الحقل مطلوب ولا يمكن تركه فارغاً",
      invalidEmail: "يرجى إدخال بريد إلكتروني صحيح",
      passwordTooShort: "كلمة المرور يجب ألا تقل عن 6 رموز",

      // 8. مفاتيح إدارة الطلاب ونموذج التسجيل المطور
      students_management_title: "إدارة الطلاب والشؤون التعليمية",
      add_new_student: "إضافة طالب جديد",
      registration_data_title: "بيانات التسجيل الأساسية والقرآنية",
      student_name_label: "اسم الطالب الثنائي أو الثلاثي *",
      student_name_placeholder: "أدخل اسم الطالب الكامل",
      gender_label: "الجنس",
      male: "ذكر",
      female: "أنثى",
      current_surah_label: "السورة أو الجزء الحالي (الورد)",
      current_surah_placeholder: "مثال: سورة البقرة / جزء عمّ",
      parent_name_label: "اسم ولي الأمر (اختياري)",
      parent_name_placeholder: "أدخل اسم الوالد أو ولي الأمر",
      contact_phone_label: "رقم هاتف التواصل",
      phone_placeholder: "مثال: 05xxxxxxxx",
      teacher_notes_label: "ملاحظات المعلم التوجيهية",
      notes_placeholder: "اكتب أي ملاحظات تخص خطة حفظ الطالب أو حالته الحالية هنا...",
      saving_progress: "جاري الحفظ والتسجيل...",
      confirm_add_student: "تأكيد إضافة الطالب في الحلقة",
      search_placeholder: "ابحث عن طالب بالاسم، الهاتف، أو السورة الحالية...",
      no_search_results: "لم يتم العثور على نتائج تطابق بحثك.",
      no_students_registered: "لا يوجد طلاب مسجلين حالياً.",
      parent_prefix: "ولي الأمر:",
      memorization_prefix: "الحفظ:",
      not_specified_yet: "لم يحدد بعد",
      click_to_update_surah: "اضغط للتحديث السريع للسورة",
      status_active: "نشط",
      status_inactive: "متوقف",
      error_no_academy_id: "خطأ: لم يتم تحديد معرف الأكاديمية.",
      error_enter_student_name: "يرجى إدخال اسم الطالب أولاً",
      student_added_success: "تم تسجيل الطالب بنجاح واحترافية! 🎉",
      student_added_failed: "فشل التسجيل:",
      error_updating_surah: "تعذر تحديث السورة الحالية",

      // 🌟 9. التحديثات العالمية المضافة حديثاً لأقسام الأكاديمية (SaaS Features)
      quick_actions: "الإجراءات السريعة للحلقة",
      academy_overview: "التقرير العام للأكاديمية",
      action_attendance: "رصد الحضور والتسميع",
      action_exams: "اختبارات الأجزاء والسور",
      action_reports: "تقارير أولياء الأمور",
      action_payments: "تحصيل الرسوم والاشتراكات",
      active_halagas: "الحلقات النشطة اليوم",
      completed_exams: "اختبارات الأجزاء الناجحة"
    }
  },
  en: {
    translation: {
      // 1. General & Navigation
      welcome: "Welcome to Smart Halaqa",
      welcome_back: "Welcome Back 👋",
      dashboard: "Dashboard",
      students: "Student Management",
      attendance: "Attendance Records",
      payments: "Subscriptions & Finance",
      settings: "General Settings",
      logout: "Log Out",
      loading: "Loading data...",
      save: "Save Changes",
      actions: "Actions",
      cancel: "Cancel",

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
      forgotPassword: "Forgot Password",
      sendResetLink: "Send Reset Link",
      checkYourEmail: "Please check your email for the reset link",
      backToLogin: "Back to Login",
      enterEmailParagraph: "Enter your registered email to receive a secure password reset link.",
      sendingStatus: "Sending...",

      // 7. Validation & Errors
      errorLoading: "Sorry, failed to load data from the server",
      noStaffRecord: "This account is not registered in the teachers system",
      fieldRequired: "This field is required",
      invalidEmail: "Please enter a valid email address",
      passwordTooShort: "Password must be at least 6 characters long",

      // 8. Student Management Forms & Details
      students_management_title: "Students Management & Academic Affairs",
      add_new_student: "Add New Student",
      registration_data_title: "Basic & Quranic Registration Data",
      student_name_label: "Student Full Name *",
      student_name_placeholder: "Enter student's full name",
      gender_label: "Gender",
      male: "Male",
      female: "Female",
      current_surah_label: "Current Surah / Juz' (Progress)",
      current_surah_placeholder: "e.g., Surah Al-Baqarah / Juz' Amma",
      parent_name_label: "Parent's Name (Optional)",
      parent_name_placeholder: "Enter father or guardian's name",
      contact_phone_label: "Contact Phone Number",
      phone_placeholder: "e.g., 05xxxxxxxx",
      teacher_notes_label: "Teacher's Guidance Notes",
      notes_placeholder: "Write any notes regarding the student's memorization plan here...",
      saving_progress: "Saving and registering...",
      confirm_add_student: "Confirm Adding Student to Halaqa",
      search_placeholder: "Search student by name, phone, or current surah...",
      no_search_results: "No results match your search.",
      no_students_registered: "No students currently registered.",
      parent_prefix: "Parent:",
      memorization_prefix: "Hifz:",
      not_specified_yet: "Not specified yet",
      click_to_update_surah: "Click for quick update on Surah",
      status_active: "Active",
      status_inactive: "Inactive",
      error_no_academy_id: "Error: Academy ID is not defined.",
      error_enter_student_name: "Please enter the student name first",
      student_added_success: "Student registered successfully and professionally! 🎉",
      student_added_failed: "Registration failed:",
      error_updating_surah: "Unable to update the current Surah",

      // 🌟 9. New SaaS / Enterprise Additions
      quick_actions: "Quick Operations",
      academy_overview: "Academy Performance",
      action_attendance: "Recitation & Attendance",
      action_exams: "Surah & Juz Exams",
      action_reports: "Parent Reports",
      action_payments: "Billing & Finance",
      active_halagas: "Active Halagas Today",
      completed_exams: "Exams Passed (Month)"
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

// ⚡ تثبيت الاتجاه الأولي فوراً عند التشغيل البارد لمنع وميض الواجهة (Layout Shift)
const initialLng = i18n.language || 'ar';
document.documentElement.setAttribute('dir', initialLng === 'ar' ? 'rtl' : 'ltr');
document.documentElement.setAttribute('lang', initialLng);

// مراقبة وضبط الاتجاه ديناميكياً عند قيام المستخدم بتبديل اللغة لاحقاً من زر الإعدادات
i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;
