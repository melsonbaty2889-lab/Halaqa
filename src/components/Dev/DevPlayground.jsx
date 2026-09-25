// src/components/Dev/DevPlayground.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// 1. استيرادات المكونات الذرية
import AppBrand from '@/components/UI/AppBrand';
import { PrimaryButton, GoogleButton } from '@/components/UI/AuthButtons';
import Badge from '@/components/UI/Badge';
import Btn from '@/components/UI/Btn';
import Card from '@/components/UI/Card';
import CountrySelect from '@/components/UI/CountrySelect';
import CustomDatePicker from '@/components/UI/CustomDatePicker';
import EmptyState from '@/components/UI/EmptyState';
import Input from '@/components/UI/Input';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import LoadingButton from '@/components/UI/LoadingButton';
import PageHeader from '@/components/UI/PageHeader';
import Select from '@/components/UI/Select';
import Skeleton from '@/components/UI/Skeleton';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import SplashScreen from '@/components/UI/SplashScreen';
import Table, { THead, TBody, TR, TH, TD } from '@/components/UI/Table';
import Toast from '@/components/UI/Toast';

// 2. استيرادات النوافذ المنبثقة
import Modal from '@/components/UI/Modal';
import ConfirmModal from '@/components/UI/ConfirmModal';
import TermsModal from '@/components/UI/TermsModal';
import EditProfileModal from '@/components/Header/EditProfileModal';

// 3. الأيقونات
import { 
  Sparkles, 
  MousePointerClick, 
  Layout, 
  Bookmark, 
  Shield, 
  Activity, 
  Table as TableIcon,
  UserCheck,
  Plus,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Globe,
  Layers
} from 'lucide-react';

