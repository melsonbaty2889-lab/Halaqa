// src/components/Student/DocumentPreviewModal.jsx
import React from 'react';
import { FileText, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Download, X } from 'lucide-react';

const isImage = (mime, url) => {
  if (mime?.startsWith('image/')) return true;
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
};

const isPdf = (mime, url) => {
  if (mime === 'application/pdf') return true;
  return /\.pdf$/i.test(url);
};

const DocumentPreviewModal = ({ previewDoc, onClose, zoomScale, setZoomScale, t }) => {
  if (!previewDoc) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/95 overscroll-contain">
      <div className="bg-dark-card border border-appBorder-card rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-appBorder-card bg-dark-card shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <h3 className="text-xs font-bold text-appText-main truncate">
              {previewDoc.file_name}
            </h3>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {isImage(previewDoc.mime_type, previewDoc.file_url) && (
              <div className="flex items-center bg-dark-input rounded-lg p-0.5 border border-appBorder-input gap-0.5 me-1">
                <button
                  type="button"
                  onClick={() => setZoomScale((prev) => Math.min(prev + 0.25, 3))}
                  className="p-1.5 text-appText-sub hover:text-appText-main rounded-md cursor-pointer"
                  title="تكبير"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale((prev) => Math.max(prev - 0.25, 0.5))}
                  className="p-1.5 text-appText-sub hover:text-appText-main rounded-md cursor-pointer"
                  title="تصغير"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(1)}
                  className="p-1.5 text-appText-sub hover:text-appText-main rounded-md cursor-pointer"
                  title="إعادة ضبط"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            )}

            <a
              href={previewDoc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-appText-sub hover:text-appText-main bg-dark-input hover:bg-appBorder-input/50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href={previewDoc.file_url}
              download
              className="p-1.5 text-appText-sub hover:text-appText-main bg-dark-input hover:bg-appBorder-input/50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <Download className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-appText-sub hover:text-appText-main bg-dark-input hover:bg-appBorder-input/50 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="flex-1 bg-black/60 p-2 overflow-auto overscroll-contain flex items-center justify-center relative">
          {isImage(previewDoc.mime_type, previewDoc.file_url) ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
              <img
                src={previewDoc.file_url}
                alt={previewDoc.file_name}
                style={{ transform: `scale(${zoomScale})`, transition: 'transform 0.15s ease-in-out' }}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl origin-center"
              />
            </div>
          ) : isPdf(previewDoc.mime_type, previewDoc.file_url) ? (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewDoc.file_url)}&embedded=true`}
              title={previewDoc.file_name}
              className="w-full h-full rounded-lg border-0 bg-white"
            />
          ) : (
            <div className="text-center space-y-4 p-6">
              <FileText className="w-16 h-16 text-appText-muted mx-auto" />
              <p className="text-sm text-appText-sub">
                {t('documents.cannot_preview', 'لا يمكن معاينة هذا النوع من الملفات مباشرة.')}
              </p>
              <a
                href={previewDoc.file_url}
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-appText-main font-bold rounded-xl text-xs shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>{t('common.download_file', 'تحميل الملف')}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
