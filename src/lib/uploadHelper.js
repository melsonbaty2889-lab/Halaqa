// src/lib/uploadHelper.js
import imageCompression from 'browser-image-compression';

export async function processAndUploadReceipt(file, supabaseInstance, userId) {
  if (!file) return { url: null, path: null };

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

    const fileExt = fileToUpload.type === 'image/webp'
      ? 'webp'
      : (file.name?.split('.').pop() || 'png');

    const fileName = `receipt_${userId}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabaseInstance.storage
      .from('subscription-receipts')
      .upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: signedData } = await supabaseInstance.storage
      .from('subscription-receipts')
      .createSignedUrl(data.path, 60 * 60);

    return {
      path: data.path,
      url: signedData?.signedUrl || null
    };
  } catch (error) {
    console.error("Error in processAndUploadReceipt:", error);
    throw new Error(error.message || "حدث خطأ أثناء معالجة أو رفع الصورة.");
  }
}
