Smart Halaqa

Master Design System & Development Reference Guide

Single Source of Truth — Mandatory Rules for Every File

---

1. الهدف من هذا الدليل

هذا المستند هو المرجع الإلزامي الموحد لمشروع:

Smart Halaqa | الحلقة الذكية

ويجب الرجوع إليه عند:

- إنشاء أي ملف جديد.
- تعديل أي ملف موجود.
- إنشاء Component جديد.
- تعديل Page.
- إنشاء Form أو Modal أو Dropdown.
- إضافة Button أو Input أو Card.
- إضافة جدول أو Dashboard.
- تعديل Header أو Sidebar أو Navigation.
- إضافة أي لون أو Border أو Shadow.
- إضافة أي نص أو عنوان أو رسالة.
- إضافة أي لغة جديدة.
- تعديل RTL/LTR.
- إضافة أي وظيفة تؤثر على واجهة المستخدم.

الهدف الأساسي هو:

«منع أي ملف جديد من إنشاء هوية بصرية أو نظام تنسيق خاص به خارج النظام الموحد للمشروع.»

أي Component أو Page جديد يجب أن يبدو وكأنه جزء أصلي من Smart Halaqa، وليس Component منفصلًا.

---

2. القاعدة الذهبية

لا تنشئ Design System جديدًا داخل أي ملف.

قبل كتابة أي CSS أو Tailwind classes أو ألوان أو Shadows أو Borders:

1. ابحث أولًا عن Token مناسب في "index.css".
2. إذا كان موجودًا، استخدمه.
3. ابحث عن Semantic Token مناسب.
4. استخدم "tailwind.config.js" للوصول إلى الـ Token.
5. استخدم "src/theme/colors.js" إذا كان التعامل مع الألوان من JavaScript.
6. استخدم "src/theme/styles.js" إذا كان هناك Style موحد موجود بالفعل.
7. لا تنشئ قيمة جديدة إلا إذا كان هناك احتياج حقيقي غير مغطى بالنظام.
8. إذا احتجت Token جديدًا بشكل فعلي، اقترحه أولًا كإضافة للنظام المركزي، وليس كقيمة محلية داخل Component.

---

3. هرم مصدر التصميم

يجب الحفاظ دائمًا على التسلسل التالي:

Smart Halaqa Design System
        ↓
src/index.css
        ↓
CSS Variables
        ↓
Semantic Color Tokens
        ↓
tailwind.config.js
        ↓
src/theme/colors.js
        ↓
src/theme/styles.js
        ↓
Reusable Components
        ↓
Pages

لا يجوز كسر هذا التسلسل بإنشاء ألوان أو Styles مستقلة داخل Pages أو Components بدون ضرورة.

---

4. نظام الألوان

الألوان الأساسية الحالية يجب اعتبارها جزءًا من الهوية الرسمية للمشروع.

Background

--bg-dark: #070B11

وهو اللون الأساسي لخلفية التطبيق.

---

Card Surface

--surface-card: #0F172A

يستخدم لأسطح البطاقات والمكونات الرئيسية.

---

Dropdown Surface

--surface-dropdown: #0F172A

يستخدم للقوائم المنسدلة والأسطح العائمة التي يجب أن تكون صلبة وغير شفافة.

---

Input Surface

--surface-input: #0A101D

يستخدم لحقول الإدخال.

---

Secondary Surface

--surface-google: #162032

يستخدم للأسطح الثانوية، مثل بعض مناطق تسجيل الدخول أو Google-related UI.

---

5. اللون الأساسي Primary

اللون البرتقالي/Amber هو اللون الأساسي للإجراءات الرئيسية.

--primary: #E07A00
--primary-hover: #C66B00
--primary-glow: rgba(224, 122, 0, 0.35)

--primary-btn-start: #E67E00
--primary-btn-end: #D97706

يستخدم في:

- Primary Buttons
- CTA
- Links المهمة
- Focus states
- Active states
- العناصر التي تحتاج إلى إبراز الإجراء الأساسي

