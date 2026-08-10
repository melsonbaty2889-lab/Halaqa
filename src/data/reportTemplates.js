export const REPORT_TEMPLATES = [
  {
    id: 'daily',
    nameAr: 'تقرير الإنجاز اليومي',
    nameEn: 'Daily Achievement',
    textAr: `✨ *تقرير الحفظ والمراجعة اليومي* ✨

السلام عليكم ورحمة الله وبركاته،
ولي أمر طالبنا المتميز/ة *[Student_Name]* 🌟

إليكم إنجاز اليوم ([Date]):
حالة الحضور: [Status]
📖 *الحفظ الجديد:* [Memorization]
🔄 *المراجعة:* [Review]
⭐ *التقييم اليومي:* [Rating]

[Notes]

شكرًا لحسن متابعتكم وحرصكم الدائم 🌿`,
    textEn: `✨ *Daily Progress Report* ✨

Peace be upon you,
Dear Parent of *[Student_Name]* 🌟

Here is the progress for today ([Date]):
Status: [Status]
📖 *New Memorization:* [Memorization]
🔄 *Revision:* [Review]
⭐ *Daily Rating:* [Rating]

[Notes]

Thank you for your continuous support 🌿`
  },
  {
    id: 'absence',
    nameAr: 'تنبيه غياب',
    nameEn: 'Absence Notice',
    textAr: `⚠️ *تنبيه غياب*

السلام عليكم ورحمة الله وبركاته،
ولي أمر طالبنا/تنا *[Student_Name]* المحترم/ة.

نحيطكم علمًا بعدم حضور الطالب/ة لحلقة القرآن الكريم اليوم ([Date]).

نرجو التكرم بالاطمئنان عليه/ا وإفادتنا بسب الغياب لضمان استمرار متابعة الحفظ دون انقطاع 🌸`,
    textEn: `⚠️ *Absence Notification*

Peace be upon you,
Dear Parent of *[Student_Name]*.

We would like to inform you that the student was absent from the Quran class today ([Date]).

Please let us know if everything is fine and notify us of the reason to ensure continuous progress 🌸`
  },
  {
    id: 'exam',
    nameAr: 'نتيجة اختبار',
    nameEn: 'Exam Result',
    textAr: `🎉 *نتيجة اختبار القرآن الكريم* 🎉

السلام عليكم ورحمة الله وبركاته،
بشرى سارة لولي أمر الطالب/ة *[Student_Name]* 🏆

نود إعلامكم باجتياز اختبار: *[Test_Name]*
🎯 *الدرجة المستحقة:* [Score]
⭐ *التقييم العام:* [Rating]

[Notes]

مبارك هذا التميز، ونسأل الله أن يجعله من أهل القرآن 🤲✨`,
    textEn: `🎉 *Quran Exam Result* 🎉

Peace be upon you,
Great news for the parent of *[Student_Name]* 🏆

We are pleased to announce the completion of: *[Test_Name]*
🎯 *Score:* [Score]
⭐ *Rating:* [Rating]

[Notes]

Congratulations on this success! May Allah bless their progress 🤲✨`
  },
  {
    id: 'encouragement',
    nameAr: 'تحفيز وتميز',
    nameEn: 'Encouragement',
    textAr: `🌟 *وسام التميز والتفوق* 🌟

السلام عليكم ورحمة الله وبركاته،
سعداء جدًا اليوم بأداء طالبنا/تنا *[Student_Name]* في الحلقة 👏

أظهر/ت إتقانًا متميزًا وخلقًا رفيعًا في جلسة اليوم ([Date]).
[Notes]

استمروا في تحفيزه/ا، فنحن نكبر بجهودكم ومتابعتكم الصادقة 💖`,
    textEn: `🌟 *Excellence & Appreciation* 🌟

Peace be upon you,
We are extremely proud of *[Student_Name]*'s performance today 👏

Showed outstanding commitment and dedication during today's session ([Date]).
[Notes]

Keep encouraging them on this noble journey 💖`
  }
];

export const AVAILABLE_VARIABLES = [
  { key: '[Student_Name]', labelAr: 'اسم الطالب', labelEn: 'Student Name' },
  { key: '[Date]', labelAr: 'التاريخ', labelEn: 'Date' },
  { key: '[Status]', labelAr: 'حالة الحضور', labelEn: 'Status' },
  { key: '[Memorization]', labelAr: 'الحفظ', labelEn: 'Memorization' },
  { key: '[Review]', labelAr: 'المراجعة', labelEn: 'Review' },
  { key: '[Rating]', labelAr: 'التقييم', labelEn: 'Rating' },
  { key: '[Test_Name]', labelAr: 'اسم الاختبار', labelEn: 'Test Name' },
  { key: '[Score]', labelAr: 'الدرجة', labelEn: 'Score' },
  { key: '[Notes]', labelAr: 'الملاحظات', labelEn: 'Notes' }
];
