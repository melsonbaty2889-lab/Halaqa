import React, { useState } from 'react';
import { Building, Globe, BookOpen, Database, Save, CheckCircle2 } from 'lucide-react';
import IdentityTab from './IdentityTab';
import ContactRegionalTab from './ContactRegionalTab';
import QuranicPoliciesTab from './QuranicPoliciesTab';
import DataBackupTab from './DataBackupTab';

export default function Settings({ 
  formData = {}, 
  updateField, 
  handleNameChange, 
  handleLogoUpload, 
  handleRemoveLogo, 
  uploadingLogo, 
  fileInputRef, 
  onSave, 
  saving, 
  isRtl 
}) {
  const [activeTab, setActiveTab] = useState('identity');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // التبويبات المطابقة للملفات الفعالية الموجودة في المجلد
  const tabs = [
    { id: 'identity', label: isRtl ? 'الهوية والشعار' : 'Identity & Logo', icon: Building },
    { id: 'contact', label: isRtl ? 'التواصل والإقليمية' : 'Contact & Regional', icon: Globe },
    { id: 'quranic', label: isRtl ? 'سياسات الحلقة' : 'Quranic Policies', icon: BookOpen },
    { id: 'backup', label: isRtl ? 'النسخ الاحتياطي' : 'Data Backup', icon: Database },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    if (onSave) {
      await onSave();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-start">
      {/* شريط التبويبات الأفقية */}
      <div className="flex border-b border-[var(--border-light)] gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap bg-transparent ${
                isActive 
                  ? 'border-[var(--primary)] text-[var(--primary)]' 
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* عرض مكون التبويب النشط */}
      <form onSubmit={handleSave} className="space-y-6">
        {activeTab === 'identity' && (
          <IdentityTab 
            formData={formData} 
            updateField={updateField} 
            handleNameChange={handleNameChange} 
            handleLogoUpload={handleLogoUpload} 
            handleRemoveLogo={handleRemoveLogo} 
            uploadingLogo={uploadingLogo} 
            fileInputRef={fileInputRef} 
            isRtl={isRtl} 
          />
        )}

        {activeTab === 'contact' && (
          <ContactRegionalTab 
            formData={formData} 
            updateField={updateField} 
            isRtl={isRtl} 
          />
        )}

        {activeTab === 'quranic' && (
          <QuranicPoliciesTab 
            formData={formData} 
            updateField={updateField} 
            isRtl={isRtl} 
          />
        )}

        {activeTab === 'backup' && (
          <DataBackupTab 
            formData={formData} 
            updateField={updateField} 
            isRtl={isRtl} 
          />
        )}

        {/* شريط الحفظ السفلي */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)]">
          <div>
            {savedSuccess && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--success)]">
                <CheckCircle2 size={16} />
                {isRtl ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully'}
              </span>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={saving} 
            className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} />
            <span>{saving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ التغييرات' : 'Save Changes')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
