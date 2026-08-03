// src/lib/uploadHelper.js
import imageCompression from 'browser-image-compression';

/**
 * دالة رفع وتصغير صورة إشعار التحويل
 */
export async function processAndUploadReceipt(file, supabaseInstance, userId) {
  if (!file) return { url: null };

  try {
    let fileToUpload = file;

    // 1. محاولة ضغط الصورة لتقليل الحجم
    const options = {
      maxSizeMB: 0.8,            // أقصى حجم 800 كيلوبايت
      maxWidthOrHeight: 1280,   // أقصى أبعاد
      useWebWorker: true,
      fileType: 'image/webp'
    };

    try {
      fileToUpload = await imageCompression(file, options);
    } catch (compressError) {
      console.warn("فشل ضغط الصورة، سيتم استخدام الملف الأصلي:", compressError);
      fileToUpload = file; // البديل: رفع الملف الأصلي بدون ضغط
    }

    // 2. إعداد مسار الملف
    const fileExt = fileToUpload.name?.split('.').pop() || 'png';
    const fileName = `${userId}/${Date.now()}_receipt.${fileExt}`;
    const filePath = `${fileName}`;

    // 3. الرفع إلى Supabase Storage
    const { data, error } = await supabaseInstance.storage
      .from('receipts')
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw error;
    }

    // 4. استخراج رابط الصورة العام
    const { data: publicUrlData } = supabaseInstance.storage
      .from('receipts')
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl };

  } catch (error) {
    console.error("Error in processAndUploadReceipt:", error);
    throw new Error(error.message || "حدث خطأ أثناء معالجة أو رفع الصورة، يرجى تجربة صورة أخرى.");
  }
}
