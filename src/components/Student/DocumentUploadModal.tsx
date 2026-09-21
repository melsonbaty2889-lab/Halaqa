// src/components/Student/DocumentUploadModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2, Trash2, RefreshCw } from 'lucide-react';
import Select from '@/components/UI/Select';

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

  // منع سكرول الشاشة الخلفية في الموبايل عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

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

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    if (isLoading) return;
    setSelectedFile(null);
    setNotes('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const typeOptions = DOCUMENT_TYPES.map((type) => ({
    value: type,
    label: t(`documents.types.${type}`, type.replace('_', ' '))
  }));

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overscroll-contain">
      <div 
        className="w-full max-w-lg bg-semantic-surfaceCard text-semantic-textPrimary rounded-2xl shadow-2xl border border-semantic-borderCard overflow-visible max-h-[90vh] flex flex-col"
        dir={i18n?.dir ? i18n.dir() : 'rtl'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-semantic-borderCard bg-semantic-surfaceCard rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-semantic-actionPrimary/10 text-semantic-actionPrimary rounded-xl border border-semantic-actionPrimary/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-semantic-textPrimary">
              {t('documents.upload_title', 'رفع ملف جديد')}
            </h3>
          </div>
          <button 
            type="button"
            onClick={handleClose} 
            disabled={isLoading}
            className="text-semantic-textSecondary hover:text-semantic-textPrimary transition-colors p-1.5 rounded-lg hover:bg-semantic-surfaceInput disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container with Scroll */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Document Type Select */}
            <div className="space-y-1.5 relative z-20">
              <label className="block text-xs font-medium text-semantic-textSecondary">
                {t('documents.type_label', 'نوع المستند')} <span className="text-semantic-actionPrimary">*</span>
              </label>
              <Select
                value={documentType}
                onChange={(val) => setDocumentType(val)}
                options={typeOptions}
                placeholder={t('documents.type_label', 'نوع المستند')}
              />
            </div>

            {/* File Upload Zone */}
            <div className="space-y-1.5 relative z-10">
              <label className="block text-xs font-medium text-semantic-textSecondary">
                {t('documents.file_label', 'الملف')} <span className="text-semantic-actionPrimary">*</span>
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />

              <div 
                onClick={() => !isLoading && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  selectedFile 
                    ? 'border-semantic-success/50 bg-semantic-success/5' 
                    : 'border-semantic-borderInput hover:border-semantic-actionPrimary/50 bg-semantic-surfaceInput/50 hover:bg-semantic-surfaceInput'
                }`}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <CheckCircle2 className="w-6 h-6 text-semantic-success shrink-0" />
                      <div className="text-start overflow-hidden">
                        <p className="text-sm font-medium text-semantic-textPrimary truncate">{selectedFile.name}</p>
                        <p className="text-xs text-semantic-textSecondary">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        disabled={isLoading}
                        className="p-1.5 text-semantic-textSecondary hover:text-semantic-actionPrimary hover:bg-semantic-surfaceInput rounded-lg transition-colors"
                        title={t('common.change', 'تغيير')}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        disabled={isLoading}
                        className="p-1.5 text-semantic-textSecondary hover:text-semantic-error hover:bg-semantic-surfaceInput rounded-lg transition-colors"
                        title={t('common.remove', 'إلغاء')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pointer-events-none">
                    <UploadCloud className="w-8 h-8 text-semantic-actionPrimary mx-auto" />
                    <p className="text-sm font-medium text-semantic-textPrimary">
                      {t('documents.drag_drop_text', 'انقر هنا لاختيار ملف من جهازك')}
                    </p>
                    <p className="text-xs text-semantic-textSecondary">PDF, PNG, JPG (MAX. 10MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-semantic-error/10 border border-semantic-error/20 rounded-xl text-semantic-error text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5 relative z-10">
              <label className="block text-xs font-medium text-semantic-textSecondary">
                {t('documents.notes_label', 'ملاحظات')}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('documents.notes_placeholder', 'تفاصيل أو ملاحظات إضافية...')}
                rows={3}
                disabled={isLoading}
                className="w-full bg-semantic-surfaceInput border border-semantic-borderInput text-semantic-textPrimary placeholder-semantic-textSecondary text-sm rounded-xl p-3 focus:outline-none focus:border-semantic-actionPrimary transition-colors resize-none disabled:opacity-50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 relative z-10">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-5 py-2.5 text-sm font-medium text-semantic-textSecondary hover:text-semantic-textPrimary bg-semantic-surfaceInput hover:bg-semantic-borderInput/50 border border-semantic-borderCard rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                {t('common.cancel', 'إلغاء')}
              </button>
              <button
                type="submit"
                disabled={isLoading || !selectedFile}
                className="px-6 py-2.5 text-sm font-bold text-white bg-semantic-actionPrimary hover:bg-semantic-actionPrimary/90 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
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
    </div>
  );
};

export default DocumentUploadModal;
