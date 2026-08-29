// src/constants/riwayat.js

/**
 * قائمة الروايات والقراءات القرآنية المتواترة (القرّاء العشرة ورُواتهم)
 * مجهزة بدعم كامل للغتين العربية والإنجليزيّة.
 */
export const RIWAYAT_LIST = [
  // --- الأكثر انتشاراً وشيوعاً ---
  { id: 'hafs_an_asem', nameAr: 'حفص عن عاصم', nameEn: "Hafs 'an 'Asim", category: 'common' },
  { id: 'warsh_an_nafi', nameAr: 'ورش عن نافع', nameEn: "Warsh 'an Nafi'", category: 'common' },
  { id: 'qaloon_an_nafi', nameAr: 'قالون عن نافع', nameEn: "Qaloon 'an Nafi'", category: 'common' },
  { id: 'al_duri_an_abu_amr', nameAr: 'الدوري عن أبي عمرو', nameEn: "Al-Doori 'an Abi 'Amr", category: 'common' },
  { id: 'shuba_an_asem', nameAr: 'شعبة عن عاصم', nameEn: "Shu'bah 'an 'Asim", category: 'common' },

  // --- باقي القراءات العشر المتواترة (مرتبة حسب الأئمة) ---
  
  // 1. نافع المدني (قالون وورش مذكورين بالأعلى)

  // 2. ابن كثير المكي
  { id: 'al_bazzi_an_ibn_kathir', nameAr: 'البزي عن ابن كثير', nameEn: "Al-Bazzi 'an Ibn Kathir", category: 'ten_reads' },
  { id: 'qunbul_an_ibn_kathir', nameAr: 'قنبل عن ابن كثير', nameEn: "Qunbul 'an Ibn Kathir", category: 'ten_reads' },

  // 3. أبو عمرو البصري (الدوري مذكور بالأعلى)
  { id: 'al_susi_an_abu_amr', nameAr: 'السوسي عن أبي عمرو', nameEn: "Al-Soosi 'an Abi 'Amr", category: 'ten_reads' },

  // 4. ابن عامر الشامي
  { id: 'hisham_an_ibn_amir', nameAr: 'هشام عن ابن عامر', nameEn: "Hisham 'an Ibn 'Amir", category: 'ten_reads' },
  { id: 'ibn_dhakwan_an_ibn_amir', nameAr: 'ابن ذكوان عن ابن عامر', nameEn: "Ibn Dhakwan 'an Ibn 'Amir", category: 'ten_reads' },

  // 5. عاصم الكوفي (حفص وشعبة مذكورين بالأعلى)

  // 6. حمزة الكوفي
  { id: 'khalaf_an_hamzah', nameAr: 'خلف عن حمزة', nameEn: "Khalaf 'an Hamzah", category: 'ten_reads' },
  { id: 'khallad_an_hamzah', nameAr: 'خلاد عن حمزة', nameEn: "Khallad 'an Hamzah", category: 'ten_reads' },

  // 7. الكسائي الكوفي
  { id: 'al_layth_an_al_kisai', nameAr: 'أبو الحارث عن الكسائي', nameEn: "Abu Al-Harith 'an Al-Kisa'i", category: 'ten_reads' },
  { id: 'al_duri_an_al_kisai', nameAr: 'الدوري عن الكسائي', nameEn: "Al-Doori 'an Al-Kisa'i", category: 'ten_reads' },

  // 8. أبو جعفر المدني
  { id: 'isa_an_abu_jafar', nameAr: 'ابن وردان عن أبي جعفر', nameEn: "Ibn Wardan 'an Abu Ja'far", category: 'ten_reads' },
  { id: 'sulayman_an_abu_jafar', nameAr: 'ابن جماز عن أبي جعفر', nameEn: "Ibn Jammaz 'an Abu Ja'far", category: 'ten_reads' },

  // 9. يعقوب الحضرمي
  { id: 'ruwaysh_an_yaqub', nameAr: 'رويس عن يعقوب الحضرمي', nameEn: "Ruways 'an Ya'qub", category: 'ten_reads' },
  { id: 'rooh_an_yaqub', nameAr: 'روح عن يعقوب الحضرمي', nameEn: "Rooh 'an Ya'qub", category: 'ten_reads' },

  // 10. خلف العاشر
  { id: 'ishaq_an_khalaf', nameAr: 'إسحاق عن خلف العاشر', nameEn: "Ishaq 'an Khalaf Al-Ashir", category: 'ten_reads' },
  { id: 'idrees_an_khalaf', nameAr: 'إدريس عن خلف العاشر', nameEn: "Idrees 'an Khalaf Al-Ashir", category: 'ten_reads' },

  // --- خيارات عامة ---
  { id: 'other', nameAr: 'رواية أخرى / غير محدد', nameEn: 'Other / Unspecified', category: 'other' }
];

export const RIWAYAT_MAP = RIWAYAT_LIST.reduce((acc, curr) => {
  acc[curr.id] = curr.nameAr;
  return acc;
}, {});

/**
 * دالة مساعدة لجلب اسم الرواية بناءً على اللغة الحالية
 */
export const getRiwayaName = (id, lang = 'ar') => {
  const item = RIWAYAT_LIST.find(r => r.id === id);
  if (!item) return id;
  return lang === 'ar' ? item.nameAr : item.nameEn;
};

export default RIWAYAT_LIST;
