import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, Search, Filter, Plus, MessageCircle, 
  Award, ShieldCheck, UserCheck, CheckCircle2, XCircle, 
  RefreshCw, Phone, Clock
} from 'lucide-react';
import { C } from '@/theme/colors';
import { Btn, Input } from '@/components/UI/UI';
import AddStaffModal from './AddStaffModal';

export default function StaffList({ academyId }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('all');
  const [selectedIjaza, setSelectedIjaza] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // جلب البيانات من Supabase
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id,
          name,
          email,
          phone,
          title,
          is_teaching,
          ijazas,
          employment_type,
          hourly_rate,
          monthly_salary,
          timezone,
          is_active,
          academy_teachers!inner(academy_id)
        `)
        .eq('academy_teachers.academy_id', academyId)
        .eq('academy_teachers.is_active', true);

      if (error) throw error;
      setStaff(data || []);
    } catch (err) {
      console.error('🚨 خطأ في جلب الكادر:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (academyId) fetchStaff();
  }, [academyId]);

  // تبديل حالة النشاط (تفعيل / إيقاف)
  const toggleStatus = async (teacherId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ is_active: !currentStatus })
        .eq('id', teacherId);

      if (error) throw error;
      setStaff(prev => prev.map(item => item.id === teacherId ? { ...item, is_active: !currentStatus } : item));
    } catch (err) {
      console.error('🚨 خطأ في تحديث الحالة:', err);
    }
  };

  // فلترة الكادر بناءً على البحث والفلاتر المختارة
  const filteredStaff = staff.filter(person => {
    const matchesSearch = (person.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (person.phone || '').includes(searchTerm);
    const matchesTitle = selectedTitle === 'all' || person.title === selectedTitle;
    const matchesIjaza = selectedIjaza === 'all' || (person.ijazas && person.ijazas.includes(selectedIjaza));

    return matchesSearch && matchesTitle && matchesIjaza;
  });

  // إحصائيات سريعة
  const totalCount = staff.length;
  const teachersCount = staff.filter(s => s.is_teaching).length;
  const activeCount = staff.filter(s => s.is_active).length;

  return (
    <div className="space-y-6 dir-rtl text-right">
      
      {/* 1. الشريط العلوي والإحصائيات */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Users className="w-6 h-6" style={{ color: C.primary }} /> الكادر التعليمي والإداري
          </h2>
          <p className="text-xs text-slate-400 mt-1">إدارة المعلمين والمشرفين ومدراء الأكاديمية</p>
        </div>

        <Btn onClick={() => setIsModalOpen(true)} variant="primary" className="flex items-center gap-2 shadow-lg">
          <Plus className="w-4 h-4" /> إضافة كادر جديد
        </Btn>
      </div>

      {/* 2. بطاقات الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">إجمالي الكادر</p>
            <p className="text-2xl font-bold text-white mt-1">{totalCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">المعلمون المباشرون للحلقات</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{teachersCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">الحسابات النشطة</p>
            <p className="text-2xl font-bold text-sky-400 mt-1">{activeCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. شريط البحث والفلترة */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
          <Input 
            type="text" 
            placeholder="البحث بالاسم أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-9"
          />
        </div>

        <div className="flex gap-2">
          <select 
            value={selectedTitle}
            onChange={(e) => setSelectedTitle(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none"
          >
            <option value="all">كل المسميات</option>
            <option value="معلّم / مقرئ">معلّم / مقرئ</option>
            <option value="مشرف تعليمي">مشرف تعليمي</option>
            <option value="مدير أكاديمية">مدير أكاديمية</option>
          </select>

          <select 
            value={selectedIjaza}
            onChange={(e) => setSelectedIjaza(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none"
          >
            <option value="all">كل الإجازات</option>
            <option value="حفص عن عاصم">حفص عن عاصم</option>
            <option value="ورش عن نافع">ورش عن نافع</option>
            <option value="القراءات العشر الصغرى">القراءات العشر الصغرى</option>
            <option value="القراءات العشر الكبرى">القراءات العشر الكبرى</option>
          </select>

          <button onClick={fetchStaff} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. شبكة عرض بطاقات الكادر (Grid Cards) */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">جاري تحميل بيانات الكادر...</div>
      ) : filteredStaff.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-dashed border-white/10 text-slate-400 text-xs">
          لا توجد نتائج تطابق خيارات البحث
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((person) => (
            <div 
              key={person.id}
              className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                person.is_active ? 'bg-slate-900/80 border-white/10 hover:border-white/20' : 'bg-slate-900/30 border-rose-500/20 opacity-75'
              }`}
            >
              <div>
                {/* الرأس: الاسم والمسمى والمبيّن */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-white text-base">{person.name}</h3>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {person.title || 'معلّم / مقرئ'}
                    </span>
                  </div>

                  <button 
                    onClick={() => toggleStatus(person.id, person.is_active)}
                    title={person.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                    className="transition-transform active:scale-95"
                  >
                    {person.is_active ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                  </button>
                </div>

                {/* تفاصيل الاتصال والمنطقة الزمنية */}
                <div className="space-y-2 text-xs text-slate-300 my-4 border-t border-b border-white/5 py-3">
                  {person.phone && (
                    <p className="flex items-center gap-2 dir-ltr text-right">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {person.phone}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {person.timezone || 'Africa/Cairo'}
                  </p>
                </div>

                {/* الإجازات القرآنية */}
                {person.ijazas && person.ijazas.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] text-slate-400 mb-1.5 flex items-center gap-1 font-bold">
                      <Award className="w-3 h-3 text-amber-400" /> الإجازات:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {person.ijazas.map((ijaza, idx) => (
                        <span key={idx} className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md text-slate-300">
                          {ijaza}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* أسفل البطاقات: زر التواصل عبر الواتساب */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {person.employment_type === 'volunteer' ? 'تطوع / احتساب' : `${person.hourly_rate || person.monthly_salary || 0} (${person.employment_type})`}
                </span>

                {person.phone && (
                  <a 
                    href={`https://wa.me/${person.phone.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> واتساب
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* المودال الخاص بالإضافة */}
      <AddStaffModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchStaff}
        academyId={academyId}
      />
    </div>
  );
}
