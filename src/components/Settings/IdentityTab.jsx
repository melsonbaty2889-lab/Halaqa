import React from 'react';
import { Upload, Trash2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
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
      <div className="card-surface space-y-4 w-full">
        <label className="block text-xs font-bold text-[var(--text-main)]">
          {t('identity.logoLabel', isRtl ? 'شعار الأكاديمية' : 'Academy Logo')}
        </label>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl border border-[var(--border-input)] bg-[var(--surface-input)] flex items-center justify-center overflow-hidden shrink-0">
            {formData?.logo_url ? (
              <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-[var(--text-sub)]" size={24} />
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
              className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
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
                className="text-xs px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>{t('common.remove', isRtl ? 'حذف' : 'Remove')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. قسم البيانات الأساسية (الاسم والـ Slug والوصف) */}
      <div className="card-surface space-y-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* الحقل الأساسي (حسب لغة الواجهة الحالية) */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
              {isRtl 
                ? t('identity.nameAr', 'اسم الأكاديمية (بالعربية)') 
                : t('identity.nameEnPrimary', 'Academy Name (English)')} <span className="text-red-500 font-bold">*</span>
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
              className={`app-input text-start transition-all duration-200 focus:ring-2 focus:ring-amber-500/20 ${!isRtl ? 'dir-ltr' : ''}`} 
            />
          </div>

          {/* الحقل الثانوي (اللغة البديلة - اختياري) */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
              {isRtl 
                ? t('identity.nameEn', 'اسم الأكاديمية (بالإنجليزية)') 
                : t('identity.nameArSecondary', 'Academy Name (Arabic)')}{' '}
              <span className="text-[var(--text-sub)] font-normal text-[11px]">
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
              className={`app-input text-start transition-all duration-200 focus:ring-2 focus:ring-amber-500/20 ${isRtl ? 'dir-ltr' : ''}`} 
            />
          </div>
        </div>

        {/* حقل الـ Slug (رابط الأكاديمية المختصر) */}
        <div>
          <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
            {t('identity.slugLabel', isRtl ? 'الرابط المختصر للأكاديمية (Slug)' : 'Academy Slug / URL Identifier')}
          </label>
          <div className="relative flex items-center dir-ltr">
            <span className="absolute left-3 text-[var(--text-sub)] text-xs font-mono select-none flex items-center gap-1">
              <LinkIcon size={12} />
              <span>/</span>
            </span>
            <input 
              type="text" 
              maxLength={60}
              placeholder="my-academy"
              value={formData?.slug || ''} 
              onChange={(e) => handleChange('slug', e.target.value)} 
              className="app-input pl-8 text-xs font-mono text-start dir-ltr transition-all duration-200 focus:ring-2 focus:ring-amber-500/20" 
            />
          </div>
          <p className="text-[10px] text-[var(--text-sub)] mt-1">
            {t('identity.slugHint', isRtl 
              ? 'يستخدم هذا المعرّف في روابط التسجيل والصفحات الخاصة بالأكاديمية (أحرف إنجليزية وشُرط فقط).' 
              : 'Used in registration links and unique URLs (lowercase letters, numbers, and hyphens only).')}
          </p>
        </div>

        {/* وصف الأكاديمية */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold text-[var(--text-main)]">
              {t('identity.description', isRtl ? 'وصف الأكاديمية' : 'Academy Description')}{' '}
              <span className="text-[var(--text-sub)] font-normal text-[11px]">
                ({t('common.optional', isRtl ? 'اختياري' : 'Optional')})
              </span>
            </label>
            <span className="text-[10px] text-[var(--text-sub)]">
              {(formData?.description || '').length}/300
            </span>
          </div>
          <textarea 
            rows={3} 
            maxLength={300}
            placeholder={t('identity.descriptionPlaceholder', isRtl ? 'اكتب نبذة مختصرة عن الأكاديمية أهدافها ورسالتها...' : 'Write a brief description of the academy...')}
            value={formData?.description || ''} 
            onChange={(e) => handleChange('description', e.target.value)} 
            className="app-input text-start text-xs resize-none transition-all duration-200 focus:ring-2 focus:ring-amber-500/20" 
          />
        </div>
      </div>
    </div>
  );
}
