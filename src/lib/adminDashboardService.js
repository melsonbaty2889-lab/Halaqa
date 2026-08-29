import { supabase } from '@/lib/supabase';

// 🛡️ دالة مساعدة معالجة النصوص الآمنة
export const getSafeText = (val, defaultVal = '') => {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (val.ar) return String(val.ar);
    if (val.en) return String(val.en);
    if (val.name) return getSafeText(val.name, defaultVal);
    if (val.title) return getSafeText(val.title, defaultVal);
    const firstVal = Object.values(val)[0];
    if (firstVal && typeof firstVal !== 'object') return String(firstVal);
    return defaultVal;
  }
  return String(val);
};

// 📊 1. جلب بيانات الإحصائيات العامة والأكاديميات
export const fetchAdminDashboardData = async ({ activeTab, sortBy }) => {
  const [
    { count: totalCount },
    { count: pCount },
    { count: aCount },
    { count: bCount },
    { data: allSubsForRevenue }
  ] = await Promise.all([
    supabase.from('academies').select('*', { count: 'exact', head: true }),
    supabase.from('saas_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'pending_verification'),
    supabase.from('academies').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('academies').select('*', { count: 'exact', head: true }).eq('is_active', false),
    supabase.from('saas_subscriptions').select('price, status')
  ]);

  const revenue = (allSubsForRevenue || [])
    .filter(sub => sub.status === 'active' || sub.status === 'approved' || sub.status === 'completed')
    .reduce((sum, sub) => sum + (Number(sub.price) || 0), 0);

  const { data: subData, error: subErr } = await supabase
    .from('saas_subscriptions')
    .select(`*, academies (*), profiles (*)`)
    .eq('status', 'pending_verification')
    .order('created_at', { ascending: false });

  if (subErr) throw subErr;

  let acadQuery = supabase
    .from('academies')
    .select('*, saas_subscriptions(*)', { count: 'exact' });

  if (activeTab === 'active') {
    acadQuery = acadQuery.eq('is_active', true);
  } else if (activeTab === 'blocked') {
    acadQuery = acadQuery.eq('is_active', false);
  }

  if (sortBy === 'created_at_desc') {
    acadQuery = acadQuery.order('created_at', { ascending: false });
  } else if (sortBy === 'created_at_asc') {
    acadQuery = acadQuery.order('created_at', { ascending: true });
  } else if (sortBy === 'trial_ends_asc') {
    acadQuery = acadQuery.order('trial_ends_at', { ascending: true, nullsFirst: false });
  }

  const { data: acadData, error: acadErr } = await acadQuery;
  if (acadErr) throw acadErr;

  const ownerIds = [...new Set((acadData || []).map(a => a.owner_id).filter(Boolean))];
  let profilesMap = {};

  if (ownerIds.length > 0) {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', ownerIds);

    if (profilesData) {
      profilesMap = profilesData.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});
    }
  }

  const enrichedAcademies = (acadData || []).map(acad => ({
    ...acad,
    ownerProfile: profilesMap[acad.owner_id] || null
  }));

  return {
    totalAcademiesCount: totalCount || 0,
    pendingCount: pCount || 0,
    activeCount: aCount || 0,
    blockedCount: bCount || 0,
    totalRevenue: revenue,
    pendingSubscriptions: subData || [],
    academies: enrichedAcademies
  };
};

// 🔎 2. جلب التفاصيل العميقة لأكاديمية محددة
export const fetchAcademyDeepDetails = async (academyId) => {
  const [
    { count: stCount },
    { count: hCount },
    { data: paymentsData }
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
    supabase.from('classes').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
    supabase.from('saas_subscriptions').select('*').eq('academy_id', academyId).order('created_at', { ascending: false })
  ]);

  return {
    studentsCount: stCount || 0,
    halaqatCount: hCount || 0,
    payments: paymentsData || []
  };
};

// 📱 3. حفظ رقم هاتف المالك
export const saveOwnerPhone = async (ownerId, phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const { error } = await supabase
    .from('profiles')
    .update({ phone: cleanPhone })
    .eq('id', ownerId);

  if (error) throw new Error(error.message);
  return cleanPhone;
};

// 🔒 4. تفعيل أو حظر أكاديمية واحدة أو جماعي
export const updateAcademyStatus = async (ids, isStatusActive) => {
  const academyIds = Array.isArray(ids) ? ids : [ids];
  const { error } = await supabase
    .from('academies')
    .update({ is_active: isStatusActive })
    .in('id', academyIds);

  if (error) throw error;
};

// ⏳ 5. تمديد اشتراك أكاديمية واحدة أو جماعي
export const extendAcademySubscription = async (ids, daysToAdd, isLifetime = false) => {
  const academyIds = Array.isArray(ids) ? ids : [ids];
  let newDateIso = null;

  if (isLifetime) {
    const lifetimeDate = new Date();
    lifetimeDate.setFullYear(lifetimeDate.getFullYear() + 100);
    newDateIso = lifetimeDate.toISOString();
  } else {
    const now = new Date();
    now.setDate(now.getDate() + daysToAdd);
    newDateIso = now.toISOString();
  }

  const { error } = await supabase
    .from('academies')
    .update({ trial_ends_at: newDateIso })
    .in('id', academyIds);

  if (error) throw error;
};
