import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { APP_SUBTITLES } from '@/components/Auth/AuthLayout';

// خريطة المسارات ومفاتيح الترجمة المخصصة لها
const ROUTE_MAP: Record<string, { key: string; fallback: string }> = {
  '/': { key: 'routes.home', fallback: 'الرئيسية' },
  '/login': { key: 'auth.loginTitle', fallback: 'تسجيل الدخول' },
  '/update-password': { key: 'auth.updatePasswordTitle', fallback: 'تحديث كلمة المرور' },
  '/forgot-password': { key: 'auth.forgotPasswordTitle', fallback: 'استعادة كلمة المرور' },
  '/students': { key: 'routes.students', fallback: 'الطلاب' },
  '/teachers': { key: 'routes.teachers', fallback: 'المعلمون' },
  '/halaqas': { key: 'routes.halaqas', fallback: 'الحلقات' },
  '/reports': { key: 'routes.reports', fallback: 'التقارير' },
  '/settings': { key: 'routes.settings', fallback: 'الإعدادات' },
};

export function useDocumentTitle(): void {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const currentLang = i18n?.language?.split('-')[0] || 'ar';
    const appSubtitle = APP_SUBTITLES[currentLang as keyof typeof APP_SUBTITLES] || APP_SUBTITLES.ar;
    
    // الحصول على إعداد العنوان بناءً على المسار الحالي
    const routeConfig = ROUTE_MAP[location.pathname] || {
      key: 'common.appName',
      fallback: 'الحلقة الذكية',
    };

    const translatedTitle = t(routeConfig.key, routeConfig.fallback);
    document.title = `${translatedTitle} | ${appSubtitle}`;
  }, [i18n.language, location.pathname, t]);
}
