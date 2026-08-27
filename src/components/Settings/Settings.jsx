import React, { useState } from 'react';
import { Building, ShieldCheck, Save, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IdentityTab from './IdentityTab';
import ContactRegionalTab from './ContactRegionalTab';
import QuranicPoliciesTab from './QuranicPoliciesTab';
import DataBackupTab from './DataBackupTab';

export default function Settings({ 
  formData = {}, 
  setFormData,
  updateField, 
  handleNameChange, 
  handleLogoUpload, 
  handleRemoveLogo, 
  uploadingLogo, 
  fileInputRef, 
  importInputRef,
  showToast,
  onSave, 
  saving, 
  isDirty = true,
  handleDiscardChanges 
}) {
  const { t, i18n } = useTranslation();
  const [activeStep, setActiveStep] = useState('general');

  // اختصار الخيارات إلى خطوتين أساسيتين لتسهيل التصفح على الهواتف
  const steps = [
    { id: 'general', label: t('settings.generalStep', '1. البيانات الأساسية والإقليمية'), icon: Building },
    { id: 'system', label: t('settings.systemStep', '2. السياسات والنسخ الاحتياطي'), icon: ShieldCheck },
  ];

  const onConfirmDiscard = () => {
    if (window.confirm(t('common.confirmDiscard', 'هل أنت متأكد من إلغاء التغييرات غير المحفوظة؟'))) {
      if (typeof handleDiscardChanges === 'function') {
        handleDiscardChanges();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onSave === 'function') {
      onSave(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-start" dir={i18n.dir()}>
      {/* شريط الخطوات المكون من خطوتين متساويتين */}
      <div className="grid grid-cols-2 border-b border-[var(--border-card)] gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center justify-center gap-2 px-3 py-3 text-xs font-bold transition-all border-b-2 -mb-[1px] cursor-pointer bg-transparent focus:outline-none ${
                isActive 
                  ? 'border-[var(--primary)] text-[var(--primary)] font-extrabold' 
                  : 'border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              <Icon size={16} />
              <span className="truncate">{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* محتوى النموذج للخطوات */}
      <form onSubmit={handleSubmit} className="space-y-6 !overflow-visible">
        {/* الخطوة الأولى: تضمين الهوية والتواصل الإقليمي */}
        {activeStep === 'general' && (
          <div className="space-y-6">
            <IdentityTab 
              formData={formData} 
              updateField={updateField} 
              handleNameChange={handleNameChange} 
              handleLogoUpload={handleLogoUpload} 
              handleRemoveLogo={handleRemoveLogo} 
              uploadingLogo={uploadingLogo} 
              fileInputRef={fileInputRef} 
            />
            <ContactRegionalTab formData={formData} updateField={updateField} />
          </div>
        )}

        {/* الخطوة الثانية: تضمين السياسات القرآنية والنسخ الاحتياطي */}
        {activeStep === 'system' && (
          <div className="space-y-6">
            <QuranicPoliciesTab formData={formData} updateField={updateField} />
            <DataBackupTab 
              formData={formData} 
              setFormData={setFormData}
              importInputRef={importInputRef}
              showToast={showToast}
            />
          </div>
        )}

        {/* شريط التحكم السفلي */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--border-card)]">
          <div className="w-full sm:w-auto min-h-[38px] flex items-center">
            {isDirty && (
              <button
                type="button"
                onClick={onConfirmDiscard}
                className="btn-secondary text-xs px-4 py-2 flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
              >
                <RotateCcw size={14} />
                <span>{t('common.discard', 'تراجع')}</span>
              </button>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={saving} 
            className={`btn-primary text-xs px-6 py-2.5 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Save size={16} />
            <span>{saving ? t('common.saving', 'جاري الحفظ...') : t('common.save', 'حفظ التغييرات')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
