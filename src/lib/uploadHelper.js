/* src/lib/uploadHelper.js */

/**
 * دالة لضغط الصورة وتقليل أبعادها باستخدام Canvas (تغنيك عن npm)
 */
const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // تغيير الأبعاد مع الحفاظ على نسبة الطول للعرض
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // تحويل الصورة إلى WebP أو JPEG مضغوطة
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('فشل ضغط الصورة'));
        },
        'image/webp',
        quality
      );
    };
    img.onerror = (error) => reject(error);
  });
};

/**
 * معالجة ورفع إشعار التحويل بشكل آمن
 */
export async function processAndUploadReceipt(file, supabaseClient, userId) {
  if (!file) throw new Error('يرجى اختيار صورة الإشعار.');

  // 1️⃣ التحقق من نوع الملف
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validMimeTypes.includes(file.type)) {
    throw new Error('عذرًا، نوع الملف غير مدعوم. يرجى رفع صورة بصيغة JPG أو PNG أو WEBP.');
  }

  // 2️⃣ التحقق المبدئي من الحجم (أقل من 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 10 ميجابايت.');
  }

  // 3️⃣ الضغط باستخدام Canvas النظيف
  let compressedBlob;
  try {
    compressedBlob = await compressImage(file);
  } catch (err) {
    console.error('Error compressing image:', err);
    throw new Error('حدث خطأ أثناء معالجة الصورة، يرجى محاولة رفع صورة أخرى.');
  }

  // 4️⃣ مسار واسم الملف
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

  // 6️⃣ الرابط المباشر
  const { data: publicUrlData } = supabaseClient.storage
    .from('payment-receipts')
    .getPublicUrl(filePath);

  return {
    path: filePath,
    url: publicUrlData.publicUrl
  };
}
