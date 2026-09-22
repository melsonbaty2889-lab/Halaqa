import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { C } from '@/theme/colors';

export interface PasswordCriteria {
  minLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export const useSignUpValidation = (password: string) => {
  const { t } = useTranslation();

  const passwordCriteria = useMemo<PasswordCriteria>(() => {
    const val = password || '';
    return {
      minLength: val.length >= 8,
      hasLetter: /[a-zA-Z]/.test(val),
      hasNumber: /\d/.test(val),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(val),
    };
  }, [password]);

  const passwordStrength = useMemo<PasswordStrength>(() => {
    if (!password) return { score: 0, label: '', color: 'transparent' };
    const passedCount = Object.values(passwordCriteria).filter(Boolean).length;
    if (passedCount <= 1) return { score: 25, label: t('auth.weak', 'ضعيفة جداً'), color: C.semantic.danger };
    if (passedCount === 2) return { score: 50, label: t('auth.medium', 'ضعيفة'), color: C.semantic.warning };
    if (passedCount === 3) return { score: 75, label: t('auth.good', 'جيدة'), color: C.semantic.info };
    return { score: 100, label: t('auth.strong', 'قوية ممتاز'), color: C.semantic.success };
  }, [password, passwordCriteria, t]);

  return {
    passwordCriteria,
    passwordStrength,
  };
};

export default useSignUpValidation;
