import React, { useState } from 'react';
import { 
  UserPlus, Search, SlidersHorizontal, ArrowUpDown, 
  User, Phone, Calendar, BookOpen, DollarSign, 
  Award, ShieldAlert, CheckCircle2, XCircle, 
  Clock, Tags, Heart, ShieldCheck, HelpCircle,
  MessageSquare, UserCheck, RefreshCw, ChevronDown
} from 'lucide-react';

// === البيانات الثابتة والخيارات المتقدمة لبيئة الحلقات ===
const NARRATIONS = [
  { id: 'hafs', name: 'حفص عن عاصم' },
  { id: 'warsh', name: 'ورش عن نافع' },
  { id: 'qaloon', name: 'قالون عن نافع' },
  { id: 'doori', name: 'الدوري عن أبي عمرو' }
];

const FUNDING_TYPES = [
  { id: 'self', name: 'تمويل ذاتي (أولياء الأمور)', icon: DollarSign, color: 'text-emerald-500' },
  { id: 'waqf', name: 'مكفول بالكامل (أوقاف / جهة خيرية)', icon: Heart, color: 'text-amber-500' },
  { id: 'scholarship', name: 'منحة تميز (لحفاظ الأجزاء المتقدمة)', icon: Award, color: 'text-indigo-500' }
];

