import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // تأكد
import { Users, UserPlus, Phone, Mail, User, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ParentsManagement() {
  const [parents, setParents] = useState([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relation, setRelation] = useState('أب');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // جلب قائمة أولياء الأمور عند تحميل المكون
  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const { data, error } = await supabase
        .from('parents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setParents(data);
    } catch (error) {
      console.error('خطأ في جلب أولياء الأمور:', error.message);
    }
  };

  // إضافة ولي أمر جديد
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !phone) {
      setMessage({ type: 'error', text: 'الرجاء إدخال اسم ولي الأمر ورقم الهاتف على الأقل.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('parents')
        .insert([
          {
            full_name: fullName,
            phone: phone,
            email: email || null,
            relation: relation,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'تم إضافة ولي الأمر بنجاح وحفظه في قاعدة البيانات!' });
      // إعادة تعيين الحقول
      setFullName('');
      setPhone('');
      setEmail('');
      setRelation('أب');
      // تحديث القائمة
      fetchParents();
    } catch (error) {
      console.error('خطأ في الحفظ:', error.message);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100 my-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <Users className="w-7 h-7 text-emerald-600" />
        <h2 className="text-xl font-bold text-gray-800">إدارة أولياء الأمور</h2>
      </div>

      {message && (
        <div className={`p-4 mb-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* نموذج الإضافة */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 space-y-4">
        <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-emerald-600" />
          إضافة ولي أمر جديد
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم ولي الأمر</label>
            <div className="relative">
              <User className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="الاسم الكامل"
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <div className="relative">
              <Phone className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010xxxxxxxx"
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني (اختياري)</label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">صلة القرابة</label>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="أب">أب</option>
              <option value="أم">أم</option>
              <option value="ولي أمر (آخر)">ولي أمر (آخر)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-sm"
        >
          <Save className="w-5 h-5" />
          {loading ? 'جاري الحفظ...' : 'حفظ ولي الأمر'}
        </button>
      </form>

      {/* جدول العرض */}
      <h3 className="text-md font-semibold text-gray-700 mb-3">قائمة أولياء الأمور المسجلين</h3>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm border-b border-gray-200">
              <th className="p-3">الاسم</th>
              <th className="p-3">رقم الهاتف</th>
              <th className="p-3">البريد الإلكتروني</th>
              <th className="p-3">صلة القرابة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-gray-600">
            {parents.length > 0 ? (
              parents.map((parent) => (
                <tr key={parent.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-800">{parent.full_name}</td>
                  <td className="p-3">{parent.phone}</td>
                  <td className="p-3">{parent.email || 'غير متوفر'}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                      {parent.relation}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-400">
                  لا توجد سجلات لأولياء الأمور حتى الآن.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
