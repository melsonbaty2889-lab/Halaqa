/* src/data/reportTemplates.js */

export const REPORT_TEMPLATES = [
  {
    id: 'daily_achievement',
    nameAr: 'تقرير الإنجاز اليومي',
    nameEn: 'Daily Achievement',
    text: `السلام عليكم ورحمة الله وبركاته، تحية طيبة من أكاديميتنا 🌸

نود إطلاعكم على تقرير أداء الابن(ة) [Student_Name] لليوم [Date]:
📖 الحفظ الجديد: [New_Mem]
🔄 المراجعة: [Review]
⭐️ التقييم: [Rating]
📝 الملاحظات: [Notes]

شاكرين لكم حسن المتابعة!`
  },
  {
    id: 'absence_alert',
    nameAr: 'تنبيه غياب',
    nameEn: 'Absence Notice',
    text: `السلام عليكم ورحمة الله وبركاته، ولي أمر الطالب(ة) [Student_Name] المحترم.

نفيدكم بعدم حضور الابن(ة) لحلقة اليوم [Date].
حالة الحضور: [Status]
نرجو الاطمئنان عليه(ا) والتواصل معنا في حال وجود أي عذر.

دمتم بخير.`
  },
  {
    id: 'exam_result',
    nameAr: 'نتيجة اختبار',
    nameEn: 'Exam Result',
    text: `السلام عليكم ورحمة الله وبركاته 💐

تهانينا! أتم الطالب(ة) [Student_Name] اختبار [Test_Name] بنجاح.
🎯 الدرجة: [Score]
📝 ملاحظات المعلم: [Notes]

بارك الله في جهوده ونفع به!`
  },
  {
    id: 'encouragement',
    nameAr: 'تحفيز وتميز',
    nameEn: 'Encouragement',
    text: `السلام عليكم ورحمة الله وبركاته 🌟

بشرى سارة! نود الإشادة بالأداء الممتاز للابن(ة) [Student_Name] اليوم في الحلقة. أظهر إتقاناً وتفوقاً ملحوظاً.

جزاكم الله خيراً على حسن التأسيس والمتابعة.`
  }
];

export const AVAILABLE_VARIABLES = [
  { id: '[Student_Name]', labelAr: 'اسم الطالب', labelEn: 'Student Name' },
  { id: '[Date]', labelAr: 'التاريخ', labelEn: 'Date' },
  { id: '[Status]', labelAr: 'حالة الحضور', labelEn: 'Status' },
  { id: '[New_Mem]', labelAr: 'الحفظ', labelEn: 'Memorization' },
  { id: '[Review]', labelAr: 'المراجعة', labelEn: 'Review' },
  { id: '[Rating]', labelAr: 'التقييم', labelEn: 'Rating' },
  { id: '[Notes]', labelAr: 'الملاحظات', labelEn: 'Notes' },
  { id: '[Test_Name]', labelAr: 'اسم الاختبار', labelEn: 'Test Name' },
  { id: '[Score]', labelAr: 'الدرجة', labelEn: 'Score' }
];
