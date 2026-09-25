// src/utils/phoneUtils.js
import { COUNTRIES_LIST } from '@/constants/countries';

/**
 * تفكيك رقم الهاتف الكامل إلى كود الدولة والرقم المحلي
 * @param {string} rawPhone - رقم الهاتف الكامل المار من قاعدة البيانات
 * @returns {{ dialCode: string, phone: string }}
 */
export const parsePhoneNumber = (rawPhone = '') => {
  let matchedDialCode = '+966';
  let mainPhone = rawPhone || '';

  const foundCountry = COUNTRIES_LIST.find((c) => rawPhone.startsWith(c.dialCode));
  if (foundCountry) {
    matchedDialCode = foundCountry.dialCode;
    mainPhone = rawPhone.replace(foundCountry.dialCode, '').trim();
  }

  return {
    dialCode: matchedDialCode,
    phone: mainPhone
  };
};

/**
 * دمج كود الدولة مع الرقم مع إزالة الصفر الأول إن وجد
 * @param {string} dialCode - كود الدولة
 * @param {string} phone - الرقم المحلي
 * @returns {string}
 */
export const formatFullPhone = (dialCode = '+966', phone = '') => {
  const trimmed = phone.trim().replace(/^0+/, '');
  return trimmed ? `${dialCode}${trimmed}` : '';
};
