# 🎨 دليل نظام التصميم والهوية البصرية (Halaqa Design System)

هذا المستند يُعد المرجع الرئيسي والأوحد لجميع الألوان، التنسيقات، المتغيرات، والفئات المستخدمة في بناء بواجهات التطبيق لضمان الحفاظ على الهوية البصرية المعتمدة.

---

## 1. الألوان والمتغيرات الرئيسية (CSS Variables)

| العنصر | متغير CSS | القيمة (Hex / RGB) | الوصف |
| :--- | :--- | :--- | :--- |
| **الخلفية الرئيسية** | `--bg-dark` | `#070B11` | خلفية التطبيق الأساسية الداكنة |
| **سطح البطاقات** | `--surface-card` | `rgba(15, 23, 42, 0.85)` | خلفية البطاقات والقوائم المنسدلة |
| **سطح الحقول** | `--surface-input` | `#0A101D` | خلفية حقول الإدخال والمدخلات |
| **سطح أزرار جوجل** | `--surface-google` | `#162032` | خلفية العناصر الثانوية/جوجل |
| **اللون الرئيسي** | `--primary` | `#E07A00` | لون التفاعل والتأكيد الأساسي (Amber) |
| **الرئيسي (Hover)** | `--primary-hover` | `#C66B00` | درجة التمرير للون الرئيسي |
| **توهج الرئيسي** | `--primary-glow` | `rgba(224, 122, 0, 0.35)` | ظلال وتوهج العناصر النشطة |
| **بداية التدرج** | `--primary-btn-start` | `#E67E00` | بداية التدرج للأزرار الرئيسية |
| **نهاية التدرج** | `--primary-btn-end` | `#D97706` | نهاية التدرج للأزرار الرئيسية |
| **الزمردي الرئيسي** | `--emerald-text` | `#10B981` | لون النصوص الزمردية والتأكيدات |
| **خلفية الزمردي** | `--emerald-bg` | `#09332C` | خلفية الشارات وعناصر الشعار |
| **إطار الزمردي** | `--emerald-border` | `#0D5C4D` | إطار الشارات الزمردية |
| **توهج الزمردي** | `--emerald-radial-glow`| `rgba(16, 185, 129, 0.14)`| ظلال وتوهج الشعار الخلفي |
| **النص الرئيسي** | `--text-main` | `#FFFFFF` | العناوين والنصوص العريضة |
| **النص الفرعي** | `--text-sub` | `#94A3B8` | النصوص الشارحة والوصفية |
| **النص الخافت** | `--text-muted` | `#475569` | النصوص الثانوية والتوضيحات |
| **إطار البطاقات** | `--border-card` | `rgba(255, 255, 255, 0.08)`| الحدود الخفيفة للبطاقات |
| **إطار المدخلات** | `--border-input` | `#1B2738` | حدود حقول الإدخال والقوائم |
| **إطار التمرير** | `--border-hover` | `#2E3E56` | حدود الحقول عند التمرير |
| **لون الخطأ** | `--error` | `#EF4444` | نصوص ورسائل الخطأ |

---

## 2. جدول الربط البرمجي (Architecture Mapping)

استخدم التسميات التالية حسب مكان التطبيق في الكود:

+------------------+------------------------+--------------------------+
| Tailwind Class   | JavaScript Object (C)  | CSS Variable             |
+------------------+------------------------+--------------------------+
| bg-dark-bg       | C.dark.bg              | var(--bg-dark)           |
| bg-dark-card     | C.dark.card            | var(--surface-card)      |
| bg-dark-input    | C.dark.input           | var(--surface-input)     |
| text-primary     | C.primary.DEFAULT      | var(--primary)           |
| bg-primary       | C.primary.DEFAULT      | var(--primary)           |
| text-brandEmerald| C.brandEmerald.DEFAULT | var(--emerald-text)      |
| bg-brandEmerald-bg| C.brandEmerald.bg     | var(--emerald-bg)        |
| text-appText-main| C.appText.main         | var(--text-main)         |
| text-appText-sub | C.appText.sub          | var(--text-sub)          |
| border-appBorder-input| C.appBorder.input  | var(--border-input)      |
+------------------+------------------------+--------------------------+


---

## 3. الأنماط الجاهزة (UI Presets - `src/theme/styles.js`)

تُستخدم هذه الفئات الجاهزة لتوحيد المكونات الشائعة عبر مشروعك:

* **البطاقة القياسية (`UI.card`):**
  `card-surface transition-all duration-200`
* **الزر الرئيسي (`UI.btnPrimary`):**
  `btn-primary transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none`
* **الزر الثانوي (`UI.btnSecondary`):**
  `btn-secondary transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none`
* **حقل الإدخال القياسي (`UI.input`):**
  `app-input focus:outline-none transition-all duration-200 disabled:opacity-50`
* **العنوان الرئيسي (`UI.title`):**
  `text-appText-main font-extrabold text-xl md:text-2xl tracking-tight`
* **العنوان الفرعي (`UI.subtitle`):**
  `text-appText-sub text-sm font-medium`

---

## 4. قواعد وإرشادات الهوية البصرية

1. **يمنع تماماً** استخدام ألوان المباشرة (Hardcoded Colors مثل `#ffffff` أو `bg-blue-500`) في أي مكون.
2. يتم الاعتماد دائماً على ملف `src/theme/colors.js` أو فئات Tailwind المعتمدة الموضحة أعلاه.
3. التفاعل والتنبيهات تعتمد على التدرج الذهبي/البرتقالي (`--primary`) والهوية الزمردية (`--emerald-text`).
4. 
