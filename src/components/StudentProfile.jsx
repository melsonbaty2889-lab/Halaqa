import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";
import { C } from "../constants/colors";
import QuranProgressSelector from './QuranProgressSelector';
import QuranProgressBar from './QuranProgressBar';
import { getQuranProgress } from '../utils/quranUtils';
import { COUNTRIES_LIST } from '../constants/countries';
import { 
  FaArrowLeft, FaArrowRight, FaUser, FaCalendarAlt, FaMars, FaVenus, 
  FaPhone, FaUserShield, FaGlobe, FaMoneyBillWave, FaFileAlt, 
  FaEdit, FaTimes, FaSave, FaCheckCircle, FaExclamationCircle, FaGraduationCap
} from 'react-icons/fa';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  // حالات إدارة البيانات والتحميل
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // نظام التنبيهات الاحترافي العائم الذكي (Toast Notification)
  const [inlineMessage, setInlineMessage] = useState({ text: '', type: '' });

  const triggerToast = (text, type = 'success') => {
    setInlineMessage({ text, type });
    setTimeout(() => setInlineMessage({ text: '', type: '' }), 4000);
  };

  // 1. جلب بيانات الطالب الكاملة عند تحميل الصفحة
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .eq("id", id)
          .single();
        if (data) setStudent(data);
      } catch (err) {
        console.error("Error fetching student details:", err);
        triggerToast(isArabic ? "حدث خطأ أثناء جلب بيانات الطالب" : "Error fetching student", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  // حساب عمر الطالب ديناميكياً
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // 2. دالة حفظ وتحديث البيانات في السيرفر
  const handleUpdate = async (e) => {
    if(e) e.preventDefault();
    setSaving(true);

    // استخراج السورة تلقائياً بناءً على الربع المختار
    const selectedIndex = parseInt(student.current_quarter_index) || 0;
    const autoSurahText = getQuranProgress(selectedIndex).text;

    try {
      const { error } = await supabase
        .from("students")
        .update({
          name: student.name.trim(),
          parent_name: student.parent_name?.trim() || null,
          parent_phone: student.parent_phone?.trim() || null,
          birth_date: student.birth_date || null,
          gender: student.gender,
          country_code: student.country_code || null,
          payment_plan: student.payment_plan,
          current_quarter_index: selectedIndex,
          current_surah: autoSurahText,
          notes: student.notes?.trim() || null
        })
        .eq("id", id);
      
      if (error) throw error;

      setStudent(prev => ({ ...prev, current_surah: autoSurahText }));
      setIsEditing(false);
      triggerToast(isArabic ? "تم تحديث ملف الطالب بنجاح احترافي! ✏️" : "Profile updated successfully!", "success");
    } catch (error) {
      console.error("Error saving student profile:", error);
      triggerToast(isArabic ? "فشلت عملية حفظ التعديلات" : "Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: C.text || '#fff', textAlign: 'center', padding: '100px 20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>⏳</div>
        <div>{isArabic ? "جاري جلب ملف الطالب الذكي..." : "Loading premium profile..."}</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ color: '#EF4444', textAlign: 'center', padding: '50px 20px', fontFamily: 'system-ui, sans-serif' }}>
        <div>{isArabic ? "عذراً، لم يتم العثور على بيانات الطالب المطلوبة." : "Student profile not found."}</div>
      </div>
    );
  }

  const currentAge = calculateAge(student.birth_date);
  const matchedCountry = COUNTRIES_LIST.find(c => c.code === student.country_code);

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '12px', textAlign: isArabic ? 'right' : 'left', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* نظام التنبيهات الاحترافي العائم الذكي */}
      {inlineMessage.text && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: inlineMessage.type === 'success' ? '#059669' : '#DC2626', color: '#fff', padding: '12px 20px', borderRadius: '30px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', fontSize: '14px', fontWeight: 'bold', minWidth: '280px', justifyContent: 'center' }}>
          {inlineMessage.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span>{inlineMessage.text}</span>
        </div>
      )}

      {/* شريط الملاحة العلوي (Top Nav Row) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: '#1E293B', border: `1px solid ${C.border || '#1E293B'}`, color: C.gold || '#C9A84C', cursor: 'pointer', padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
        >
          {isArabic ? <><FaArrowRight /> عودة للخلف</> : <><FaArrowLeft /> Back</>}
        </button>
        <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold' }}>ID: #{student.id}</span>
      </div>

      {/* كارت بروفايل الطالب العالمي */}
      <div style={{ background: C.surface || '#111827', padding: '20px', borderRadius: '16px', border: `1px solid ${C.border || '#1E293B'}`, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* هيدر الكارت الرمزي البصري (Hero Profile Header) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#0C1520', padding: '14px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: student.gender === 'female' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: `1px solid ${student.gender === 'female' ? '#EC4899' : '#3B82F6'}` }}>
            {student.gender === 'female' ? '👩‍💼' : '👨‍💼'}
          </div>
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <input 
                type="text"
                value={student.name} 
                onChange={(e) => setStudent({...student, name: e.target.value})} 
                style={{ background: '#111827', color: '#fff', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${C.border || '#1E293B'}`, width: '100%', boxSizing: 'border-box', fontSize: '14px', fontWeight: 'bold' }} 
                required
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{student.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9CA3AF' }}>
                  <span>{matchedCountry ? matchedCountry.flag : '🌐'}</span>
                  {currentAge !== null && <span>{currentAge} {isArabic ? 'سنة' : 'years old'}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* شريط المتابعة المرئي للقرآن الكريم في وضع العرض فقط */}
        {!isEditing && (
          <div style={{ background: '#0F172A', padding: '10px', borderRadius: '10px', border: '1px solid #1e293b' }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>🎯 {isArabic ? 'مستوى الإنجاز الحالي المعتمد:' : 'Current Quran Progress:'}</span>
            <QuranProgressBar currentQuarterIndex={student.current_quarter_index || 0} />
          </div>
        )}

        {/* تفاصيل المجموعات والبيانات */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* قسم أولاً: البيانات الشخصية والأساسية */}
          <div style={{ background: '#0C1520', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: C.gold || '#C9A84C', fontWeight: 'bold', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>📌 {isArabic ? 'البيانات الشخصية' : 'Personal Information'}</span>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ color: '#9CA3AF', fontSize: '12px' }}><FaUser size={10} /> {t("النوع")}</label>
                <select value={student.gender || "male"} onChange={(e) => setStudent({...student, gender: e.target.value})} disabled={!isEditing} style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${C.border || '#1E293B'}`, background: '#111827', color: '#fff', fontSize: '13px', height: '36px', opacity: !isEditing ? 0.8 : 1 }}>
                  <option value="male">{t("ذكر")}</option>
                  <option value="female">{t("أنثى")}</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ color: '#9CA3AF', fontSize: '12px' }}><FaCalendarAlt size={10} /> {isArabic ? 'تاريخ الميلاد' : 'Birth Date'}</label>
                <input type="date" value={student.birth_date || ""} onChange={(e) => setStudent({...student, birth_date: e.target.value})} disabled={!isEditing} style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${C.border || '#1E293B'}`, background: '#111827', color: '#fff', fontSize: '13px', height: '36px', boxSizing: 'border-box', opacity: !isEditing ? 0.8 : 1 }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <label style={{ color: '#9CA3AF', fontSize: '12px' }}><FaGlobe size={10} /> {isArabic ? 'الدولة والمنطقة' : 'Country'}</label>
              <select value={student.country_code || "EG"} onChange={(e) => setStudent({...student, country_code: e.target.value})} disabled={!isEditing} style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${C.border || '#1E293B'}`, background: '#111827', color: '#fff', fontSize: '13px', height: '36px', opacity: !isEditing ? 0.8 : 1 }}>
                {COUNTRIES_LIST.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name_ar} ({c.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* قسم ثانياً: بيانات أولياء الأمور والاتصال */}
          <div style={{ background: '#0C1520', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: C.gold || '#C9A84C', fontWeight: 'bold', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>📞 {isArabic ? 'الاتصال والعائلة' : 'Family & Contact'}</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ color: '#9CA3AF', fontSize: '12px' }}><FaUserShield size={10} /> {isArabic ? 'اسم ولي الأمر' : 'Parent Name'}</label>
              <input type="text" value={student.parent_name || ""} placeholder={isArabic ? 'لا يوجد اسم مسجل' : 'N/A'} onChange={(e) => setStudent({...student, parent_name: e.target.value})} disabled={!isEditing} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${C.border || '#1E293B'}`, background: '#111827', color: '#fff', fontSize: '13px', opacity: !isEditing ? 0.8 : 1 }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ color: '#9CA3AF', fontSize: '12px' }}><FaPhone size={9} /> {isArabic ? 'رقم هاتف التواصل والواتساب' : 'Phone Number'}</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input type="tel" value={student.parent_phone || ""} placeholder={isArabic ? 'لا يوجد رقم مسجل' : 'N/A'} onChange={(e) => setStudent({...student, parent_phone: e.target.value})} disabled={!isEditing} style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: `1px solid ${C.border || '#1E293B'}`, background: '#111827', color: '#fff', fontSize: '13px', textAlign: 'left', direction: 'ltr', opacity: !isEditing ? 0.8 : 1 }} />
                {!isEditing && student.parent_phone && (
                  <a href={`tel:${student.parent_phone}`} style={{ background: '#10B981', color: '#fff', width: '36px', height: '35px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '14px' }} title={isArabic ? 'اتصال فوري مباشر' : 'Call parent'}>
                    <FaPhone />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* قسم ثالثاً: الحفظ المالي والقرآني */}
          <div style={{ background: '#0C1520', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: C.gold || '#C9A84C', fontWeight: 'bold', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>💳 {isArabic ? 'الاشتراك المالي والمستوى' : 'Financial & Level Settings'}</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ color: '#9CA3AF', fontSize: '12px' }}><FaMoneyBillWave size={11} style={{color: '#10B981'}} /> {isArabic ? 'نظام الاشتراك المالي المعتمد الطالب' : 'Financial Plan'}</label>
              <select value={student.payment_plan || "شهري"} onChange={(e) => setStudent({...student, payment_plan: e.target.value})} disabled={!isEditing} style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${C.border || '#1E293B'}`, background: '#111827', color: '#fff', fontSize: '13px', height: '36px', opacity: !isEditing ? 0.8 : 1 }}>
                <option value="شهري">{isArabic ? 'اشتراك شهري دوري' : 'Monthly Subscription'}</option>
                <option value="فصلي">{isArabic ? 'اشتراك فصلي (كل 3 شهور)' : 'Quarterly (3 Months)'}</option>
                <option value="سنوي">{isArabic ? 'اشتراك سنوي كامل' : 'Yearly Plan'}</option>
                <option value="منحة">{isArabic ? 'منحة دراسية / إعفاء' : 'Scholarship / Free'}</option>
              </select>
            </div>

            {isEditing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                <label style={{ color: '#9CA3AF', fontSize: '12px' }}><FaGraduationCap size={11} /> {isArabic ? 'تحديث مستوى الحفظ الحالي:' : 'Update Progress:'}</label>
                <div style={{ background: '#111827', padding: '4px 6px', borderRadius: '6px', border: `1px solid ${C.border || '#1E293B'}` }}>
                  <QuranProgressSelector 
                    initialIndex={parseInt(student.current_quarter_index) || 0} 
                    onIndexChange={(idx) => setStudent(prev => ({ ...prev, current_quarter_index: idx }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* رابعاً: ملاحظات المعلم الأكاديمية */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 'bold' }}><FaFileAlt size={10} /> {t("ملاحظات")}</label>
            <textarea value={student.notes || ""} placeholder={isArabic ? 'اكتب أي ملاحظات أكاديمية أو صحية بخصوص الطالب...' : 'Add custom teacher notes...'} onChange={(e) => setStudent({...student, notes: e.target.value})} disabled={!isEditing} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${C.border || '#1E293B'}`, background: '#0C1520', color: '#fff', height: '65px', resize: 'none', fontSize: '13px', boxSizing: 'border-box', opacity: !isEditing ? 0.8 : 1 }} />
          </div>

        </div>

        {/* أزرار الإجراءات التفاعلية السفلية الديناميكية */}
        <div style={{ marginTop: '10px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button"
                onClick={handleUpdate} 
                disabled={saving}
                style={{ flex: 1, background: '#10B981', color: '#fff', padding: "12px", border: "none", borderRadius: "10px", fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}
              >
                <FaSave /> {saving ? t("جاري الحفظ...") : (isArabic ? 'حفظ التعديلات' : 'Save Changes')}
              </button>
              <button 
                type="button"
                onClick={() => { setIsEditing(false); }} 
                style={{ flex: 1, background: '#475569', color: '#fff', padding: "12px", border: "none", borderRadius: "10px", fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}
              >
                <FaTimes /> {t("cancel")}
              </button>
            </div>
          ) : (
            <button 
              type="button"
              onClick={() => setIsEditing(true)} 
              style={{ width: '100%', background: `linear-gradient(135deg, ${C.gold || '#C9A84C'} 0%, #B3923B 100%)`, color: '#000', padding: "12px", border: "none", borderRadius: "10px", fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
              <FaEdit /> {isArabic ? 'تعديل بيانات الملف' : 'Edit Full Profile'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
