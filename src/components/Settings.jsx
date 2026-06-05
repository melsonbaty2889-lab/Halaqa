import { Card } from './UI';

export default function Settings({ teacher, setTeacher }) {
  return (
    <div style={{ padding: '24px', color: '#fff', direction: 'rtl', textAlign: 'right' }}>
      <Card>
        <h3 style={{ color: '#fbbf24', marginBottom: '12px' }}>⚙️ إعدادات الأكاديمية وحفظ البيانات</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          إعدادات ترخيص النظام وتحديث بيانات السيرفر السحابية الحالية لمعلم الحلقة المعتمد.
        </p>
      </Card>
    </div>
  );
}
