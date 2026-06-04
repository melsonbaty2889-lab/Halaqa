import React, { useState, useEffect } from 'react';
import { fetchAllStudents, insertNewStudent } from '../api/students';
import { supabase } from '../lib/supabase'; // للاستعلام المباشر عن الـ staff الحالي عند اللزوم

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState({ id: null, academy_id: null });
  
  // حقول الإدخال
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentSurah, setCurrentSurah] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // جلب المحفظ الحالي من جدول staff بناءً على الـ Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: staffData } = await supabase
          .from('staff') // تم التعديل من واقع السكربت ليتطابق مع جدول staff الجديد
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (staffData) setCurrentTeacher(staffData);
      }

      // استدعاء دالة الـ API التي أعدنا بناءها
      const { data, error } = await fetchAllStudents();
      if (error) throw new Error(error);
      setStudents(data || []);

    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('برجاء كتابة اسم الطالب');

    try {
      const payload = {
        name,
        parent_phone: phone,
        current_surah: currentSurah,
        academy_id: currentTeacher.academy_id,
        teacher_id: currentTeacher.id
      };

      const { data: newStudent, error } = await insertNewStudent(payload);
      if (error) throw new Error(error);

      alert('تم تسجيل الطالب بنجاح! 🎉');
      if (newStudent) setStudents([newStudent, ...students]);

      // تصفير الخانات وإغلاق المودال
      setName('');
      setPhone('');
      setCurrentSurah('');
      setShowModal(false);

    } catch (error) {
      alert('فشل الحفظ: ' + error.message);
    }
  };

  return (
    <div className="p-6 bg-[#0B132B] min-h-screen text-white text-right" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F4D068]">دليل الحلقات والمحفوظ</h1>
          <p className="text-gray-400 text-sm">إدارة شؤون الطلاب الحالية (قاعدة بيانات حية)</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#F4D068] hover:bg-amber-500 text-black font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200"
        >
          + إضافة طالب للحلقة
        </button>
      </div>

      <div className="bg-[#1C2541] rounded-xl overflow-hidden border border-gray-800 shadow-xl">
        {loading ? (
          <div className="p-10 text-center text-gray-400 animate-pulse">جاري جلب البيانات من السيرفر...</div>
        ) : students.length === 0 ? (
          <div className="p-10 text-center text-gray-400">الجدول فارغ حالياً. اضغط على إضافة طالب لتجربة النظام!</div>
        ) : (
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#232F52] text-[#F4D068] font-semibold text-sm border-b border-gray-700">
                <th className="p-4">الطالب</th>
                <th className="p-4">الهاتف (ولي الأمر)</th>
                <th className="p-4">المحفوظ الحالي</th>
                <th className="p-4">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-[#2A375E] transition-colors">
                  <td className="p-4 font-medium text-amber-100">{student.name}</td>
                  <td className="p-4 text-gray-300">{student.parent_phone || 'لا يوجد'}</td>
                  <td className="p-4 text-emerald-400">📖 {student.current_surah}</td>
                  <td className="p-4 text-gray-400">
                    {new Date(student.created_at).toLocaleDateString('ar-EG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[#1C2541] border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#232F52] p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#F4D068]">تسجيل طالب جديد بالحلقة</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            
            <form onSubmit={handleRegisterStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">اسم الطالب رباعي *</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0B132B] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#F4D068]"
                  placeholder="مثال: عاصم محمد مصطفى"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">رقم هاتف ولي الأمر</label>
                <input 
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0B132B] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#F4D068]"
                  placeholder="010XXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">السورة الحالية</label>
                <input 
                  type="text" value={currentSurah} onChange={(e) => setCurrentSurah(e.target.value)}
                  className="w-full bg-[#0B132B] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#F4D068]"
                  placeholder="مثال: سورة الملك"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="w-full bg-[#F4D068] hover:bg-amber-500 text-black font-bold py-2.5 rounded-lg transition-colors">
                  حفظ وتأكيد 💾
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="w-1/2 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
