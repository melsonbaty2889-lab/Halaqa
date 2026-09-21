import React, { useState } from 'react';
import { 
  Badge, 
  Btn, 
  Card, 
  Input, 
  Select, 
  Modal, 
  PageHeader 
} from '@/components/UI';
import { 
  Bookmark, 
  MousePointerClick, 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle 
} from 'lucide-react';

export default function DevPlayground() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedValue, setSelectedValue] = useState('');

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <PageHeader 
        title="معرض مكونات النظام (Dev Playground)" 
        sub="صفحة لاختبار ومعاينة مكونات الواجهة الموحدة وتصاميمها"
        action={
          <Btn variant="primary" startIcon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            فتح نافذة تجريبية
          </Btn>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* 1. قسم شارات الحالة (Badge) */}
        <Card>
          <Card.Header>
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-action-primary)' }}>
              <Bookmark size={18} /> تجربة شارات الحالة (Badge)
            </h3>
          </Card.Header>
          <Card.Body>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              {/* الشارة الافتراضية */}
              <Badge>شارة افتراضية</Badge>

              {/* شارة النجاح */}
              <Badge color="var(--color-success)">
                <CheckCircle2 size={14} />
                <span>نشط / مكتمل</span>
              </Badge>

              {/* شارة الخطأ / الخطر */}
              <Badge color="var(--color-danger)">
                <AlertCircle size={14} />
                <span>ملغى / متوقف</span>
              </Badge>

              {/* شارة التحذير */}
              <Badge color="var(--color-warning)">
                <AlertTriangle size={14} />
                <span>قيد الانتظار</span>
              </Badge>
            </div>
          </Card.Body>
        </Card>

        {/* 2. قسم الزر الموحد (Btn / Button) */}
        <Card>
          <Card.Header>
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-action-primary)' }}>
              <MousePointerClick size={18} /> تجربة الزر الموحد (Btn)
            </h3>
          </Card.Header>
          <Card.Body style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* الأنواع (Variants) */}
            <div>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                الأنواع المختلفة (Variants):
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <Btn variant="primary">رئيسي (Primary)</Btn>
                <Btn variant="emerald">زمردي (Emerald)</Btn>
                <Btn variant="secondary">ثانوي (Secondary)</Btn>
                <Btn variant="outline">مُحدد (Outline)</Btn>
                <Btn variant="ghost">شفاف (Ghost)</Btn>
                <Btn variant="danger">تنبيه/خطر (Danger)</Btn>
                <Btn variant="success">نجاح (Success)</Btn>
                <Btn variant="failed">فشل (Failed)</Btn>
                <Btn variant="google">جوجل (Google)</Btn>
              </div>
            </div>

            {/* الأحجام (Sizes) */}
            <div>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                الأحجام المتاحة (Sizes):
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <Btn size="sm">صغير (sm)</Btn>
                <Btn size="md">متوسط (md)</Btn>
                <Btn size="lg">كبير (lg)</Btn>
              </div>
            </div>

            {/* الأيقونات والحالات (Icons & States) */}
            <div>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                الأيقونات والحالات الخاصة (Icons & States):
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <Btn startIcon={<Plus size={16} />}>أيقونة بداية</Btn>
                <Btn endIcon={<ArrowLeft size={16} />}>أيقونة نهاية</Btn>
                <Btn loading>جاري التحميل</Btn>
                <Btn disabled>زر معطل</Btn>
              </div>
            </div>

          </Card.Body>
        </Card>

        {/* 3. قسم حقول الإدخال والقوائم */}
        <Card>
          <Card.Header>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-action-primary)' }}>
              حقول الإدخال والقوائم المنسدلة
            </h3>
          </Card.Header>
          <Card.Body>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <Input 
                label="الاسم الكامل" 
                placeholder="أدخل اسمك هنا..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Select 
                label="اختر الخيار المناسب"
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                options={[
                  { value: '1', label: 'الخيار الأول' },
                  { value: '2', label: 'الخيار الثاني' },
                  { value: '3', label: 'الخيار الثالث' }
                ]}
              />
            </div>
          </Card.Body>
        </Card>

      </div>

      {/* النافذة المنبثقة التجريبية */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="نافذة معاينة تجريبية">
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
          هذه نافذة منبثقة ملحقة بـ UI UI kit لتجربة الاستجابة والتفاعل.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="outline" onClick={() => setIsModalOpen(false)}>إلغاء</Btn>
          <Btn variant="primary" onClick={() => setIsModalOpen(false)}>تأكيد</Btn>
        </div>
      </Modal>
    </div>
  );
}
