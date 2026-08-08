// src/components/Certificates/CertificateModal.jsx
import React, { useRef } from 'react';
import { X, Printer, ShieldCheck, Award } from 'lucide-react';

export default function CertificateModal({ isOpen, onClose, certData, isRtl = true }) {
  const printRef = useRef();

  if (!isOpen || !certData) return null;

  const {
    studentName = 'طالب الأكاديمية',
    examTarget = 'اختبار المنهج القرآنية',
    score = 100,
    date = new Date().toLocaleDateString('ar-EG'),
    verificationCode = 'CERT-000000',
    academyName = 'أكاديمية تحفيظ القرآن الكريم',
    tajweedGrade = 'excellent'
  } = certData;

  // رابط التحقق الذكي عبر رمز QR
  const verifyUrl = `${window.location.origin}/verify/${verificationCode}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* شريط الأزرار العلوي (مخفي أثناء الطباعة) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          {isRtl ? 'طباعة الشهادة / تصدير PDF' : 'Print / Export PDF'}
        </button>
        <button
          onClick={onClose}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* قالب الشهادة التفاعلي والجاهز للطباعة */}
      <div className="w-full max-w-3xl my-8 print:m-0 print:w-full print:max-w-none">
        <div
          ref={printRef}
          className="certificate-container relative bg-slate-900 border-8 border-double border-amber-500/40 p-8 md:p-12 rounded-2xl text-center shadow-2xl text-slate-100 print:border-amber-600 print:text-black print:bg-white print:shadow-none font-sans overflow-hidden"
          style={{ direction: isRtl ? 'rtl' : 'ltr' }}
        >
          {/* الزوايا الزخرفية للشهادة */}
          <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-amber-500/60 print:border-amber-600" />
          <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-amber-500/60 print:border-amber-600" />
          <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-amber-500/60 print:border-amber-600" />
          <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-amber-500/60 print:border-amber-600" />

          {/* الهيدر والعلامة التجارية للأكاديمية */}
          <div className="flex justify-between items-center mb-6 border-b border-amber-500/20 pb-4 print:border-amber-600/30">
            <div className="text-right">
              <h4 className="text-xs font-extrabold text-amber-400 print:text-amber-800">{academyName}</h4>
              <p className="text-[10px] text-slate-400 print:text-slate-600">إدارة الشؤون التعليمية والترقيات</p>
            </div>
            <Award className="w-10 h-10 text-amber-400 print:text-amber-600" />
            <div className="text-left font-mono text-[10px] text-slate-400 print:text-slate-600">
              <span>كود التوثيق:</span>
              <br />
              <strong className="text-amber-400 print:text-slate-900 font-bold">{verificationCode}</strong>
            </div>
          </div>

          {/* عنوان الشهادة الرئيسي */}
          <div className="my-6">
            <h1 className="text-2xl md:text-3xl font-extrabold text-amber-300 print:text-amber-900 tracking-wide">
              شهــادة إتـقــان وتــفـوّق
            </h1>
            <p className="text-[10px] text-slate-400 print:text-slate-600 mt-1 tracking-widest uppercase">Certificate of Excellence</p>
          </div>

          {/* محتوى الشهادة والنص */}
          <div className="my-8 leading-relaxed space-y-3">
            <p className="text-xs text-slate-300 print:text-slate-700">
              تشهد إدارة الأكاديمية بأن الطالب/ـة الموفق/ـة:
            </p>
            <div className="text-xl md:text-2xl font-black text-amber-400 print:text-amber-800 my-3 underline decoration-amber-500/40 underline-offset-8">
              {studentName}
            </div>
            <p className="text-xs text-slate-300 print:text-slate-700">
              قد اجتاز بنجاح واقتدار اختبار: <span className="font-bold text-white print:text-black">{examTarget}</span>
            </p>
            <p className="text-xs text-slate-300 print:text-slate-700">
              وحصل على درجة قدرها <span className="font-bold text-emerald-400 print:text-emerald-700">{score}%</span> بدرجة تجويد (<span className="font-bold text-amber-300 print:text-slate-900">{tajweedGrade === 'excellent' ? 'امتياز ومجود' : 'حسن التلاوة'}</span>).
            </p>
          </div>

          {/* الفوتر: التاريخ، توثيق الـ QR والاعتماد */}
          <div className="mt-10 pt-6 border-t border-amber-500/20 print:border-amber-600/30 grid grid-cols-3 items-center gap-4 text-xs">
            <div className="text-right">
              <p className="text-slate-400 print:text-slate-600 text-[10px]">تاريخ الإصدار:</p>
              <p className="font-bold text-slate-200 print:text-slate-800 text-xs mt-0.5">{date}</p>
            </div>

            {/* كود الـ QR للتأكد الذكي */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-1 rounded-lg shadow-md border border-amber-400/40">
                <img src={qrCodeUrl} alt="QR Verification" className="w-16 h-16" />
              </div>
              <span className="text-[9px] text-slate-400 print:text-slate-600 mt-1 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-400 print:text-emerald-700" /> موثق إلكترونياً
              </span>
            </div>

            <div className="text-left">
              <p className="text-slate-400 print:text-slate-600 text-[10px]">توقيع رئيس اللجنة:</p>
              <p className="font-bold text-amber-400 print:text-amber-800 text-xs mt-0.5">لجنة الاختبارات القرآنيّة</p>
            </div>
          </div>
        </div>
      </div>

      {/* أنماط طباعة المتصفح الخاصة */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-container, .certificate-container * {
            visibility: visible;
          }
          .certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border-color: #d97706 !important;
            background-color: #ffffff !important;
            color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
}
