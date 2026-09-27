// src/lib/notificationService.js
import { supabase } from '@/lib/supabase';

/**
 * دالة موحدة لإرسال/إنشاء إشعار جديد في قاعدة البيانات
 * @param {Object} params
 * @param {string} params.userId - معرف المستخدم المستهدف
 * @param {string} [params.academyId] - معرف الأكاديمية (اختياري)
 * @param {Object|string} params.title - العنوان (يمكن أن يكون كائن لغات أو نص مباشر)
 * @param {Object|string} params.message - الرسالة (يمكن أن تكون كائن لغات أو نص مباشر)
 * @param {string} [params.notificationType='info'] - نوع التنبيه (live_session, recitation, attendance, payment, badge, exam, alert, info)
 * @param {string} [params.actionUrl] - رابط الإجراء عند الضغط
 * @param {string} [params.entityType] - نوع الكائن المرتبط (مثل session, student)
 * @param {string} [params.entityId] - معرف الكائن المرتبط
 */
export async function sendNotification({
  userId,
  academyId = null,
  title,
  message,
  notificationType = 'info',
  actionUrl = null,
  entityType = null,
  entityId = null
}) {
  if (!userId) {
    console.error('Notification error: userId is required');
    return { success: false, error: 'userId is required' };
  }

  try {
    // تجهيز الهيكل متعدد اللغات للعنوان والرسالة إن لم تكن مجهزة
    const formattedTitle = typeof title === 'string' 
      ? { ar: title, en: title, fr: title, tr: title, ur: title, id: title } 
      : title;

    const formattedMessage = typeof message === 'string' 
      ? { ar: message, en: message, fr: message, tr: message, ur: message, id: message } 
      : message;

    const notificationData = {
      user_id: userId,
      academy_id: academyId,
      title: formattedTitle,
      message: formattedMessage,
      notification_type: notificationType,
      action_url: actionUrl,
      entity_type: entityType,
      entity_id: entityId,
      is_read: false,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    console.error('Error sending notification:', err);
    return { success: false, error: err.message };
  }
}
