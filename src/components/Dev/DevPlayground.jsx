// src/components/Dev/DevPlayground.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// استيرادات مباشرة لمنع الحلقات التداخلية (Circular Dependency)
import AppBrand from '@/components/UI/AppBrand';
import { PrimaryButton, GoogleButton } from '@/components/UI/AuthButtons';
import Badge from '@/components/UI/Badge';
import Btn from '@/components/UI/Btn';
import Card from '@/components/UI/Card';
import ConfirmModal from '@/components/UI/ConfirmModal';
import CountrySelect from '@/components/UI/CountrySelect';
import CustomDatePicker from '@/components/UI/CustomDatePicker';
import DatePickerDaysGrid from '@/components/UI/DatePickerDaysGrid';
import DatePickerHeader from '@/components/UI/DatePickerHeader';
import EmptyState from '@/components/UI/EmptyState';
import Input from '@/components/UI/Input';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import LoadingButton from '@/components/UI/LoadingButton';
import Modal from '@/components/UI/Modal';
import PageHeader from '@/components/UI/PageHeader';
import Select from '@/components/UI/Select';
import Skeleton from '@/components/UI/Skeleton';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import SplashScreen from '@/components/UI/SplashScreen';
import Table, { THead, TBody, TR, TH, TD } from '@/components/UI/Table';
import TermsModal from '@/components/UI/TermsModal';
import Toast from '@/components/UI/Toast';

import { 
  Bookmark, 
  MousePointerClick, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Table as TableIcon,
  Layout,
  Sparkles,
  Inbox,
  Calendar,
  Shield,
  Activity
} from 'lucide-react';

