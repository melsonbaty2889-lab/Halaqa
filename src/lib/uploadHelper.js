/* src/lib/uploadHelper.js */
import browserImageResizer from 'browser-image-resizer';

// إعدادات ضغط الصور
const RESIZE_CONFIG = {
  quality: 0.75,         // جودة الصورة (75% ممتازة للإيصالات)
  maxWidth: 1200,        // أقصى عرض للكسل
  maxHeight: 1200,       // أقصى ارتفاع
  autoRotate: true,
  mimeType: 'image/webp' // تحويل الصيغة إلى webP لتقليل الحجم
};

/**
 * معالجة ورفع إشعار التحويل بشكل آمن
 * @param {File} file - ملف الصورة من مدخل العميل
 * @param {Object} supabaseClient - عميل Supabase
 * @param {string} userId - معرف المستخدم لإنشاء مجلد خاص به
 */
export async function processAndUploadReceipt(file, supabaseClient, userId) {
  if (!file) throw new Error('يرجى اختيار صورة الإشعار.');

  // 1️⃣ التحقق من نوع الملف (MIME Type)
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validMimeTypes.includes(file.type)) {
    throw new Error('عذرًا، نوع الملف غير مدعوم. يرجى رفع صورة بصيغة JPG أو PNG أو WEBP.');
  }

  // 2️⃣ التحقق المبدئي من حجم الملف (أقل من 10MB قبل الضغط)
  const MAX_RAW_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_RAW_SIZE) {
    throw new Error('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 10 ميجابايت.');
  }

  // 3️⃣ ضغط الصورة وتغيير الأبعاد
  let compressedBlob;
  try {
    compressedBlob = await browserImageResizer.resize(file, RESIZE_CONFIG);
  } catch (err) {
    console.error('Error compressing image:', err);
    throw new Error('حدث خطأ أثناء معالجة الصورة، يرجى محاولة رفع صورة أخرى.');
  }

  // 4️⃣ إنشاء مسار واسم آمن للملف لمنع التعارض والحروب البرمجية
  const timestamp = Date.now();
  const safeRandomId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
  const filePath = `${userId}/${timestamp}_${safeRandomId}.webp`;

  // 5️⃣ الرفع إلى Supabase Storage Bucket
  const { data, error } = await supabaseClient.storage
    .from('payment-receipts')
    .upload(filePath, compressedBlob, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Storage Upload Error:', error.message);
    throw new Error('فشل رفع صورة الإشعار، يرجى المحاولة مرة أخرى.');
  }

  // 6️⃣ استخراج الرابط المباشر للملف
  const { data: publicUrlData } = supabaseClient.storage
    .from('payment-receipts')
    .getPublicUrl(filePath);

  return {
    path: filePath,
    url: publicUrlData.publicUrl
  };
}
