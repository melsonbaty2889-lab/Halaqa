// src/lib/notificationService.js
import { supabase } from './supabase';
import { NOTIFICATION_TYPES } from '../constants/notificationConstants.js';

/**
 * دالة موحدة لإرسال إشعار فردي يطابق بنية جدول notifications
 */
export async function sendNotification({
  userId,
  academyId = null,
  notificationType = NOTIFICATION_TYPES.GENERAL,
  titleKey,
  messageKey,
  metadata = {},
  actionUrl = null,
  entityType = null,
  entityId = null,
}) {
  if (!userId || !titleKey) {
    console.error('🚨 Notification Error: Missing required fields');
    return { success: false, error: 'Missing required parameters' };
  }

  try {
    const payload = {
      user_id: userId,
      academy_id: academyId,
      notification_type: notificationType,
      title: { key: titleKey },
      message: messageKey ? { key: messageKey } : null,
      metadata: metadata,
      action_url: actionUrl,
      entity_type: entityType,
      entity_id: entityId,
      is_read: false,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    console.error('🚨 Error sending notification:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * دالة إرسال تنبيهات جماعية
 */
export async function sendBulkNotification({
  userIds = [],
  academyId = null,
  notificationType = NOTIFICATION_TYPES.ANNOUNCEMENT,
  titleKey,
  messageKey,
  metadata = {},
  actionUrl = null,
}) {
  if (!userIds.length || !titleKey) return { success: false };

  try {
    const now = new Date().toISOString();
    const records = userIds.map((id) => ({
      user_id: id,
      academy_id: academyId,
      notification_type: notificationType,
      title: { key: titleKey },
      message: messageKey ? { key: messageKey } : null,
      metadata,
      action_url: actionUrl,
      is_read: false,
      created_at: now
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(records);

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('🚨 Error sending bulk notifications:', err.message);
    return { success: false, error: err.message };
  }
}
