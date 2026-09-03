// src/hooks/useSubscription.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useSubscription(academyId) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!academyId) {
      setLoading(true);
      return;
    }

    let isMounted = true;

    async function fetchSubscription() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('saas_subscriptions')
          .select('*')
          .eq('academy_id', academyId)
          .maybeSingle();

        if (error) throw error;
        if (isMounted) setSubscription(data);
      } catch (err) {
        console.error("🚨 Error fetching subscription:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSubscription();

    return () => {
      isMounted = false;
    };
  }, [academyId]);

  const isActive = subscription?.status === 'active' || subscription?.status === 'trial';
  const isPending = subscription?.status === 'unpaid';
  const isExpired = subscription?.expires_at 
    ? new Date(subscription.expires_at) < new Date() 
    : false;

  return { 
    subscription, 
    isActive: subscription ? (isActive && !isExpired) : true, 
    isPending, 
    isExpired,
    loading 
  };
}
