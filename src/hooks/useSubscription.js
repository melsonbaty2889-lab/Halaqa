// src/hooks/useSubscription.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSubscription(academyId) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!academyId) {
      setLoading(false);
      return;
    }

    async function fetchSubscription() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('saas_subscriptions')
          .select('*')
          .eq('academy_id', academyId)
          .maybeSingle();

        if (error) throw error;
        setSubscription(data);
      } catch (err) {
        console.error("🚨 Error fetching subscription:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [academyId]);

  // حالة الاشتراك النشط
  const isActive = subscription?.status === 'active' || subscription?.status === 'trial';
  
  // حالة طلب غير مدفوع / قيد المراجعة
  const isPending = subscription?.status === 'unpaid';

  // هل الخطة منتهية الصلاحية
  const isExpired = subscription?.expires_at 
    ? new Date(subscription.expires_at) < new Date() 
    : false;

  return { 
    subscription, 
    isActive: isActive && !isExpired, 
    isPending, 
    isExpired,
    loading 
  };
}
