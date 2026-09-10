import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';

export interface NotificationItem {
  id: string;
  academy_id: string;
  user_id: string;
  title: Record<string, string> | string;
  message: Record<string, string> | string;
  is_read: boolean;
  notification_type: string;
  action_url?: string;
  entity_type?: string;
  entity_id?: string;
  created_at: string;
  read_at?: string;
}

export function useNotifications(userId?: string, academyId?: string) {
  const { i18n } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper لفك نص الترجمة من حقل jsonb
  const formatText = useCallback((data: any) => {
    if (!data) return '';
    if (typeof data === 'string') return data;
    const lang = i18n.language || 'ar';
    return data[lang] || data.ar || data.en || '';
  }, [i18n.language]);

  // جلب الإشعارات الخاصة بالمستخدم
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (academyId) {
        query = query.eq('academy_id', academyId);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        setNotifications(data as NotificationItem[]);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, academyId]);

  // تحديد إشعار محدد كـ "تمت القراءة"
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: now })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, is_read: true, read_at: now } : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // تحديد كل الإشعارات كـ "تمت القراءة"
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: now })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true, read_at: now }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [userId]);

  // الاشتراك بالبث المباشر (Realtime) لطلب الإشعارات الجديدة فور وصولها
  useEffect(() => {
    fetchNotifications();

    if (!userId) return;

    const channel = supabase
      .channel(`public:notifications:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as NotificationItem;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    formatText,
  };
}

export default useNotifications;
