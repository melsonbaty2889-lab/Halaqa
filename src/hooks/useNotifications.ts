import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';

export interface NotificationItem {
  id: string;
  academy_id?: string;
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

export function useNotifications(userId?: string | null, academyId?: string | null) {
  const { i18n } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Helper لفك نص الترجمة من حقل jsonb
  const formatText = useCallback((data: any) => {
    if (!data) return '';
    if (typeof data === 'string') return data;
    const lang = i18n.language || 'ar';
    return data[lang] || data.ar || data.en || '';
  }, [i18n.language]);

  // جلب الإشعارات الخاصة بالمستخدم
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      if (isMounted.current) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
      }
      return;
    }

    if (isMounted.current) setLoading(true);

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

      if (data && isMounted.current) {
        const notifs = data as NotificationItem[];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.is_read).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [userId, academyId]);

  // تحديد إشعار محدد كـ "تمت القراءة"
  const markAsRead = useCallback(async (notificationId: string) => {
    const previousNotifs = [...notifications];

    // Optimistic Update
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notificationId ? { ...item, is_read: true, read_at: new Date().toISOString() } : item
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: now })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Revert upon error
      if (isMounted.current) {
        setNotifications(previousNotifs);
        setUnreadCount(previousNotifs.filter((n) => !n.is_read).length);
      }
    }
  }, [notifications]);

  // تحديد كل الإشعارات كـ "تمت القراءة"
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    const previousNotifs = [...notifications];
    const now = new Date().toISOString();

    // Optimistic Update
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, is_read: true, read_at: now }))
    );
    setUnreadCount(0);

    try {
      let query = supabase
        .from('notifications')
        .update({ is_read: true, read_at: now })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (academyId) {
        query = query.eq('academy_id', academyId);
      }

      const { error } = await query;
      if (error) throw error;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      if (isMounted.current) {
        setNotifications(previousNotifs);
        setUnreadCount(previousNotifs.filter((n) => !n.is_read).length);
      }
    }
  }, [userId, academyId, notifications]);

  // الاشتراك بالبث المباشر (Realtime) لطلب الإشعارات الجديدة وتحديث الأحداث
  useEffect(() => {
    fetchNotifications();

    if (!userId) return;

    const channel = supabase
      .channel(`public:notifications:user_id=${userId}`)
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
          if (academyId && newNotif.academy_id && newNotif.academy_id !== academyId) return;

          setNotifications((prev) => [newNotif, ...prev]);
          if (!newNotif.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedNotif = payload.new as NotificationItem;
          setNotifications((prev) =>
            prev.map((item) => (item.id === updatedNotif.id ? updatedNotif : item))
          );
          setUnreadCount((prev) => {
            const list = notifications.map((n) => (n.id === updatedNotif.id ? updatedNotif : n));
            return list.filter((n) => !n.is_read).length;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, academyId, fetchNotifications]);

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
