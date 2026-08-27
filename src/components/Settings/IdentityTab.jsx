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
    <div className="space-y-6 text-start">
      {/* قسم الشعار */}
      <div className="card-surface space-y-4">
        <label className="block text-xs font-bold text-[var(--text-main)]">
          {t('identity.logoLabel', 'شعار الأكاديمية')}
        </label>
        
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl border border-[var(--border-input)] bg-[var(--surface-input)] flex items-center justify-center overflow-hidden shrink-0">
            {formData?.logo_url ? (
              <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-[var(--text-sub)]" size={28} />
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
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
              onClick={() => fileInputRef?.current?.click()}
              className="btn-secondary text-xs px-4 py-2 flex items-center gap-2"
            >
              <Upload size={15} />
              <span>{uploadingLogo ? t('common.uploading', 'جاري الرفع...') : t('identity.uploadBtn', 'تغيير الشعار')}</span>
            </button>

            {formData?.logo_url && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-xs px-3.5 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={15} />
                <span>{t('common.remove', 'حذف')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* قسم الأسماء والوصف */}
      <div className="card-surface space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
              {t('identity.nameAr', 'اسم الأكاديمية (بالعربية)')}
            </label>
            <input 
              type="text" 
              value={formData?.name_ar || ''} 
              onChange={(e) => handleNameChange?.('name_ar', e.target.value)} 
              className="app-input" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
              {t('identity.nameEn', 'اسم الأكاديمية (بالإنجليزية)')}
            </label>
            <input 
              type="text" 
              value={formData?.name_en || ''} 
              onChange={(e) => handleNameChange?.('name_en', e.target.value)} 
              dir="ltr"
              className="app-input text-left" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
            {t('identity.slug', 'الرابط المختصر (Slug)')}
          </label>
          <input 
            type="text" 
            value={formData?.slug || ''} 
            onChange={(e) => updateField?.('slug', e.target.value)} 
            dir="ltr"
            className="app-input text-left" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
            {t('identity.tagline', 'الوصف الترويجي القصير (Tagline)')}
          </label>
          <input 
            type="text" 
            value={formData?.tagline || ''} 
            onChange={(e) => updateField?.('tagline', e.target.value)} 
            className="app-input" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
            {t('identity.description', 'وصف الأكاديمية')}
          </label>
          <textarea 
            rows={4} 
            value={formData?.description || ''} 
            onChange={(e) => updateField?.('description', e.target.value)} 
            className="app-input resize-none" 
          />
        </div>
      </div>
    </div>
  );
}
