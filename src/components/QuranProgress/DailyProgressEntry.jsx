import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; 
import { Calendar, CheckCircle2, User, BookOpen, Save, AlertCircle } from 'lucide-react';

export default function DailyProgressEntry() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [surahName, setSurahName] = useState('');
  const [fromAyah, setFromAyah] = useState('');
  const [toAyah, setToAyah] = useState('');
  const [evaluation, setEvaluation] = useState('ممتاز');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // جلب قائمة الطلاب عند تحميل المكون
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, full_name');
      
      if (error) throw error;
      if (data) setStudents(data);
    } catch (error) {
      console.error('خطأ في جلب الطلاب:', error.message);
    }
  };

  // حفظ البيانات في جدول daily_progress
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !surahName) {
      setMessage({ type: 'error', text: 'الرجاء اختيار الطالب وإدخال اسم السورة على الأقل.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('daily_progress')
        .insert([
          {
            student_id: selectedStudent,
            surah_name: surahName,
            from_ayah: parseInt(fromAyah) || null,
            to_ayah: parseInt(toAyah) || null,
            evaluation: evaluation,
            notes: notes,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'تم تسجيل التقدم اليومي بنجاح في قاعدة البيانات!' });
      // إعادة تعيين الحقول
      setSurahName('');
      setFromAyah('');
      setToAyah('');
      setNotes('');
    } catch (error) {
      console.error('خطأ في الحفظ:', error.message);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100 my-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <BookOpen className="w-7 h-7 text-emerald-600" />
        <h2 className="text-xl font-bold text-gray-800">تسجيل المتابعة والتقدم اليومي للحفظ</h2>
      </div>

      {message && (
        <div className={`p-4 mb-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* اختيار الطالب */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الطالب</label>
          <div className="relative">
            <User className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            >
              <option value="">-- اختر الطالب --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* اسم السورة */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اسم السورة</label>
          <input
            type="text"
            value={surahName}
            onChange={(e) => setSurahName(e.target.value)}
            placeholder="مثال: سورة البقرة"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            required
          />
        </div>

        {/* الآيات من وإلى */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">من الآية</label>
            <input
              type="number"
              value={fromAyah}
              onChange={(e) => setFromAyah(e.target.value)}
              placeholder="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">إلى الآية</label>
            <input
              type="number"
              value={toAyah}
              onChange={(e) => setToAyah(e.target.value)}
              placeholder="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* التقييم */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">التقييم / مستوى الإتقان</label>
          <select
            value={evaluation}
            onChange={(e) => setEvaluation(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="ممتاز">ممتاز</option>
            <option value="جيد جداً">جيد جداً</option>
            <option value="جيد">جيد</option>
            <option value="بحاجة لمراجعة">بحاجة لمراجعة</option>
          </select>
        </div>

        {/* ملاحظات */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات إضافية</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أي ملاحظات حول التسميع أو الأخطاء..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          ></textarea>
        </div>

        {/* زر الحفظ */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-sm"
        >
          <Save className="w-5 h-5" />
          {loading ? 'جاري الحفظ...' : 'حفظ التقدم اليومي'}
        </button>
      </form>
    </div>
  );
}
