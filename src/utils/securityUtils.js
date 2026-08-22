/**
 * أدوات التشفير والتأمين وحماية البيانات المخزنة
 * تطبيق سمارت حلقة (Smart Halaqa)
 */

import CryptoJS from 'crypto-js';

// جلب المفتاح السري من متغيرات البيئة مع قيمة افتراضية
const SECRET_KEY = import.meta.env.VITE_STORAGE_SECRET_KEY || 'SmartHalaqa_SecureKey_2026!';

/**
 * 1. تشفير البيانات وحفظها في LocalStorage
 */
export const encryptAndSave = (key, data) => {
  if (!key) return;
  try {
    const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
    const encryptedData = CryptoJS.AES.encrypt(stringData, SECRET_KEY).toString();
    localStorage.setItem(key, encryptedData);
  } catch (error) {
    console.error("فشل تشفير وحفظ البيانات:", error);
  }
};

/**
 * 2. جلب وفك تشفير البيانات من LocalStorage
 */
export const getAndDecrypt = (key) => {
  if (!key) return null;
  try {
    const encryptedData = localStorage.getItem(key);
    if (!encryptedData) return null;

    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) return null;

    try {
      return JSON.parse(decryptedText);
    } catch {
      return decryptedText;
    }
  } catch (error) {
    console.error("فشل جلب وفك تشفير البيانات:", error);
    return null;
  }
};

/**
 * 3. حذف مفتاح مشفر محدد
 */
export const removeEncryptedItem = (key) => {
  if (!key) return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("فشل حذف البيانات المشفرة:", error);
  }
};

/**
 * 4. تنظيف النصوص لحماية التطبيق من هجمات XSS
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};
