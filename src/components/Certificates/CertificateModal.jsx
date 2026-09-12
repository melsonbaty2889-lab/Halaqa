// src/components/Certificates/CertificateModal.jsx
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Printer, ShieldCheck, Award } from 'lucide-react';

export default function CertificateModal({ isOpen, onClose, certData, isRtl: isRtlProp, currentLang: currentLangProp }) {
  const { t, i18n } = useTranslation();
  const printRef = useRef();

  const currentLang = currentLangProp || i18n?.language || 'ar';
  const rtlLanguages = ['ar', 'ur'];
  const isRtl = isRtlProp !== undefined ? isRtlProp : rtlLanguages.some(lang => currentLang.startsWith(lang));
  const isEn = currentLang.startsWith('en');

  if (!isOpen || !certData) return null;

  const {
    studentName = isEn ? 'Academy Student' : 'طالب الأكاديمية',
    examTarget = isEn ? 'Quranic Curriculum Exam' : 'اختبار المنهج القرآني',
    score = 100,
    date = new Date().toLocaleDateString(currentLang),
    verificationCode = 'CERT-000000',
    academyName = isEn ? 'Holy Quran Academy' : 'أكاديمية تحفيظ القرآن الكريم',
    tajweedGrade = 'excellent'
  } = certData;

  // رابط التحقق الذكي عبر رمز QR
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://smart-halaqa.vercel.app';
  const verifyUrl = `${baseUrl}/verify/${verificationCode}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  const labels = {
    printBtn: t('cert.printBtn', isEn ? "Print Certificate / Export PDF" : "طباعة الشهادة / تصدير PDF"),
    subHeader: t('cert.subHeader', isEn ? "Department of Educational Affairs & Promotions" : "إدارة الشؤون التعليمية والترقيات"),
    verificationCode: t('cert.verificationCode', isEn ? "Verification Code:" : "كود التوثيق:"),
    certTitle: t('cert.certTitle', isEn ? "Certificate of Excellence" : "شهــادة إتـقــان وتــفـوّق"),
    certSubTitle: t('cert.certSubTitle', isEn ? "Certificate of Quranic Achievement" : "Certificate of Excellence"),
    certBody1: t('cert.certBody1', isEn ? "The Academy Management hereby certifies that the student:" : "تشهد إدارة الأكاديمية بأن الطالب/ـة الموفق/ـة:"),
    certBody2: t('cert.certBody2', isEn ? "has successfully passed the examination in:" : "قد اجتاز بنجاح واقتدار اختبار:"),
    certBody3: t('cert.certBody3', isEn ? "with a score of" : "وحصل على درجة قدرها"),
    tajweedText: t('cert.tajweedText', isEn ? "with Tajweed grade" : "بدرجة تجويد"),
    gradeExcellent: t('cert.gradeExcellent', isEn ? "Excellent & Recited" : "امتياز ومجود"),
    gradeGood: t('cert.gradeGood', isEn ? "Good Recitation" : "حسن التلاوة"),
    issueDate: t('cert.issueDate', isEn ? "Issue Date:" : "تاريخ الإصدار:"),
    electronicallyVerified: t('cert.verified', isEn ? "Electronically Verified" : "موثق إلكترونياً"),
    signatureTitle: t('cert.signatureTitle', isEn ? "Committee Approval:" : "توقيع رئيس اللجنة:"),
    signatureValue: t('cert.signatureValue', isEn ? "Quranic Exams Board" : "لجنة الاختبارات القرآنيّة")
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      
      {/* 🟢 شريط الأزرار العلوي (مخفي تلقائياً أثناء الطباعة) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>{labels.printBtn}</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer active:scale-95"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 🟢 قالب الشهادة التفاعلي والجاهز للطباعة والتصدير */}
      <div className="w-full max-w-3xl my-8 print:m-0 print:w-full print:max-w-none">
        <div
          ref={printRef}
          className="certificate-container relative bg-slate-900 border-8 border-double border-amber-500/40 p-8 md:p-12 rounded-2xl text-center shadow-2xl text-slate-100 print:border-amber-600 print:text-black print:bg-white print:shadow-none overflow-hidden"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* الزوايا الزخرفية للشهادة */}
          <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-amber-500/60 print:border-amber-600" />
          <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-amber-500/60 print:border-amber-600" />
          <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-amber-500/60 print:border-amber-600" />
          <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-amber-500/60 print:border-amber-600" />

          {/* الهيدر والعلامة التجارية للأكاديمية */}
          <div className="flex justify-between items-center mb-6 border-b border-amber-500/20 pb-4 print:border-amber-600/30">
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <h4 className="text-sm font-extrabold text-amber-400 print:text-amber-800">{academyName}</h4>
              <p className="text-[10px] text-slate-400 print:text-slate-600 mt-0.5">{labels.subHeader}</p>
            </div>
            <Award className="w-10 h-10 text-amber-400 print:text-amber-600 shrink-0 mx-2" />
            <div className={`${isRtl ? 'text-left' : 'text-right'} font-mono text-[10px] text-slate-400 print:text-slate-600`}>
              <span>{labels.verificationCode}</span>
              <br />
              <strong className="text-amber-400 print:text-slate-900 font-bold">{verificationCode}</strong>
            </div>
          </div>

          {/* عنوان الشهادة الرئيسي */}
          <div className="my-6">
            <h1 className="text-2xl md:text-3xl font-black text-amber-300 print:text-amber-900 tracking-wide">
              {labels.certTitle}
            </h1>
            <p className="text-[10px] text-slate-400 print:text-slate-600 mt-1 tracking-widest uppercase font-semibold">
              {labels.certSubTitle}
            </p>
          </div>

          {/* محتوى الشهادة والنص */}
          <div className="my-8 leading-relaxed space-y-3">
            <p className="text-xs text-slate-300 print:text-slate-700">
              {labels.certBody1}
            </p>
            <div className="text-xl md:text-2xl font-black text-amber-400 print:text-amber-800 my-3 underline decoration-amber-500/40 underline-offset-8">
              {studentName}
            </div>
            <p className="text-xs text-slate-300 print:text-slate-700">
              {labels.certBody2} <span className="font-bold text-white print:text-black">{examTarget}</span>
            </p>
            <p className="text-xs text-slate-300 print:text-slate-700">
              {labels.certBody3} <span className="font-bold text-emerald-400 print:text-emerald-700">{score}%</span> {labels.tajweedText} (<span className="font-bold text-amber-300 print:text-slate-900">{tajweedGrade === 'excellent' ? labels.gradeExcellent : labels.gradeGood}</span>).
            </p>
          </div>

          {/* الفوتر: التاريخ، توثيق الـ QR والاعتماد */}
          <div className="mt-10 pt-6 border-t border-amber-500/20 print:border-amber-600/30 grid grid-cols-3 items-center gap-4 text-xs">
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <p className="text-slate-400 print:text-slate-600 text-[10px]">{labels.issueDate}</p>
              <p className="font-bold text-slate-200 print:text-slate-800 text-xs mt-0.5">{date}</p>
            </div>

            {/* كود الـ QR للتأكد الذكي */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-1 rounded-lg shadow-md border border-amber-400/40">
                <img src={qrCodeUrl} alt="QR Verification" className="w-16 h-16 object-contain" />
              </div>
              <span className="text-[9px] text-slate-400 print:text-slate-600 mt-1 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-400 print:text-emerald-700" /> {labels.electronicallyVerified}
              </span>
            </div>

            <div className={isRtl ? 'text-left' : 'text-right'}>
              <p className="text-slate-400 print:text-slate-600 text-[10px]">{labels.signatureTitle}</p>
              <p className="font-bold text-amber-400 print:text-amber-800 text-xs mt-0.5">{labels.signatureValue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 أنماط طباعة المتصفح الخاصة لضبط التنسيق عند الطباعة / التصدير PDF */}
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
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
