import React, { useState } from 'react';
import { X, UserPlus, User, Phone, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import { formatName } from '@/utils/formatters';

const AddStudentModal = ({ isOpen, onClose, onAddStudent, halaqat = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    halaqa_id: '',
    join_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'اسم الطالب مطلوب';
    }
    if (formData.phone && !/^01[0125][0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح (يجب أن يكون رقم مصري مكون من 11 رقم)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formattedData = {
        ...formData,
        name: formatName(formData.name),
        status: 'active',
      };
      await onAddStudent(formattedData);
      onClose();
      setFormData({
        name: '',
        phone: '',
        halaqa_id: '',
        join_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch (error) {
      console.error('Error adding student:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary-500/10 text-primary-400 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">إضافة طالب جديد</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* اسم الطالب */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              اسم الطالب الثلاثي / الرباعي *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل اسم الطالب كاملًا..."
                className={`w-full pr-9 pl-3 py-2.5 bg-slate-800 border ${
                  errors.name ? 'border-rose-500' : 'border-slate-700'
                } rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors`}
              />
            </div>
            {errors.name && (
              <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.0 h-3.0" />
                {errors.name}
              </p>
            )}
          </div>

          {/* رقم الهاتف */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              رقم الهاتف / الواتساب
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01xxxxxxxx"
                className={`w-full pr-9 pl-3 py-2.5 bg-slate-800 border ${
                  errors.phone ? 'border-rose-500' : 'border-slate-700'
                } rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors`}
              />
            </div>
            {errors.phone && (
              <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* الحلقة وتاريخ الانضمام */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                تحديد الحلقة
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={formData.halaqa_id}
                  onChange={(e) => setFormData({ ...formData, halaqa_id: e.target.value })}
                  className="w-full pr-9 pl-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-primary-500 transition-colors appearance-none"
                >
                  <option value="">بدون تحديد حلقة</option>
                  {halaqat.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                تاريخ الانضمام
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={formData.join_date}
                  onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                  className="w-full pr-9 pl-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* ملاحظات */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">ملاحظات إضافية</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="أي ملاحظات خاصة بالطالب..."
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
            />
          </div>

          {/* الأزرار */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'إضافة الطالب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
