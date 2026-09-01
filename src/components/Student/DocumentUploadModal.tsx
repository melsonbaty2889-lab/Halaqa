// src/components/Student/DocumentUploadModal.jsx

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import CustomSelect from '@/components/UI/CustomSelect';

const DOCUMENT_TYPES = [
  'id_card',
  'passport',
  'birth_certificate',
  'parent_consent',
  'medical_report',
  'payment_receipt',
  'certificate',
  'other'
];

export const DocumentUploadModal = ({
  isOpen,
  onClose,
  onUpload,
  isLoading = false,
}) => {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('id_card');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB Limit
        setError(t('documents.error_size_limit', 'حجم الملف يتجاوز الحد المسموح (10 ميجابايت)'));
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError(t('documents.error_select_file', 'يرجى اختيار ملف أولاً'));
      return;
    }
    await onUpload({ file: selectedFile, documentType, notes });
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setNotes('');
    setError(null);
    onClose();
  };

  const typeOptions = DOCUMENT_TYPES.map((type) => ({
    value: type,
    label: t(`documents.types.${type}`, type.replace('_', ' '))
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-lg bg-dark-card text-appText-main rounded-2xl shadow-2xl border border-appBorder-card overflow-visible animate-in fade-in zoom-in-95"
        dir={i18n.dir()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-appBorder-card bg-dark-card rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-appText-main">
              {t('documents.upload_title', 'رفع ملف جديد')}
            </h3>
          </div>
          <button 
            type="button"
            onClick={handleClose} 
            disabled={isLoading}
            className="text-appText-sub hover:text-appText-main transition-colors p-1.5 rounded-lg hover:bg-dark-input disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Document Type Select - Integrated CustomSelect */}
          <div className="space-y-1.5 relative z-20">
            <label className="block text-xs font-medium text-appText-sub">
              {t('documents.type_label', 'نوع المستند')} <span className="text-primary">*</span>
            </label>
            <CustomSelect
              value={documentType}
              onChange={(val) => setDocumentType(val)}
              options={typeOptions}
              placeholder={t('documents.type_label', 'نوع المستند')}
            />
          </div>

          {/* File Upload Zone */}
          <div className="space-y-1.5 relative z-10">
            <label className="block text-xs font-medium text-appText-sub">
              {t('documents.file_label', 'الملف')} <span className="text-primary">*</span>
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                selectedFile 
                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                  : 'border-appBorder-input hover:border-primary/50 bg-dark-input/50 hover:bg-dark-input'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div className="text-start overflow-hidden">
                    <p className="text-sm font-medium text-appText-main truncate">{selectedFile.name}</p>
                    <p className="text-xs text-appText-sub">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pointer-events-none">
                  <UploadCloud className="w-8 h-8 text-primary mx-auto" />
                  <p className="text-sm font-medium text-appText-main">
                    {t('documents.drag_drop_text', 'انقر هنا لاختيار ملف من جهازك')}
                  </p>
                  <p className="text-xs text-appText-muted">PDF, PNG, JPG (MAX. 10MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5 relative z-10">
            <label className="block text-xs font-medium text-appText-sub">
              {t('documents.notes_label', 'ملاحظات')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('documents.notes_placeholder', 'تفاصيل أو ملاحظات إضافية...')}
              rows={3}
              className="w-full bg-dark-input border border-appBorder-input text-appText-main placeholder-appText-muted text-sm rounded-xl p-3 focus:outline-none focus:border-appBorder-hover transition-colors resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 relative z-10">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-appText-sub hover:text-appText-main bg-dark-input hover:bg-appBorder-input/50 rounded-xl transition-colors disabled:opacity-50"
            >
              {t('common.cancel', 'إلغاء')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="px-6 py-2.5 text-sm font-bold text-appText-main bg-primary hover:bg-primary-hover rounded-xl transition-all shadow-lg shadow-primary-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('common.uploading', 'جاري الرفع...')}</span>
                </>
              ) : (
                <span>{t('common.upload', 'رفع')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
