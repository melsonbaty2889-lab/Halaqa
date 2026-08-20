/* src/components/Student/StudentProfile.jsx */
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// 🛠️ الخدمات والثوابت وأدوات الهوية
import { supabase } from "@/lib/supabase";
import colors from "@/theme/colors";
import { COUNTRIES_LIST } from "@/constants/countries";
import { getQuranProgress } from "@/utils/quranUtils";
import { formatName } from "@/utils/formatters";

// 🧩 المكونات العامة والمجاورة
import { Btn, Card, Input, Select, PageHeader } from "@/components/UI/UI.jsx"; 
import QuranProgressSelector from "@/components/QuranProgress/QuranProgressSelector";
import QuranProgressBar from "@/components/QuranProgress/QuranProgressBar";
import AchievementChart from "@/components/Gamification/AchievementChart"; 

// 🎓 المكونات الفرعية التابعة للطالب
import StudentStatsCard from "@/components/Student/StudentStatsCard";
import StudentBadges from "@/components/Gamification/StudentBadges";
import { 
  ArrowLeft, ArrowRight, Save, X, Edit3, 
  CheckCircle, AlertCircle, GraduationCap,
  BookOpen, Info, Banknote, CheckSquare,
  UserCheck, MessageCircle
} from 'lucide-react';

