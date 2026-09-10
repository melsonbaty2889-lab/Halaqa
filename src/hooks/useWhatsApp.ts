import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

// ── Interfaces ──────────────────────────────────────────────────

export interface SendReportPayload {
  studentName: string;
  phone: string;
  date: string;
  attendanceStatus: string;
  newMemorization?: string;
  retentionAssignment?: string;
  grade?: string | number;
  notes?: string;
  teacherName?: string;
  academyName?: string;
}

export interface UseWhatsAppReturn {
  sending: boolean;
  formatPhoneNumber: (phone: string, defaultCountryCode?: string) => string;
  generateReportMessage: (payload: SendReportPayload) => string;
  sendCustomMessage: (phone: string, message: string) => void;
  sendDailyReport: (payload: SendReportPayload) => void;
  sendReportByStudentId: (
    studentId: string,
    payload: Omit<SendReportPayload, 'phone' | 'studentName'>
  ) => Promise<void>;
  buildWhatsAppLink: (phone: string, message: string) => string;
}

// Helper لفك تشفير اسم الطالب إذا كان مخزناً كـ JSONB أو string
const extractName = (nameData: any, lang: string = 'ar'): string => {
  if (!nameData) return '';
  if (typeof nameData === 'string') {
    try {
      const parsed = JSON.parse(nameData);
      return parsed[lang] || parsed.ar || parsed.en || nameData;
    } catch {
      return nameData;
    }
  }
  if (typeof nameData === 'object') {
    return nameData[lang] || nameData.ar || nameData.en || Object.values(nameData)[0] || '';
  }
  return String(nameData);
};

// ── Main Hook ───────────────────────────────────────────────────

export function useWhatsApp(): UseWhatsAppReturn {
  const { t, i18n } = useTranslation();
  const [sending, setSending] = useState<boolean>(false);

  // 1. تنظيف وتنسيق رقم الهاتف بالصيغة الدولية
  const formatPhoneNumber = useCallback((phone: string, defaultCountryCode: string = '20'): string => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, ''); // إزالة المسافات والأقواس والرموز

    if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2);
    }

    if (cleaned.startsWith('0')) {
      cleaned = defaultCountryCode + cleaned.substring(1);
    }

    return cleaned;
  }, []);

  // 2. بناء رابط الواتساب Direct Link
  const buildWhatsAppLink = useCallback(
    (phone: string, message: string): string => {
      const formattedPhone = formatPhoneNumber(phone);
      const encodedMessage = encodeURIComponent(message);
      return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    },
    [formatPhoneNumber]
  );

  // 3. صياغة قالب التقرير اليومي مطبقاً نصوص الواجهة والترجمة
  const generateReportMessage = useCallback(
    (payload: SendReportPayload): string => {
      const {
        studentName,
        date,
        attendanceStatus,
        newMemorization,
        retentionAssignment,
        grade,
        notes,
        teacherName,
        academyName,
      } = payload;

      const title = academyName || t('whatsapp.report_title', 'الحلقة الذكية');

      let body = `*📖 تقرير الحفظ والمتابعة اليومي - ${title}*\n`;
      body += `------------------------------------\n`;
      body += `👤 *${t('student.name', 'الطالب')}:* ${studentName}\n`;
      body += `📅 *${t('common.date', 'التاريخ')}:* ${date}\n`;
      body += `📌 *${t('attendance.status', 'حالة الحضور')}:* ${attendanceStatus}\n`;

      if (newMemorization) {
        body += `✨ *${t('attendance.new_memorization', 'الحفظ الجديد')}:* ${newMemorization}\n`;
      }

      if (retentionAssignment) {
        body += `🔄 *${t('attendance.retention', 'المراجعة')}:* ${retentionAssignment}\n`;
      }

      if (grade !== undefined && grade !== null && grade !== '') {
        body += `⭐ *${t('attendance.grade', 'التقييم')}:* ${grade}\n`;
      }

      if (notes) {
        body += `📝 *${t('common.notes', 'ملاحظات المعلم')}:* ${notes}\n`;
      }

      if (teacherName) {
        body += `👨‍🏫 *${t('teacher.name', 'المعلم')}:* ${teacherName}\n`;
      }

      body += `------------------------------------\n`;
      body += `${t('whatsapp.footer', 'نسأل الله أن يبارك في وقته وحفظه. 🌹')}`;

      return body;
    },
    [t]
  );

  // 4. فتح الواتساب للإرسال
  const sendCustomMessage = useCallback(
    (phone: string, message: string) => {
      if (!phone || !message) return;
      setSending(true);

      try {
        const link = buildWhatsAppLink(phone, message);
        window.open(link, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Error opening WhatsApp:', error);
      } finally {
        setSending(false);
      }
    },
    [buildWhatsAppLink]
  );

  // 5. إرسال التقرير بحمولة جاهزة
  const sendDailyReport = useCallback(
    (payload: SendReportPayload) => {
      if (!payload.phone) return;
      const message = generateReportMessage(payload);
      sendCustomMessage(payload.phone, message);
    },
    [generateReportMessage, sendCustomMessage]
  );

  // 6. جلب بيانات الطالب ورقم ولي أمره مباشرة من Supabase (مطابق تماماً لجدول students عندك)
  const sendReportByStudentId = useCallback(
    async (
      studentId: string,
      payload: Omit<SendReportPayload, 'phone' | 'studentName'>
    ) => {
      if (!studentId) return;
      setSending(true);

      try {
        // الاستعلام من جدول students مع مطابقة حقول parent_whatsapp و parent_phone و name (jsonb)
        const { data: student, error } = await supabase
          .from('students')
          .select('name, parent_whatsapp, parent_phone')
          .eq('id', studentId)
          .single();

        if (error || !student) {
          throw new Error(error?.message || 'لم يتم العثور على بيانات الطالب');
        }

        // اختيار الرقم المتاح (الأولوية لـ parent_whatsapp ثم parent_phone)
        const phone = student.parent_whatsapp || student.parent_phone;
        if (!phone) {
          alert('لا يوجد رقم واتساب أو هاتف مسجل لولي أمر هذا الطالب.');
          return;
        }

        const currentLang = i18n.language || 'ar';
        const parsedStudentName = extractName(student.name, currentLang);

        const fullPayload: SendReportPayload = {
          ...payload,
          studentName: parsedStudentName,
          phone,
        };

        const message = generateReportMessage(fullPayload);
        sendCustomMessage(phone, message);
      } catch (err) {
        console.error('Failed to send report via Student ID:', err);
      } finally {
        setSending(false);
      }
    },
    [generateReportMessage, sendCustomMessage, i18n.language]
  );

  return {
    sending,
    formatPhoneNumber,
    generateReportMessage,
    sendCustomMessage,
    sendDailyReport,
    sendReportByStudentId,
    buildWhatsAppLink,
  };
}

export default useWhatsApp;
