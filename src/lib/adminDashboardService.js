import { supabase } from '@/lib/supabase';

// 🛡️ دالة مساعدة لمعالجة النصوص والأسماء باللغة العربية حصراً
export const getSafeText = (val, defaultVal = '') => {
  if (val === null || val === undefined) return defaultVal;
  
  let parsed = val;
  if (typeof val === 'string') {
    try {
      parsed = JSON.parse(val);
    } catch {
      return String(val);
    }
  }

  if (typeof parsed === 'number') return String(parsed);

  if (typeof parsed === 'object' && parsed !== null) {
    if (parsed.ar && typeof parsed.ar === 'string') return parsed.ar;
    if (parsed.en && typeof parsed.en === 'string') return parsed.en;
    if (parsed.name) return getSafeText(parsed.name, defaultVal);
    if (parsed.title) return getSafeText(parsed.title, defaultVal);

    const firstVal = Object.values(parsed).find((v) => typeof v === 'string' && v.trim() !== '');
    if (firstVal) return String(firstVal);

    return defaultVal;
  }

  return String(val);
};

// 📊 1. جلب بيانات الإحصائيات العامة والأكاديميات (مع ربط التواريخ والأشتراكات)
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
    supabase.from('saas_subscriptions').select('price, currency, status')
  ]);

  // 💰 تجميع الإيرادات مقسمة حسب كل عملة لضمان الدقة المالية
  const revenueByCurrency = (allSubsForRevenue || [])
    .filter(sub => sub.status === 'active' || sub.status === 'approved' || sub.status === 'completed')
    .reduce((acc, sub) => {
      const currency = (sub.currency || 'EGP').trim().toUpperCase();
      const price = Number(sub.price) || 0;
      acc[currency] = (acc[currency] || 0) + price;
      return acc;
    }, {});

  const { data: subData, error: subErr } = await supabase
    .from('saas_subscriptions')
    .select(`*, academies (*), profiles (*)`)
    .eq('status', 'pending_verification')
    .order('created_at', { ascending: false });

  if (subErr) throw subErr;

  // 🔄 جلب الأكاديميات مع ترتيب الاشتراكات المرفقة تنازلياً للحصول على أحدث اشتراك دائماً
  let acadQuery = supabase
    .from('academies')
    .select(`
      *,
      saas_subscriptions (
        id,
        academy_id,
        status,
        expires_at,
        trial_ends_at,
        created_at,
        plan_tier,
        price,
        currency
      )
    `, { count: 'exact' });

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

  // 🛠️ ترتيب اشتراكات كل أكاديمية تنازلياً وتمرير تاريخ أحدث اشتراك مباشر
  const enrichedAcademies = (acadData || []).map(acad => {
    const rawSubs = Array.isArray(acad.saas_subscriptions) ? acad.saas_subscriptions : [];
    const sortedSubs = [...rawSubs].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const latestSub = sortedSubs.length > 0 ? sortedSubs[0] : null;

    return {
      ...acad,
      saas_subscriptions: sortedSubs,
      expires_at: latestSub?.expires_at || acad.expires_at || null,
      trial_ends_at: latestSub?.trial_ends_at || acad.trial_ends_at || null,
      ownerProfile: profilesMap[acad.owner_id] || null
    };
  });

  return {
    totalAcademiesCount: totalCount || 0,
    pendingCount: pCount || 0,
    activeCount: aCount || 0,
    blockedCount: bCount || 0,
    totalRevenue: revenueByCurrency,
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

// ⏳ 5. تمديد اشتراك أكاديمية بمدد محددة وبشكل آمن
export const extendAcademySubscription = async (academyId, daysToAdd) => {
  const { data: subs, error: fetchErr } = await supabase
    .from('saas_subscriptions')
    .select('*')
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (fetchErr) throw fetchErr;

  const currentSub = subs && subs.length > 0 ? subs[0] : null;
  const now = new Date();
  const addedDays = Number(daysToAdd) || 0;

  if (currentSub) {
    if (currentSub.status === 'active') {
      const currentExpiry = currentSub.expires_at ? new Date(currentSub.expires_at) : now;
      const baseDate = currentExpiry > now ? currentExpiry : now;
      baseDate.setDate(baseDate.getDate() + addedDays);

      const { error } = await supabase
        .from('saas_subscriptions')
        .update({
          expires_at: baseDate.toISOString(),
          trial_ends_at: null,
          status: 'active',
          updated_at: now.toISOString()
        })
        .eq('id', currentSub.id);

      if (error) throw error;
    } else {
      const currentTrial = currentSub.trial_ends_at ? new Date(currentSub.trial_ends_at) : now;
      const baseDate = currentTrial > now ? currentTrial : now;
      baseDate.setDate(baseDate.getDate() + addedDays);

      const { error } = await supabase
        .from('saas_subscriptions')
        .update({
          trial_ends_at: baseDate.toISOString(),
          expires_at: baseDate.toISOString(),
          status: 'trial',
          updated_at: now.toISOString()
        })
        .eq('id', currentSub.id);

      if (error) throw error;
    }
  } else {
    // إنشاء سجل جديد في حالة الأكاديميات التي لا تملك اشتراكاً سابقاً
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + addedDays);

    const { error } = await supabase
      .from('saas_subscriptions')
      .insert({
        academy_id: academyId,
        status: 'active',
        expires_at: newExpiry.toISOString(),
        trial_ends_at: null,
        plan_tier: 'standard',
        price: 0,
        currency: 'EGP',
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      });

    if (error) throw error;
  }
};