export default function DevPlayground() {
  const { t, i18n } = useTranslation();

  // حالة التبويب النشط لمناطق المعاينة
  const [activeTab, setActiveTab] = useState('ui-elements');

  // حالات النوافذ المنبثقة
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  // حالات نماذج البيانات والإدخال
  const [inputValue, setInputValue] = useState('');
  const [selectedValue, setSelectedValue] = useState('1');
  const [countryValue, setCountryValue] = useState('+966');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // حالة التنبيه المباشر
  const [activeToast, setActiveToast] = useState({
    type: 'info',
    message: 'تنبيه تفاعلي في بيئة الاختبار'
  });

  const sampleUser = {
    name: 'محمد السنباطي',
    email: 'm89elsonbaty89@gmail.com',
    phone: '+966500000000'
  };

  const tableData = [
    { id: 1, name: 'أحمد علي', role: 'معلم قرآن', status: 'نشط', variant: 'success' },
    { id: 2, name: 'محمود حسن', role: 'طالب', status: 'قيد الانتظار', variant: 'warning' },
    { id: 3, name: 'سارة إبراهيم', role: 'ولي أمر', status: 'متوقف', variant: 'danger' },
  ];

  if (showSplash) {
    return (
      <div className="relative h-screen">
        <SplashScreen lang={i18n.language} onFinish={() => setShowSplash(false)} />
        <button 
          onClick={() => setShowSplash(false)}
          className="fixed bottom-5 right-5 z-[10000] px-5 py-2.5 rounded-xl bg-semantic-surfaceCard border border-semantic-borderCard text-semantic-textPrimary font-bold text-xs shadow-2xl hover:bg-semantic-surfaceInput transition-colors cursor-pointer"
        >
          {t('dev.close_splash', 'إغلاق SplashScreen')}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      
      {/* الهيدر الرئيسي لمعرض الكود */}
      <PageHeader 
        title={t('dev.title', 'معرض ومختبر جميع مكونات المنظومة (Dev Playground)')} 
        sub={t('dev.sub', 'بيئة موحدة لاختبار كافة عناصر المشروع والتأكد من التنسيقات والألوان متعدده اللغات')}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Btn variant="outline" size="sm" onClick={() => setShowSplash(true)}>
              معاينة SplashScreen
            </Btn>
            <Btn variant="primary" size="sm" startIcon={<UserCheck size={16} />} onClick={() => setIsEditProfileOpen(true)}>
              معاينة تعديل الملف الشخصي
            </Btn>
          </div>
        }
      />

      {/* شريط تبويب الأقسام الرئيسية */}
      <div className="flex items-center gap-2 border-b border-semantic-borderCard pb-3 overflow-x-auto">
        <Btn 
          variant={activeTab === 'ui-elements' ? 'primary' : 'ghost'} 
          size="sm" 
          startIcon={<Layers size={16} />}
          onClick={() => setActiveTab('ui-elements')}
        >
          عناصر الواجهة والمدخلات
        </Btn>
        <Btn 
          variant={activeTab === 'modals' ? 'primary' : 'ghost'} 
          size="sm" 
          startIcon={<Sparkles size={16} />}
          onClick={() => setActiveTab('modals')}
        >
          النوافذ والـ Modals
        </Btn>
        <Btn 
          variant={activeTab === 'system-states' ? 'primary' : 'ghost'} 
          size="sm" 
          startIcon={<Activity size={16} />}
          onClick={() => setActiveTab('system-states')}
        >
          حالات النظام والجداول
        </Btn>
      </div>

      {/* ==================== 1. عناصر الواجهة والمدخلات ==================== */}
      {activeTab === 'ui-elements' && (
        <div className="flex flex-col gap-6">

          {/* الهوية والشعارات واللغات */}
          <Card className="border border-semantic-borderCard bg-semantic-surfaceCard rounded-2xl shadow-sm">
            <Card.Header className="p-4 border-b border-semantic-borderCard">
              <h3 className="m-0 text-sm sm:text-base font-bold flex items-center gap-2 text-semantic-actionPrimary">
                <Sparkles size={18} />
                <span>1. الهوية والشعارات متعددة اللغات (AppBrand & LanguageSwitcher)</span>
              </h3>
            </Card.Header>
            <Card.Body className="p-4 sm:p-6">
              <div className="flex flex-wrap gap-8 items-center">
                <div>
                  <p className="text-xs text-semantic-textSecondary mb-2 font-medium">شعار AppBrand:</p>
                  <AppBrand />
                </div>
                <div>
                  <p className="text-xs text-semantic-textSecondary mb-2 font-medium">شعار SmartHalaqaProLogo:</p>
                  <SmartHalaqaProLogo size={40} />
                </div>
                <div>
                  <p className="text-xs text-semantic-textSecondary mb-2 font-medium">محول اللغات (LanguageSwitcher):</p>
                  <LanguageSwitcher />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* الأزرار والإجراءات */}
          <Card className="border border-semantic-borderCard bg-semantic-surfaceCard rounded-2xl shadow-sm">
            <Card.Header className="p-4 border-b border-semantic-borderCard">
              <h3 className="m-0 text-sm sm:text-base font-bold flex items-center gap-2 text-semantic-actionPrimary">
                <MousePointerClick size={18} />
                <span>2. الأزرار وحقول الإجراءات الموحدة (Btn & AuthButtons)</span>
              </h3>
            </Card.Header>
            <Card.Body className="p-4 sm:p-6 flex flex-col gap-5">
              <div className="flex flex-wrap gap-2.5 items-center">
                <Btn variant="primary">Btn Primary</Btn>
                <Btn variant="secondary">Btn Secondary</Btn>
                <Btn variant="outline">Btn Outline</Btn>
                <Btn variant="danger">Btn Danger</Btn>
                <Btn variant="ghost">Btn Ghost</Btn>
                <LoadingButton loading={true}>جاري التحميل...</LoadingButton>
              </div>

              <div className="pt-3 border-t border-semantic-borderCard">
                <p className="text-xs text-semantic-textSecondary mb-2.5 font-medium">أزرار المصادقة والدخول:</p>
                <div className="flex flex-wrap gap-3 items-center">
                  <PrimaryButton className="w-auto px-6">تسجيل الدخول</PrimaryButton>
                  <GoogleButton />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* حقول الإدخال والانتخاب والتقويم */}
          <Card className="border border-semantic-borderCard bg-semantic-surfaceCard rounded-2xl shadow-sm">
            <Card.Header className="p-4 border-b border-semantic-borderCard">
              <h3 className="m-0 text-sm sm:text-base font-bold flex items-center gap-2 text-semantic-actionPrimary">
                <Layout size={18} />
                <span>3. حقول الإدخال والقوائم والتقويم (Inputs & Selects)</span>
              </h3>
            </Card.Header>
            <Card.Body className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input 
                  label="حقل Input عادي" 
                  placeholder="أدخل نصاً هنا..." 
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

              <div className="max-w-md pt-2">
                <CustomDatePicker 
                  label="اختيار التاريخ (CustomDatePicker)"
                  value={selectedDate}
                  onChange={setSelectedDate}
                />
              </div>
            </Card.Body>
          </Card>

          {/* الشارات والتنبيهات */}
          <Card className="border border-semantic-borderCard bg-semantic-surfaceCard rounded-2xl shadow-sm">
            <Card.Header className="p-4 border-b border-semantic-borderCard">
              <h3 className="m-0 text-sm sm:text-base font-bold flex items-center gap-2 text-semantic-actionPrimary">
                <Bookmark size={18} />
                <span>4. الشارات والتنبيهات المباشرة (Badge & Toast)</span>
              </h3>
            </Card.Header>
            <Card.Body className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap gap-3 items-center">
                <Badge>افتراضي</Badge>
                <Badge variant="success"><CheckCircle2 size={13} /> <span>مكتمل</span></Badge>
                <Badge variant="danger"><AlertCircle size={13} /> <span>ملغى</span></Badge>
                <Badge variant="warning"><AlertTriangle size={13} /> <span>قيد الانتظار</span></Badge>
              </div>

              <div className="pt-3 border-t border-semantic-borderCard space-y-3">
                <p className="text-xs text-semantic-textSecondary font-medium">مكون Toast التفاعلي:</p>
                <div className="flex flex-wrap gap-2">
                  <Btn size="sm" variant="outline" onClick={() => setActiveToast({ type: 'success', message: 'تمت العملية بنجاح!' })}>نجاح</Btn>
                  <Btn size="sm" variant="outline" onClick={() => setActiveToast({ type: 'danger', message: 'حدث خطأ غير متوقع!' })}>خطأ</Btn>
                  <Btn size="sm" variant="outline" onClick={() => setActiveToast({ type: 'warning', message: 'تحذير: البيانات قد لا تحفظ!' })}>تحذير</Btn>
                  <Btn size="sm" variant="outline" onClick={() => setActiveToast({ type: 'info', message: 'معلومة: تم التحديث.' })}>معلومات</Btn>
                </div>
                <Toast type={activeToast.type} message={activeToast.message} />
              </div>
            </Card.Body>
          </Card>

        </div>
      )}

      {/* ==================== 2. النوافذ والـ Modals ==================== */}
      {activeTab === 'modals' && (
        <Card className="border border-semantic-borderCard bg-semantic-surfaceCard rounded-2xl shadow-sm">
          <Card.Header className="p-4 border-b border-semantic-borderCard">
            <h3 className="m-0 text-sm sm:text-base font-bold flex items-center gap-2 text-semantic-actionPrimary">
              <Shield size={18} />
              <span>اختبار معاينة جميع النوافذ المنبثقة (Modals & Dialogs)</span>
            </h3>
          </Card.Header>
          <Card.Body className="p-4 sm:p-6 flex flex-wrap gap-3">
            <Btn variant="primary" onClick={() => setIsEditProfileOpen(true)} startIcon={<UserCheck size={16} />}>
              معاينة EditProfileModal
            </Btn>
            <Btn variant="outline" onClick={() => setIsModalOpen(true)} startIcon={<Plus size={16} />}>
              معاينة Modal العادي
            </Btn>
            <Btn variant="outline" onClick={() => setIsConfirmOpen(true)} startIcon={<AlertCircle size={16} />}>
              معاينة ConfirmModal
            </Btn>
            <Btn variant="outline" onClick={() => setIsTermsOpen(true)} startIcon={<Shield size={16} />}>
              معاينة TermsModal
            </Btn>
          </Card.Body>
        </Card>
      )}

      {/* ==================== 3. حالات النظام والجداول ==================== */}
      {activeTab === 'system-states' && (
        <div className="flex flex-col gap-6">
          <Card className="border border-semantic-borderCard bg-semantic-surfaceCard rounded-2xl shadow-sm">
            <Card.Header className="p-4 border-b border-semantic-borderCard">
              <h3 className="m-0 text-sm sm:text-base font-bold flex items-center gap-2 text-semantic-actionPrimary">
                <Activity size={18} />
                <span>حالات تحميل الهيكل العظمي والحالة الفارغة (Skeleton & EmptyState)</span>
              </h3>
            </Card.Header>
            <Card.Body className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-semantic-textSecondary mb-3 font-medium">تحميل Skeleton:</p>
                <div className="flex flex-col gap-2.5">
                  <Skeleton width="100%" height="24px" />
                  <Skeleton width="80%" height="18px" />
                  <Skeleton width="60%" height="18px" />
                </div>
              </div>

              <div>
                <p className="text-xs text-semantic-textSecondary mb-3 font-medium">الحالة الفارغة EmptyState:</p>
                <EmptyState 
                  icon={<Inbox size={32} />}
                  title="لا توجد بيانات حالياً"
                  description="مكون EmptyState الموحد لاستخدامه في القوائم والجداول الفارغة."
                />
              </div>
            </Card.Body>
          </Card>

          <Card className="border border-semantic-borderCard bg-semantic-surfaceCard rounded-2xl shadow-sm overflow-hidden">
            <Card.Header className="p-4 border-b border-semantic-borderCard">
              <h3 className="m-0 text-sm sm:text-base font-bold flex items-center gap-2 text-semantic-actionPrimary">
                <TableIcon size={18} />
                <span>جداول البيانات (Table)</span>
              </h3>
            </Card.Header>
            <Card.Body className="p-0 overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>المعرف</TH>
                    <TH>الاسم</TH>
                    <TH>الدور</TH>
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
      )}

      {/* ==================== النوافذ التفاعلية المنبثقة ==================== */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={sampleUser}
        onSave={async (updatedData) => {
          setActiveToast({ type: 'success', message: 'تم تحديث بيانات الملف الشخصي بنجاح!' });
        }}
      />

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="نافذة Modal عامة">
        <p className="text-sm text-semantic-textSecondary leading-relaxed">
          هذا نموذج تجريبي للمكون الأساسي `Modal.jsx`.
        </p>
        <div className="flex justify-end gap-2.5 mt-5">
          <Btn variant="outline" onClick={() => setIsModalOpen(false)}>إلغاء</Btn>
          <Btn variant="primary" onClick={() => setIsModalOpen(false)}>موافقة</Btn>
        </div>
      </Modal>

      <ConfirmModal 
        open={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={() => {
          setIsConfirmOpen(false);
          setActiveToast({ type: 'success', message: 'تم تأكيد الإجراء بنجاح.' });
        }}
        title="تأكيد العملية"
        message="هل أنت متأكد من تنفيذ هذا الإجراء في بيئة المعاينة؟"
      />

      <TermsModal 
        open={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)} 
      />

    </div>
  );
}
