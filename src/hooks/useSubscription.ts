// src/hooks/useSubscription.ts

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';

export type SubscriptionStatus = 'trial' | 'active' | 'pending_verification' | 'unpaid' | 'canceled' | 'past_due' | string;
export type PlanTier = 'monthly' | 'yearly' | string;
export type PlanDuration = 'monthly' | 'yearly' | string;

export interface SaasSubscription {
  id: string;
  academy_id: string;
  payer_id?: string;
  plan_tier: PlanTier;
  plan_duration: PlanDuration;
  status: SubscriptionStatus;
  trial_ends_at?: string | null;
  expires_at: string;
  starts_at?: string;
  cancel_at_period_end?: boolean;
  canceled_at?: string | null;
  payment_gateway?: string | null;
  gateway_subscription_id?: string | null;
  gateway_customer_id?: string | null;
  created_at?: string;
  updated_at?: string;
  price?: number;
  currency?: string;
  metadata?: Record<string, any>;
  last_payment_attempt_at?: string | null;
}

export interface UseSubscriptionReturn {
  subscription: SaasSubscription | null;
  isActive: boolean;
  isPending: boolean;
  isExpired: boolean;
  isTrial: boolean;
  daysRemaining: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSubscription(explicitAcademyId?: string | null): UseSubscriptionReturn {
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState<SaasSubscription | null>(null);
  const [academyId, setAcademyId] = useState<string | null>(explicitAcademyId || null);
  const [computedData, setComputedData] = useState({
    isActive: false,
    isTrial: false,
    daysRemaining: 0,
    status: 'trial',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // جلب academy_id إذا لم يتم تمريره
  useEffect(() => {
    if (explicitAcademyId) {
      setAcademyId(explicitAcademyId);
      return;
    }

    let isSubscribed = true;

    async function resolveAcademyId() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('academy_id')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.academy_id && isSubscribed) {
          setAcademyId(profile.academy_id);
        }
      } catch (err) {
        console.error('🚨 Error resolving academy_id:', err);
      }
    }

    resolveAcademyId();

    return () => {
      isSubscribed = false;
    };
  }, [explicitAcademyId]);

  const fetchSubscription = useCallback(async () => {
    if (!academyId) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. جلب السجل الكامل للاشتراك
      const { data: subData, error: apiError } = await supabase
        .from('saas_subscriptions')
        .select('*')
        .eq('academy_id', academyId)
        .maybeSingle();

      if (apiError) throw apiError;

      // 2. استدعاء RPC الموحدة لحساب الأيام والحالة بدقة دقيقة
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_academy_subscription_status', { target_academy_id: academyId });

      if (rpcError) throw rpcError;

      const computed = Array.isArray(rpcData) && rpcData.length > 0 ? rpcData[0] : null;

      setSubscription(subData as SaasSubscription | null);

      if (computed) {
        setComputedData({
          isActive: Boolean(computed.is_active),
          isTrial: Boolean(computed.is_trial),
          daysRemaining: Number(computed.days_remaining) || 0,
          status: computed.status || subData?.status || 'trial',
        });
      }
    } catch (err: any) {
      console.error('🚨 Error fetching subscription:', err);
      const fallbackMsg = t('subscription.errors.fetchFailed', 'فشل جلب بيانات الاشتراك');
      setError(err?.message || fallbackMsg);
    } finally {
      setLoading(false);
    }
  }, [academyId, t]);

  useEffect(() => {
    if (!academyId) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    fetchSubscription();

    const channelName = `subscription_${academyId}_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saas_subscriptions',
          filter: `academy_id=eq.${academyId}`,
        },
        () => {
          fetchSubscription();
        }
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [academyId, fetchSubscription]);

  const isPending = Boolean(
    subscription?.status === 'pending_verification' || 
    subscription?.status === 'unpaid' || 
    subscription?.status === 'past_due'
  );

  const isExpired = !computedData.isActive && !computedData.isTrial && !isPending;

  return {
    subscription,
    isActive: computedData.isActive,
    isPending,
    isExpired,
    isTrial: computedData.isTrial,
    daysRemaining: computedData.daysRemaining,
    loading,
    error,
    refetch: fetchSubscription,
  };
}

export default useSubscription;
