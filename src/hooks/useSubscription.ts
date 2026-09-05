import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

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

      const { data, error: apiError } = await supabase
        .from('saas_subscriptions')
        .select('*')
        .eq('academy_id', academyId)
        .maybeSingle();

      if (apiError) throw apiError;
      setSubscription(data as SaasSubscription | null);
    } catch (err: any) {
      console.error('🚨 Error fetching subscription:', err);
      setError(err.message || 'فشل جلب بيانات الاشتراك');
    } finally {
      setLoading(false);
    }
  }, [academyId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // حساب الحالات الزمانية والتنظيمية
  const now = new Date();

  // فحص ما إذا كانت الفترة التجريبية سارية
  const isTrial = Boolean(
    subscription?.status === 'trial' ||
    (subscription?.trial_ends_at && new Date(subscription.trial_ends_at) > now)
  );

  // هل الخطة منتهية الصلاحية
  const isExpired = subscription?.expires_at
    ? new Date(subscription.expires_at) < now
    : false;

  // حالة الاشتراك النشط (شاملة التجريبية غير المنتهية)
  const isActive = Boolean(
    (subscription?.status === 'active' || subscription?.status === 'trial') && !isExpired
  );

  // حالة طلب غير مدفوع / قيد المراجعة
  const isPending = subscription?.status === 'unpaid' || subscription?.status === 'past_due';

  // حساب الأيام المتبقية حتى الانتهاء
  const daysRemaining = subscription?.expires_at
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    subscription,
    isActive,
    isPending,
    isExpired,
    isTrial,
    daysRemaining,
    loading,
    error,
    refetch: fetchSubscription,
  };
}
