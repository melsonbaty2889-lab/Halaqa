import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, X, CheckCircle2, AlertCircle } from 'lucide-react';

// القائمة المطابقة لـ check constraint في قاعدة البيانات
const DOCUMENT_TYPES = [
  'id_card',
  'passport',
  'birth_certificate',
  'parent_consent',
  'medical_report',
  'payment_receipt',
  'certificate',
  'other'
] as const;

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: { file: File; documentType: string; notes: string }) => Promise<void>;
  isLoading?: boolean;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isLoading = false,
}) => {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('id_card');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-lg bg-[#111827] text-white rounded-2xl shadow-2xl border border-gray-800 overflow-hidden animate-in fade-in zoom-in-95"
        dir={i18n.dir()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#1f2937]/50">
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-gray-100">
              {t('documents.upload_title', 'رفع ملف جديد')}
            </h3>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Document Type Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-300">
              {t('documents.type_label', 'نوع المستند')} <span className="text-amber-500">*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full bg-[#1f2937] border border-gray-700 text-gray-100 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500 transition-colors"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`documents.types.${type}`, type.replace('_', ' '))}
                </option>
              ))}
            </select>
          </div>

          {/* Custom File Dropzone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-300">
              {t('documents.file_label', 'الملف')} <span className="text-amber-500">*</span>
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                selectedFile 
                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                  : 'border-gray-700 hover:border-amber-500/50 bg-[#1f2937]/40 hover:bg-[#1f2937]/80'
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
                    <p className="text-sm font-medium text-gray-200 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pointer-events-none">
                  <UploadCloud className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-sm font-medium text-gray-300">
                    {t('documents.drag_drop_text', 'انقر هنا لاختيار ملف من جهازك')}
                  </p>
                  <p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 10MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Notes Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-300">
              {t('documents.notes_label', 'ملاحظات')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('documents.notes_placeholder', 'تفاصيل أو ملاحظات إضافية...')}
              rows={3}
              className="w-full bg-[#1f2937] border border-gray-700 text-gray-100 placeholder-gray-500 text-sm rounded-xl p-3 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {t('common.cancel', 'إلغاء')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="px-6 py-2.5 text-sm font-medium text-black bg-amber-500 hover:bg-amber-400 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              {isLoading ? t('common.uploading', 'جاري الرفع...') : t('common.upload', 'رفع')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default DocumentUploadModal;