ولا يجوز استبداله بألوان برتقالية عشوائية داخل Component.

---

6. اللون Emerald

اللون Emerald مخصص للحالات الإيجابية والنجاح والإجراءات الإيجابية.

--emerald-bg: #09332C
--emerald-border: #0D5C4D
--emerald-text: #10B981
--emerald-dark: #059669
--emerald-light: #34D399

--emerald-radial-glow:
rgba(16, 185, 129, 0.14)

--emerald-logo-glow:
rgba(16, 185, 129, 0.35)

يستخدم في:

- Success
- Confirm
- Save
- Positive actions
- Status indicators
- Logo effects
- Positive feedback

يوجد بالفعل Button موحد لهذا الغرض:

UI.btnEmerald

لذلك لا تنشئ Button Emerald جديدًا بتنسيق مختلف إذا كان "btnEmerald" مناسبًا.

---

7. النصوص

النظام الرسمي للنصوص:

--text-main: #FFFFFF
--text-sub: #94A3B8
--text-muted: #475569

الاستخدام:

Primary Text

semantic-textPrimary

للعناوين والمحتوى الأساسي.

Secondary Text

semantic-textSecondary

للوصف والنصوص الثانوية.

Muted Text

semantic-textMuted

للمعلومات الأقل أهمية.

لا تستخدم:

text-gray-400
text-gray-500
text-gray-600
text-white

بشكل عشوائي إذا كان هناك Semantic Token مناسب.

---

8. Borders

النظام الرسمي:

--border-card: rgba(255, 255, 255, 0.08)
--border-input: #1B2738
--border-hover: #2E3E56

الاستخدام:

semantic-borderCard
semantic-borderInput
semantic-borderHover

لا تنشئ Border بلون جديد داخل Component لمجرد تحسين الشكل.

---

9. Error / Danger

النظام الرسمي:

--error: #EF4444

والـ semantic tokens:

--color-danger
--color-danger-bg

الاستخدام:

semantic-danger
semantic-dangerBg

رسائل الخطأ الموحدة موجودة بالفعل في:

UI.errorText

وتستخدم:

text-semantic-danger

مع animation موحد.

---

10. Semantic Tokens هي الأولوية

عند كتابة UI جديد:

يفضل:

bg-semantic-surfaceCard
text-semantic-textPrimary
border-semantic-borderCard
text-semantic-actionPrimary
bg-semantic-successBg
text-semantic-success

بدل كتابة ألوان مباشرة.

الهدف هو أن يكون الـ Component مرتبطًا بالمعنى وليس بقيمة اللون نفسها.

مثال:

<div className="bg-semantic-surfaceCard text-semantic-textPrimary">

أفضل من:

<div className="bg-[#0F172A] text-white">

---

11. ممنوع Hardcoded Colors بدون ضرورة

ممنوع إضافة ألوان مثل:

