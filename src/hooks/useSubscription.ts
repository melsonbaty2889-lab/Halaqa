import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';

// ── Types & Interfaces ──────────────────────────────────────────

export type SubscriptionStatus = 'trial' | 'active' | 'unpaid' | 'canceled' | 'past_due' | string;
export type PlanTier = 'free' | 'basic' | 'pro' | 'enterprise' | string;
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

// ── Main Hook ───────────────────────────────────────────────────

export function useSubscription(academyId?: string | null): UseSubscriptionReturn {
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState<SaasSubscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!academyId) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!supabase?.from) {
        throw new Error(t('subscription.errors.clientNotInitialized', 'لم يتم تهيئة الاتصال بالسحابة بشكل صحيح'));
      }

      const { data, error: apiError } = await supabase
        .from('saas_subscriptions')
        .select('*')
        .eq('academy_id', academyId)
        .maybeSingle();

      if (apiError) throw apiError;
      setSubscription(data as SaasSubscription | null);
    } catch (err: any) {
      console.error('🚨 Error fetching subscription:', err);
      const fallbackMsg = t('subscription.errors.fetchFailed', 'فشل جلب بيانات الاشتراك');
      setError(err?.message || fallbackMsg);
    } finally {
      setLoading(false);
    }
  }, [academyId, t]);

  useEffect(() => {
    fetchSubscription();

    // 📡 الاشتراك بالاستماع للتغييرات الفورية للخطط والاشتراكات عبر Realtime
    if (!academyId) return;

    const channel = supabase
      .channel(`subscription_${academyId}`)
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
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [academyId, fetchSubscription]);

  // ⏱️ حساب الحالات والمدد
  const computedState = useMemo(() => {
    const now = new Date();

    const isTrial = Boolean(
      subscription?.status === 'trial' ||
      (subscription?.trial_ends_at && new Date(subscription.trial_ends_at) > now)
    );

    const isExpired = subscription?.expires_at
      ? new Date(subscription.expires_at) < now
      : false;

    const isActive = Boolean(
      (subscription?.status === 'active' || subscription?.status === 'trial') && !isExpired
    );

    const isPending = subscription?.status === 'unpaid' || subscription?.status === 'past_due';

    const daysRemaining = subscription?.expires_at
      ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      isTrial,
      isExpired,
      isActive,
      isPending,
      daysRemaining,
    };
  }, [subscription]);

  return {
    subscription,
    isActive: computedState.isActive,
    isPending: computedState.isPending,
    isExpired: computedState.isExpired,
    isTrial: computedState.isTrial,
    daysRemaining: computedState.daysRemaining,
    loading,
    error,
    refetch: fetchSubscription,
  };
}

export default useSubscription;
