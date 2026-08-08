// src/components/Certificates/CertificateVerify.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, ShieldAlert, Award, Calendar, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

export default function CertificateVerify() {
  // 1. استخراج الرمز من useParams أو من رابط window المباشر
  const { code: routeCode } = useParams();
  const code = routeCode || (typeof window !== 'undefined' ? window.location.pathname.split('/verify/')[1] : '');

  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function verifyCertificate() {
      if (!code) {
        setError('رمز التحقق غير مكتمل.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // الاستعلام عن الشهادة وجلب بيانات الطالب والمنهج
        const { data, error: fetchErr } = await supabase
          .from('certificates')
          .select(`
            *,
            students (name),
            curriculums (title)
          `)
          .eq('verification_code', code.trim().toUpperCase())
          .maybeSingle();

        if (fetchErr) throw fetchErr;

        if (!data) {
          setError('لم يتم العثور على شهادة معتمدة بهذا الرمز. يرجى التأكد من الرمز المدخل.');
        } else {
          setCert(data);
        }
      } catch (err) {
        console.error('🚨 خطأ أثناء التحقق من الشهادة:', err);
        setError('حدث خطأ أثناء الاتصال بقاعدة البيانات للتحقق من الشهادة.');
      } finally {
        // 2. تصحيح الهيكل البرمجي هنا بدلاً من font-medium الخاطئة
        setLoading(false);
      }
    }

    verifyCertificate();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-400">جاري فحص وتدقيق التوثيق الرقمي للشهادة...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans" dir="rtl">
      <div className="w-full max-w-lg">
        
        {/* هيدر الشعار */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3 shadow-lg shadow-amber-500/5">
            <Award className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-white">نظام التوثيق والتحقق المعتمد</h1>
          <p className="text-xs text-slate-400 mt-1">بوابة الاستعلام عن الشهادات والترقيات القرآنية الرسمية</p>
        </div>

        {/* حالة عدم وجود الشهادة أو خطأ */}
        {error ? (
          <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/5 text-center backdrop-blur-md">
            <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h2 className="text-base font-bold text-red-400 mb-2">تعذّر إثبات صحة الشهادة</h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">{error}</p>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-500 mb-4">
              رمز البحث: {code || 'N/A'}
            </div>
            <Link to="/" className="inline-flex items-center gap-2 text-xs text-amber-400 font-bold hover:underline">
              <ArrowRight className="w-4 h-4" /> العودة للصفحة الرئيسية
            </Link>
          </div>
        ) : (
          /* حالة النجاح وعرض بيانات التوثيق الرسمية */
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-slate-900/80 backdrop-blur-md shadow-2xl relative overflow-hidden">
            
            {/* شريط الأمان العلوي */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> شهادة موثوقة ومسجلة
              </span>
              <span className="text-[10px] font-mono text-slate-400">ID: {cert?.verification_code}</span>
            </div>

            {/* تفاصيل الشهادة */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] mb-1">اسم الطالب المعتمد:</span>
                <p className="text-base font-extrabold text-amber-400">
                  {typeof cert?.students?.name === 'object' ? (cert?.students?.name?.ar || cert?.students?.name?.en) : cert?.students?.name || 'طالب الأكاديمية'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] mb-1">المجال / المنهج الاجتيازي:</span>
                <p className="font-bold text-slate-200 text-sm">
                  {cert?.curriculums?.title || 'اختبار المنهج القرآني'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] mb-1">تاريخ التوثيق:</span>
                  <p className="font-bold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(cert?.issued_at || cert?.created_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] mb-1">الحالة النظامية:</span>
                  <p className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> سارية وموثقة
                  </p>
                </div>
              </div>
            </div>

            {/* الفوتر الصغير */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[10px] text-slate-500">
              تم إصدار هذه البيانات رسمياً بواسطة منصة إدارة الحلقة القرآنية.
            </div>
          </div>
        )}

      </div>
    </div>
  );
              }
