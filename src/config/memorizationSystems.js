/**
 * src/config/memorizationSystems.js
 * المرجع العالمي الكامل لأنظمة التحفيظ القرآنية والروايات المتواترة
 */

// أولاً: الروايات العشر المتواترة من طريق الشاطبية والدرة وطيبة النشر
export const QURAAN_READINGS = [
  { id: 'hafs', name: 'حفص عن عاصم (العالمي الأبرز)', defaultIn: ['EG', 'SA', 'IN', 'PK', 'ID', 'MY', 'TR', 'Global'] },
  { id: 'warsh_azraq', name: 'ورش عن نافع - طريق الأزرق (المغرب العربي والغرب الإفريقي)', defaultIn: ['MA', 'DZ', 'TN', 'SN', 'ML'] },
  { id: 'warsh_asbahani', name: 'ورش عن نافع - طريق الأصبهاني', defaultIn: ['MA', 'DZ'] },
  { id: 'qaloon', name: 'قالون عن نافع (ليبيا وتونس وغرب إفريقيا)', defaultIn: ['LY', 'TN', 'NG', 'TD'] },
  { id: 'duri_abu_amr', name: 'دوري أبي عمرو البصري (السودان وشرق إفريقيا)', defaultIn: ['SD', 'SO', 'KE'] },
  { id: 'al_soosi', name: 'السوسي عن أبي عمرو البصري', defaultIn: ['SD', 'YEM'] },
  { id: 'shouba', name: 'شعبة عن عاصم', defaultIn: ['Global'] },
  { id: 'ibn_kathir', name: 'ابن كثير المكي (البزي وقنبل)', defaultIn: ['Global'] },
  { id: 'ibn_amir', name: 'ابن عامر الشامي (هشام ابن ذكوان)', defaultIn: ['SY'] },
  { id: 'hamza', name: 'حمزة الكوفي (خلف وخلاد)', defaultIn: ['Global'] },
  { id: 'al_kisai', name: 'الكسائي (أبو الحارث والدوري)', defaultIn: ['Global'] },
  { id: 'abu_jaafar', name: 'أبو جعفر المدني (عيسى وسليمان)', defaultIn: ['Global'] },
  { id: 'yaqoub', name: 'يعقوب الحضرمي (رويس ورويس)', defaultIn: ['Global'] },
  { id: 'khalaf_tenth', name: 'خلف العاشر (إسحاق وإدريس)', defaultIn: ['Global'] }
];

// ثانياً: الطرق والمناهج العالمية المعتمدة للتحفيظ
export const GLOBAL_MEMORIZATION_SYSTEMS = [
  {
    id: 'morocco_louh',
    region: 'المغرب العربي وغرب إفريقيا',
    name: 'نظام اللوح والخرطة والربط المغاربي',
    description: 'كتابة النص على اللوح الخشبي بمداد خاص، والتثبيت بالسلكة والربط الأسبوعي.',
    unitType: 'لوح / ثمن / حزب',
    supportedCountries: ['MA', 'DZ', 'TN', 'MR', 'SN', 'ML', 'NE'],
    defaultReading: 'warsh_azraq'
  },
  {
    id: 'egypt_shami',
    region: 'مصر والشام والعالم العربي',
    name: 'نظام الأرباع والربط الثلاثي (الجديد - القريب - البعيد)',
    description: 'حفظ الورد الجديد، مع مراجعة قريب الحفظ (الربط)، وسرد البعيد لتثبيت القرآن.',
    unitType: 'ربع / حزب / جزء',
    supportedCountries: ['EG', 'SY', 'JO', 'PS', 'LB', 'IQ'],
    defaultReading: 'hafs'
  },
  {
    id: 'gulf_standard',
    region: 'الخليج العربي والجزيرة',
    name: 'نظام الأوجه والأسْباع والمراجعة المتقنة',
    description: 'حفظ عدد محدد من الأوجه (الصفحات) يومياً، مع اختبارات التقييم المباشر والتجويد.',
    unitType: 'وجه / صفحة / جزء',
    supportedCountries: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
    defaultReading: 'hafs'
  },
  {
    id: 'indostan_15lines',
    region: 'شبه القارة الهندية ودول آسيا',
    name: 'نظام المصحف 15 سطراً والذاكرة البصرية (المنازل)',
    description: 'الاعتماد على التقسيم الثابت لأسطر الصفحة (15 سطراً) والسرد الكامل غيباً في مجلس واحد.',
    unitType: 'سطر / صفحة / منزل',
    supportedCountries: ['PK', 'IN', 'BD', 'AF'],
    defaultReading: 'hafs'
  },
  {
    id: 'se_asia_pesantren',
    region: 'جنوب شرق آسيا',
    name: 'نظام المعاهد والتسميع التبادلي (Pesantren System)',
    description: 'الدراسة الداخلية الحلقية، والتسميع التبادلي بين الطلاب تحت إشراف المشايخ.',
    unitType: 'صفحة / جزء / ختمة جماعية',
    supportedCountries: ['ID', 'MY', 'BN'],
    defaultReading: 'hafs'
  },
  {
    id: 'sudan_khalwa',
    region: 'السودان وإفريقيا الاستوائية',
    name: 'نظام الخلوة والدواية والمحاضر القرآنية',
    description: 'الكتابة الجماعية والتكرار الصوتي المباشر، والسرد المتقن قبل منح الإجازة.',
    unitType: 'لوح / عرضة / سلكة',
    supportedCountries: ['SD', 'SO', 'TD', 'ET'],
    defaultReading: 'duri_abu_amr'
  },
  {
    id: 'global_flexible',
    region: 'عالمي / عام',
    name: 'النظام المرن المعياري (الآيات والصفحات)',
    description: 'نظام افتراضي يتيح تحديد عدد الحرية الكاملة في اختيار عدد الآيات أو الصفحات يومياً.',
    unitType: 'آية / صفحة',
    supportedCountries: ['Global'],
    defaultReading: 'hafs'
  }
];

// ثالثاً: دوال الجلب والدعم لربط الإعدادات ديناميكياً
export const getAcademyConfiguration = (countryCode = 'EG') => {
  // تصفية الطرق بناءً على الدولة
  const matchedSystems = GLOBAL_MEMORIZATION_SYSTEMS.filter(sys => 
    sys.supportedCountries.includes(countryCode) || sys.supportedCountries.includes('Global')
  );

  // تصفية الروايات المقترحة أولاً بناءً على الدولة
  const primaryReadings = QURAAN_READINGS.filter(rd => 
    rd.defaultIn.includes(countryCode)
  );

  return {
    availableSystems: matchedSystems,
    suggestedReadings: primaryReadings.length > 0 ? primaryReadings : QURAAN_READINGS,
    allReadings: QURAAN_READINGS
  };
};
