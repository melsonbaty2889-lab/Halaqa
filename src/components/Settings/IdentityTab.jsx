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
    <div className="space-y-5 text-start">
      {/* قسم الشعار - تم توحيد المتغيرات مع الهوية */}
      <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-light)] space-y-3">
        <label className="block text-xs font-bold text-[var(--text-main)]">
          {t('identity.logoLabel', 'شعار الأكاديمية')}
        </label>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] flex items-center justify-center overflow-hidden shrink-0">
            {formData?.logo_url ? (
              <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-[var(--text-muted)]" size={24} />
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
              onClick={() => fileInputRef?.current?.click()}
              className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
            >
              <Upload size={14} />
              <span>{uploadingLogo ? t('common.uploading', 'جاري الرفع...') : t('identity.uploadBtn', 'تغيير الشعار')}</span>
            </button>

            {formData?.logo_url && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-xs px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>{t('common.remove', 'حذف')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* قسم الأسماء والوصف - تم تحديد ألوان الحقول بـ Tailwind الصريح */}
      <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-light)] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
              {t('identity.nameAr', 'اسم الأكاديمية (بالعربية)')}
            </label>
            <input 
              type="text" 
              value={formData?.name_ar || ''} 
              onChange={(e) => handleNameChange?.('name_ar', e.target.value)} 
              className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none" 
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
              className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none text-left" 
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
            className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none text-left" 
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
            className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
            {t('identity.description', 'وصف الأكاديمية')}
          </label>
          <textarea 
            rows={3} 
            value={formData?.description || ''} 
            onChange={(e) => updateField?.('description', e.target.value)} 
            className="w-full text-xs p-2.5 rounded-md border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] focus:border-[var(--primary)] outline-none resize-none" 
          />
        </div>
      </div>
    </div>
  );
}
