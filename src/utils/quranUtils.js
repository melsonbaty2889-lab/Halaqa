/**
 * دالة تحول رقم الربع الخطي (1-240) إلى تفاصيل عربية ونسبة مئوية لخط السير
 * @param {number} index - مؤشر الربع الحالي للطالب
 */
export const getQuranProgress = (index) => {
  // إذا كان الرقم صفر أو غير صحيح، يعني أن الطالب لم يبدأ بعد
  if (!index || index < 1 || index > 240) {
    return { juz: 0, hizb: 0, quarterInHizb: 0, percentage: 0, text: 'لم يبدأ بعد' };
  }

  // 1. حساب النسبة المئوية من القرآن كاملاً
  const percentage = Math.round((index / 240) * 100);

  // 2. حساب رقم الجزء (كل جزء يحتوي على 8 أرباع)
  const juz = Math.ceil(index / 8);

  // 3. حساب رقم الحزب (كل حزب يحتوي على 4 أرباع)
  const hizb = Math.ceil(index / 4);

  // 4. حساب ترتيب الربع داخل الحزب الحالي (من 1 إلى 4)
  const quarterInHizb = index % 4 === 0 ? 4 : index % 4;

  return {
    juz,
    hizb,
    quarterInHizb,
    percentage,
    text: `الجزء ${juz} • الحزب ${hizb} • الربع ${quarterInHizb}`
  };
};
