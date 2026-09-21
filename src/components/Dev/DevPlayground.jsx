import React, { useState } from 'react';
import { 
  AppBrand,
  PrimaryButton,
  GoogleButton,
  Badge, 
  Btn, 
  Card, 
  ConfirmModal,
  CountrySelect,
  CustomDatePicker,
  DatePickerDaysGrid,
  DatePickerHeader,
  EmptyState,
  Input, 
  LanguageSwitcher,
  LoadingButton,
  Modal, 
  PageHeader,
  Select, 
  Skeleton,
  SmartHalaqaProLogo,
  SplashScreen,
  Table, THead, TBody, TR, TH, TD,
  TermsModal,
  Toast
} from '@/components/UI';
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
    { id: 1, name: 'محمد علي', role: 'مطور واجهات', status: 'نشط', color: 'var(--color-success)' },
    { id: 2, name: 'أحمد محمود', role: 'مصمم UI/UX', status: 'قيد الانتظار', color: 'var(--color-warning)' },
    { id: 3, name: 'سارة خالد', role: 'مدير مشروع', status: 'متوقف', color: 'var(--color-danger)' },
  ];

  if (showSplash) {
    return (
      <div style={{ position: 'relative', height: '100vh' }}>
        <SplashScreen />
        <button 
          onClick={() => setShowSplash(false)}
          style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 10000, padding: '10px 20px', borderRadius: 8, background: '#fff', border: 'none', cursor: 'pointer' }}
        >
          إغلاق شاشة التحميل (SplashScreen)
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', fontFamily: 'inherit' }}>
      
      {/* 1. PageHeader */}
      <PageHeader 
        title="معرض جميع مكونات UI (Dev Playground)" 
        sub="صفحة شاملة لاختبار ومعاينة 23 مكوناً من المكونات المفصولة"
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn variant="outline" size="sm" onClick={() => setShowSplash(true)}>عرض SplashScreen</Btn>
            <Btn variant="outline" size="sm" onClick={() => setIsConfirmOpen(true)}>ConfirmModal</Btn>
            <Btn variant="primary" size="sm" startIcon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
              Modal
            </Btn>
          </div>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* 2. الهوية والعلامة التجارية (AppBrand & Logos) */}
        <Card>
          <Card.Header>
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-action-primary)' }}>
              <Sparkles size={18} /> 1. الهوية والشعارات (AppBrand, SmartHalaqaProLogo, LanguageSwitcher)
            </h3>
          </Card.Header>
          <Card.Body>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>AppBrand:</p>
                <AppBrand />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>SmartHalaqaProLogo:</p>
                <SmartHalaqaProLogo size={40} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>LanguageSwitcher:</p>
                <LanguageSwitcher />
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* 3. شارات الحالة والتنبيهات (Badge & Toast) */}
        <Card>
          <Card.Header>
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-action-primary)' }}>
              <Bookmark size={18} /> 2. الشارات والتنبيهات (Badge & Toast)
            </h3>
          </Card.Header>
          <Card.Body style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <Badge>افتراضي</Badge>
              <Badge color="var(--color-success)">
                <CheckCircle2 size={14} /> <span>مكتمل</span>
              </Badge>
              <Badge color="var(--color-danger)">
                <AlertCircle size={14} /> <span>ملغى</span>
              </Badge>
              <Badge color="var(--color-warning)">
                <AlertTriangle size={14} /> <span>قيد الانتظار</span>
              </Badge>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>مكون Toast:</p>
              <Toast type="info" message="هذا تنبيه تجريبي لمعاينة مكون Toast" />
            </div>
          </Card.Body>
        </Card>

                {/* 4. الأزرار وتسجيل الدخول (Btn, LoadingButton, AuthButtons) */}
        <Card>
          <Card.Header>
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-action-primary)' }}>
              <MousePointerClick size={18} /> 3. الأزرار وحقول الإجراءات (Btn, LoadingButton, PrimaryButton, GoogleButton)
            </h3>
          </Card.Header>
          <Card.Body style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <Btn variant="primary">Btn Primary</Btn>
              <Btn variant="outline">Btn Outline</Btn>
              <LoadingButton loading={true}>زر جاري التحميل</LoadingButton>
              <Btn variant="ghost" onClick={() => setIsTermsOpen(true)} startIcon={<Shield size={16} />}>
                عرض TermsModal
              </Btn>
            </div>

            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 10 }}>أزرار المصادقة (PrimaryButton & GoogleButton):</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <PrimaryButton>تسجيل الدخول</PrimaryButton>
                <GoogleButton />
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* 5. حقول الإدخال والانتخاب المتقدمة (Input, Select, CountrySelect) */}
        <Card>
          <Card.Header>
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-action-primary)' }}>
              <Layout size={18} /> 4. حقول القوائم والإدخال (Input, Select, CountrySelect)
            </h3>
          </Card.Header>
          <Card.Body>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
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
        <Card>
          <Card.Header>
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-action-primary)' }}>
              <Calendar size={18} /> 5. أدوات التقويم (CustomDatePicker, DatePickerHeader, DatePickerDaysGrid)
            </h3>
          </Card.Header>
          <Card.Body>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>مكون CustomDatePicker كامل:</p>
                <CustomDatePicker 
                  label="اختر التاريخ"
                  value={selectedDate}
                  onChange={setSelectedDate}
                />
              </div>

              <div style={{ border: '1px dashed var(--color-border-input)', padding: 12, borderRadius: 12 }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>مكونات DatePicker الفرعية معروضة مباشرة:</p>
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
        <Card>
          <Card.Header>
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-action-primary)' }}>
              <Activity size={18} /> 6. حالات الواجهة (Skeleton & EmptyState)
            </h3>
          </Card.Header>
          <Card.Body style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>تحميل Skeleton:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Skeleton width="100%" height="20px" />
                <Skeleton width="75%" height="20px" />
                <Skeleton width="40%" height="20px" />
              </div>
            </div>

            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>الحالة الفارغة EmptyState:</p>
              <EmptyState 
                icon={<Inbox size={28} />}
                title="لا توجد بيانات"
                description="مكون EmptyState للاستعراض."
              />
            </div>
          </Card.Body>
        </Card>

        {/* 8. الجدول (Table, THead, TBody, TR, TH, TD) */}
        <Card>
          <Card.Header>
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-action-primary)' }}>
              <TableIcon size={18} /> 7. الجداول (Table)
            </h3>
          </Card.Header>
          <Card.Body style={{ padding: 0 }}>
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
                    <TD><Badge color={row.color}>{row.status}</Badge></TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card.Body>
        </Card>

      </div>

      {/* 9. النوافذ المنبثقة (Modal, ConfirmModal, TermsModal) */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="نافذة Modal العادية">
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          هذا محتوى النافذة المنبثقة العادية المفصولة في ملف Modal.jsx.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
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
