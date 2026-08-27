import React, { useState } from 'react';
import { Building, Globe, BookOpen, Database, Save, RotateCcw } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('identity');

  const tabs = [
    { id: 'identity', label: t('settings.identityTab', 'الهوية والشعار'), icon: Building },
    { id: 'contact', label: t('settings.contactTab', 'التواصل والإقليمية'), icon: Globe },
    { id: 'quranic', label: t('settings.quranicTab', 'سياسات الحلقة'), icon: BookOpen },
    { id: 'backup', label: t('settings.backupTab', 'النسخ الاحتياطي'), icon: Database },
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
      {/* شريط التبويبات العلوي */}
      <div className="flex border-b border-[var(--border-card)] gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-[1px] cursor-pointer whitespace-nowrap bg-transparent focus:outline-none ${
                isActive 
                  ? 'border-[var(--primary)] text-[var(--primary)]' 
                  : 'border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* محتوى التبويبات داخل نموذج يضمن عدم قص العناصر */}
      <form onSubmit={handleSubmit} className="space-y-6 !overflow-visible">
        {activeTab === 'identity' && (
          <IdentityTab 
            formData={formData} 
            updateField={updateField} 
            handleNameChange={handleNameChange} 
            handleLogoUpload={handleLogoUpload} 
            handleRemoveLogo={handleRemoveLogo} 
            uploadingLogo={uploadingLogo} 
            fileInputRef={fileInputRef} 
          />
        )}

        {activeTab === 'contact' && <ContactRegionalTab formData={formData} updateField={updateField} />}
        {activeTab === 'quranic' && <QuranicPoliciesTab formData={formData} updateField={updateField} />}
        {activeTab === 'backup' && (
          <DataBackupTab 
            formData={formData} 
            setFormData={setFormData}
            importInputRef={importInputRef}
            showToast={showToast}
          />
        )}

        {/* شريط التحكم السفلي */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--border-card)]">
          <div className="w-full sm:w-auto min-h-[38px] flex items-center">
            {isDirty && (
              <button
                type="button"
                onClick={onConfirmDiscard}
                className="btn-secondary text-xs px-4 py-2 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>{t('common.discard', 'تراجع')}</span>
              </button>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={saving} 
            className={`btn-primary text-xs px-6 py-2.5 flex items-center justify-center gap-2 cursor-pointer ${
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
