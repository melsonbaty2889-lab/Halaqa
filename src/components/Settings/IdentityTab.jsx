import React from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';

export default function IdentityTab({ 
  formData = {}, 
  updateField, 
  handleNameChange, 
  handleLogoUpload, 
  handleRemoveLogo, 
  uploadingLogo, 
  fileInputRef, 
  isRtl 
}) {
  return (
    <div className="space-y-5 text-start">
      {/* قسم الشعار */}
      <div className="bg-[var(--surface-card)] p-4 rounded-xl border border-[var(--border-light)] space-y-3">
        <label className="block text-xs font-bold text-[var(--text-main)]">
          {isRtl ? 'شعار الأكاديمية' : 'Academy Logo'}
        </label>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl border border-[var(--border-light)] bg-[var(--surface-input)] flex items-center justify-center overflow-hidden shrink-0">
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
              <span>{uploadingLogo ? (isRtl ? 'جاري الرفع...' : 'Uploading...') : (isRtl ? 'تغيير الشعار' : 'Upload Logo')}</span>
            </button>

            {formData?.logo_url && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-xs px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>{isRtl ? 'حذف' : 'Remove'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* قسم أسماء الأكاديمية والشعار الترويجي */}
      <div className="bg-[var(--surface-card)] p-4 rounded-xl border border-[var(--border-light)] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
              {isRtl ? 'اسم الأكاديمية (بالعربية)' : 'Academy Name (Arabic)'}
            </label>
            <input 
              type="text" 
              value={formData?.name_ar || ''} 
              onChange={(e) => handleNameChange?.('ar', e.target.value)} 
              className="app-input text-start" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
              {isRtl ? 'اسم الأكاديمية (بالإنجليزية)' : 'Academy Name (English)'}
            </label>
            <input 
              type="text" 
              value={formData?.name_en || ''} 
              onChange={(e) => handleNameChange?.('en', e.target.value)} 
              className="app-input text-start dir-ltr" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
            {isRtl ? 'الرابط المختصر (Slug)' : 'URL Slug'}
          </label>
          <input 
            type="text" 
            value={formData?.slug || ''} 
            onChange={(e) => updateField?.('slug', e.target.value)} 
            className="app-input text-start dir-ltr text-xs" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
            {isRtl ? 'الوصف الترويجي القصير (Tagline)' : 'Tagline'}
          </label>
          <input 
            type="text" 
            value={formData?.tagline || ''} 
            onChange={(e) => updateField?.('tagline', e.target.value)} 
            className="app-input text-start" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
            {isRtl ? 'وصف الأكاديمية' : 'Description'}
          </label>
          <textarea 
            rows={3} 
            value={formData?.description || ''} 
            onChange={(e) => updateField?.('description', e.target.value)} 
            className="app-input text-start text-xs resize-none" 
          />
        </div>
      </div>
    </div>
  );
}