bg-[#123456]
text-[#FFFFFF]
border-[#222222]

أو:

background: #123456;

إذا كان هناك Token مناسب.

كذلك لا تضف:

--my-custom-orange: ...

داخل Component.

أي لون جديد يجب أن يكون له سبب حقيقي، ويجب التفكير أولًا في إضافته إلى Design System المركزي.

---

12. Typography

الخط الأساسي الحالي:

Cairo

ويجب الحفاظ عليه في التطبيق.

Tailwind يستخدم:

font-cairo

والـ "sans" الافتراضي مرتبط أيضًا بـ Cairo.

لا تقم بإضافة خط جديد داخل Page أو Component بدون سبب معماري واضح.

---

13. Direction — RTL / LTR

Smart Halaqa تطبيق عالمي متعدد اللغات.

يجب دعم:

Arabic      → RTL
English     → LTR
French      → LTR
Turkish     → LTR
Urdu        → RTL
Indonesian  → LTR

لا يجوز افتراض أن:

direction: rtl

صالح لكل اللغات.

يجب أن يعتمد اتجاه الواجهة على اللغة الحالية.

أي Component جديد يجب أن يعمل بشكل صحيح في:

RTL
LTR

---

14. لا تستخدم Left / Right بشكل يسبب مشاكل RTL

تجنب كتابة تصميم يعتمد على:

left
right
margin-left
margin-right
padding-left
padding-right

عندما يكون المقصود اتجاهيًا.

يفضل استخدام:

start
end

أو الحلول المتوافقة مع RTL/LTR عندما تكون متاحة.

يجب اختبار Component في الاتجاهين.

---

15. Cards

يوجد Card System موحد:

card-surface

وموجود في:

UI.card

لذلك عند إنشاء Card جديد لا تعيد بناء:

- Background
- Border
- Radius
- Shadow

من الصفر.

استخدم:

UI.card

أو:

card-surface

عند الحاجة.

يوجد أيضًا:

UI.cardActive
UI.cardGlass

للحالات المناسبة.

---

16. Dropdowns

القوائم المنسدلة يجب أن تستخدم:

dropdown-surface

عندما تكون القائمة بحاجة إلى Surface صلب.

السبب:

--surface-dropdown

مصمم خصيصًا لمنع ظهور الخلفية خلف القائمة.

لا تستخدم Card عاديًا للـ Dropdown إذا كان ذلك يؤدي إلى شفافية غير مرغوبة.

---

17. Inputs

يوجد Input System موحد:

app-input

وموجود في:

UI.input

لذلك:

<input className={UI.input} />

أفضل من إعادة إنشاء Input Style في كل ملف.

الـ Input يحتوي بالفعل على:

- Width
- Height
- Background
- Border
- Color
- Radius
- Padding
- Font size
- Hover
- Focus
- Glow

لا تعيد تعريف هذه الخصائص إلا عند وجود احتياج حقيقي.

---

18. Buttons

Primary

استخدم:

btn-primary

أو:

UI.btnPrimary

---

Secondary

استخدم:

btn-secondary

أو:

UI.btnSecondary

---

Emerald / Positive

استخدم:

UI.btnEmerald

عندما يكون الإجراء إيجابيًا مثل:

- Save
- Confirm
- Submit
- Positive action

لا تنشئ Button جديدًا مشابهًا باسم مختلف إذا كان أحد هذه الأنماط مناسبًا.

---

19. Button Behavior

الأزرار يجب أن تحافظ على:

- Hover
- Active
- Focus
- Disabled
- Pointer behavior
- Transition
- Border radius
- Typography

ولا يجوز إنشاء Button يبدو مختلفًا عن باقي التطبيق لمجرد أنه موجود في Page جديدة.

---

20. Border Radius

النظام الحالي يستخدم Rounded UI حديثًا.

يجب الحفاظ على النسب الموجودة في النظام:

Cards      → rounded-xl / 1.25rem
Dropdown   → rounded-2xl / 1rem
Inputs     → rounded-lg تقريبًا
Buttons    → rounded-xl
Logo       → rounded-2xl

لا تستخدم قيمًا عشوائية لكل Component.

---

21. Shadows

Shadow الرئيسي:

--shadow-main

وهو:

0 20px 50px rgba(0, 0, 0, 0.4)

ومتاح في Tailwind باسم:

shadow-main

لا تنشئ Shadows مختلفة بشكل عشوائي.

إذا كان المكون Card أو Dropdown، استخدم النظام الموجود.

---

22. Glass Effect

هناك نظام Glass موجود:

card-glass

ويستخدم:

backdrop-filter
blur
border
surface-card

لكن لا تستخدم Glass Effect لكل شيء.

يجب أن يكون الاستخدام مقصودًا، خصوصًا في:

- Cards الخاصة
- Logo wrapper
- عناصر تحتاج عمقًا بصريًا

---

23. الخلفية العامة

الخلفية العامة للتطبيق تعتمد على:

--bg-dark

مع التأثيرات الخلفية الموجودة في "index.css".

لا تضف خلفية جديدة لكل Page.

يجب أن تظهر جميع Pages كأنها أجزاء من تطبيق واحد.

---

24. Animation

الـ animation يجب أن يكون:

- خفيفًا
- سريعًا
- وظيفيًا
- غير مبالغ فيه

يوجد:

fade-in
spin-slow

في Tailwind.

لا تضف Animations كثيرة لمجرد الزخرفة.

---

25. Reusable Styles

قبل إنشاء Class جديد اسأل:

«هل هذا النمط عام ويمكن استخدامه في أكثر من مكان؟»

إذا نعم:

يجب التفكير في إضافته إلى:

index.css

أو:

src/theme/styles.js

بدل وضعه داخل Page.

---

26. src/theme/styles.js

هذا الملف يمثل طبقة Reusable UI Styles.

يحتوي حاليًا على أنماط موحدة مثل:

UI.card
UI.cardActive
UI.cardGlass
UI.btnPrimary
UI.btnSecondary
UI.btnEmerald
UI.input
UI.logoWrapper
UI.link
UI.title
UI.subtitle
UI.errorText

هذه الأنماط يجب إعادة استخدامها بدل إنشاء نسخ متكررة منها.

إذا أضفت Style عامًا جديدًا، يجب أن يكون:

- قابلًا لإعادة الاستخدام.
- متوافقًا مع Design System.
- مبنيًا على Semantic Tokens.
- غير مرتبط بصفحة واحدة.

---

27. src/theme/colors.js

هذا الملف ليس مكانًا لتعريف ألوان جديدة عشوائيًا.

هو طبقة JavaScript للوصول إلى نظام الألوان المركزي.

يحتوي على:

dark
primary
brandEmerald
appText
appBorder
error
semantic

ويعتمد على CSS Variables.

والـ Semantic layer موجود لتوفير أسماء ذات معنى بدل ربط Components بأرقام Hex مباشرة.

---

28. Tailwind Configuration

"tailwind.config.js" هو طبقة الربط بين Tailwind وDesign System.

يجب عدم كسر هذه العلاقة.

الألوان الموجودة تحت:

dark
primary
brandEmerald
appText
appBorder
appError
semantic

تعتبر جزءًا من النظام.

عند الحاجة إلى لون أو Token جديد بشكل عام:

لا تضف اللون فقط داخل Component.

يجب التفكير في إضافته إلى:

index.css
→ tailwind.config.js
→ colors.js

إذا كان Token عامًا فعلًا.

---

29. قاعدة التعديل المركزي

إذا اكتشفنا أن لونًا أو Radius أو Shadow أو Typography يجب تغييره على مستوى المشروع كله:

لا نقوم بتعديله داخل كل Component.

نعدل المصدر المركزي.

مثال:

إذا أردنا تغيير Primary:

index.css
--primary

ثم تستفيد منه بقية الطبقات.

هذا هو جوهر:

Single Source of Truth

---

30. عدم تكرار النظام

ممنوع إنشاء:

newColors.js
newStyles.js
pageStyles.js
dashboardTheme.js
customTheme.js

لمجرد إضافة Component.

قبل إنشاء أي ملف تصميم جديد، افحص النظام الحالي.

---

31. Responsive Design

كل Component جديد يجب أن يعمل على:

Mobile
Tablet
Desktop
Large Desktop

لا تفترض أن Desktop هو الحالة الأساسية الوحيدة.

يجب استخدام Tailwind responsive utilities عند الحاجة:

sm:
md:
lg:
xl:

لكن بدون مبالغة.

---

32. Mobile First

عند إنشاء UI جديد:

ابدأ من Mobile.

ثم أضف تحسينات:

sm
md
lg
xl

عند الحاجة.

لا تنشئ Desktop layout ثم تحاول إصلاحه للموبايل في النهاية.

---

33. Accessibility

كل Component جديد يجب مراعاة:

- Semantic HTML
- Keyboard navigation
- Focus state
- Disabled state
- Labels
- ARIA عند الحاجة
- Contrast
- Readability

خصوصًا:

- Buttons
- Inputs
- Dropdowns
- Modals
- Navigation
- Tables

---

34. Icons

عند استخدام Icons:

استخدم نظام Icons المعتمد في المشروع.

لا تستخدم صورًا أو SVGs عشوائية عندما يكون هناك Icon موجود في المكتبة المستخدمة.

يجب الحفاظ على:

- الحجم
- الوزن البصري
- alignment
- RTL/LTR positioning

---

35. Internationalization

Smart Halaqa مشروع Multilingual.

اللغات الحالية:

ar
en
fr
tr
ur
id

أي نص جديد في UI يجب ألا يكون Hardcoded داخل Component إذا كان النص يحتاج إلى ترجمة.

ممنوع:

<button>حفظ</button>

والصحيح استخدام نظام الترجمة الحالي.

مثل:

t('common.save')

مع إضافة Translation Keys المناسبة.

---

36. لا تغير Translation Architecture

عند تعديل Component:

لا تنشئ نظام ترجمة خاصًا به.

استخدم:

react-i18next

والبنية الحالية للمشروع.

أي Key جديد يجب أن يكون:

- واضحًا
- منطقيًا
- قابلًا للترجمة
- متوفرًا في جميع اللغات المطلوبة

---

37. اللغة واتجاه الصفحة

لا تفترض أن:

Arabic = default behavior لكل شيء

يجب أن يعتمد:

- direction
- alignment
- icon placement
- spacing
- navigation

على اللغة الحالية.

خصوصًا مع:

Arabic
Urdu

لأنهما RTL.

---

38. البيانات لا يجب أن تتحكم في التصميم

لا تجعل Component يغير الهوية البصرية حسب بيانات غير متوقعة.

استخدم حالات واضحة:

loading
empty
success
error
disabled
active
selected

وكل حالة يجب أن تستعمل ألوان Semantic المناسبة.

---

39. Loading State

Loading يجب أن يكون:

- بسيطًا
- متناسقًا
- غير مشتت

ويجب ألا يغير Layout بشكل مفاجئ.

---

40. Empty State

Empty State يجب أن يستخدم:

- Surface النظام
- Typography النظام
- Icon مناسب
- Primary/Secondary action عند الحاجة

ولا ينشئ تصميمًا منفصلًا عن التطبيق.

---

41. Error State

استخدم:

semantic-danger
semantic-dangerBg

ولا تستخدم الأحمر بشكل عشوائي.

---

42. Success State

استخدم:

semantic-success
semantic-successBg
semantic-successBorder

ولا تختر لون Green جديدًا داخل Component.

---

43. Active State

الحالة النشطة يجب أن تستخدم اللون الأساسي أو Semantic Primary حسب السياق.

مثال النظام الحالي:

UI.cardActive

يعتمد على:

semantic-actionPrimary

وبالتالي لا تنشئ Active Color جديدًا لكل Page.

---

44. Hover State

يجب أن يكون Hover:

- واضحًا
- خفيفًا
- متناسقًا
- مرتبطًا بالـ Token المناسب

مثال:

actionPrimaryHover
borderHover

---

45. Focus State

Focus يجب ألا يتم حذفه.

يجب أن يكون واضحًا باستخدام:

actionPrimary
actionPrimaryGlow

خصوصًا للـ Inputs وButtons.

---

46. Z-Index / Dropdown / Modal

عند إنشاء:

- Dropdown
- Tooltip
- Popover
- Modal

يجب التأكد من:

- stacking context
- z-index
- overflow
- positioning
- RTL
- mobile behavior

ولا يتم حل المشكلة بإضافة z-index عشوائي كبير مثل:

z-[99999]

إلا إذا كان هناك سبب معماري واضح.

---

47. عدم استخدام !important إلا عند الضرورة

لا تستخدم:

!important

في Components الجديدة إلا عند وجود سبب واضح.

النظام الحالي يحتوي على بعض الاستخدامات المركزية المقصودة، مثل الخلفية العامة والقوائم المنسدلة.

لا تحول ذلك إلى قاعدة عامة لكل Component.

---

48. عند تعديل ملف موجود

قبل التعديل:

1. اقرأ الملف كاملًا.
2. افهم Imports.
3. افهم Props.
4. افهم Hooks.
5. افهم State.
6. افهم العلاقات مع الملفات الأخرى.
7. افهم نظام الترجمة.
8. افهم الـ Design Tokens المستخدمة.
9. لا تحذف وظيفة قائمة لمجرد إعادة تنظيم الكود.
10. لا تغير API الخاص بالمكون دون ضرورة.

---

49. الحفاظ على التوافق القديم

أي Refactoring يجب أن يحافظ قدر الإمكان على:

- Existing imports
- Existing exports
- Existing props
- Existing routes
- Existing callbacks
- Existing database bindings
- Existing translation keys
- Existing role logic
- Existing authentication logic
- Existing behavior

إذا كان تغيير أحدها ضروريًا، يجب توضيح السبب قبل تنفيذه.

---

50. لا تعالج مشكلة محلية بتغيير معماري واسع

إذا كانت المشكلة:

Button

لا تعيد بناء:

Design System

إذا كانت المشكلة:

Dropdown

لا تغير:

Global Theme

إلا إذا ثبت أن المشكلة أصلًا في النظام المركزي.

---

51. قبل إنشاء أي Component جديد

يجب تنفيذ هذا الـ Checklist:

[ ] هل يوجد Component مشابه؟
[ ] هل يوجد Style جاهز؟
[ ] هل يوجد Token جاهز؟
[ ] هل يوجد Button جاهز؟
[ ] هل يوجد Input جاهز؟
[ ] هل يوجد Card جاهز؟
[ ] هل يوجد Modal جاهز؟
[ ] هل يوجد Dropdown جاهز؟
[ ] هل يوجد Translation Key مناسب؟
[ ] هل يعمل RTL؟
[ ] هل يعمل LTR؟
[ ] هل يعمل Mobile؟
[ ] هل يعمل Desktop؟

---

52. قبل إضافة لون جديد

اسأل بالترتيب:

1. هل يوجد Semantic Token مناسب؟
2. هل يوجد Direct Token مناسب؟
3. هل يمكن استخدام Primary؟
4. هل يمكن استخدام Emerald؟
5. هل يمكن استخدام Text Secondary؟
6. هل يمكن استخدام Border Token؟
7. هل اللون الجديد ضروري فعلًا؟

إذا كانت الإجابة الأخيرة نعم:

يجب تقييم إضافته للنظام المركزي بدل إضافته محليًا.

---

53. قبل إضافة Style جديد

اسأل:

هل هذا Style خاص بهذا Component فعلًا؟

إذا كان لا:

أضفه إلى النظام المشترك.

إذا كان نعم:

اجعله محدودًا قدر الإمكان ولا يعيد تعريف الهوية.

---

54. قاعدة عدم كسر الهوية

لا يجوز إنشاء Component يختلف عن بقية المشروع في:

- Background
- Colors
- Font
- Radius
- Shadows
- Borders
- Buttons
- Inputs
- Spacing
- Animation
- Direction

إلا إذا كان الاختلاف جزءًا مقصودًا من UX.

---

55. قاعدة التناسق البصري

أي Page جديدة يجب أن تبدو كالتالي:

نفس الخلفية
+
نفس الألوان
+
نفس Typography
+
نفس Cards
+
نفس Buttons
+
نفس Inputs
+
نفس Borders
+
نفس Shadows
+
نفس Radius
+
نفس RTL/LTR behavior
+
نفس Responsive behavior

الهدف:

«المستخدم لا يجب أن يشعر أنه انتقل إلى جزء آخر من التطبيق.»

---

56. قاعدة عدم الاجتهاد البصري

Gemini لا يقوم بتغيير Design System من تلقاء نفسه.

ممنوع:

- تغيير الألوان لأن لونًا آخر "أجمل".
- تغيير الخط.
- تغيير Radius.
- إضافة Gradients جديدة.
- إضافة Shadows جديدة.
- تغيير Background.
- تغيير Primary color.
- إضافة Glass effect لكل العناصر.
- تغيير حجم Typography.
- إعادة تصميم Component بدون طلب.

إذا كان هناك اقتراح تصميمي مفيد:

اعرض الاقتراح أولًا، ولا تطبقه تلقائيًا.

---

57. عند اكتشاف تعارض في النظام

إذا وجدت:

Component يستخدم لونًا مختلفًا

أو:

Page تستخدم Style قديمًا

لا تقم بتغيير كل شيء مباشرة.

حدد:

Current behavior
Expected Design System behavior
Affected files
Potential impact
Recommended centralized fix

ثم نفذ أقل تغيير آمن.

---

58. ترتيب الأولويات

عند وجود تعارض بين:

Local Component Style

و:

Smart Halaqa Design System

تكون الأولوية للنظام المركزي، ما لم يكن هناك سبب وظيفي واضح.

---

59. ترتيب تنفيذ أي مهمة UI

استخدم هذا التسلسل:

1. Understand existing component
        ↓
2. Identify reusable components
        ↓
3. Identify existing tokens
        ↓
4. Identify existing UI styles
        ↓
5. Preserve behavior
        ↓
6. Implement minimum required change
        ↓
7. Check RTL
        ↓
8. Check LTR
        ↓
9. Check Mobile
        ↓
10. Check Desktop
        ↓
11. Check translations
        ↓
12. Check visual consistency

---

60. قاعدة عدم حذف الكود القديم بدون سبب

لا تحذف:

- Imports
- Functions
- Props
- Hooks
- Styles
- Translation keys
- Logic

فقط لأنها تبدو غير مستخدمة قبل التأكد من جميع الاستخدامات.

يجب الحفاظ على العلاقات القديمة في المشروع.

---

61. قاعدة التحقق بعد كل تعديل

بعد تعديل أي ملف، يجب مراجعة:

1. Syntax
2. Imports
3. Exports
4. Runtime behavior
5. Existing functionality
6. Design Tokens
7. RTL
8. LTR
9. Mobile
10. Desktop
11. Translation
12. Accessibility

---

62. قاعدة عدم إنشاء Duplicate Components

قبل إنشاء:

NewButton
NewCard
NewInput
NewModal
NewDropdown
NewHeader

ابحث أولًا عن الموجود.

إذا كان الموجود يمكن تطويره دون كسر الاستخدامات الحالية:

يفضل إعادة استخدامه.

---

63. قاعدة Naming

الأسماء يجب أن تكون واضحة ومتماشية مع بنية المشروع.

استخدم أسماء تعكس الوظيفة:

StudentCard
TeacherCard
PaymentModal
AttendanceTable

ولا تستخدم أسماء عامة وغامضة:

Box1
NewCard
CustomThing
TempComponent

---

64. قاعدة الحفاظ على Architecture

Design System ليس مجرد ألوان.

يجب الحفاظ على العلاقة:

Design System
      ↓
Theme
      ↓
Reusable UI
      ↓
Components
      ↓
Pages

ولا يجوز أن تصبح Pages هي مصدر التصميم.

---

65. Master Rule

عند أي مهمة جديدة في Smart Halaqa:

«لا تبدأ من الصفر. ابدأ من النظام الموجود.»

ابحث أولًا.

أعد الاستخدام ثانيًا.

وسّع النظام مركزيًا عند الحاجة.

ولا تنشئ نظامًا موازيًا.

---

66. تعليمات إلزامية لـ Gemini

قبل تنفيذ أي طلب برمجي داخل Smart Halaqa، يجب على Gemini تنفيذ الآتي:

1. اقرأ الملفات ذات الصلة أولًا.
2. حدد Design Tokens المستخدمة.
3. حدد Components الموجودة والقابلة لإعادة الاستخدام.
4. حافظ على Imports وExports الحالية ما لم يوجد سبب واضح للتغيير.
5. حافظ على Authentication وRoles وRouting وDatabase bindings.
6. حافظ على نظام i18n.
7. حافظ على RTL/LTR.
8. حافظ على Responsive Design.
9. استخدم Design Tokens بدل Hardcoded colors.
10. استخدم UI styles الموجودة في src/theme/styles.js.
11. استخدم colors.js عند الحاجة من JavaScript.
12. لا تنشئ Design System موازيًا.
13. لا تغير الهوية البصرية من تلقاء نفسك.
14. نفذ أقل تعديل آمن يحقق المطلوب.
15. راجع تأثير التعديل على الملفات المرتبطة.

---

67. صيغة إلزامية قبل كتابة الكود

عند إعطاء Gemini مهمة تعديل ملف، يجب أن يفكر وفق هذا النموذج:

TARGET FILE:
ما الملف المطلوب؟

RELATED FILES:
ما الملفات المرتبطة؟

CURRENT DESIGN TOKENS:
ما الـ Tokens المستخدمة حاليًا؟

REUSABLE COMPONENTS:
ما الموجود ويمكن إعادة استخدامه؟

I18N:
ما مفاتيح الترجمة المطلوبة؟

RTL/LTR:
هل يحتاج التعديل إلى معالجة الاتجاه؟

RESPONSIVE:
كيف سيعمل على Mobile/Desktop؟

BACKWARD COMPATIBILITY:
ما الوظائف القديمة التي يجب الحفاظ عليها؟

MINIMUM SAFE CHANGE:
ما أقل تعديل يحقق المطلوب؟

VALIDATION:
كيف سيتم التأكد من عدم كسر النظام؟

---

68. ممنوعات أساسية

لا تفعل الآتي:

❌ Hardcoded colors بدون ضرورة
❌ Design System جديد
❌ Theme جديد
❌ Font جديد بدون سبب
❌ Duplicate Button
❌ Duplicate Card
❌ Duplicate Input
❌ Duplicate Modal
❌ تغيير RTL/LTR behavior
❌ حذف i18n
❌ Hardcoded Arabic/English UI text
❌ حذف Logic قديم بدون تحقق
❌ تغيير API للمكونات بدون ضرورة
❌ تغيير الهوية البصرية من تلقاء نفسك
❌ استخدام !important بشكل عشوائي
❌ إنشاء z-index عشوائي ضخم
❌ إعادة تصميم Page كاملة عند إصلاح مشكلة صغيرة

---

69. المسموحات

مسموح:

✓ إعادة استخدام الموجود
✓ تحسين Component موجود
✓ إضافة Token مركزي عند الحاجة
✓ إضافة Style reusable
✓ تحسين Responsive behavior
✓ تحسين Accessibility
✓ إصلاح RTL/LTR
✓ إصلاح تناقض بصري
✓ إضافة Translation Keys
✓ تحسين UX بدون تغيير الهوية
✓ Refactoring آمن يحافظ على behavior

---

70. الهدف النهائي

يجب أن يكون Smart Halaqa:

Consistent
Scalable
Multilingual
RTL/LTR
Responsive
Accessible
Maintainable
Reusable
Theme-driven
Token-driven

والأهم:

«أي ملف جديد يجب أن يرث هوية Smart Halaqa، وليس أن يخترع هوية جديدة.»

---

71. قاعدة أخيرة — Single Source of Truth

عند الشك في أي قرار بصري:

لا تخمّن.
لا تختر لونًا عشوائيًا.
لا تنشئ Style موازيًا.
لا تغير النظام.

ارجع إلى:

index.css
      ↓
tailwind.config.js
      ↓
theme/colors.js
      ↓
theme/styles.js
      ↓
Reusable Components

ثم نفذ التعديل بما يحافظ على النظام بالكامل.

---

SMART HALAQA DESIGN SYSTEM PRINCIPLE

ONE BRAND
ONE DESIGN SYSTEM
ONE TOKEN SYSTEM
ONE VISUAL LANGUAGE
ONE RTL/LTR STRATEGY
ONE MULTILINGUAL ARCHITECTURE

EVERY COMPONENT
EVERY PAGE
EVERY FEATURE
EVERY NEW FILE

MUST BELONG TO THE SAME SYSTEM.

هذا المستند هو المرجع الإلزامي عند إنشاء أو تعديل أي ملف في مشروع Smart Halaqa.
