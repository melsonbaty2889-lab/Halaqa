import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // التوجه حسب ملف السوبابيز عندك

export default function StudentsManager() {
  const [students, setStudents] = useState([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [juz, setJuz] = useState(0);
  const [loading, setLoading] = useState(false);

  // 1. جلب الطلاب الخاصين بأكاديمية المستخدم الحالي فقط
  const fetchStudents = async () => {
    setLoading(true);
    // جلب رقم أكاديمية المعلم الحالي أولاً
    const { data: staffData } = await supabase
      .from('staff')
      .select('academy_id')
      .single();

    if (staffData?.academy_id) {
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*')
        .eq('academy_id', staffData.academy_id)
        .order('created_at', { ascending: false });

      if (!error) setStudents(studentsData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 2. إضافة طالب جديد يربط تلقائياً بنفس الأكاديمية
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!fullName) return;

    // جلب رقم الأكاديمية الحالي
    const { data: staffData } = await supabase
      .from('staff')
      .select('academy_id')
      .single();

    if (staffData?.academy_id) {
      const { error } = await supabase.from('students').insert([
        {
          full_name: fullName,
          phone: phone,
          juz_memorized: juz,
          academy_id: staffData.academy_id,
        },
      ]);

      if (!error) {
        setFullName('');
        setPhone('');
        setJuz(0);
        fetchStudents(); // إعادة تحديث الجدول تلقائياً
      }
    }
  };

  return (
    <div className="p-6 bg-slate-900 text-white min-h-screen rtl text-right">
      <h2 className="text-2xl font-bold mb-6 border-b border-slate-700 pb-2 text-amber-400">
        👥 إدارة دليل الطلاب والخطط
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* فورم الإضافة */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 h-fit">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">إضافة طالب جديد</h3>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">اسم الطالب بالكامل</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400"
                placeholder="محمد أحمد..."
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">رقم الهاتف (أو ولي الأمر)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400"
                placeholder="01xxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">عدد الأجزاء المحفوظة</label>
              <input
                type="number"
                value={juz}
                onChange={(e) => setJuz(e.target.value)}
                min="0"
                max="30"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold p-2 rounded-lg transition-colors"
            >
              ➕ حفظ الطالب بالحلقة
            </button>
          </form>
        </div>

        {/* جدول العرض */}
        <div className="lg:col-span-2 bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">قائمة طلاب الأكاديمية الحاليين</h3>
          {loading ? (
            <p className="text-slate-400 text-center py-4">جاري تحميل البيانات...</p>
          ) : students.length === 0 ? (
            <p className="text-slate-400 text-center py-4">لا يوجد طلاب مسجلين حالياً بالحلقة.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-700 text-slate-300">
                    <th className="p-3 rounded-r-lg">الاسم</th>
                    <th className="p-3">رقم الهاتف</th>
                    <th className="p-3 rounded-l-lg">الأجزاء المحفوظة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-750 transition-colors">
                      <td className="p-3 font-medium">{student.full_name}</td>
                      <td className="p-3 text-slate-400">{student.phone || 'غير مسجل'}</td>
                      <td className="p-3">
                        <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-sm">
                          {student.juz_memorized} جزء
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
