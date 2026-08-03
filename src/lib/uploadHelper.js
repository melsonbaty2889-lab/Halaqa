// src/utils/uploadHelper.js
import { supabase } from '../supabaseClient'; // اضبط المسار حسب مشروعك
import imageCompression from 'browser-image-compression';

/**
 * معالجة وضغط صورة الإشعار ورفعها لـ Supabase Storage
 */
export async function processAndUploadReceipt(file, userId) {
  if (!file) return null;

  try {
    let fileToUpload = file;

    // 1. محاولة ضغط الصورة لتقليل حجمها وتسريع الرفع
    const options = {
      maxSizeMB: 0.8,            // أقصى حجم 800 كيلوبايت
      maxWidthOrHeight: 1280,   // أقصى بعد لتفادي مشاكل الذاكرة
      useWebWorker: true,
      fileType: 'image/webp'    // تحويلها لـ WEBP الممتازة
    };

    try {
      fileToUpload = await imageCompression(file, options);
    } catch (compressError) {
      console.warn("فشل ضغط الصورة، سيتم رفع الملف الأصلي كبديل:", compressError);
      // في حالة فشل المكتبة في المعالجة (مثلاً صيغة غريبة)، نستخدم الملف الأصلي مباشرة
      fileToUpload = file;
    }

    // 2. تجهيز اسم الملف والمسار داخل Supabase Storage
    const fileExt = fileToUpload.name?.split('.').pop() || 'png';
    const fileName = `${userId}/${Date.now()}_receipt.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    // 3. رفع الملف إلى Supabase Storage Bucket
    const { data, error } = await supabase.storage
      .from('receipts') // تأكد من اسم الباكت لديك
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw error;
    }

    // 4. الحصول على رابط الصورة العام (Public URL)
    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;

  } catch (error) {
    console.error("Error in processAndUploadReceipt:", error);
    throw new Error("حدث خطأ أثناء رفع الصورة، يرجى التأكد من الاتصال أو محاولة اختيار صورة أخرى.");
  }
}
