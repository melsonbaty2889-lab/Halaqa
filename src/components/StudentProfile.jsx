import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";
import { C } from "../constants/colors";
import { Btn, Card, Input, Select, PageHeader } from './UI'; 
import QuranProgressSelector from './QuranProgressSelector';
import QuranProgressBar from './QuranProgressBar';
import AchievementChart from './AchievementChart'; 
import { getQuranProgress } from '../utils/quranUtils';
import { formatName } from '../utils/formatters';
import { COUNTRIES_LIST } from '../constants/countries';
import { 
  FaArrowLeft, FaArrowRight, FaSave, FaTimes, FaEdit, 
  FaCheckCircle, FaExclamationCircle, FaGraduationCap,
  FaBookOpen, FaInfoCircle, FaMoneyBillWave, FaCheckSquare,
  FaFire, FaAward, FaCrown, FaUserGraduate
} from 'react-icons/fa';

export default function StudentProfile({ genderPolicy = 'mixed' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const isRtl = i18n.dir() === 'rtl';
  const currentLang = isRtl ? 'ar' : 'en';
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('quran'); 
  const [inlineMessage, setInlineMessage] = useState({ text: '', type: '' });

  // حالات البيانات الخاصة بمنحنى الإنجاز الأسبوعي
  const [weeklyData, setWeeklyData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  const triggerToast = useCallback((text, type = 'success') => {
    setInlineMessage({ text, type });
    setTimeout(() => setInlineMessage({ text: '', type: '' }), 4000);
  }, []);

  // 1. جلب بيانات الطالب الموحدة
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("students")
          .select(`
            *,
            halaqas (
              id,
              name,
              target_audience
            )
          `)
          .eq("id", id)
          .single();

        if (error) throw error;
        if (data) setStudent(data);
      } catch (err) {
        console.error("Error fetching student details:", err);
        triggerToast(t('error_fetching_student') || "تعذر جلب بيانات الطالب", "error");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStudent();
  }, [id, t, triggerToast]);

  // 2. جلب بيانات جدول المتابعة اليومية وحساب منحنى الإنجاز
  useEffect(() => {
    const fetchWeeklyAchievement = async () => {
      if (!id) return;
      try {
        setChartLoading(true);
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const formattedDate = sevenDaysAgo.toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('daily_progress')
          .select('date, new_hifz_start, new_hifz_end, review_start, review_end')
          .eq('student_id', id)
          .gte('date', formattedDate)
          .order('date', { ascending: true });

        if (error) throw error;

        const daysMapAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const daysMapEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const processedChartData = (data || []).map(record => {
          const recordDate = new Date(record.date);
          const dayIndex = recordDate.getDay();

          const calculatePages = (start, end) => {
            const startNum = parseInt(start, 10);
            const endNum = parseInt(end, 10);
            if (!isNaN(startNum) && !isNaN(endNum) && endNum >= startNum) {
              return (endNum - startNum) + 1;
            }
            return 0;
          };

          const newHifzPages = calculatePages(record.new_hifz_start, record.new_hifz_end);
          const reviewPages = calculatePages(record.review_start, record.review_end);

          return {
            dayAr: daysMapAr[dayIndex],
            dayEn: daysMapEn[dayIndex],
            pages: newHifzPages + reviewPages
          };
        });

        setWeeklyData(processedChartData);
      } catch (err) {
        console.error("Error processing weekly achievement chart:", err);
      } finally {
        setChartLoading(false);
      }
    };

    fetchWeeklyAchievement();
  }, [id]);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    if (isNaN(birth.getTime())) return null;
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    const selectedIndex = parseInt(student.current_quarter_index, 10) || 0;
    const progressInfo = getQuranProgress(selectedIndex);
    const autoSurahText = progressInfo.text;
    const calculatedJuz = progressInfo.juz || 1;

    // التعامل الأمني مع الاسم لمنع أخطاء التنسيق
    const formattedSaveName = typeof student.name === 'string' 
      ? student.name.trim() 
      : student.name;

    try {
      const { error } = await supabase
        .from("students")
        .update({
          name: formattedSaveName,
          parent_name: typeof student.parent_name === 'string' ? student.parent_name.trim() : student.parent_name || null,
          parent_phone: typeof student.parent_phone === 'string' ? student.parent_phone.trim() : student.parent_phone || null,
          birth_date: student.birth_date || null,
          gender: student.gender,
          country: student.country || student.country_code || 'EG', 
          subscription_system: student.subscription_system || 'monthly', 
          status: student.status || 'active',
          current_quarter_index: selectedIndex,
          current_juz: calculatedJuz, 
          notes: typeof student.notes === 'string' ? student.notes.trim() : student.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      
      if (error) throw error;

      setStudent(prev => ({ 
        ...prev, 
        current_juz: calculatedJuz,
        current_surah_name: autoSurahText
      }));
      setIsEditing(false);
      triggerToast(t('profile_updated_success') || "تم تحديث الملف الشخصي بنجاح", "success");
    } catch (error) {
      console.error("Error saving student profile:", error);
      triggerToast(t('profile_updated_failed') || "فشل تحديث البيانات", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: C.text || '#fff', textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
        <div>{t('loading_premium_profile') || 'جاري تحميل ملف الطالب...'}</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ color: '#EF4444', textAlign: 'center', padding: '50px 20px' }}>
        <div>{t('student_not_found') || 'الطالب غير موجود'}</div>
      </div>
    );
  }

  const studentDisplayName = formatName(student.name, currentLang);
  const halaqaDisplayName = student.halaqas ? formatName(student.halaqas.name, currentLang) : '';
  const currentAge = calculateAge(student.birth_date);
  const studentCountryCode = student.country || student.country_code || "EG";
  const matchedCountry = COUNTRIES_LIST.find(c => c.code === studentCountryCode);

  const getStatusStyle = (status) => {
    switch(status) {
      case 'paused': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', label: t('status_paused') || 'موقوف موقتاً' };
      case 'inactive': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', label: t('status_inactive') || 'غير نشط' };
      default: return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', label: t('status_active') || 'نشط' };
    }
  };
  const statusInfo = getStatusStyle(student.status);

  const statusOptions = [
    { value: "active", label: t('status_active') || 'نشط' },
    { value: "paused", label: t('status_paused') || 'موقوف' },
    { value: "inactive", label: t('status_inactive') || 'غير نشط' }
  ];

  const genderOptions = [
    { value: "male", label: t('gender_male') || 'ذكر' },
    { value: "female", label: t('gender_female') || 'أنثى' }
  ];

  const countryOptions = COUNTRIES_LIST.map(c => ({
    value: c.code,
    label: `${c.flag} ${isRtl ? (c.name_ar || c.nameAr) : (c.name_en || c.nameEn)} (${c.code})`
  }));

  const paymentOptions = [
    { value: "monthly", label: t('plan_monthly') || 'اشتراك شهري' },
    { value: "per_hour", label: t('plan_per_hour') || 'بالساعة' },
    { value: "free", label: t('plan_free') || 'مجاني / منحة' }
  ];

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ width: '100%', maxWidth: '520px', margin: '0 auto', padding: '12px', boxSizing: 'border-box' }}>
      
      {/* التنبيهات المباشرة Toast Notification */}
      {inlineMessage.text && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: inlineMessage.type === 'success' ? '#059669' : '#DC2626', color: '#fff', padding: '12px 20px', borderRadius: '30px', zIndex: 1200, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', fontSize: '14px', fontWeight: 'bold' }}>
          {inlineMessage.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span>{inlineMessage.text}</span>
        </div>
      )}

      <PageHeader 
        title={isEditing ? "" : studentDisplayName}
        sub={isEditing ? "" : `${t('student_id') || 'كود الطالب'}: #${student.student_code || student.id.slice(0, 8)}`}
        action={
          <Btn variant="ghost" onClick={() => navigate(-1)} style={{ borderRadius: '20px' }}>
            {isRtl ? <><FaArrowRight /> {t('back') || 'رجوع'}</> : <><FaArrowLeft /> {t('back') || 'Back'}</>}
          </Btn>
        }
      />

      {/* البطاقة العلوية للطالب */}
      <Card style={{ borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', borderBottom: 'none' }}>
        
        <div style={{ position: 'absolute', top: '16px', left: isRtl ? '16px' : 'auto', right: isRtl ? 'auto' : '16px' }}>
          {isEditing ? (
            <Select 
              value={student.status || "active"} 
              onChange={(e) => setStudent({...student, status: e.target.value})} 
              options={statusOptions}
              style={{ padding: '4px 8px', fontSize: '11px', height: 'auto', marginBottom: 0 }}
            />
          ) : (
            <span style={{ background: statusInfo.bg, color: statusInfo.text, padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', border: `1px solid ${statusInfo.text}33` }}>
              ● {statusInfo.label}
            </span>
          )}
        </div>

        {/* رمز الطالب مع مراعاة سياسة الخصوصية */}
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: student.gender === 'female' ? 'rgba(236, 72, 153, 0.12)' : 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: `2px solid ${student.gender === 'female' ? '#EC4899' : '#3B82F6'}` }}>
          {genderPolicy === 'separated' && student.gender === 'female' ? (
            <FaUserGraduate style={{ color: '#EC4899', fontSize: '22px' }} />
          ) : (
            student.gender === 'female' ? '🧕' : '🙋‍♂️'
          )}
        </div>

        <div style={{ flex: 1 }}>
          {isEditing ? (
            <Input 
              value={studentDisplayName} 
              onChange={(e) => setStudent({...student, name: e.target.value})} 
              style={{ marginBottom: 0, fontSize: '14px', fontWeight: 'bold' }}
              required
            />
          ) : (
            <div style={{ textAlign: 'start' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '17px', fontWeight: 'bold' }}>{studentDisplayName}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                <span>{matchedCountry ? matchedCountry.flag : '🌐'}</span>
                <span>{matchedCountry ? (isRtl ? (matchedCountry.name_ar || matchedCountry.nameAr) : (matchedCountry.name_en || matchedCountry.nameEn)) : ''}</span>
                {currentAge !== null && <span>• {currentAge} {t('years_old') || 'سنة'}</span>}
                {halaqaDisplayName && <span style={{ color: C.gold }}>• {halaqaDisplayName}</span>}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* التبويبات الداخلية */}
      <div style={{ display: 'flex', background: '#0F172A', borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, padding: '4px' }}>
        {[
          { id: 'quran', label: t('tab_quran_track') || 'مسار القرآن', icon: <FaBookOpen size={12} /> },
          { id: 'personal', label: t('tab_identity_contact') || 'البيانات والتواصل', icon: <FaInfoCircle size={12} /> },
          { id: 'financial', label: t('tab_financials') || 'المالية والملاحظات', icon: <FaMoneyBillWave size={12} /> }
        ].map(tab => (
          <Btn 
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
            style={{ flex: 1, padding: '10px 4px', fontSize: '11px', borderRadius: activeTab === tab.id ? '8px' : '0', border: 'none', background: activeTab === tab.id ? C.surface : 'transparent', color: activeTab === tab.id ? C.gold : '#9CA3AF' }}
          >
            {tab.icon} {tab.label}
          </Btn>
        ))}
      </div>

      {/* جسم البطاقة الرئيسي */}
      <Card style={{ borderRadius: '0 0 16px 16px', borderTop: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* تبويب مسار القرآن والانجاز */}
        {activeTab === 'quran' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* السلاسل والنقاط */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#0C1520', padding: '12px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.08)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <FaFire size={20} style={{ color: '#EF4444' }} />
                <div style={{ textAlign: 'start' }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{isRtl ? 'السلسلة الحالية' : 'Current Streak'}</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#EF4444' }}>{student.current_streak || 0} {isRtl ? 'يوم' : 'Days'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(245, 158, 11, 0.08)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <FaCrown size={18} style={{ color: '#F59E0B' }} />
                <div style={{ textAlign: 'start' }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{isRtl ? 'إجمالي النقاط' : 'Total Points'}</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#F59E0B' }}>{student.points || 0} {isRtl ? 'نقطة' : 'Pts'}</div>
                </div>
              </div>
            </div>

            {/* نظام الشارات */}
            <div style={{ background: '#0C1520', padding: '12px', borderRadius: '12px', border: `1px solid ${C.border}`, textAlign: 'start' }}>
              <div style={{ fontSize: '12px', color: C.gold, fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaAward style={{ color: C.gold }} /> {isRtl ? 'شارات التميز والإتقان' : 'Mastery & Achievement Badges'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(student.current_streak >= 3) && (
                  <span style={{ background: 'linear-gradient(135deg, #EF4444, #F59E0B)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🔥 {isRtl ? 'شعلة الحفظ' : 'Hifz Spark'}
                  </span>
                )}
                {(student.current_quarter_index >= 8) && (
                  <span style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⭐ {isRtl ? 'مُتقن الأجزاء' : 'Juz Mastery'}
                  </span>
                )}
                {weeklyData.length >= 4 && (
                  <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    👑 {isRtl ? 'المثابر الأسبوعي' : 'Weekly Achiever'}
                  </span>
                )}
              </div>
            </div>

            {/* شريط التقدم والسورة */}
            <div style={{ background: '#0C1520', padding: '14px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', textAlign: 'start' }}>
                <span style={{ fontSize: '12px', color: C.gold, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaCheckSquare style={{color: '#10B981'}} /> {t('current_memorization_progress') || 'التقدم الحفظي الحالي'}
                </span>
              </div>
              <div style={{ margin: '8px 0 12px 0' }}>
                <QuranProgressBar currentQuarterIndex={student.current_quarter_index || 0} />
              </div>
              <div style={{ background: '#111827', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', border: `1px solid ${C.border}` }}>
                <span style={{ color: '#9CA3AF' }}>{t('current_juz') || 'الجزء الحالي'}</span>
                <span style={{ fontWeight: 'bold', color: '#10B981' }}>{t('juz') || 'الجزء'} {student.current_juz || 1}</span>
              </div>
            </div>

            {/* رسم بياني للإنجاز */}
            <div className="w-full">
              {chartLoading ? (
                <div style={{ background: '#0C1520', padding: '24px', borderRadius: '12px', border: `1px solid ${C.border}`, textAlign: 'center', fontSize: '12px', color: '#9CA3AF' }}>
                  ⏳ {isRtl ? 'جاري تحليل منحنى الإنجاز الأسبوعي...' : 'Analyzing weekly achievement logs...'}
                </div>
              ) : (
                <AchievementChart data={weeklyData} isRtl={isRtl} />
              )}
            </div>

            {isEditing && (
              <div style={{ background: '#0C1520', padding: '14px', borderRadius: '12px', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', textAlign: 'start' }}>
                  <FaGraduationCap /> {t('update_progress_selector') || 'تعديل موضع الحفظ'}
                </label>
                <div style={{ background: '#111827', padding: '6px', borderRadius: '8px', border: `1px solid ${C.border}` }}>
                  <QuranProgressSelector 
                    initialIndex={parseInt(student.current_quarter_index, 10) || 0} 
                    onIndexChange={(idx) => setStudent(prev => ({ ...prev, current_quarter_index: idx }))}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* تبويب البيانات والتواصل */}
        {activeTab === 'personal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Select 
                label={t("gender") || 'الجنس'} 
                value={student.gender || "male"} 
                onChange={(e) => setStudent({...student, gender: e.target.value})} 
                disabled={!isEditing}
                options={genderOptions}
              />
              <Input 
                label={t('birth_date') || 'تاريخ الميلاد'} 
                type="date" 
                value={student.birth_date || ""} 
                onChange={(e) => setStudent({...student, birth_date: e.target.value})} 
                disabled={!isEditing}
              />
            </div>

            <Select 
              label={t('country_geographic_region') || 'الدولة / المنطقة'} 
              value={student.country || student.country_code || "EG"} 
              onChange={(e) => setStudent({...student, country: e.target.value, country_code: e.target.value})} 
              disabled={!isEditing}
              options={countryOptions}
            />

            <div style={{ background: '#0C1520', padding: '12px', borderRadius: '12px', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Input 
                label={t('parent_custody_name') || 'اسم ولي الأمر'} 
                value={student.parent_name || ""} 
                placeholder={t('not_specified') || 'غير محدد'} 
                onChange={(e) => setStudent({...student, parent_name: e.target.value})} 
                disabled={!isEditing}
              />

              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <Input 
                    label={t('contact_hotline') || 'رقم هاتف التواصل'} 
                    type="tel" 
                    value={student.parent_phone || ""} 
                    placeholder={t('not_specified') || 'غير محدد'} 
                    onChange={(e) => setStudent({...student, parent_phone: e.target.value})} 
                    disabled={!isEditing}
                    style={{ textAlign: 'left', direction: 'ltr' }} 
                  />
                </div>
                {!isEditing && student.parent_phone && (
                  <a 
                    href={`https://wa.me/${student.parent_phone.replace(/\+/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ background: '#10B981', color: '#fff', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}
                    title="WhatsApp"
                  >
                    💬
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* تبويب المالية والملاحظات */}
        {activeTab === 'financial' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Select 
              label={t('financial_tariff_plan') || 'نظام الاشتراك'} 
              value={student.subscription_system || "monthly"} 
              onChange={(e) => setStudent({...student, subscription_system: e.target.value})} 
              disabled={!isEditing}
              options={paymentOptions}
            />

            <Input 
              label={t('academic_teacher_notes') || 'ملاحظات المعلم والأكاديمية'} 
              as="textarea"
              value={student.notes || ""} 
              placeholder={t('academic_notes_placeholder') || 'اكتب أي ملاحظات خاصة بالطالب...'} 
              onChange={(e) => setStudent({...student, notes: e.target.value})} 
              disabled={!isEditing}
              style={{ minHeight: '100px', lineHeight: '1.5' }}
            />
          </div>
        )}

        {/* أزرار الحفظ والتعديل */}
        <div style={{ marginTop: '4px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Btn variant="success" onClick={handleUpdate} disabled={saving} style={{ flex: 1, padding: '12px' }}>
                <FaSave /> {saving ? (t("saving") || "جاري الحفظ...") : (t('save_changes') || "حفظ التغييرات")}
              </Btn>
              <Btn variant="ghost" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '12px' }}>
                <FaTimes /> {t("cancel") || "إلغاء"}
              </Btn>
            </div>
          ) : (
            <Btn variant="primary" onClick={() => setIsEditing(true)} style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 'bold' }}>
              <FaEdit /> {t('edit_full_profile') || "تعديل بيانات الملف الشخصي"}
            </Btn>
          )}
        </div>

      </Card>
    </div>
  );
}
