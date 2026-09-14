import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { APP_SUBTITLES } from '@/components/Auth/AuthLayout';

export function useDocumentTitle(pageTitleKey: string, fallbackTitle: string): void {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const currentLang = i18n?.language?.split('-')[0] || 'ar';
    const appSubtitle = APP_SUBTITLES[currentLang as keyof typeof APP_SUBTITLES] || APP_SUBTITLES.ar;
    const translatedTitle = t(pageTitleKey, fallbackTitle);

    document.title = `${translatedTitle} | ${appSubtitle}`;
  }, [i18n.language, pageTitleKey, fallbackTitle, t]);
}
