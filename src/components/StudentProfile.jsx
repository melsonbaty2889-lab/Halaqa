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
  FaArrowLeft, FaArrowRight, FaUser, FaCalendarAlt, FaPhone, 
  FaUserShield, FaGlobe, FaMoneyBillWave, FaFileAlt, FaEdit, 
  FaTimes, FaSave, FaCheckCircle, FaExclamationCircle, FaGraduationCap,
  FaBookOpen, FaInfoCircle, FaCheckSquare, FaHistory
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
  
  // التبويب النشط حالياً (نظام التنقل الداخلي الفاخر)
  const [activeTab, setActiveTab] = useState('quran'); // quran, personal, financial

  // نظام التنبيهات الاحترافي العائم
  const [inlineMessage, setInlineMessage] = useState({ text: '', type: '' });

  const triggerToast = (text, type = 'success') => {
    setInlineMessage({ text, type });
    setTimeout(() => setInlineMessage({ text: '', type: '' }), 4000);
  };

  // 1. جلب بيانات الطالب
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) throw error; // معالجة منع الخطأ الصامت وقذفه للـ catch مباشرة
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

  // 2. دالة حفظ وتحديث البيانات
  const handleUpdate = async (e) => {
    if(e) e.preventDefault();
    setSaving(true);

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
          status: student.status || 'active',
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
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
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

  // الألوان الخاصة بحالة الطالب الثابتة والديناميكية
  const getStatusStyle = (status) => {
    switch(status) {
      case 'paused': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', label: isArabic ? 'مؤجل / متوقف' : 'Paused' };
      case 'inactive': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', label: isArabic ? 'غير نشط' : 'Inactive' };
      default: return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', label: isArabic ? 'نشط بانتظام' : 'Active' };
    }
  };
  const statusInfo = getStatusStyle(student.status);

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '12px', textAlign: isArabic ? 'right' : 'left', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      
      {/* نظام التنبيهات الاحترافي */}
      {inlineMessage.text && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: inlineMessage.type === 'success' ? '#059669' : '#DC2626', color: '#fff', padding: '12px 20px', borderRadius: '30px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', fontSize: '14px', fontWeight: 'bold', minWidth: '280px', justifyContent: 'center' }}>
          {inlineMessage.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span>{inlineMessage.text}</span>
        </div>
      )}

      {/* شريط الملاحة العلوي */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: '#1E293B', border: `1px solid ${C.border || '#1E293B'}`, color: C.gold || '#C9A84C', cursor: 'pointer', padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
        >
          {isArabic ? <><FaArrowRight /> الحلقات</> : <><FaArrowLeft /> Classes</>}
        </button>
        <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold' }}>ID: #{student.id}</span>
      </div>

      {/* الهيدر الرئيسي لكارت الطالب العالمي */}
      <div style={{ background: C.surface || '#111827', padding: '16px', borderRadius: '16px 16px 0 0', border: `1px solid ${C.border || '#1E293B'}`, borderBottom: 'none', display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
        
        {/* شارة الحالة الاحترافية */}
        <div style={{ position: 'absolute', top: '16px', left: isArabic ? '16px' : 'auto', right: isArabic ? 'auto' : '16px' }}>
          {isEditing ? (
            <select value={student.status || "active"} onChange={(e) => setStudent({...student, status: e.target.value})} style={{ background: '#0F172A', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #1e293b', fontWeight: 'bold' }}>
              <option value="active">{isArabic ? 'نشط' : 'Active'}</option>
              <option value="paused">{isArabic ? 'متوقف مؤقتاً' : 'Paused'}</option>
              <option value="inactive">{isArabic ? 'غير نشط' : 'Inactive'}</option>
            </select>
          ) : (
            <span style={{ background: statusInfo.bg, color: statusInfo.text, padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', border: `1px solid ${statusInfo.text}33` }}>
              ● {statusInfo.label}
            </span>
          )}
        </div>

        <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: student.gender === 'female' ? 'rgba(236, 72, 153, 0.12)' : 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: `2px solid ${student.gender === 'female' ? '#EC4899' : '#3B82F6'}` }}>
          {student.gender === 'female' ? '🧕' : '🙋‍♂️'}
        </div>

        <div style={{ flex: 1, paddingLeft: isArabic ? 0 : '70px', paddingRight: isArabic ? '70px' : 0 }}>
          {isEditing ? (
            <input 
              type="text"
              value={student.name} 
              onChange={(e) => setStudent({...student, name: e.target.value})} 
              style={{ background: '#0F172A', color: '#fff', padding: '6px 12px', borderRadius: '8px', border: `1px solid ${C.border || '#1E293B'}`, width: '90%', boxSizing: 'border-box', fontSize: '14px', fontWeight: 'bold' }} 
              required
            />
          ) : (
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '17px', fontWeight: 'bold', letterSpacing: '-0.3px' }}>{student.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                <span>{matchedCountry ? matchedCountry.flag : '🌐'}</span>
                <span>{matchedCountry ? (isArabic ? matchedCountry.name_ar : matchedCountry.name_en) : ''}</span>
                {currentAge !== null && <span>• {currentAge} {isArabic ? 'سنة' : 'years'}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* شريط التبويبات الفاخر (Premium Tab Switcher) */}
      <div style={{ display: 'flex', background: '#0F172A', borderLeft: `1px solid ${C.border || '#1E293B'}`, borderRight: `1px solid ${C.border || '#1E293B'}`, padding: '4px' }}>
        <button 
          onClick={() => setActiveTab('quran')}
          style={{ flex: 1, background: activeTab === 'quran' ? (C.surface || '#111827') : 'transparent', color: activeTab === 'quran' ? (C.gold || '#C9A84C') : '#9CA3AF', border: 'none', padding: '10px 4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: activeTab === 'quran' ? '8px' : '0', transition: 'all 0.2s' }}
        >
          <FaBookOpen size={12} /> {isArabic ? 'المسار القرآني' : 'Quran Track'}
        </button>
        <button 
          onClick={() => setActiveTab('personal')}
          style={{ flex: 1, background: activeTab === 'personal' ? (C.surface || '#111827') : 'transparent', color: activeTab === 'personal' ? (C.gold || '#C9A84C') : '#9CA3AF', border: 'none', padding: '10px 4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: activeTab === 'personal' ? '8px' : '0', transition: 'all 0.2s' }}
        >
          <FaInfoCircle size={12} /> {isArabic ? 'الهوية والتواصل' : 'Identity'}
        </button>
        <button 
          onClick={() => setActiveTab('financial')}
          style={{ flex: 1, background: activeTab === 'financial' ? (C.surface || '#111827') : 'transparent', color: activeTab === 'financial' ? (C.gold || '#C9A84C') : '#9CA3AF', border: 'none', padding: '10px 4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: activeTab === 'financial' ? '8px' : '0', transition: 'all 0.2s' }}
        >
          <FaMoneyBillWave size={12} /> {isArabic ? 'الاشتراك والتقرير' : 'Financials'}
        </button>
      </div>

      {/* محتوى كارت البروفايل المتغير حسب التبويب المختار */}
      <div style={{ background: C.surface || '#111827', padding: '16px', borderRadius: '0 0 16px 16px', border: `1px solid ${C.border || '#1E293B'}`, borderTop: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* TAB 1: المسار القرآني والأكاديمي */}
        {activeTab === 'quran' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#0C1520', padding: '14px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: C.gold || '#C9A84C', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaCheckSquare style={{color: '#10B981'}} /> {isArabic ? 'مستوى خطة الحفظ الحالية المعتمدة:' : 'Current Memorization Progress:'}
                </span>
              </div>
              <div style={{ margin: '8px 0 12px 0' }}>
                <QuranProgressBar currentQuarterIndex={student.current_quarter_index || 0} />
              </div>
              <div style={{ background: '#111827', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', border: '1px solid #1e293b' }}>
                <span style={{ color: '#9CA3AF' }}>{isArabic ? 'السورة الحالية:' : 'Current Surah:'}</span>
                <span style={{ fontWeight: 'bold', color: '#10B981' }}>{student.current_surah || (isArabic ? 'غير محدد' : 'N/A')}</span>
              </div>
            </div>

            {isEditing && (
              <div style={{ background: '#0C1520', padding: '14px', borderRadius: '12px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 'bold' }}><FaGraduationCap /> {isArabic ? 'تحديث مستوى إنجاز الخطة الفعلي:' : 'Update Progress Selector:'}</label>
                <div style={{ background: '#111827', padding: '6px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <QuranProgressSelector 
                    initialIndex={parseInt(student.current_quarter_index) || 0} 
                    onIndexChange={(idx) => setStudent(prev => ({ ...prev, current_quarter_index: idx }))}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: البيانات الشخصية والهوية */}
        {activeTab === 'personal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#9CA3AF', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><FaUser size={10} /> {t("النوع")}</label>
                <select value={student.gender || "male"} onChange={(e) => setStudent({...student, gender: e.target.value})} disabled={!isEditing} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #1e293b', background: '#0F172A', color: '#fff', fontSize: '13px', height: '38px', opacity: !isEditing ? 0.85 : 1 }}>
                  <option value="male">{t("ذكر")}</option>
                  <option value="female">{t("أنثى")}</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#9CA3AF', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><FaCalendarAlt size={10} /> {isArabic ? 'تاريخ الميلاد' : 'Birth Date'}</label>
                <input type="date" value={student.birth_date || ""} onChange={(e) => setStudent({...student, birth_date: e.target.value})} disabled={!isEditing} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #1e293b', background: '#0F172A', color: '#fff', fontSize: '13px', height: '38px', boxSizing: 'border-box', opacity: !isEditing ? 0.85 : 1 }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#9CA3AF', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><FaGlobe size={11} /> {isArabic ? 'الدولة الإقليمية ومفتاح الاتصال' : 'Country Geographic Region'}</label>
              <select value={student.country_code || "EG"} onChange={(e) => setStudent({...student, country_code: e.target.value})} disabled={!isEditing} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #1e293b', background: '#0F172A', color: '#fff', fontSize: '13px', height: '38px', opacity: !isEditing ? 0.85 : 1 }}>
                {COUNTRIES_LIST.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name_ar} ({c.code})</option>
                ))}
              </select>
            </div>

            <div style={{ background: '#0C1520', padding: '12px', borderRadius: '12px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ color: '#9CA3AF', fontSize: '12px' }}><FaUserShield size={11} /> {isArabic ? 'اسم ولي الأمر المسؤول' : 'Parent Custody Name'}</label>
                <input type="text" value={student.parent_name || ""} placeholder={isArabic ? 'لا يوجد اسم مسجل' : 'N/A'} onChange={(e) => setStudent({...student, parent_name: e.target.value})} disabled={!isEditing} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #1e293b', background: '#111827', color: '#fff', fontSize: '13px', opacity: !isEditing ? 0.85 : 1 }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ color: '#9CA3AF', fontSize: '12px' }}><FaPhone size={9} /> {isArabic ? 'رقم هاتف التواصل الفوري (واتساب)' : 'Contact Hotline'}</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="tel" value={student.parent_phone || ""} placeholder={isArabic ? 'لا يوجد رقم مسجل' : 'N/A'} onChange={(e) => setStudent({...student, parent_phone: e.target.value})} disabled={!isEditing} style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #1e293b', background: '#111827', color: '#fff', fontSize: '13px', textAlign: 'left', direction: 'ltr', opacity: !isEditing ? 0.85 : 1 }} />
                  {!isEditing && student.parent_phone && (
                    <a href={`https://wa.me/${student.parent_phone.replace(/\+/g, '')}`} target="_blank" rel="noreferrer" style={{ background: '#10B981', color: '#fff', width: '38px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '14px', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }} title="واتساب">
                      💬
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: النظام المالي والملاحظات الأكاديمية */}
        {activeTab === 'financial' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#9CA3AF', fontSize: '12px' }}><FaMoneyBillWave size={11} style={{color: '#10B981'}} /> {isArabic ? 'نظام ونوع العضوية والاشتراك' : 'Financial Tariff Plan'}</label>
              <select value={student.payment_plan || "شهري"} onChange={(e) => setStudent({...student, payment_plan: e.target.value})} disabled={!isEditing} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #1e293b', background: '#0F172A', color: '#fff', fontSize: '13px', height: '38px', opacity: !isEditing ? 0.85 : 1 }}>
                <option value="شهري">{isArabic ? 'اشتراك شهري دوري' : 'Monthly Subscription'}</option>
                <option value="فصلي">{isArabic ? 'اشتراك فصلي (3 شهور)' : 'Quarterly (3 Months)'}</option>
                <option value="سنوي">{isArabic ? 'اشتراك سنوي كامل' : 'Yearly Plan'}</option>
                <option value="منحة">{isArabic ? 'منحة دراسية / إعفاء كامل' : 'Full Scholarship / Free'}</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 'bold' }}><FaFileAlt size={10} /> {isArabic ? 'ملاحظات المعلم والتقرير السلوكي الأكاديمي' : 'Academic Teacher Notes'}</label>
              <textarea value={student.notes || ""} placeholder={isArabic ? 'اكتب هنا تفاصيل أداء الطالب، التوصيات الصحية، أو الملاحظات الخاصة بالمشمرف الأكاديمي...' : 'Enter custom administrative or health reports...'} onChange={(e) => setStudent({...student, notes: e.target.value})} disabled={!isEditing} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1e293b', background: '#0C1520', color: '#fff', height: '80px', resize: 'none', fontSize: '13px', boxSizing: 'border-box', opacity: !isEditing ? 0.85 : 1, lineHeight: '1.5' }} />
            </div>
          </div>
        )}

        {/* أزرار الإجراءات التفاعلية السفلية */}
        <div style={{ marginTop: '4px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button"
                onClick={handleUpdate} 
                disabled={saving}
                style={{ flex: 1, background: '#10B981', color: '#fff', padding: "12px", border: "none", borderRadius: "10px", fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', transition: 'opacity 0.2s' }}
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
              style={{ width: '100%', background: `linear-gradient(135deg, ${C.gold || '#C9A84C'} 0%, #B3923B 100%)`, color: '#000', padding: "12px", border: "none", borderRadius: "10px", fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 4px 14px rgba(201,168,76,0.25)' }}
            >
              <FaEdit /> {isArabic ? 'تعديل بيانات الملف الكامل' : 'Edit Full Profile'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
