// src/components/Settings/IdentityTab.jsx

import React, { useState } from 'react';
import { Upload, Trash2, Image as ImageIcon, Link as LinkIcon, Copy, Check, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function IdentityTab({ 
  formData = {}, 
  updateField, 
  handleNameChange, 
  handleLogoUpload, 
  handleRemoveLogo, 
  uploadingLogo, 
  fileInputRef 
}) {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);

  const isRtl = i18n.dir() === 'rtl' || i18n.language === 'ar';

  const handleChange = (field, value) => {
    if (typeof updateField === 'function') {
      updateField(field, value);
    }
  };

  const onNameChange = (lang, value) => {
    if (typeof handleNameChange === 'function') {
      handleNameChange(lang, value);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleCopyReferral = () => {
    const code = formData?.my_referral_code;
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getArabicName = () => {
    if (!formData?.name) return '';
    if (typeof formData.name === 'object') return formData.name.ar || '';
    return formData.name;
  };

  const getEnglishName = () => {
    if (!formData?.name || typeof formData.name !== 'object') return '';
    return formData.name.en || '';
  };

  return (
    <div className="space-y-5 text-start w-full">
      {/* 1. قسم الشعار */}
      <div className="bg-semantic-surfaceCard border border-semantic-borderCard rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 w-full">
        <label className="block text-xs font-bold text-semantic-textPrimary">
          {t('identity.logoLabel', isRtl ? 'شعار الأكاديمية' : 'Academy Logo')}
        </label>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl border border-semantic-borderInput bg-semantic-surfaceInput flex items-center justify-center overflow-hidden shrink-0">
            {formData?.logo_url ? (
              <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-semantic-textSecondary" size={24} />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleLogoUpload} 
              accept="image/*" 
              className="hidden" 
            />
            
            <button
              type="button"
              disabled={uploadingLogo}
              onClick={triggerFileInput}
              className="bg-semantic-surfaceInput hover:bg-semantic-surfaceInput/80 text-semantic-textSecondary hover:text-semantic-textPrimary border border-semantic-borderInput text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer font-medium transition-colors"
            >
              <Upload size={14} />
              <span>
                {uploadingLogo 
                  ? t('common.uploading', isRtl ? 'جاري الرفع...' : 'Uploading...') 
                  : t('identity.uploadBtn', isRtl ? 'تغيير الشعار' : 'Change Logo')}
              </span>
            </button>

            {formData?.logo_url && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-xs px-3 py-2 rounded-xl text-semantic-error hover:bg-semantic-error/10 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <Trash2 size={14} />
                <span>{t('common.remove', isRtl ? 'حذف' : 'Remove')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. قسم البيانات الأساسية (الاسم والـ Slug والوصف وكود الإحالة) */}
      <div className="bg-semantic-surfaceCard border border-semantic-borderCard rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* الحقل الأساسي (حسب لغة الواجهة الحالية) */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-semantic-textPrimary">
              {isRtl 
                ? t('identity.nameAr', 'اسم الأكاديمية (بالعربية)') 
                : t('identity.nameEnPrimary', 'Academy Name (English)')} <span className="text-semantic-error font-bold">*</span>
            </label>
            <input 
              type="text" 
              required
              maxLength={100}
              placeholder={isRtl 
                ? t('identity.nameArPlaceholder', 'اكتب اسم الأكاديمية بالعربية...') 
                : t('identity.nameEnPlaceholder', 'Enter academy name in English...')}
              value={isRtl ? getArabicName() : getEnglishName()} 
              onChange={(e) => onNameChange(isRtl ? 'ar' : 'en', e.target.value)} 
              className={`w-full bg-semantic-surfaceInput border border-semantic-borderInput rounded-xl px-3.5 py-2.5 text-xs text-semantic-textPrimary placeholder:text-semantic-textSecondary/50 outline-none transition-all duration-200 text-start focus:border-semantic-actionPrimary focus:ring-2 focus:ring-semantic-actionPrimary/20 ${!isRtl ? 'dir-ltr' : ''}`} 
            />
          </div>

          {/* الحقل الثانوي (اللغة البديلة - اختياري) */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-semantic-textPrimary">
              {isRtl 
                ? t('identity.nameEn', 'اسم الأكاديمية (بالإنجليزية)') 
                : t('identity.nameArSecondary', 'Academy Name (Arabic)')}{' '}
              <span className="text-semantic-textSecondary font-normal text-[11px]">
                ({t('common.optional', isRtl ? 'اختياري' : 'Optional')})
              </span>
            </label>
            <input 
              type="text" 
              maxLength={100}
              placeholder={isRtl 
                ? t('identity.nameEnPlaceholder', 'Enter academy name in English...') 
                : t('identity.nameArPlaceholder', 'اكتب اسم الأكاديمية بالعربية...')}
              value={isRtl ? getEnglishName() : getArabicName()} 
              onChange={(e) => onNameChange(isRtl ? 'en' : 'ar', e.target.value)} 
              className={`w-full bg-semantic-surfaceInput border border-semantic-borderInput rounded-xl px-3.5 py-2.5 text-xs text-semantic-textPrimary placeholder:text-semantic-textSecondary/50 outline-none transition-all duration-200 text-start focus:border-semantic-actionPrimary focus:ring-2 focus:ring-semantic-actionPrimary/20 ${isRtl ? 'dir-ltr' : ''}`} 
            />
          </div>
        </div>

        {/* حقل الـ Slug (رابط الأكاديمية المختصر) */}
        <div>
          <label className="block text-xs font-bold mb-1.5 text-semantic-textPrimary">
            {t('identity.slugLabel', isRtl ? 'الرابط المختصر للأكاديمية (Slug)' : 'Academy Slug / URL Identifier')}
          </label>
          <div className="relative flex items-center dir-ltr">
            <span className="absolute left-3 text-semantic-textSecondary text-xs font-mono select-none flex items-center gap-1">
              <LinkIcon size={12} />
              <span>/</span>
            </span>
            <input 
              type="text" 
              maxLength={60}
              placeholder="my-academy"
              value={formData?.slug || ''} 
              onChange={(e) => handleChange('slug', e.target.value)} 
              className="w-full bg-semantic-surfaceInput border border-semantic-borderInput rounded-xl py-2.5 pr-3.5 pl-8 text-xs font-mono text-semantic-textPrimary placeholder:text-semantic-textSecondary/50 outline-none text-start dir-ltr transition-all duration-200 focus:border-semantic-actionPrimary focus:ring-2 focus:ring-semantic-actionPrimary/20" 
            />
          </div>
          <p className="text-[10px] text-semantic-textSecondary mt-1">
            {t('identity.slugHint', isRtl 
              ? 'يستخدم هذا المعرّف في روابط التسجيل والصفحات الخاصة بالأكاديمية (أحرف إنجليزية وشُرط فقط).' 
              : 'Used in registration links and unique URLs (lowercase letters, numbers, and hyphens only).')}
          </p>
        </div>

        {/* كود الإحالة الخاص بالأكاديمية (Read-only + Copy) */}
        <div>
          <label className="block text-xs font-bold mb-1.5 text-semantic-textPrimary">
            {t('identity.referralCode', isRtl ? 'كود الإحالة الخاص بالأكاديمية' : 'Academy Referral Code')}
          </label>
          <div className="flex items-center gap-2 dir-ltr">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-semantic-textSecondary select-none">
                <Share2 size={13} />
              </span>
              <input 
                type="text" 
                readOnly
                value={formData?.my_referral_code || ''} 
                placeholder="ACAD-XXXXXX"
                className="w-full bg-semantic-surfaceInput/60 border border-semantic-borderInput rounded-xl py-2.5 pr-3.5 pl-8 text-xs font-mono font-bold text-semantic-actionPrimary outline-none text-start cursor-not-allowed select-all" 
              />
            </div>
            <button
              type="button"
              onClick={handleCopyReferral}
              disabled={!formData?.my_referral_code}
              className="bg-semantic-surfaceInput hover:bg-semantic-surfaceInput/80 text-semantic-textPrimary border border-semantic-borderInput text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer font-bold transition-all shrink-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? <Check size={14} className="text-semantic-success" /> : <Copy size={14} />}
              <span>{copied ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ' : 'Copy')}</span>
            </button>
          </div>
          <p className="text-[10px] text-semantic-textSecondary mt-1">
            {t('identity.referralHint', isRtl 
              ? 'كود ثابت وغير قابل للتعديل يُستخدم في التسويق ودعوة الأكاديميات الأخرى.' 
              : 'Immutable unique code used for marketing and academy invitations.')}
          </p>
        </div>

        {/* وصف الأكاديمية */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold text-semantic-textPrimary">
              {t('identity.description', isRtl ? 'وصف الأكاديمية' : 'Academy Description')}{' '}
              <span className="text-semantic-textSecondary font-normal text-[11px]">
                ({t('common.optional', isRtl ? 'اختياري' : 'Optional')})
              </span>
            </label>
            <span className="text-[10px] text-semantic-textSecondary">
              {(formData?.description || '').length}/300
            </span>
          </div>
          <textarea 
            rows={3} 
            maxLength={300}
            placeholder={t('identity.descriptionPlaceholder', isRtl ? 'اكتب نبذة مختصرة عن الأكاديمية أهدافها ورسالتها...' : 'Write a brief description of the academy...')}
            value={formData?.description || ''} 
            onChange={(e) => handleChange('description', e.target.value)} 
            className="w-full bg-semantic-surfaceInput border border-semantic-borderInput rounded-xl px-3.5 py-2.5 text-xs text-semantic-textPrimary placeholder:text-semantic-textSecondary/50 outline-none text-start resize-none transition-all duration-200 focus:border-semantic-actionPrimary focus:ring-2 focus:ring-semantic-actionPrimary/20" 
          />
        </div>
      </div>
    </div>
  );
}
