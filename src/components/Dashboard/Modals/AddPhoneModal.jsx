import React from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function AddPhoneModal({
  phoneModalData,
  onClose,
  onSave,
  inputPhone,
  setInputPhone,
  processingId,
  isRtl,
  getSafeText
}) {
  if (!phoneModalData) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[4000] p-4">
      <div className="bg-slate-900 border border-sky-500/40 rounded-2xl p-6 max-w-sm w-full text-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="m-0 text-base font-bold flex items-center gap-2">
            <MessageCircle size={20} className="text-emerald-400" />
            {isRtl ? 'إدخال رقم هاتف المالك' : 'Enter Owner Phone'}
          </h3>
          <button onClick={onClose} className="bg-transparent border-0 text-slate-400 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <p className="text-slate-400 text-xs mb-4">
          {isRtl ? `أدخل رقم هاتف مالك أكاديمية (${getSafeText(phoneModalData.academyName)}) لتفعيل التواصل عبر الواتساب:` : `Enter phone for (${getSafeText(phoneModalData.academyName)}):`}
        </p>

        <div className="mb-5">
          <label className="block text-xs text-slate-300 mb-1.5">{isRtl ? 'رقم الهاتف:' : 'Phone number:'}</label>
          <input
            type="tel"
            placeholder="201000000000"
            value={inputPhone}
            onChange={(e) => setInputPhone(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none ltr text-left"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={processingId === 'save-phone'}
            className="flex-1 bg-emerald-600 text-white border-0 py-2.5 rounded-lg font-bold cursor-pointer text-xs"
          >
            {processingId === 'save-phone' ? '...' : (isRtl ? 'حفظ وتفعيل الواتساب' : 'Save & Enable WhatsApp')}
          </button>
          <button
            onClick={onClose}
            className="bg-transparent border border-slate-800 text-slate-400 px-3.5 py-2.5 rounded-lg cursor-pointer text-xs"
          >
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
