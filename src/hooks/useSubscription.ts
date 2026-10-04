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

      // 1. جلب بيانات الاشتراك والأكاديمية
      const [subRes, academyRes] = await Promise.all([
        supabase
          .from('saas_subscriptions')
          .select('*')
          .eq('academy_id', academyId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('academies')
          .select('expires_at, trial_ends_at, is_active')
          .eq('id', academyId)
          .maybeSingle()
      ]);

      if (subRes.error) throw subRes.error;

      const subData = subRes.data as SaasSubscription | null;
      const academyData = academyRes.data;

      // 2. استدعاء RPC للحسابات
      const { data: rpcData } = await supabase
        .rpc('get_academy_subscription_status', { target_academy_id: academyId });

      const computed = Array.isArray(rpcData) && rpcData.length > 0 ? rpcData[0] : null;

      setSubscription(subData);

      // 3. حساب احتياطي مباشر
      const now = new Date();
      const targetExpiryStr = 
        subData?.expires_at || 
        academyData?.expires_at || 
        subData?.trial_ends_at || 
        academyData?.trial_ends_at;

      let calcDays = 0;
      let calcIsActive = false;
      let calcIsTrial = false;

      if (targetExpiryStr) {
        const expiryDate = new Date(targetExpiryStr);
        const diffTime = expiryDate.getTime() - now.getTime();
        calcDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        calcIsActive = diffTime > 0;
        calcIsTrial = !subData?.expires_at && !academyData?.expires_at && Boolean(targetExpiryStr);
      }

      setComputedData({
        isActive: computed ? Boolean(computed.is_active) : calcIsActive,
        isTrial: computed ? Boolean(computed.is_trial) : calcIsTrial,
        daysRemaining: computed ? Number(computed.days_remaining) || 0 : calcDays,
        status: computed?.status || subData?.status || (calcIsActive ? 'active' : 'trial'),
      });

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

    // إنشاء قناة الاستماع الخاصة بالاشتراك
    const subChannel = supabase
      .channel(`sub_realtime_${academyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saas_subscriptions',
          filter: `academy_id=eq.${academyId}`,
        },
        () => fetchSubscription()
      )
      .subscribe();

    // إنشاء قناة الاستماع الخاصة بالأكاديمية
    const acadChannel = supabase
      .channel(`acad_realtime_${academyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'academies',
          filter: `id=eq.${academyId}`,
        },
        () => fetchSubscription()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subChannel);
      supabase.removeChannel(acadChannel);
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
