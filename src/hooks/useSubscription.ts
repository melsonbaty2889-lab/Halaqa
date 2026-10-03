// src/hooks/useSubscription.ts

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';

// ── Types & Interfaces ──────────────────────────────────────────

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

// ── Main Hook ───────────────────────────────────────────────────

export function useSubscription(explicitAcademyId?: string | null): UseSubscriptionReturn {
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState<SaasSubscription | null>(null);
  const [academyId, setAcademyId] = useState<string | null>(explicitAcademyId || null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // 🔄 جلب academy_id تلقائياً إذا لم يتم تحديده يدوياً
  useEffect(() => {
    if (explicitAcademyId) {
      setAcademyId(explicitAcademyId);
      return;
    }

    async function resolveAcademyId() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('academy_id')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.academy_id && isMountedRef.current) {
          setAcademyId(profile.academy_id);
        }
      } catch (err) {
        console.error('🚨 Error resolving academy_id:', err);
      }
    }

    resolveAcademyId();
  }, [explicitAcademyId]);

  const fetchSubscription = useCallback(async () => {
    if (!academyId) {
      if (isMountedRef.current) {
        setSubscription(null);
        setLoading(false);
      }
      return;
    }

    try {
      if (isMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      if (!supabase?.from) {
        throw new Error(t('subscription.errors.clientNotInitialized', 'لم يتم تهيئة الاتصال بالسحابة بشكل صحيح'));
      }

      const { data, error: apiError } = await supabase
        .from('saas_subscriptions')
        .select('*')
        .eq('academy_id', academyId)
        .maybeSingle();

      if (apiError) throw apiError;

      if (isMountedRef.current) {
        setSubscription(data as SaasSubscription | null);
      }
    } catch (err: any) {
      console.error('🚨 Error fetching subscription:', err);
      if (isMountedRef.current) {
        const fallbackMsg = t('subscription.errors.fetchFailed', 'فشل جلب بيانات الاشتراك');
        setError(err?.message || fallbackMsg);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [academyId, t]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchSubscription();

    if (!academyId) return;

    // 📡 الاستماع للتغييرات الفورية للخطط والاشتراكات عبر Realtime
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
      isMountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [academyId, fetchSubscription]);

  // ⏱️ حساب الحالات والمدد بشكل موحد
  const computedState = useMemo(() => {
    const now = new Date();

    const isSubActive = subscription?.status === 'active';

    // التمييز بين فترة التجربة والاشتراك النشط
    const isTrial = Boolean(
      subscription?.status === 'trial' ||
      (!isSubActive && subscription?.trial_ends_at && new Date(subscription.trial_ends_at) > now)
    );

    // تحديد التاريخ المستهدف لحساب الأيام المتبقية
    const targetExpiryDate = isSubActive
      ? (subscription?.expires_at ? new Date(subscription.expires_at) : null)
      : (subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null);

    const isExpired = targetExpiryDate ? targetExpiryDate < now : false;

    const isActive = Boolean((isSubActive || isTrial) && !isExpired);

    const isPending = Boolean(
      subscription?.status === 'pending_verification' || 
      subscription?.status === 'unpaid' || 
      subscription?.status === 'past_due'
    );

    const daysRemaining = targetExpiryDate
      ? Math.max(0, Math.ceil((targetExpiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
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
