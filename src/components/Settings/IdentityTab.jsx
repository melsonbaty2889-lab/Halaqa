import React, { useState } from 'react';
import { Image as ImageIcon, Trash2, Upload, RefreshCw, Palette, ChevronDown, ChevronUp } from 'lucide-react';

export default function IdentityTab({ 
  formData, 
  updateField, 
  handleNameChange, 
  handleLogoUpload, 
  handleRemoveLogo, 
  uploadingLogo, 
  fileInputRef, 
  isRtl 
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-5 text-start">
      <div className="bg-[var(--surface-card)] p-4 rounded-xl border border-[var(--border-light)] space-y-4">
        <div>
          <label className="block text-xs font-bold mb-2 text-[var(--text-main)]">
            {isRtl ? 'شعار الأكاديمية' : 'Academy Logo'}
          </label>
          <div className="flex items-center gap-3">
            {formData.logo_url ? (
              <div className="relative group shrink-0">
                <img src={formData.logo_url} alt="Logo" className="w-14 h-14 rounded-xl object-cover border border-[var(--border-light)]" />
                <button 
                  type="button" 
                  onClick={handleRemoveLogo} 
                  className="absolute -top-1.5 -right-1.5 bg-[var(--danger)] text-white border-none rounded-full p-1 cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-[var(--surface-input)] border border-dashed border-[var(--border-input)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                <ImageIcon size={22} />
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploadingLogo} 
              className="btn-secondary text-xs px-3 py-2"
            >
              {uploadingLogo ? <RefreshCw className="spin-animation" size={14} /> : <Upload size={14} />}
              {uploadingLogo 
                ? (isRtl ? 'جاري الرفع...' : 'Uploading...') 
                : (formData.logo_url ? (isRtl ? 'تغيير الشعار' : 'Change Logo') : (isRtl ? 'رفع الشعار' : 'Upload Logo'))
              }
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5 text-[var(--text-main)]">
            {isRtl ? 'اسم الأكاديمية *' : 'Academy Name *'}
          </label>
          <input 
            type="text" 
            value={formData.name_ar} 
            onChange={(e) => handleNameChange('ar', e.target.value)} 
            className="app-input text-sm font-semibold" 
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3.5 bg-[var(--surface-card)] border border-[var(--border-light)] rounded-xl">
        <div className="flex items-center gap-2.5">
          <Palette size={16} className="text-[var(--primary)]" />
          <div>
            <p className="m-0 text-xs font-bold text-[var(--text-main)]">
              {isRtl ? 'اللون الرسمي' : 'Brand Color'}
            </p>
            <p className="m-0 text-[10px] text-[var(--text-muted)]">
              {isRtl ? 'اللون الرئيسي للواجهة' : 'Primary Interface Color'}
            </p>
          </div>
        </div>
        <input 
          type="color" 
          value={formData.brand_color || '#D97706'} 
          onChange={(e) => updateField('brand_color', e.target.value)} 
          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0" 
        />
      </div>

      <div className="border border-[var(--border-light)] rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-3 bg-[var(--surface-card)] hover:bg-[var(--surface-input)] transition-colors flex items-center justify-between text-xs font-bold text-[var(--text-muted)] border-none cursor-pointer"
        >
          <span>{isRtl ? 'خيارات إضافية' : 'Additional Options'}</span>
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showAdvanced && (
          <div className="p-4 bg-[var(--surface-card)] border-t border-[var(--border-light)] space-y-3.5">
            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--text-muted)]">
                {isRtl ? 'الاسم بالإنجليزية' : 'English Name'}
              </label>
              <input 
                type="text" 
                value={formData.name_en} 
                onChange={(e) => handleNameChange('en', e.target.value)} 
                className="app-input text-start dir-ltr text-xs" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1 text-[var(--text-muted)]">
                  {isRtl ? 'المعرّف الفريد (Slug)' : 'Slug'}
                </label>
                <input 
                  type="text" 
                  value={formData.slug} 
                  onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                  className="app-input text-start dir-ltr text-xs" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-[var(--text-muted)]">
                  {isRtl ? 'الشعار اللفظي (Tagline)' : 'Tagline'}
                </label>
                <input 
                  type="text" 
                  value={formData.tagline} 
                  onChange={(e) => updateField('tagline', e.target.value)} 
                  className="app-input text-xs" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--text-muted)]">
                {isRtl ? 'الوصف' : 'Description'}
              </label>
              <textarea 
                rows={2}
                value={formData.description} 
                onChange={(e) => updateField('description', e.target.value)} 
                className="app-input text-xs resize-none py-2" 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