export default function DevPlayground() {
  const { t } = useTranslation();

  // الحالات الخاصة بالسناريوهات والتفاعلات
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  
  const [inputValue, setInputValue] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [countryValue, setCountryValue] = useState('EG');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const tableData = [
    { id: 1, name: 'محمد علي', role: 'مطور واجهات', status: 'نشط', variant: 'success' },
    { id: 2, name: 'أحمد محمود', role: 'مصمم UI/UX', status: 'قيد الانتظار', variant: 'warning' },
    { id: 3, name: 'سارة خالد', role: 'مدير مشروع', status: 'متوقف', variant: 'danger' },
  ];

  if (showSplash) {
    return (
      <div className="relative h-screen">
        <SplashScreen />
        <button 
          onClick={() => setShowSplash(false)}
          className="fixed bottom-5 right-5 z-[10000] px-5 py-2.5 rounded-xl bg-semantic-surfaceCard border border-semantic-borderCard text-semantic-textPrimary font-bold text-xs shadow-2xl hover:bg-semantic-surfaceInput transition-colors cursor-pointer"
        >
          {t('dev.close_splash', 'إغلاق شاشة التحميل (SplashScreen)')}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      
      {/* 1. PageHeader */}
      <PageHeader 
        title={t('dev.title', 'معرض جميع مكونات UI (Dev Playground)')} 
        sub={t('dev.sub', 'صفحة شاملة لاختبار ومعاينة 23 مكوناً من المكونات المفصولة')}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Btn variant="outline" size="sm" onClick={() => setShowSplash(true)}>
              {t('dev.show_splash', 'عرض SplashScreen')}
            </Btn>
            <Btn variant="outline" size="sm" onClick={() => setIsConfirmOpen(true)}>
              ConfirmModal
            </Btn>
            <Btn variant="primary" size="sm" startIcon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
              Modal
            </Btn>
          </div>
        }
      />

      <div className="flex flex-col gap-6">

        {/* 2. الهوية والعلامة التجارية (AppBrand & Logos) */}
        <Card className="border border-semantic-borderCard bg-semantic-surfaceCard rounded-2xl shadow-sm">
          <Card.Header className="p-4 border-b border-semantic-borderCard">
            <h3 className="m-0 text-sm sm:text-base font-bold flex items-center gap-2 text-semantic-actionPrimary">
              <Sparkles size={18} />
              <span>1. الهوية والشعارات (AppBrand, SmartHalaqaProLogo, LanguageSwitcher)</span>
            </h3>
          </Card.Header>
          <Card.Body className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-6 items-center">
              <div>
                <p className="text-xs text-semantic-textSecondary mb-2 font-medium">AppBrand:</p>
                <AppBrand />
              </div>
              <div>
                <p className="text-xs text-semantic-textSecondary mb-2 font-medium">SmartHalaqaProLogo:</p>
                <SmartHalaqaProLogo size={40} />
              </div>
              <div>
                <p className="text-xs text-semantic-textSecondary mb-2 font-medium">LanguageSwitcher:</p>
                <LanguageSwitcher />
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* 3. شارات الحالة والتنبيهات (Badge & Toast) */}
        <Card className="border border-semantic-borderCard bg-semantic-surfaceCard rounded-2xl shadow-sm">
          <Card.Header className="p-4 border-b border-semantic-borderCard">
            <h3 className="m-0 text-sm sm:text-base font-bold flex items-center gap-2 text-semantic-actionPrimary">
              <Bookmark size={18} />
              <span>2. الشارات والتنبيهات (Badge & Toast)</span>
            </h3>
          </Card.Header>
          <Card.Body className="p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Badge>افتراضي</Badge>
              <Badge variant="success">
                <CheckCircle2 size={14} /> <span>مكتمل</span>
              </Badge>
              <Badge variant="danger">
                <AlertCircle size={14} /> <span>ملغى</span>
              </Badge>
              <Badge variant="warning">
                <AlertTriangle size={14} /> <span>قيد الانتظار</span>
              </Badge>
            </div>
            
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-xs text-semantic-textSecondary font-medium">مكون Toast:</p>
              <Toast type="info" message="هذا تنبيه تجريبي لمعاينة مكون Toast" />
            </div>
          </Card.Body>
        </Card>

        {/* 4. الأزرار وتسجيل الدخول (Btn, LoadingButton, AuthButtons) */}
        <Card className="border border-semantic-borderCard bg-semantic-surfaceCard rounded-2xl shadow-sm">
          <Card.Header className="p-4 border-b border-semantic-borderCard">
            <h3 className="m-0 text-sm sm:text-base font-bold flex items-center gap-2 text-semantic-actionPrimary">
              <MousePointerClick size={18} />
              <span>3. الأزرار وحقول الإجراءات (Btn, LoadingButton, PrimaryButton, GoogleButton)</span>
            </h3>
          </Card.Header>
          <Card.Body className="p-4 sm:p-6 flex flex-col gap-5">
            <div className="flex flex-wrap gap-2.5 items-center">
              <Btn variant="primary">Btn Primary</Btn>
              <Btn variant="outline">Btn Outline</Btn>
              <LoadingButton loading={true}>زر جاري التحميل</LoadingButton>
              <Btn variant="ghost" onClick={() => setIsTermsOpen(true)} startIcon={<Shield size={16} />}>
                عرض TermsModal
              </Btn>
            </div>

            <div>
              <p className="text-xs text-semantic-textSecondary mb-2.5 font-medium">أزرار المصادقة (PrimaryButton & GoogleButton):</p>
              <div className="flex flex-wrap gap-2.5 items-center">
                <PrimaryButton>تسجيل الدخول</PrimaryButton>
                <GoogleButton />
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* 5. حقول الإدخال والانتخاب المتقدمة (Input, Select, CountrySelect) */}
        <Card className="border border-semantic-borderCard bg-semantic-surfaceCard rounded-2xl shadow-sm">
          <Card.Header className="p-4 border-b border-semantic-borderCard">
            <h3 className="m-0 text-sm sm:text-base font-bold flex items-center gap-2 text-semantic-actionPrimary">
              <Layout size={18} />
              <span>4. حقول القوائم والإدخال (Input, Select, CountrySelect)</span>
            </h3>
          </Card.Header>
          <Card.Body className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input 
                label="حقل Input عادي" 
                placeholder="أدخل النص..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Select 
                label="حقل Select المنسدل"
                value={selectedValue}
                onChange={(val) => setSelectedValue(val)}
                options={[
                  { value: '1', label: 'الخيار الأول' },
                  { value: '2', label: 'الخيار الثاني' }
                ]}
              />
              <CountrySelect 
                label="اختيار الدولة (CountrySelect)"
                value={countryValue}
                onChange={setCountryValue}
              />
            </div>
          </Card.Body>
        </Card>

        {/* 6. تاريخ ووقت التقويم (CustomDatePicker, DatePickerHeader, DatePickerDaysGrid) */}
        <Card className="border border-semantic-borderCard bg-semantic-surfaceCard rounded-2xl shadow-sm">
          <Card.Header className="p-4 border-b border-semantic-borderCard">
            <h3 className="m-0 text-sm sm:text-base font-bold flex items-center gap-2 text-semantic-actionPrimary">
              <Calendar size={18} />
              <span>5. أدوات التقويم (CustomDatePicker, DatePickerHeader, DatePickerDaysGrid)</span>
            </h3>
          </Card.Header>
          <Card.Body className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-semantic-textSecondary mb-2 font-medium">مكون CustomDatePicker كامل:</p>
                <CustomDatePicker 
                  label="اختر التاريخ"
                  value={selectedDate}
                  onChange={setSelectedDate}
                />
              </div>

              <div className="border border-dashed border-semantic-borderInput p-3 rounded-xl bg-semantic-surfaceInput/30">
                <p className="text-xs text-semantic-textSecondary mb-2 font-medium">مكونات DatePicker الفرعية معروضة مباشرة:</p>
                <DatePickerHeader 
                  currentMonth={selectedDate} 
                  onPrevMonth={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                  onNextMonth={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                />
                <DatePickerDaysGrid 
                  currentMonth={selectedDate}
                  selectedDate={selectedDate}
                  onSelectDate={(d) => setSelectedDate(d)}
                />
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* 7. الهيكل العظمي والحالة الفارغة (Skeleton & EmptyState) */}
        <Card className="border border-semantic-borderCard bg-semantic-surfaceCard rounded-2xl shadow-sm">
          <Card.Header className="p-4 border-b border-semantic-borderCard">
            <h3 className="m-0 text-sm sm:text-base font-bold flex items-center gap-2 text-semantic-actionPrimary">
              <Activity size={18} />
              <span>6. حالات الواجهة (Skeleton & EmptyState)</span>
            </h3>
          </Card.Header>
          <Card.Body className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-semantic-textSecondary mb-3 font-medium">تحميل Skeleton:</p>
              <div className="flex flex-col gap-2">
                <Skeleton width="100%" height="20px" />
                <Skeleton width="75%" height="20px" />
                <Skeleton width="40%" height="20px" />
              </div>
            </div>

            <div>
              <p className="text-xs text-semantic-textSecondary mb-3 font-medium">الحالة الفارغة EmptyState:</p>
              <EmptyState 
                icon={<Inbox size={28} />}
                title="لا توجد بيانات"
                description="مكون EmptyState للاستعراض."
              />
            </div>
          </Card.Body>
        </Card>

        {/* 8. الجدول (Table, THead, TBody, TR, TH, TD) */}
        <Card className="border border-semantic-borderCard bg-semantic-surfaceCard rounded-2xl shadow-sm overflow-hidden">
          <Card.Header className="p-4 border-b border-semantic-borderCard">
            <h3 className="m-0 text-sm sm:text-base font-bold flex items-center gap-2 text-semantic-actionPrimary">
              <TableIcon size={18} />
              <span>7. الجداول (Table)</span>
            </h3>
          </Card.Header>
          <Card.Body className="p-0 overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>المعرف</TH>
                  <TH>الاسم</TH>
                  <TH>الوظيفة</TH>
                  <TH>الحالة</TH>
                </TR>
              </THead>
              <TBody>
                {tableData.map((row) => (
                  <TR key={row.id}>
                    <TD>{row.id}</TD>
                    <TD>{row.name}</TD>
                    <TD>{row.role}</TD>
                    <TD><Badge variant={row.variant}>{row.status}</Badge></TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card.Body>
        </Card>

      </div>

      {/* 9. النوافذ المنبثقة (Modal, ConfirmModal, TermsModal) */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="نافذة Modal العادية">
        <p className="text-sm text-semantic-textSecondary">
          هذا محتوى النافذة المنبثقة العادية المفصولة في ملف Modal.jsx.
        </p>
        <div className="flex justify-end gap-2.5 mt-5">
          <Btn variant="outline" onClick={() => setIsModalOpen(false)}>إلغاء</Btn>
          <Btn variant="primary" onClick={() => setIsModalOpen(false)}>تأكيد</Btn>
        </div>
      </Modal>

      <ConfirmModal 
        open={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={() => setIsConfirmOpen(false)}
        title="تأكيد العملية"
        message="هل أنت متأكد من تنفيذ هذا الإجراء؟"
      />

      <TermsModal 
        open={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)} 
      />

    </div>
  );
}
