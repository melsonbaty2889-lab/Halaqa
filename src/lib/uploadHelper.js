// src/lib/uploadHelper.js
import imageCompression from 'browser-image-compression';

export async function processAndUploadReceipt(file, supabaseInstance, userId) {
  if (!file) return { url: null };

  try {
    let fileToUpload = file;

    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      fileType: 'image/webp'
    };

    try {
      fileToUpload = await imageCompression(file, options);
    } catch (compressError) {
      console.warn("فشل ضغط الصورة، سيتم استخدام الملف الأصلي:", compressError);
      fileToUpload = file;
    }

    // تحديد الامتداد بدقة بحسب نوع الملف المعالج
    const fileExt = fileToUpload.type === 'image/webp' 
      ? 'webp' 
      : (file.name?.split('.').pop() || 'png');

    // مسار مباشر داخل الـ Bucket دون مجلدات فرعية زائدة
    const fileName = `receipt_${userId}_${Date.now()}.${fileExt}`;

    // الرفع إلى Bucket: subscription-receipts
    const { data, error } = await supabaseInstance.storage
      .from('subscription-receipts')
      .upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: publicUrlData } = supabaseInstance.storage
      .from('subscription-receipts')
      .getPublicUrl(fileName);

    return { url: publicUrlData.publicUrl };

  } catch (error) {
    console.error("Error in processAndUploadReceipt:", error);
    throw new Error(error.message || "حدث خطأ أثناء معالجة أو رفع الصورة.");
  }
}
