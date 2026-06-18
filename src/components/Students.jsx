import React, { useState } from 'react';
import {
  UserPlus, Search, SlidersHorizontal, Grid, 
  User, Phone, Calendar, BookOpen, Download, 
  Award, ShieldAlert, CheckCircle2, XCircle, 
  Clock, Tags, Heart, ShieldCheck, HelpCircle, 
  MessageSquare, UserCheck, RefreshCw
} from 'lucide-react';

export default function Students() {
  // حالات الفلترة والبحث
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // بيانات افتراضية مطابقة تماماً لملف الحفاظ الخاص بك المعروض في النظام
  const [students] = useState([
    {
      id: 1,
      name: "عبد الرحمن محمد المصطفى",
      type: "برعم / طالب",
      narration: "حفص عن عاصم",
      status: "مستمر",
      halaqa: "حلقة الإمام البخاري",
      attendanceDays: "الأحد، الثلاثاء، الخميس",
      target: "حفظ سورة البقرة",
      registrationDate: "1447-07-21 هـ"
    }
  ]);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 md:p-8 flex justify-center" dir="rtl">
      <div className="w-full max-w-4xl">
        
        {/* العناوين الرئيسية */}
        <div className="mb-6 text-right">
          <h1 className="text-2xl md:text-3xl font-black tracking-wide text-slate-100">
            إدارة شؤون الحفاظ والطلاب
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-2 leading-relaxed">
            متابعة تسجيل الطلاب، الحلقات المقررة، الخطط السنوية والأوضاع التربوية والمالية للأوقاف والكفالات.
          </p>
        </div>

        {/* أدوات التحكم والبحث - تم إعادة هيكلتها لتفادي التداخل على الموبايل */}
        <div className="bg-[#121826]/80 backdrop-blur-md p-4 rounded-xl border border-slate-800/80 space-y-4 shadow-xl">
          
          {/* السطر الأول: الزر وحقل البحث */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            
            {/* زر إضافة طالب جديد المعتمد باللون البرتقالي الإستراتيجي */}
            <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#E87722] hover:bg-[#d0661e] text-white px-5 py-3 rounded-lg text-xs md:text-sm font-bold transition-all shrink-0 shadow-md shadow-[#E87722]/10 active:scale-95">
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>تسجيل طالب / برعم جديد</span>
            </button>

            {/* صندوق البحث مع الأيقونة منضبطة الاتجاه تماماً في اليمين RTL */}
            <div className="relative w-full">
              <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث باسم الطالب، رقم الهاتف، أو اسم ولي الأمر..." 
                className="w-full bg-[#1A237E]/10 border border-slate-700/60 rounded-lg py-2.5 pl-4 pr-10 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00C853] focus:ring-1 focus:ring-[#00C853]/30 transition-all text-right"
              />
            </div>

          </div>

          {/* السطر الثاني: القوائم المنسدلة مقسمة في شبكة مرنة تمنع اختلاط النصوص */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            <div className="relative">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-[#1A237E]/10 border border-slate-700/60 text-slate-300 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-[#00C853] transition-colors appearance-none cursor-pointer text-right"
              >
                <option value="" className="bg-[#121826]">كل الفئات التربوية</option>
                <option value="براعم" className="bg-[#121826]">براعم</option>
                <option value="شباب" className="bg-[#121826]">شباب</option>
              </select>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500 text-[10px]">
                ▼
              </div>
            </div>

            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#1A237E]/10 border border-slate-700/60 text-slate-300 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-[#00C853] transition-colors appearance-none cursor-pointer text-right"
              >
                <option value="" className="bg-[#121826]">كل حالات السجلات</option>
                <option value="مستمر" className="bg-[#121826]">مستمر</option>
                <option value="مكثف" className="bg-[#121826]">مكثف</option>
              </select>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500 text-[10px]">
                ▼
              </div>
            </div>

          </div>

        </div>

        {/* عرض بطاقات الطلاب المستهدفة بتنسيق UI الفاخر */}
        <div className="mt-6 space-y-4">
          {students.map((student) => (
            <div key={student.id} className="bg-[#121826] border border-slate-800/80 hover:border-[#1A237E]/60 rounded-xl p-5 shadow-lg transition-all space-y-4 text-right">
              
              {/* ترويسة بطاقة الطالب */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    {student.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                    <span className="bg-[#1A237E]/30 text-indigo-300 px-2 py-0.5 rounded-md font-medium">
                      {student.type}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-400 font-semibold">
                      {student.narration}
                    </span>
                  </div>
                </div>

                {/* شارة حالة المتابعة باللون الأخضر المميز */}
                <div className="self-start sm:self-center">
                  <span className="inline-flex items-center gap-1.5 bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20 px-2.5 py-1 rounded-full text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    {student.status}
                  </span>
                </div>
              </div>

              {/* تفاصيل خطة وجدول الطالب الموزعة هندسياً بدقة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-300">
                
                <div className="flex items-center gap-2 bg-[#0B0F19]/40 p-2.5 rounded-lg border border-slate-800/40">
                  <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-slate-400">الحلقة المقررة:</span>
                  <span className="font-semibold text-slate-200">{student.halaqa}</span>
                </div>

                <div className="flex items-center gap-2 bg-[#0B0F19]/40 p-2.5 rounded-lg border border-slate-800/40">
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-slate-400">أيام الحضور والورود:</span>
                  <span className="font-semibold text-slate-200">{student.attendanceDays}</span>
                </div>

                <div className="flex items-center gap-2 bg-[#0B0F19]/40 p-2.5 rounded-lg border border-slate-800/40">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-slate-400">الخطة والمستهدف:</span>
                  <span className="font-semibold text-amber-400">{student.target}</span>
                </div>

                <div className="flex items-center gap-2 bg-[#0B0F19]/40 p-2.5 rounded-lg border border-slate-800/40">
                  <RefreshCw className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-slate-400">تاريخ التسجيل (هـ/م):</span>
                  <span className="font-semibold text-slate-200" dir="ltr">{student.registrationDate}</span>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
