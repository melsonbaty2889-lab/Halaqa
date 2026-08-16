import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Check, 
  ChevronRight, 
  LogOut, 
  ChevronDown,
  Globe,
  Coins,
  Calendar,
  Clock,
  Languages,
  Building2,
  Link as LinkIcon
} from 'lucide-react';

import SelectModal from './SelectModal';
import { CURRENCIES } from '../../constants/currencies';
import { COUNTRIES } from '../../constants/countries';

export default function CreateAcademy({ onLogout, onSubmitAcademy }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [modalType, setModalType] = useState(null); // 'currency' | 'timezone' | 'calendar' | 'language' | null
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حالة النموذج فارغة بالكامل
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    currency: 'SAR',
    calendar: 'Hijri',
    timezone: 'Asia/Riyadh',
    language: 'ar',
  });

  const CALENDARS = [
    { value: 'Hijri', label: 'هجري (Hijri)', icon: '📅' },
    { value: 'Gregorian', label: 'ميلادي (Gregorian)', icon: '📆' },
  ];

  const LANGUAGES = [
    { value: 'ar', label: 'العربية (Arabic)', icon: '🇸🇦' },
    { value: 'en', label: 'English', icon: '🇺🇸' },
    { value: 'fr', label: 'Français', icon: '🇫🇷' },
  ];

  // خيارات النوافذ المنبثقة
  const currencyOptions = (CURRENCIES || []).map((c) => ({
    value: c.code,
    label: `${c.nameAr || c.labelAr || c.code} (${c.code})`,
    subLabel: c.symbol ? `الرمز: ${c.symbol}` : c.code,
    icon: c.symbol || '🪙',
  }));

  const timezoneOptions = (COUNTRIES || []).map((c) => ({
    value: c.timezone,
    label: c.nameAr,
    subLabel: c.timezone,
    icon: c.flag || '🌐',
  }));

  // دوال توليد الـ Slug تلقائياً
  const handleNameChange = (e) => {
    const nameVal = e.target.value;
    const generatedSlug = nameVal
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0621-\u064A-]+/g, '');

    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      slug: prev.slug === '' || prev.slug === generatedSlug ? generatedSlug : prev.slug
    }));
  };

  // دوال جلب القيم المعروضة
  const getCurrencyDisplay = () => {
    const item = (CURRENCIES || []).find((c) => c.code === formData.currency);
    return item ? `${item.nameAr || item.labelAr} (${item.code})` : formData.currency;
  };

  const getTimezoneDisplay = () => {
    const item = (COUNTRIES || []).find((c) => c.timezone === formData.timezone);
    return item ? `${item.nameAr} (${item.timezone})` : formData.timezone;
  };

  const getCalendarDisplay = () => {
    const item = CALENDARS.find((c) => c.value === formData.calendar);
    return item ? item.label : formData.calendar;
  };

  const getLanguageDisplay = () => {
    const item = LANGUAGES.find((l) => l.value === formData.language);
    return item ? item.label : formData.language;
  };

  // التحقق من اكتمال الخطوات
  const isStep1Valid = formData.name.trim().length >= 2 && formData.slug.trim().length >= 2;

  const handleNext = () => {
    if (currentStep === 1 && !isStep1Valid) return;
    setCurrentStep((prev) => Math.min(3, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (onSubmitAcademy) {
        await onSubmitAcademy(formData);
      }
    } catch (error) {
      console.error('Error creating academy:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132A] text-slate-100 flex flex-col items-center p-4 md:p-8 dir-rtl font-sans">
      
      {/* زر الخروج */}
      <div className="w-full max-w-md flex justify-start mb-4">
        <button 
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition"
        >
          <LogOut size={14} />
          <span>خروج</span>
        </button>
      </div>

      {/* الرأس الرئيسي */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-[#131D38] border border-amber-500/30 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/5">
          <GraduationCap className="w-10 h-10 text-amber-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
          تأسيس أكاديميتك الذكية
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-sm">
          خطوات بسيطة لإطلاق منظومتك التعليمية وإدارتها عالمياً
        </p>
      </div>

      {/* شريط مؤشر الخطوات */}
      <div className="w-full max-w-md flex items-center justify-between mb-8 px-4 relative">
        <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-800 -translate-y-1/2 -z-0"></div>

        {/* الخطوة 1 */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition ${
            currentStep > 1 
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
              : currentStep === 1 
              ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-400' 
              : 'bg-slate-800 text-slate-400'
          }`}>
            {currentStep > 1 ? <Check size={18} /> : '1'}
          </div>
          <span className={`text-[11px] font-medium ${currentStep === 1 ? 'text-amber-400' : 'text-slate-300'}`}>
            بيانات الأكاديمية
          </span>
        </div>

        {/* الخطوة 2 */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition ${
            currentStep > 2 
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
              : currentStep === 2 
              ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-400' 
              : 'bg-slate-800 text-slate-400'
          }`}>
            {currentStep > 2 ? <Check size={18} /> : '2'}
          </div>
          <span className={`text-[11px] font-medium ${currentStep === 2 ? 'text-amber-400' : 'text-slate-300'}`}>
            الإعدادات الإقليمية
          </span>
        </div>

        {/* الخطوة 3 */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition ${
            currentStep === 3 ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-400' : 'bg-slate-800 text-slate-400'
          }`}>
            <Sparkles size={18} />
          </div>
          <span className={`text-[11px] font-medium ${currentStep === 3 ? 'text-amber-400' : 'text-slate-300'}`}>
            المراجعة والإنشاء
          </span>
        </div>
      </div>

      {/* الكارت الرئيسي */}
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[#10182E] border border-slate-800/80 rounded-3xl p-6 shadow-2xl">

        {/* ----------------- الخطوة 1: البيانات الأساسية ----------------- */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="pb-2 border-b border-slate-800/60">
              <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Building2 size={18} className="text-amber-400" />
                <span>بيانات الأكاديمية الأساسية</span>
              </h2>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">اسم الأكاديمية</label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="مثال: أكاديمية اقرأ للعلوم"
                className="w-full px-4 py-3 bg-[#172033] text-slate-100 placeholder-slate-500 rounded-xl border border-slate-700/60 focus:outline-none focus:border-amber-500 text-sm transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <LinkIcon size={14} className="text-amber-400" />
                <span>الرابط الفريد (Slug)</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="iqraa"
                className="w-full px-4 py-3 bg-[#172033] text-slate-100 placeholder-slate-500 rounded-xl border border-slate-700/60 focus:outline-none focus:border-amber-500 text-sm dir-ltr transition"
                required
              />
            </div>
          </div>
        )}

        {/* ----------------- الخطوة 2: الإعدادات الإقليمية ----------------- */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-800/60">
              <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Globe size={18} className="text-amber-400" />
                <span>الإعدادات الإقليمية</span>
              </h2>
            </div>

            {/* زر اختيار العملة */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Coins size={14} className="text-amber-400" />
                <span>العملة الرسمية</span>
              </label>
              <button
                type="button"
                onClick={() => setModalType('currency')}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#172033] hover:bg-[#1c2842] text-slate-100 rounded-xl border border-slate-700/60 text-sm transition"
              >
                <span>{getCurrencyDisplay()}</span>
                <ChevronDown size={18} className="text-slate-400" />
              </button>
            </div>

            {/* زر اختيار التقويم */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar size={14} className="text-amber-400" />
                <span>التقويم المعتمد</span>
              </label>
              <button
                type="button"
                onClick={() => setModalType('calendar')}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#172033] hover:bg-[#1c2842] text-slate-100 rounded-xl border border-slate-700/60 text-sm transition"
              >
                <span>{getCalendarDisplay()}</span>
                <ChevronDown size={18} className="text-slate-400" />
              </button>
            </div>

            {/* زر اختيار المنطقة الزمنية */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock size={14} className="text-amber-400" />
                <span>المنطقة الزمنية</span>
              </label>
              <button
                type="button"
                onClick={() => setModalType('timezone')}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#172033] hover:bg-[#1c2842] text-slate-100 rounded-xl border border-slate-700/60 text-sm transition"
              >
                <span className="dir-ltr">{getTimezoneDisplay()}</span>
                <ChevronDown size={18} className="text-slate-400" />
              </button>
            </div>

            {/* زر اختيار اللغة الأساسية */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Languages size={14} className="text-amber-400" />
                <span>اللغة الأساسية</span>
              </label>
              <button
                type="button"
                onClick={() => setModalType('language')}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#172033] hover:bg-[#1c2842] text-slate-100 rounded-xl border border-slate-700/60 text-sm transition"
              >
                <span>{getLanguageDisplay()}</span>
                <ChevronDown size={18} className="text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------- الخطوة 3: المراجعة والإنشاء ----------------- */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-amber-400 pb-2 border-b border-slate-800/60">
              <Sparkles size={18} />
              <h2 className="font-bold text-base">ملخص بيانات الأكاديمية الإقليمية:</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400 font-medium">اسم الأكاديمية:</span>
                <span className="text-slate-100 font-bold">{formData.name || 'غير محدد'}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400 font-medium">الرابط الفريد (Slug):</span>
                <span className="text-amber-400 font-semibold dir-ltr">{formData.slug || 'غير محدد'}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400 font-medium">العملة الرسمية:</span>
                <span className="text-slate-200">{getCurrencyDisplay()}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400 font-medium">التقويم المعتمد:</span>
                <span className="text-slate-200">{getCalendarDisplay()}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400 font-medium">المنطقة الزمنية:</span>
                <span className="text-slate-200 dir-ltr">{getTimezoneDisplay()}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">اللغة الأساسية:</span>
                <span className="text-slate-200">{getLanguageDisplay()}</span>
              </div>
            </div>
          </div>
        )}

        {/* أزرار التنقل السفلية */}
        <div className="flex items-center gap-3 mt-8 pt-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3.5 px-4 bg-[#18223C] hover:bg-slate-800 text-slate-200 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border border-slate-700/40 transition"
            >
              <ChevronRight size={18} />
              <span>السابق</span>
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={currentStep === 1 && !isStep1Valid}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                currentStep === 1 && !isStep1Valid
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
              }`}
            >
              <span>التالي</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[1.5] py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              <Check size={18} />
              <span>{isSubmitting ? 'جاري الإنشاء...' : 'تأكيد وإنشاء الأكاديمية'}</span>
            </button>
          )}
        </div>

      </form>

      {/* النوافذ المنبثقة للاختيار */}
      <SelectModal
        isOpen={modalType === 'currency'}
        onClose={() => setModalType(null)}
        title="اختر العملة الرسمية"
        options={currencyOptions}
        selectedValue={formData.currency}
        onSelect={(val) => setFormData({ ...formData, currency: val })}
      />

      <SelectModal
        isOpen={modalType === 'timezone'}
        onClose={() => setModalType(null)}
        title="اختر المنطقة الزمنية"
        options={timezoneOptions}
        selectedValue={formData.timezone}
        onSelect={(val) => setFormData({ ...formData, timezone: val })}
      />

      <SelectModal
        isOpen={modalType === 'calendar'}
        onClose={() => setModalType(null)}
        title="اختر التقويم المعتمد"
        options={CALENDARS}
        selectedValue={formData.calendar}
        onSelect={(val) => setFormData({ ...formData, calendar: val })}
      />

      <SelectModal
        isOpen={modalType === 'language'}
        onClose={() => setModalType(null)}
        title="اختر اللغة الأساسية"
        options={LANGUAGES}
        selectedValue={formData.language}
        onSelect={(val) => setFormData({ ...formData, language: val })}
      />

    </div>
  );
}