const BEHAVIOR_STATUS = [
  { id: 'excellent', name: 'متميز خلقياً وأدبياً', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { id: 'needs_encouragement', name: 'يحتاج إلى تشجيع ومتابعة', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { id: 'distracted', name: 'متشتت أو قليل الانتباه اليوم', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' }
];

// بيانات وهمية أولية مطورة تعكس البيئة الحلقية الجديدة
const INITIAL_STUDENTS = [
  {
    id: 1,
    name: "عبد الرحمن محمد المصطفى",
    gender: "male",
    phone: "+966501234567",
    parentPhone: "+966507654321",
    joinDateM: "2026-01-10",
    joinDateH: "1447-07-21",
    narration: "hafs",
    ringName: "حلقة الإمام البخاري",
    daysScheduled: ["الأحد", "الثلاثاء", "الخميس"],
    fundingType: "self",
    behavior: "excellent",
    status: "active",
    currentPlan: "حفظ سورة البقرة",
    tags: ["موهوب", "صوت حسن"],
    monthlyPayment: "paid"
  },
  {
    id: 2,
    name: "فاطمة عائشة عمر",
    gender: "female",
    phone: "+201012345678",
    parentPhone: "+201098765432",
    joinDateM: "2026-02-15",
    joinDateH: "1447-08-27",
    narration: "warsh",
    ringName: "حلقة أمهات المؤمنين",
    daysScheduled: ["الإثنين", "الأربعاء"],
    fundingType: "waqf",
    behavior: "needs_encouragement",
    status: "active",
    currentPlan: "حفظ جزء عم",
    tags: ["مسابقة الدولة"],
    monthlyPayment: "pending"
  },
  {
    id: 3,
    name: "معاذ بلال إدريس",
    gender: "male",
    phone: "+244912345678",
    parentPhone: "+244987654321",
    joinDateM: "2025-11-01",
    joinDateH: "1447-05-10",
    narration: "hafs",
    ringName: "حلقة مصعب بن عمير",
    daysScheduled: ["يومياً"],
    fundingType: "scholarship",
    behavior: "excellent",
    status: "frozen",
    currentPlan: "مراجعة القرآن كاملاً",
    tags: ["خاتم"],
    monthlyPayment: "exempt"
  }
];

export default function Students() {
  // === States الإدارة والفرز ===
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  
  // === State النموذج المطور للطالب الجديد ===
  const [newStudent, setNewStudent] = useState({
    name: "",
    gender: "male", 
    phone: "",
    parentPhone: "",
    joinDateM: new Date().toISOString().split('T')[0],
    joinDateH: "1447-12-30", // قيمة تقريبية للتقويم الهجري الحي
    narration: "hafs",
    ringName: "",
    daysScheduled: [],
    fundingType: "self",
    behavior: "excellent",
    status: "active",
    currentPlan: "",
    tags: "",
    monthlyPayment: "paid"
  });

  // التحكم بـ Selector الورد القرآني المنعزل بصرياً
  const [activeQuranSelector, setActiveQuranSelector] = useState(null);

  // إرسال تقرير فوري لولي الأمر عبر الواتساب دون حفظ الرقم
  const sendWhatsAppReport = (student) => {
    const message = `السلام عليكم ورحمة الله وبركاته، تحية طيبة من مركز التحفيظ. نود إحاطتكم علماً بأن الطالب(ة) ${student.name} في ${student.ringName} يسير بخطى مباركة في خطته الحالية (${student.currentPlan}). نسأل الله له التوفيق والسداد.`;
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = student.parentPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
  };

  // معالجة إضافة الطالب
  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.name) return;

    const studentToAdd = {
      ...newStudent,
      id: Date.now(),
      tags: newStudent.tags ? newStudent.tags.split(',').map(t => t.trim()) : []
    };

    setStudents([studentToAdd, ...students]);
    setShowAddModal(false);
    // إعادة تهيئة النموذج
    setNewStudent({
      name: "", gender: "male", phone: "", parentPhone: "",
      joinDateM: new Date().toISOString().split('T')[0], joinDateH: "1447-12-30",
      narration: "hafs", ringName: "", daysScheduled: [],
      fundingType: "self", behavior: "excellent", status: "active",
      currentPlan: "", tags: "", monthlyPayment: "paid"
    });
  };

  // تصفية الطلاب بناءً على الاختيارات
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.phone.includes(searchTerm) || 
                          (student.ringName && student.ringName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGender = genderFilter === "all" || student.gender === genderFilter;
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesGender && matchesStatus;
  });

  return (
    <div className="p-6 bg-[#0B0F19] min-h-screen text-slate-100 font-sans" dir="rtl">
      
      {/* العناوين الرئيسية لواجهة الـ SaaS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-l from-amber-400 via-yellow-200 to-slate-100 bg-clip-text text-transparent">
            إدارة شؤون الحفاظ والطلاب
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            متابعة تسجيل الطلاب، الحلقات المقررة، الخطط السنوية والأوضاع التربوية والمالية للأوقاف والكفالات.
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/10 hover:scale-[1.02]"
        >
          <UserPlus size={20} />
          <span>تسجيل طالب / برعم جديد</span>
        </button>
      </div>

      {/* شريط الفرز والبحث الاحترافي المطور */}
      <div className="bg-[#121826] p-4 rounded-2xl border border-slate-800 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-xl">
        <div className="relative w-full lg:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="البحث باسم الطالب، رقم الهاتف، أو اسم الحلقة..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-[#1A2234] border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* فلتر تصنيف الجنسين التربوي */}
          <div className="relative min-w-[140px]">
            <select 
              value={genderFilter} 
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full appearance-none bg-[#1A2234] border border-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">كل الفئات التربوية</option>
              <option value="male">قسم البنين (براعم / طلاب)</option>
              <option value="female">قسم البنات (براعم / طالبات)</option>
            </select>
            <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          {/* فلتر حالة السجل داخل المركز */}
          <div className="relative min-w-[140px]">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-[#1A2234] border border-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">كل حالات السجلات</option>
              <option value="active">نشط ومستمر</option>
              <option value="frozen">مجمّد مؤقتاً لعذر</option>
              <option value="inactive">منقطع</option>
            </select>
            <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* شبكة عرض بطاقات الطلاب (Grid List) المتجاوبة بالكامل مع اتجاه الـ RTL */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map((student) => {
          // الفصل البصري التلقائي ذو الهوية الذكية بناءً على الجنس
          const isFemale = student.gender === 'female';
          const genderTheme = isFemale 
            ? { border: 'border-purple-500/30', bg: 'bg-purple-500/5', text: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20' }
            : { border: 'border-amber-500/20', bg: 'bg-amber-500/0', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };

          return (
            <div 
              key={student.id} 
              className={`bg-[#121826] rounded-2xl border ${genderTheme.border} ${genderTheme.bg} p-5 flex flex-col justify-between transition-all hover:shadow-2xl hover:shadow-black/40 group relative overflow-hidden`}
            >
              {/* شريط تمييز الحالة العلوية */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-l from-transparent via-slate-700 to-transparent group-hover:via-amber-500 transition-all" />

              <div>
                {/* رأس البطاقة: الاسم والتصنيف التربوي وحالة الانتظام */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors flex items-center gap-2">
                      {student.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${genderTheme.badge}`}>
                        {isFemale ? "برعمة / طالبة" : "برعم / طالب"}
                      </span>
                      <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                        {NARRATIONS.find(n => n.id === student.narration)?.name || "حفص عن عاصم"}
                      </span>
                    </div>
                  </div>

                  {/* شارات الحالة المتقدمة والتجميد الذكي */}
                  <div>
                    {student.status === 'active' && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                        <CheckCircle2 size={12} /> مستمر
                      </span>
                    )}
                    {student.status === 'frozen' && (
                      <span className="flex items-center gap-1 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full font-medium">
                        <Clock size={12} /> مجمّد لعذر
                      </span>
                    )}
                    {student.status === 'inactive' && (
                      <span className="flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full font-medium">
                        <XCircle size={12} /> منقطع
                      </span>
                    )}
                  </div>
                </div>

                {/* تفاصيل الهيكل الحلقي والبيانات الإدارية والخطط */}
                <div className="space-y-2.5 my-4 border-y border-slate-800/60 py-3 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5"><BookOpen size={14} /> الحلقة المقررة:</span>
                    <span className="font-medium text-slate-200">{student.ringName || "لم يحدد بعد"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5"><Calendar size={14} /> أيام الحضور والورود:</span>
                    <span className="font-medium text-amber-500/90">{student.daysScheduled.join('، ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5"><Award size={14} /> الخطة والمستهدف:</span>
                    <span className="font-medium text-slate-200">{student.currentPlan || "لم يحدد مستهدف"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5"><Calendar size={14} /> تاريخ التسجيل (هـ/م):</span>
                    <span className="font-medium text-slate-400">{student.joinDateH} هـ | {student.joinDateM} م</span>
                  </div>
                </div>

                {/* الوسوم والسمات المميزة للفرز والترشيح (Tags) */}
                {student.tags && student.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <Tags size={12} className="text-slate-600 self-center" />
                    {student.tags.map((tag, index) => (
                      <span key={index} className="text-[10px] bg-slate-800/80 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* الوضع التربوي والسلوكي في الحلقة اليوم */}
                <div className="mb-4">
                  <div className="text-[11px] text-slate-500 mb-1">توجيهات المحفظ والمشرف التربوي اليومية:</div>
                  <div className={`text-xs border px-3 py-1.5 rounded-xl font-medium text-center ${BEHAVIOR_STATUS.find(b => b.id === student.behavior)?.color}`}>
                    {BEHAVIOR_STATUS.find(b => b.id === student.behavior)?.name}
                  </div>
                </div>
              </div>

              {/* ذيل البطاقة: الحالة المالية للأوقاف، والكفالات وأزرار الاتصال السريع */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {student.fundingType === 'self' && (
                    <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                      <DollarSign size={12} /> اشتراك مالي مدفوع
                    </span>
                  )}
                  {student.fundingType === 'waqf' && (
                    <span className="text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                      <Heart size={12} /> مكفول (وقف خيري)
                    </span>
                  )}
                  {student.fundingType === 'scholarship' && (
                    <span className="text-[11px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                      <Award size={12} /> منحة تميز وإعفاء
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => sendWhatsAppReport(student)}
                    title="إرسال تقرير فوري لولي الأمر عبر واتساب"
                    className="p-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-slate-950 rounded-xl border border-emerald-600/20 hover:border-transparent transition-all shadow-md"
                  >
                    <MessageSquare size={14} />
                  </button>
                  <button 
                    onClick={() => setActiveQuranSelector(activeQuranSelector === student.id ? null : student.id)}
                    className="text-xs bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 px-3 py-2 rounded-xl border border-slate-700 hover:border-transparent transition-all font-bold"
                  >
                    تحديث الورد اليومي
                  </button>
                </div>
              </div>

              {/* المكوّن المطور والمنعزل تماماً لمنشئ ومحدد الورد القرآني - علاج مشكلة صور المعاينة */}
              {activeQuranSelector === student.id && (
                <div className="absolute inset-0 bg-[#0B0F19]/98 z-30 p-5 flex flex-col justify-between border border-amber-500/40 rounded-2xl animate-fadeIn shadow-2xl backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                        <BookOpen size={16} /> منشئ التقدم والورد اليومي للقرآن
                      </h4>
                      <span className="text-[11px] text-slate-400">{student.name}</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">نوع ومستوى الورد المنجز:</label>
                        <select className="w-full bg-[#161F30] border border-slate-700 text-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-amber-500">
                          <option>تسميع حفظ جديد</option>
                          <option>مراجعة قريب (الماضي القريب)</option>
                          <option>مراجعة بعيد (المنهج القديم)</option>
                          <option>اختبار جزء كامل</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">من سورة / جزء:</label>
                          <input type="text" placeholder="مثال: البقرة آية 1" className="w-full bg-[#161F30] border border-slate-700 text-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-center" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">إلى سورة / جزء:</label>
                          <input type="text" placeholder="مثال: آية 24" className="w-full bg-[#161F30] border border-slate-700 text-slate-200 p-2 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-center" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">تقدير الحفظ والتجويد للحلقة:</label>
                        <div className="grid grid-cols-4 gap-1.5 text-center">
                          <button className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 p-1.5 border border-emerald-500/20 rounded-md text-[11px] transition-colors font-medium">ممتاز</button>
                          <button className="bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-slate-950 p-1.5 border border-blue-500/20 rounded-md text-[11px] transition-colors font-medium">جيد جداً</button>
                          <button className="bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 p-1.5 border border-amber-500/20 rounded-md text-[11px] transition-colors font-medium">جيد</button>
                          <button className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 p-1.5 border border-rose-500/20 rounded-md text-[11px] transition-colors font-medium">مقبول</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                    <button 
                      onClick={() => setActiveQuranSelector(null)}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold p-2 rounded-xl text-xs hover:from-amber-600 hover:to-yellow-700 transition-colors"
                    >
                      اعتماد ورصد الدرجات بالملف
                    </button>
                    <button 
                      onClick={() => setActiveQuranSelector(null)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 px-3 py-2 rounded-xl text-xs transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* نافذة التسجيل المتقدمة الفاخرة لطالب / برعم جديد */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" dir="rtl">
          <div className="bg-[#121826] w-full max-w-2xl rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* رأس النافذة */}
            <div className="bg-[#161F30] p-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="text-amber-400" size={22} />
                <h2 className="text-lg font-bold text-slate-100">تسجيل طالب / برعم جديد بالمنظومة التعليمية</h2>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-100 bg-slate-800/60 w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            {/* محتوى نموذج الإدخال */}
            <form onSubmit={handleAddStudent} className="p-6 overflow-y-auto space-y-5 text-sm">
              
              {/* قسم الاسم والجنس التربوي المطور مع الـ Dynamic Theming */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">اسم الطالب ثلاثي أو رباعي بالكامل *</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text" 
                      required
                      placeholder="مثال: محمد مصطفى السنباطي"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                      className="w-full pl-4 pr-10 py-2.5 bg-[#161F30] border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">التصنيف والقسم التربوي (الجنس)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewStudent({...newStudent, gender: 'male'})}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${newStudent.gender === 'male' ? 'bg-amber-500/20 text-amber-400 border-amber-500' : 'bg-[#161F30] text-slate-400 border-slate-700 hover:bg-slate-800'}`}
                    >
                      🚹 برعم / طالب (بنين)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewStudent({...newStudent, gender: 'female'})}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${newStudent.gender === 'female' ? 'bg-purple-500/20 text-purple-400 border-purple-500' : 'bg-[#161F30] text-slate-400 border-slate-700 hover:bg-slate-800'}`}
                    >
                      🚺 برعمة / طالبة (بنات)
                    </button>
                  </div>
                </div>
              </div>

              {/* قسم الهواتف والربط السريع بأولياء الأمور */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">رقم هاتف الطالب (إن وجد)</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="tel" 
                      placeholder="+966500000000"
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                      className="w-full pl-4 pr-10 py-2.5 bg-[#161F30] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 text-left text-xs" dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">رقم هاتف ولي الأمر (للتواصل والواتساب الرئيسي) *</label>
                  <div className="relative">
                    <MessageSquare className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="tel" 
                      required
                      placeholder="+966500000000"
                      value={newStudent.parentPhone}
                      onChange={(e) => setNewStudent({...newStudent, parentPhone: e.target.value})}
                      className="w-full pl-4 pr-10 py-2.5 bg-[#161F30] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 text-left text-xs" dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* قسم الرواية وتفاصيل الحلقة والمستهدف */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">الرواية المقررة للطالب</label>
                  <select 
                    value={newStudent.narration}
                    onChange={(e) => setNewStudent({...newStudent, narration: e.target.value})}
                    className="w-full bg-[#161F30] border border-slate-700 text-slate-200 p-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {NARRATIONS.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">اسم الحلقة / اسم المحفظ</label>
                  <input 
                    type="text" 
                    placeholder="مثال: حلقة الإمام البخاري"
                    value={newStudent.ringName}
                    onChange={(e) => setNewStudent({...newStudent, ringName: e.target.value})}
                    className="w-full pl-4 pr-4 py-2.5 bg-[#161F30] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">الخطة والمستهدف السنوي</label>
                  <input 
                    type="text" 
                    placeholder="مثال: حفظ سورة البقرة"
                    value={newStudent.currentPlan}
                    onChange={(e) => setNewStudent({...newStudent, currentPlan: e.target.value})}
                    className="w-full pl-4 pr-4 py-2.5 bg-[#161F30] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              {/* مواعيد الحضور وتواريخ التسجيل (الهجري والميلادي) المدمج لأسواق الخليج */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">تاريخ التسجيل (ميلادي)</label>
                  <input 
                    type="date" 
                    value={newStudent.joinDateM}
                    onChange={(e) => setNewStudent({...newStudent, joinDateM: e.target.value})}
                    className="w-full bg-[#161F30] border border-slate-700 text-slate-200 p-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">تاريخ التسجيل التقريبي (هجري)</label>
                  <input 
                    type="text" 
                    placeholder="مثال: 1447-07-21 هـ"
                    value={newStudent.joinDateH}
                    onChange={(e) => setNewStudent({...newStudent, joinDateH: e.target.value})}
                    className="w-full bg-[#161F30] border border-slate-700 text-slate-200 p-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">أيام الحضور المقررة بالحلقة</label>
                  <input 
                    type="text" 
                    placeholder="مثال: الأحد، الثلاثاء، الخميس"
                    onChange={(e) => setNewStudent({...newStudent, daysScheduled: e.target.value.split('،').map(d => d.trim())})}
                    className="w-full bg-[#161F30] border border-slate-700 text-slate-200 p-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* الحالة المالية والمساهمات (الأوقاف، الكفالات، التمويل الذاتي) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">نوع التمويل ومساهمة التحفيظ المالي</label>
                  <select 
                    value={newStudent.fundingType}
                    onChange={(e) => setNewStudent({...newStudent, fundingType: e.target.value})}
                    className="w-full bg-[#161F30] border border-slate-700 text-slate-200 p-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {FUNDING_TYPES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">حالة السجل المبدئية عند الإدخال</label>
                  <select 
                    value={newStudent.status}
                    onChange={(e) => setNewStudent({...newStudent, status: e.target.value})}
                    className="w-full bg-[#161F30] border border-slate-700 text-slate-200 p-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="active">نشط ومستمر في التسميع</option>
                    <option value="frozen">مجمّد مؤقتاً لعذر أو إجازة</option>
                  </select>
                </div>
              </div>

              {/* نظام الوسوم والسمات المميزة الذكي (Tags) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">الوسوم والسمات المتميزة (مفصولة بفاصلة)</label>
                <input 
                  type="text" 
                  placeholder="مثال: صوت حسن، موهوب، مسابقة الدولة"
                  value={newStudent.tags}
                  onChange={(e) => setNewStudent({...newStudent, tags: e.target.value})}
                  className="w-full pl-4 pr-4 py-2.5 bg-[#161F30] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {/* أزرار الحفظ والإغلاق السفلي للنافذة */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-700 mt-6 justify-end">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors font-medium text-xs"
                >
                  إلغاء وتراجع
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold rounded-xl transition-all shadow-lg text-xs"
                >
                  حفظ وتسجيل الطالب بالمنظومة
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
