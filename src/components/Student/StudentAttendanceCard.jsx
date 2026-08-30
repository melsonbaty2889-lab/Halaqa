// src/components/Teacher/StudentAttendanceCard.jsx

import React, { useState } from 'react';
import { 
  User, CheckCircle2, XCircle, Clock, 
  Send, Save, BookOpen, Star 
} from 'lucide-react';
import { formatName } from '@/utils/formatters';

const StudentAttendanceCard = ({ student, onSaveAttendance, initialData = {} }) => {
  const [status, setStatus] = useState(initialData.status || 'present');
  const [memorization, setMemorization] = useState(initialData.memorization || '');
  const [review, setReview] = useState(initialData.review || '');
  const [rating, setRating] = useState(initialData.rating || 5);
  const [notes, setNotes] = useState(initialData.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const attendanceData = {
        student_id: student.id,
        date: new Date().toISOString().split('T')[0],
        status,
        memorization,
        review,
        rating,
        notes,
      };
      await onSaveAttendance(attendanceData);
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
    setIsSaving(false);
  };

  const handleSendWhatsApp = () => {
    if (!student.phone) return;
    
    const cleanPhone = student.phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
    
    const message = `تقرير الطالب: ${formatName(student.name)}
حالة الحضور: ${status === 'present' ? 'حاضر ✅' : status === 'absent' ? 'غائب ❌' : 'مستأذن ⚠️'}
الحفظ: ${memorization || 'لم يتم التحديد'}
المراجعة: ${review || 'لم يتم التحديد'}
التقييم: ${'⭐'.repeat(rating)}
ملاحظات: ${notes || 'لا يوجد'}`;

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-dark-card border border-appBorder-card rounded-2xl p-5 space-y-4 backdrop-blur-sm transition-all hover:border-appBorder-hover">
      {/* هيدر الطالب */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-appBorder-card pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-dark-input border border-appBorder-input flex items-center justify-center text-appText-sub font-medium overflow-hidden shrink-0">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-appText-main">{formatName(student.name)}</h3>
            <p className="text-xs text-appText-sub">{student.halaqa_name || 'حلقة غير محددة'}</p>
          </div>
        </div>

        {/* خيارات تحديد الحضور والغياب */}
        <div className="flex items-center gap-1.5 bg-dark-input/60 p-1 rounded-xl border border-appBorder-input">
          <button
            type="button"
            onClick={() => setStatus('present')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              status === 'present' 
                ? 'bg-brandEmerald-bg text-brandEmerald border border-brandEmerald-border' 
                : 'text-appText-sub hover:text-appText-main'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            حاضر
          </button>

          <button
            type="button"
            onClick={() => setStatus('absent')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              status === 'absent' 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                : 'text-appText-sub hover:text-appText-main'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            غائب
          </button>

          <button
            type="button"
            onClick={() => setStatus('excused')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              status === 'excused' 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                : 'text-appText-sub hover:text-appText-main'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            مستأذن
          </button>
        </div>
      </div>

      {/* تفاصيل الورد والتسميع (تظهر فقط عند الحضور) */}
      {status === 'present' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs text-appText-sub mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              الحفظ الجديد
            </label>
            <input
              type="text"
              value={memorization}
              onChange={(e) => setMemorization(e.target.value)}
              placeholder="مثال: سورة البقرة من آية 1 إلى 15"
              className="w-full px-3 py-2 bg-dark-input border border-appBorder-input rounded-xl text-appText-main text-xs placeholder-appText-muted focus:outline-none focus:border-appBorder-hover transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-appText-sub mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              المراجعة
            </label>
            <input
              type="text"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="مثال: الجزء الأول كاملاً"
              className="w-full px-3 py-2 bg-dark-input border border-appBorder-input rounded-xl text-appText-main text-xs placeholder-appText-muted focus:outline-none focus:border-appBorder-hover transition-colors"
            />
          </div>
        </div>
      )}

      {/* التقييم بالنجوم والملاحظات */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-appText-sub ml-2">التقييم:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-0.5 focus:outline-none transition-transform active:scale-125"
            >
              <Star 
                className={`w-4 h-4 ${
                  star <= rating ? 'text-amber-400 fill-amber-400' : 'text-appText-muted'
                }`} 
              />
            </button>
          ))}
        </div>

        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="ملاحظات حول أدائه اليوم..."
          className="flex-1 w-full px-3 py-1.5 bg-dark-input border border-appBorder-input rounded-xl text-appText-main text-xs placeholder-appText-muted focus:outline-none focus:border-appBorder-hover transition-colors"
        />
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-appBorder-card">
        {student.phone && (
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brandEmerald-bg text-brandEmerald hover:bg-brandEmerald/20 border border-brandEmerald-border rounded-xl text-xs font-medium transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            إرسال للواتساب
          </button>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary-hover text-appText-main rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-glow disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'جاري الحفظ...' : 'حفظ التقييم'}
        </button>
      </div>
    </div>
  );
};

export default StudentAttendanceCard;
