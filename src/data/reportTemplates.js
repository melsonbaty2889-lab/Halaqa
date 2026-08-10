export const AVAILABLE_VARIABLES = [
  { key: '{{student_name}}', category: 'basic', labelAr: 'اسم الطالب', labelEn: 'Student Name' },
  { key: '{{date}}', category: 'basic', labelAr: 'التاريخ', labelEn: 'Date' },
  { key: '{{status}}', category: 'attendance', labelAr: 'حالة الحضور', labelEn: 'Status' },
  { key: '{{memorization}}', category: 'academic', labelAr: 'الحفظ', labelEn: 'Memorization' },
  { key: '{{review}}', category: 'academic', labelAr: 'المراجعة', labelEn: 'Review' },
  { key: '{{rating}}', category: 'academic', labelAr: 'التقييم', labelEn: 'Rating' },
  { key: '{{test_name}}', category: 'academic', labelAr: 'اسم الاختبار', labelEn: 'Test Name' },
  { key: '{{score}}', category: 'academic', labelAr: 'الدرجة', labelEn: 'Score' },
  { key: '{{notes}}', category: 'communication', labelAr: 'الملاحظات', labelEn: 'Notes' }
];

export const REPORT_TEMPLATES = [
  {
    id: 'daily',
    nameAr: 'تقرير الإنجاز اليومي',
    nameEn: 'Daily Achievement',
    textAr: `✨ *تقرير الحفظ والمراجعة اليومي* ✨\n\nالسلام عليكم ورحمة الله وبركاته،\nولي أمر طالبنا المتميز/ة *{{student_name}}* 🌟\n\nإليكم إنجاز اليوم ({{date}}):\nحالة الحضور: {{status}}\n📖 *الحفظ الجديد:* {{memorization}}\n🔄 *المراجعة:* {{review}}\n⭐ *التقييم اليومي:* {{rating}}\n\n{{notes}}\n\nشكرًا لحسن متابعتكم وحرصكم الدائم 🌿`,
    textEn: `✨ *Daily Progress Report* ✨\n\nPeace be upon you,\nDear Parent of *{{student_name}}* 🌟\n\nHere is the progress for today ({{date}}):\nStatus: {{status}}\n📖 *New Memorization:* {{memorization}}\n🔄 *Revision:* {{review}}\n⭐ *Daily Rating:* {{rating}}\n\n{{notes}}\n\nThank you for your continuous support 🌿`
  },
  {
    id: 'absence',
    nameAr: 'تنبيه غياب',
    nameEn: 'Absence Notice',
    textAr: `⚠️ *تنبيه غياب*\n\nالسلام عليكم ورحمة الله وبركاته،\nولي أمر طالبنا/تنا *{{student_name}}* المحترم/ة.\n\nنحيطكم علمًا بعدم حضور الطالب/ة لحلقة القرآن الكريم اليوم ({{date}}).\n\nنرجو التكرم بالاطمئنان عليه/ا وإفادتنا بسب الغياب لضمان استمرار متابعة الحفظ دون انقطاع 🌸`,
    textEn: `⚠️ *Absence Notification*\n\nPeace be upon you,\nDear Parent of *{{student_name}}*.\n\nWe would like to inform you that the student was absent from the Quran class today ({{date}}).\n\nPlease let us know if everything is fine and notify us of the reason 🌸`
  },
  {
    id: 'exam',
    nameAr: 'نتيجة اختبار',
    nameEn: 'Exam Result',
    textAr: `🎉 *نتيجة اختبار القرآن الكريم* 🎉\n\nالسلام عليكم ورحمة الله وبركاته،\nبشرى سارة لولي أمر الطالب/ة *{{student_name}}* 🏆\n\nنود إعلامكم باجتياز اختبار: *{{test_name}}*\n🎯 *الدرجة المستحقة:* {{score}}\n⭐ *التقييم العام:* {{rating}}\n\n{{notes}}\n\nمبارك هذا التميز، ونسأل الله أن يجعله من أهل القرآن 🤲✨`,
    textEn: `🎉 *Quran Exam Result* 🎉\n\nPeace be upon you,\nGreat news for the parent of *{{student_name}}* 🏆\n\nWe are pleased to announce the completion of: *{{test_name}}*\n🎯 *Score:* {{score}}\n⭐ *Rating:* {{rating}}\n\n{{notes}}\n\nCongratulations on this success! May Allah bless their progress 🤲✨`
  },
  {
    id: 'encouragement',
    nameAr: 'تحفيز وتميز',
    nameEn: 'Encouragement',
    textAr: `🌟 *وسام التميز والتفوق* 🌟\n\nالسلام عليكم ورحمة الله وبركاته،\nسعداء جدًا اليوم بأداء طالبنا/تنا *{{student_name}}* في الحلقة 👏\n\nأظهر/ت إتقانًا متميزًا وخلقًا رفيعًا في جلسة اليوم ({{date}}).\n{{notes}}\n\nاستمروا في تحفيزه/ا، فنحن نكبر بجهودكم ومتابعتكم الصادقة 💖`,
    textEn: `🌟 *Excellence & Appreciation* 🌟\n\nPeace be upon you,\nWe are extremely proud of *{{student_name}}*'s performance today 👏\n\nShowed outstanding commitment and dedication during today's session ({{date}}).\n{{notes}}\n\nKeep encouraging them on this noble journey 💖`
  }
];
