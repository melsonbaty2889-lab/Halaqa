// src/constants/colors.js

export const colors = {
  // الألوان الأساسية والتأكيدية (Amber / Gold)
  primary: {
    DEFAULT: '#D97706', // اللون البرتقالي العنبري للتركيز والأزرار الرئيسية[span_4](start_span)[span_4](end_span)[span_5](start_span)[span_5](end_span)[span_6](start_span)[span_6](end_span)[span_7](start_span)[span_7](end_span)
    hover: '#B45309',   // درجة أغمق لحالات التمرير (Hover)[span_8](start_span)[span_8](end_span)[span_9](start_span)[span_9](end_span)[span_10](start_span)[span_10](end_span)[span_11](start_span)[span_11](end_span)
    light: '#F59E0B',   // روابط استعادة كلمة المرور والتنبيهات الفرعية[span_12](start_span)[span_12](end_span)[span_13](start_span)[span_13](end_span)[span_14](start_span)[span_14](end_span)
    focusRing: 'rgba(217, 119, 6, 0.2)', // هالة حقول الإدخال عند التركيز[span_15](start_span)[span_15](end_span)[span_16](start_span)[span_16](end_span)[span_17](start_span)[span_17](end_span)[span_18](start_span)[span_18](end_span)
    shadow: 'rgba(217, 119, 6, 0.25)',   // ظلال الأزرار الرئيسية[span_19](start_span)[span_19](end_span)
  },

  // ألوان النجاح والأمان (Emerald / Green)
  success: {
    DEFAULT: '#10B981', // شارات الأمان والأيقونات المكتملة[span_20](start_span)[span_20](end_span)[span_21](start_span)[span_21](end_span)[span_22](start_span)[span_22](end_span)[span_23](start_span)[span_23](end_span)
    light: '#34D399',   // نصوص رسائل النجاح[span_24](start_span)[span_24](end_span)[span_25](start_span)[span_25](end_span)
    bg: 'rgba(16, 185, 129, 0.1)',      // خلفية تنبيهات النجاح[span_26](start_span)[span_26](end_span)[span_27](start_span)[span_27](end_span)
    border: 'rgba(16, 185, 129, 0.25)',  // حدود تنبيهات النجاح[span_28](start_span)[span_28](end_span)[span_29](start_span)[span_29](end_span)
  },

  // ألوان الأخطاء والتنبيهات (Red)
  error: {
    DEFAULT: '#EF4444', // حدود الحقول عند وجود خطأ ومؤشر كلمة المرور الضعيفة[span_30](start_span)[span_30](end_span)[span_31](start_span)[span_31](end_span)
    light: '#F87171',   // نصوص رسائل الخطأ[span_32](start_span)[span_32](end_span)[span_33](start_span)[span_33](end_span)[span_34](start_span)[span_34](end_span)[span_35](start_span)[span_35](end_span)
    bg: 'rgba(239, 68, 68, 0.1)',       // خلفية صندوق الأخطاء[span_36](start_span)[span_36](end_span)[span_37](start_span)[span_37](end_span)[span_38](start_span)[span_38](end_span)[span_39](start_span)[span_39](end_span)
    border: 'rgba(239, 68, 68, 0.25)',   // حدود صندوق الأخطاء[span_40](start_span)[span_40](end_span)[span_41](start_span)[span_41](end_span)[span_42](start_span)[span_42](end_span)[span_43](start_span)[span_43](end_span)
  },

  // ألوان الخلفيات والمساحات الداكنة (Dark / Slate)
  dark: {
    pageBgStart: 'rgba(15, 118, 110, 0.18)', // مركز التدرج الشعاعي للخلفية[span_44](start_span)[span_44](end_span)[span_45](start_span)[span_45](end_span)[span_46](start_span)[span_46](end_span)[span_47](start_span)[span_47](end_span)
    pageBgEnd: '#070C12',                    // أطراف خلفية الصفحة[span_48](start_span)[span_48](end_span)[span_49](start_span)[span_49](end_span)[span_50](start_span)[span_50](end_span)[span_51](start_span)[span_51](end_span)
    cardBg: '#0F172A',                       // خلفية الكروت الرئيسية (Slate 900)[span_52](start_span)[span_52](end_span)[span_53](start_span)[span_53](end_span)[span_54](start_span)[span_54](end_span)[span_55](start_span)[span_55](end_span)
    inputBg: '#090F16',                      // خلفية حقول الإدخال[span_56](start_span)[span_56](end_span)[span_57](start_span)[span_57](end_span)[span_58](start_span)[span_58](end_span)[span_59](start_span)[span_59](end_span)
    buttonBg: '#1E293B',                     // خلفية زر Google واللغة (Slate 800)[span_60](start_span)[span_60](end_span)[span_61](start_span)[span_61](end_span)[span_62](start_span)[span_62](end_span)
  },

  // ألوان النصوص (Typography)
  text: {
    title: '#F8FAFC',       // العناوين الرئيسية (Slate 50)[span_63](start_span)[span_63](end_span)[span_64](start_span)[span_64](end_span)[span_65](start_span)[span_65](end_span)[span_66](start_span)[span_66](end_span)
    heading: '#E2E8F0',     // العناوين الفرعية (Slate 200)[span_67](start_span)[span_67](end_span)[span_68](start_span)[span_68](end_span)[span_69](start_span)[span_69](end_span)[span_70](start_span)[span_70](end_span)
    body: '#CBD5E1',        // النصوص العامة (Slate 300)[span_71](start_span)[span_71](end_span)[span_72](start_span)[span_72](end_span)[span_73](start_span)[span_73](end_span)[span_74](start_span)[span_74](end_span)
    muted: '#94A3B8',       // النصوص التوضيحية الباهتة (Slate 400)[span_75](start_span)[span_75](end_span)[span_76](start_span)[span_76](end_span)[span_77](start_span)[span_77](end_span)[span_78](start_span)[span_78](end_span)
    placeholder: '#64748B', // نصوص الحقول التوضيحية (Slate 500)[span_79](start_span)[span_79](end_span)[span_80](start_span)[span_80](end_span)[span_81](start_span)[span_81](end_span)[span_82](start_span)[span_82](end_span)
    highlight: '#38BDF8',   // تمييز البريد الإلكتروني (Sky 400)[span_83](start_span)[span_83](end_span)
  },

  // ألوان الحدود والتفاصيل (Borders & Dividers)
  border: {
    card: '#1E293B',                     // حدود الكروت والأزرار العائمة[span_84](start_span)[span_84](end_span)[span_85](start_span)[span_85](end_span)[span_86](start_span)[span_86](end_span)[span_87](start_span)[span_87](end_span)
    input: '#223147',                    // حدود حقول الإدخال الافتراضية[span_88](start_span)[span_88](end_span)[span_89](start_span)[span_89](end_span)[span_90](start_span)[span_90](end_span)[span_91](start_span)[span_91](end_span)
    divider: '#334155',                  // الفواصل الأفريقية وحدود زر Google[span_92](start_span)[span_92](end_span)[span_93](start_span)[span_93](end_span)[span_94](start_span)[span_94](end_span)
    logoBorder: 'rgba(45, 212, 191, 0.35)', // حدود الشعار الزمردية[span_95](start_span)[span_95](end_span)[span_96](start_span)[span_96](end_span)[span_97](start_span)[span_97](end_span)[span_98](start_span)[span_98](end_span)
  },

  // التدرجات اللونية الخاصة للشعار والرسوم البيانية (Gradients)
  gradients: {
    background: 'radial-gradient(circle at 50% 25%, rgba(15, 118, 110, 0.18) 0%, #070C12 70%)',[span_99](start_span)[span_99](end_span)[span_100](start_span)[span_100](end_span)[span_101](start_span)[span_101](end_span)[span_102](start_span)[span_102](end_span)
    logoRadial: 'radial-gradient(circle at 30% 20%, #0f766e 0%, #042f2e 100%)',[span_103](start_span)[span_103](end_span)[span_104](start_span)[span_104](end_span)[span_105](start_span)[span_105](end_span)[span_106](start_span)[span_106](end_span)
    gold: {
      stop1: '#FEF08A',[span_107](start_span)[span_107](end_span)[span_108](start_span)[span_108](end_span)[span_109](start_span)[span_109](end_span)[span_110](start_span)[span_110](end_span)
      stop2: '#F59E0B',[span_111](start_span)[span_111](end_span)[span_112](start_span)[span_112](end_span)[span_113](start_span)[span_113](end_span)[span_114](start_span)[span_114](end_span)
      stop3: '#B45309',[span_115](start_span)[span_115](end_span)[span_116](start_span)[span_116](end_span)[span_117](start_span)[span_117](end_span)[span_118](start_span)[span_118](end_span)
    },
    emerald: {
      stop1: '#10B981',[span_119](start_span)[span_119](end_span)[span_120](start_span)[span_120](end_span)[span_121](start_span)[span_121](end_span)[span_122](start_span)[span_122](end_span)
      stop2: '#047857',[span_123](start_span)[span_123](end_span)[span_124](start_span)[span_124](end_span)[span_125](start_span)[span_125](end_span)[span_126](start_span)[span_126](end_span)
    }
  }
};