export default function StudentProfile({ genderPolicy = 'mixed' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');
  const currentLang = isRtl ? 'ar' : 'en';
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('quran'); 
  const [inlineMessage, setInlineMessage] = useState({ text: '', type: '' });

  const [weeklyData, setWeeklyData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  const triggerToast = useCallback((text, type = 'success') => {
    setInlineMessage({ text, type });
    setTimeout(() => setInlineMessage({ text: '', type: '' }), 4000);
  }, []);

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
        triggerToast(t('error_fetching_student') || (isRtl ? "تعذر جلب بيانات الطالب" : "Failed to fetch student profile"), "error");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStudent();
  }, [id, t, isRtl, triggerToast]);

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
    const progressInfo = getQuranProgress ? getQuranProgress(selectedIndex) : { juz: Math.floor(selectedIndex / 8) + 1, text: '' };
    const autoSurahText = progressInfo.text || '';
    const calculatedJuz = progressInfo.juz || 1;

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
      triggerToast(t('profile_updated_success') || (isRtl ? "تم تحديث الملف الشخصي بنجاح" : "Profile updated successfully"), "success");
    } catch (error) {
      console.error("Error saving student profile:", error);
      triggerToast(t('profile_updated_failed') || (isRtl ? "فشل تحديث البيانات" : "Failed to update profile"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`text-[${colors.text || '#fff'}] text-center py-28 px-5`}>
        <div className="text-3xl mb-2.5">⏳</div>
        <div className="text-sm text-slate-400">{t('loading_premium_profile') || (isRtl ? 'جاري تحميل ملف الطالب...' : 'Loading student profile...')}</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-red-500 text-center py-16 px-5">
        <div className="text-base font-bold">{t('student_not_found') || (isRtl ? 'الطالب غير موجود' : 'Student not found')}</div>
        <Btn variant="ghost" onClick={() => navigate('/students')} className="mt-4">
          {isRtl ? 'العودة لقائمة الطلاب' : 'Back to Students List'}
        </Btn>
      </div>
    );
  }

  const studentDisplayName = formatName(student.name, currentLang);
  const halaqaDisplayName = student.halaqas ? formatName(student.halaqas.name, currentLang) : '';
  const currentAge = calculateAge(student.birth_date);
  const studentCountryCode = student.country || student.country_code || "EG";
  const matchedCountry = COUNTRIES_LIST ? COUNTRIES_LIST.find(c => c.code === studentCountryCode) : null;
  const cleanPhone = student.parent_phone ? String(student.parent_phone).replace(/\D/g, '') : '';

  const getStatusStyle = (status) => {
    switch(status) {
      case 'paused': return { className: 'bg-amber-500/15 text-amber-400 border-amber-500/20', label: t('status_paused') || (isRtl ? 'موقوف مؤقتاً' : 'Paused') };
      case 'inactive': return { className: 'bg-red-500/15 text-red-400 border-red-500/20', label: t('status_inactive') || (isRtl ? 'غير نشط' : 'Inactive') };
      default: return { className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', label: t('status_active') || (isRtl ? 'نشط' : 'Active') };
    }
  };
  const statusInfo = getStatusStyle(student.status);

  const statusOptions = [
    { value: "active", label: t('status_active') || (isRtl ? 'نشط' : 'Active') },
    { value: "paused", label: t('status_paused') || (isRtl ? 'موقوف' : 'Paused') },
    { value: "inactive", label: t('status_inactive') || (isRtl ? 'غير نشط' : 'Inactive') }
  ];

  const genderOptions = [
    { value: "male", label: t('gender_male') || (isRtl ? 'ذكر' : 'Male') },
    { value: "female", label: t('gender_female') || (isRtl ? 'أنثى' : 'Female') }
  ];

  const countryOptions = (COUNTRIES_LIST || []).map(c => ({
    value: c.code,
    label: `${c.flag} ${isRtl ? (c.name_ar || c.nameAr) : (c.name_en || c.nameEn)} (${c.code})`
  }));

  const paymentOptions = [
    { value: "monthly", label: t('plan_monthly') || (isRtl ? 'اشتراك شهري' : 'Monthly Subscription') },
    { value: "per_hour", label: t('plan_per_hour') || (isRtl ? 'بالساعة' : 'Per Hour') },
    { value: "free", label: t('plan_free') || (isRtl ? 'مجاني / منحة' : 'Free / Scholarship') }
  ];

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="w-full max-w-[600px] mx-auto p-3 box-border">
      
      {inlineMessage.text && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 text-white px-5 py-3 rounded-full z-[1200] flex items-center gap-2 shadow-xl text-sm font-bold ${inlineMessage.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {inlineMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{inlineMessage.text}</span>
        </div>
      )}

      <PageHeader 
        title={isEditing ? "" : studentDisplayName}
        sub={isEditing ? "" : `${t('student_id') || (isRtl ? 'كود الطالب' : 'Student Code')}: #${student.student_code || (student.id ? student.id.slice(0, 8) : '')}`}
        action={
          <Btn variant="ghost" onClick={() => navigate(-1)} className="rounded-full">
            {isRtl ? <><ArrowRight className="w-4 h-4" /> {t('back') || 'رجوع'}</> : <><ArrowLeft className="w-4 h-4" /> {t('back') || 'Back'}</>}
          </Btn>
        }
      />

      <Card className={`rounded-t-2xl flex items-center gap-3.5 relative border-b-0 bg-[${colors.card || '#1E293B'}] border border-[${colors.border || '#334155'}] p-4`}>
        
        <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'}`}>
          {isEditing ? (
            <Select 
              value={student.status || "active"} 
              onChange={(e) => setStudent({...student, status: e.target.value})} 
              options={statusOptions}
              className="py-1 px-2 text-xs h-auto mb-0"
            />
          ) : (
            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${statusInfo.className}`}>
              ● {statusInfo.label}
            </span>
          )}
        </div>

        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 ${student.gender === 'female' ? 'bg-pink-500/10 border-pink-500 text-pink-500' : 'bg-blue-500/10 border-blue-500 text-blue-500'}`}>
          {genderPolicy === 'separated' && student.gender === 'female' ? (
            <UserCheck className="w-6 h-6 text-pink-500" />
          ) : (
            student.gender === 'female' ? '🧕' : '👨‍🎓'
          )}
        </div>

        <div className="flex-1">
          {isEditing ? (
            <Input 
              value={studentDisplayName} 
              onChange={(e) => setStudent({...student, name: e.target.value})} 
              className="mb-0 text-sm font-bold"
              required
            />
          ) : (
            <div className="text-start">
              <h3 className="m-0 text-slate-100 text-lg font-bold">{studentDisplayName}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span>{matchedCountry ? matchedCountry.flag : '🌐'}</span>
                <span>{matchedCountry ? (isRtl ? (matchedCountry.name_ar || matchedCountry.nameAr) : (matchedCountry.name_en || matchedCountry.nameEn)) : ''}</span>
                {currentAge !== null && <span>• {currentAge} {t('years_old') || (isRtl ? 'سنة' : 'yrs')}</span>}
                {halaqaDisplayName && <span className="text-amber-500">• {halaqaDisplayName}</span>}
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className={`flex bg-[${colors.background || '#0F172A'}] border-x border-[${colors.border || '#334155'}] p-1`}>
        {[
          { id: 'quran', label: t('tab_quran_track') || (isRtl ? 'مسار القرآن' : 'Quran Track'), icon: <BookOpen className="w-3.5 h-3.5" /> },
          { id: 'personal', label: t('tab_identity_contact') || (isRtl ? 'البيانات والتواصل' : 'Identity & Contact'), icon: <Info className="w-3.5 h-3.5" /> },
          { id: 'financial', label: t('tab_financials') || (isRtl ? 'المالية والملاحظات' : 'Financials & Notes'), icon: <Banknote className="w-3.5 h-3.5" /> }
        ].map(tab => (
          <Btn 
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-1 text-xs rounded-none border-none flex items-center justify-center gap-1.5 transition-colors ${activeTab === tab.id ? `bg-[${colors.card || '#1E293B'}] text-amber-500 font-bold` : 'bg-transparent text-slate-400 hover:text-slate-200'}`}
          >
            {tab.icon} {tab.label}
          </Btn>
        ))}
      </div>

      <Card className={`rounded-b-2xl border-t-0 bg-[${colors.card || '#1E293B'}] border border-[${colors.border || '#334155'}] shadow-2xl flex flex-col gap-4 p-4`}>
        
        {activeTab === 'quran' && (
          <div className="flex flex-col gap-3.5">
            
            <StudentStatsCard student={student} isRtl={isRtl} />

            <StudentBadges student={student} weeklyData={weeklyData} isRtl={isRtl} />

            <div className={`bg-[${colors.background || '#0F172A'}] p-3.5 rounded-xl border border-[${colors.border || '#334155'}]`}>
              <div className="flex items-center mb-2 text-start">
                <span className="text-xs text-amber-500 font-bold flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-500" /> {t('current_memorization_progress') || (isRtl ? 'التقدم الحفظي الحالي' : 'Current Memorization Progress')}
                </span>
              </div>
              <div className="my-2">
                <QuranProgressBar currentQuarterIndex={student.current_quarter_index || 0} />
              </div>
              <div className={`bg-[${colors.card || '#1E293B'}] px-3 py-2 rounded-lg text-xs flex justify-between border border-[${colors.border || '#334155'}]`}>
                <span className="text-slate-400">{t('current_juz') || (isRtl ? 'الجزء الحالي' : 'Current Juz')}</span>
                <span className="font-bold text-emerald-500">{t('juz') || (isRtl ? 'الجزء' : 'Juz')} {student.current_juz || 1}</span>
              </div>
            </div>

            <div className="w-full">
              {chartLoading ? (
                <div className={`bg-[${colors.background || '#0F172A'}] p-6 rounded-xl border border-[${colors.border || '#334155'}] text-center text-xs text-slate-400`}>
                  ⏳ {isRtl ? 'جاري تحليل منحنى الإنجاز الأسبوعي...' : 'Analyzing weekly achievement logs...'}
                </div>
              ) : (
                <AchievementChart data={weeklyData} isRtl={isRtl} />
              )}
            </div>

            {isEditing && (
              <div className={`bg-[${colors.background || '#0F172A'}] p-3.5 rounded-xl border border-[${colors.border || '#334155'}] flex flex-col gap-1.5`}>
                <label className="text-slate-400 text-xs font-bold flex items-center gap-1 text-start">
                  <GraduationCap className="w-4 h-4" /> {t('update_progress_selector') || (isRtl ? 'تعديل موضع الحفظ' : 'Update Memorization Selector')}
                </label>
                <div className={`bg-[${colors.card || '#1E293B'}] p-1.5 rounded-lg border border-[${colors.border || '#334155'}]`}>
                  <QuranProgressSelector 
                    initialIndex={parseInt(student.current_quarter_index, 10) || 0} 
                    onIndexChange={(idx) => setStudent(prev => ({ ...prev, current_quarter_index: idx }))}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'personal' && (
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Select 
                label={t("gender") || (isRtl ? 'الجنس' : 'Gender')} 
                value={student.gender || "male"} 
                onChange={(e) => setStudent({...student, gender: e.target.value})} 
                disabled={!isEditing}
                options={genderOptions}
              />
              <Input 
                label={t('birth_date') || (isRtl ? 'تاريخ الميلاد' : 'Birth Date')} 
                type="date" 
                value={student.birth_date || ""} 
                onChange={(e) => setStudent({...student, birth_date: e.target.value})} 
                disabled={!isEditing}
              />
            </div>

            <Select 
              label={t('country_geographic_region') || (isRtl ? 'الدولة / المنطقة' : 'Country / Region')} 
              value={student.country || student.country_code || "EG"} 
              onChange={(e) => setStudent({...student, country: e.target.value, country_code: e.target.value})} 
              disabled={!isEditing}
              options={countryOptions}
            />

            <div className={`bg-[${colors.background || '#0F172A'}] p-3 rounded-xl border border-[${colors.border || '#334155'}] flex flex-col gap-2`}>
              <Input 
                label={t('parent_custody_name') || (isRtl ? 'اسم ولي الأمر' : 'Parent Name')} 
                value={student.parent_name || ""} 
                placeholder={t('not_specified') || (isRtl ? 'غير محدد' : 'Not specified')} 
                onChange={(e) => setStudent({...student, parent_name: e.target.value})} 
                disabled={!isEditing}
              />

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input 
                    label={t('contact_hotline') || (isRtl ? 'رقم هاتف التواصل' : 'Contact Phone')} 
                    type="tel" 
                    value={student.parent_phone || ""} 
                    placeholder={t('not_specified') || (isRtl ? 'غير محدد' : 'Not specified')} 
                    onChange={(e) => setStudent({...student, parent_phone: e.target.value})} 
                    disabled={!isEditing}
                    className="text-left direction-ltr" 
                  />
                </div>
                {!isEditing && cleanPhone && (
                  <a 
                    href={`https://wa.me/${cleanPhone}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white w-11 h-11 rounded-xl flex items-center justify-center no-underline mb-4 shadow-md transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="flex flex-col gap-3.5">
            <Select 
              label={t('financial_tariff_plan') || (isRtl ? 'نظام الاشتراك' : 'Subscription Plan')} 
              value={student.subscription_system || "monthly"} 
              onChange={(e) => setStudent({...student, subscription_system: e.target.value})} 
              disabled={!isEditing}
              options={paymentOptions}
            />

            <Input 
              label={t('academic_teacher_notes') || (isRtl ? 'ملاحظات المعلم والأكاديمية' : 'Teacher & Academy Notes')} 
              as="textarea"
              value={student.notes || ""} 
              placeholder={t('academic_notes_placeholder') || (isRtl ? 'اكتب أي ملاحظات خاصة بالطالب...' : 'Type student notes...')} 
              onChange={(e) => setStudent({...student, notes: e.target.value})} 
              disabled={!isEditing}
              className="min-h-[100px] leading-relaxed"
            />
          </div>
        )}

        <div className="mt-1">
          {isEditing ? (
            <div className="flex gap-2.5">
              <Btn variant="success" onClick={handleUpdate} disabled={saving} className="flex-1 py-3 flex items-center justify-center gap-1.5">
                <Save className="w-4 h-4" /> {saving ? (t("saving") || (isRtl ? "جاري الحفظ..." : "Saving...")) : (t('save_changes') || (isRtl ? "حفظ التغييرات" : "Save Changes"))}
              </Btn>
              <Btn variant="ghost" onClick={() => setIsEditing(false)} className="flex-1 py-3 flex items-center justify-center gap-1.5">
                <X className="w-4 h-4" /> {t("cancel") || (isRtl ? "إلغاء" : "Cancel")}
              </Btn>
            </div>
          ) : (
            <Btn variant="primary" onClick={() => setIsEditing(true)} className="w-full py-3 text-sm font-bold flex items-center justify-center gap-1.5">
              <Edit3 className="w-4 h-4" /> {t('edit_full_profile') || (isRtl ? "تعديل بيانات الملف الشخصي" : "Edit Full Profile")}
            </Btn>
          )}
        </div>

      </Card>
    </div>
  );
}
