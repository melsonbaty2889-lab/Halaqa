import React from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
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
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* رفع الشعار */}
      <div className="p-4 rounded-lg border border-[var(--border-light)] bg-[var(--bg-surface)] space-y-3">
        <label className="block text-xs font-bold text-[var(--text-main)]">
          {t('settings.logoLabel', 'شعار الأكاديمية')}
        </label>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg border border-[var(--border-light)] bg-[var(--bg-main)] flex items-center justify-center overflow-hidden">
            {formData.logo_url ? (
              <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-[var(--text-muted)]" size={24} />
            )}
          </div>

          <div className="flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleLogoUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingLogo}
              className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
            >
              <Upload size={14} />
              <span>{uploadingLogo ? t('common.uploading', 'جاري الرفع...') : t('settings.changeLogo', 'تغيير الشعار')}</span>
            </button>

            {formData.logo_url && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="btn-danger text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>{t('common.remove', 'حذف')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* مدخلات الأسماء والبيانات */}
      <div className="p-4 rounded-lg border border-[var(--border-light)] bg-[var(--bg-surface)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
              {t('settings.academyNameAr', 'اسم الأكاديمية (بالعربية)')}
            </label>
            <input
              type="text"
              value={formData.name_ar || ''}
              onChange={(e) => handleNameChange('name_ar', e.target.value)}
              className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
              {t('settings.academyNameEn', 'اسم الأكاديمية (بالإنجليزية)')}
            </label>
            <input
              type="text"
              value={formData.name_en || ''}
              onChange={(e) => handleNameChange('name_en', e.target.value)}
              className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none text-left"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
            {t('settings.slug', 'المعرف الرابط (URL Slug)')}
          </label>
          <input
            type="text"
            value={formData.slug || ''}
            onChange={(e) => updateField('slug', e.target.value)}
            className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none text-left"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
            {t('settings.tagline', 'الوصف المختصر (Tagline)')}
          </label>
          <input
            type="text"
            value={formData.tagline || ''}
            onChange={(e) => updateField('tagline', e.target.value)}
            className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
            {t('settings.description', 'وصف الأكاديمية')}
          </label>
          <textarea
            rows={3}
            value={formData.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
}
