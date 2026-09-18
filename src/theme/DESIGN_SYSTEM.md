# 🎨 دليل نظام التصميم والهوية البصرية (Smart Halaqa Design System)

هذا المستند يُعد المرجع الرئيسي والأوحد (Single Source of Truth) لجميع الألوان، المتغيرات، التنسيقات، والفئات البرمجية المستخدمة في بناء واجهات التطبيق لضمان الحفاظ على الهوية البصرية المعتمدة.

---

## 1. الألوان والمتغيرات الرئيسية (CSS Variables)

### **أ) السلم المباشر للألوان (Direct Color Scale)**

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
| **النص الخافت** | `--text-muted` | `#475569` | الحدود الضبابية والعناصر المعطلة فقط |
| **إطار البطاقات** | `--border-card` | `rgba(255, 255, 255, 0.08)`| الحدود الخفيفة للبطاقات |
| **إطار المدخلات** | `--border-input` | `#1B2738` | حدود حقول الإدخال والقوائم |
| **إطار التمرير** | `--border-hover` | `#2E3E56` | حدود الحقول عند التمرير |
| **لون الخطأ** | `--error` | `#EF4444` | نصوص ورسائل الخطأ |

---

### **ب) طبقة الألوان الدلالية (Semantic Color Tokens)**

| متغير CSS الدلالي | المتغير المربوط | الوصف والوظيفة |
| :--- | :--- | :--- |
| `--color-bg-page` | `var(--bg-dark)` | خلفية الصفحة الرئيسية |
| `--color-surface-card` | `var(--surface-card)` | أسطح البطاقات والحاويات المرتفعة |
| `--color-surface-input` | `var(--surface-input)` | أسطح الحقول والمدخلات |
| `--color-surface-secondary` | `var(--surface-google)` | أسطح الأزرار الثانوية |
| `--color-action-primary` | `var(--primary)` | أزرار الإجراءات الرئيسية والتنشيط |
| `--color-action-primary-hover`| `var(--primary-hover)` | حالة التمرير للإجراءات |
| `--color-action-primary-glow` | `var(--primary-glow)` | ظلال التركيز والـ Glow |
| `--color-success` | `var(--emerald-text)` | نصوص وأيقونات النجاح والتأكيد |
| `--color-success-bg` | `var(--emerald-bg)` | خلفيات شارات النجاح |
| `--color-success-border` | `var(--emerald-border)` | حدود شارات النجاح |
| `--color-danger` | `var(--error)` | نصوص التنبيه والأخطاء |
| `--color-danger-bg` | `rgba(239, 68, 68, 0.15)` | خلفيات التنبيه بالأخطاء |
| `--color-text-primary` | `var(--text-main)` | العناوين والمعلومات الأساسية |
| `--color-text-secondary` | `var(--text-sub)` | النصوص الوصفية والشارحة |
| `--color-text-muted` | `var(--text-muted)` | العناصر المكتومة والحدود الخافتة |
| `--color-border-card` | `var(--border-card)` | إطارات البطاقات |
| `--color-border-input` | `var(--border-input)` | إطارات الحقول والقوائم المنسدلة |
| `--color-border-hover` | `var(--border-hover)` | إطارات التمرير والتركيز |

---

## 2. جدول الربط البرمجي (Architecture Mapping)

+---------------------------+-----------------------------------+-----------------------------------+
| Tailwind Class            | JavaScript Object (C / colors)    | CSS Variable                      |
+---------------------------+-----------------------------------+-----------------------------------+
| bg-semantic-bgPage        | C.semantic.bgPage                 | var(--color-bg-page)              |
| bg-semantic-surfaceCard   | C.semantic.surfaceCard            | var(--color-surface-card)         |
| bg-semantic-surfaceInput  | C.semantic.surfaceInput           | var(--color-surface-input)        |
| text-semantic-actionPrimary| C.semantic.actionPrimary         | var(--color-action-primary)       |
| bg-semantic-actionPrimary | C.semantic.actionPrimary          | var(--color-action-primary)       |
| text-semantic-success     | C.semantic.success                | var(--color-success)              |
| bg-semantic-successBg     | C.semantic.successBg              | var(--color-success-bg)           |
| text-semantic-textPrimary | C.semantic.textPrimary            | var(--color-text-primary)         |
| text-semantic-textSecondary| C.semantic.textSecondary         | var(--color-text-secondary)       |
| border-semantic-borderInput| C.semantic.borderInput           | var(--color-border-input)         |
+---------------------------+-----------------------------------+-----------------------------------+


---

## 3. الأنماط الجاهزة (UI Presets - `src/theme/styles.js`)

* **البطاقة القياسية (`UI.card`):**
  `card-surface transition-all duration-200`
* **البطاقة النشطة (`UI.cardActive`):**
  `card-surface border-semantic-actionPrimary ring-2 ring-semantic-actionPrimary/20 transition-all duration-200`
* **الزر الرئيسي (`UI.btnPrimary`):**
  `btn-primary transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-semantic-actionPrimary/50`
* **الزر الثانوي (`UI.btnSecondary`):**
  `btn-secondary transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-semantic-borderHover`
* **حقل الإدخال القياسي (`UI.input`):**
  `app-input focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`
* **العنوان الرئيسي (`UI.title`):**
  `text-semantic-textPrimary font-extrabold text-xl md:text-2xl tracking-tight`
* **العنوان الفرعي (`UI.subtitle`):**
  `text-semantic-textSecondary text-sm font-medium`

---

## 4. قواعد وإرشادات الهوية البصرية والـ Accessibility

1. **الالتزام المطلق بالطبقة الدلالية (Semantic Tokens):** يمنع تماماً استخدام الألوان المباشرة (`#ffffff` أو `bg-blue-500` أو `text-orange-500`) داخل أي مكون.
2. **التسلسل البصري للأسطح:** يجب الحفاظ دائماً على التدرج العمقي للواجهة:
   `Page Background (--bg-dark) → Surface Card (--surface-card) → Surface Input (--surface-input)`
3. **قواعد استخدام اللون المكتوم (`#475569`):** يُمنع استخدام هذا اللون في أي نصوص أو أيقونات تحتاج للقراءة لاتخاذ إجراء، ويقتصر استخدامه على الحدود الضبابية، خطوط الفصل (Dividers)، وحالات العناصر المعطلة (`disabled`).
4. **تأثير التوهج (Glow Effect):** يُقتصر استخدام الـ Glow على العناصر التفاعلية النشطة والـ CTA الرئيسي، ولا يُضاف للبطاقات العامة لمنع الازدحام البصري.
5. **القوائم المنسدلة والعناصر العائمة (Floating UI):** يجب تعيين `backgroundColor: var(--surface-card)` وإطار `var(--border-input)` صراحةً لجميع العناصر المنسدلة والمودال لضمان التغطية الكاملة وسلاسة المظهر.


