import CryptoJS from 'crypto-js';

const SECRET_KEY = 'MySuperSecretKey123!'; // يمكنك تغييره لاحقاً لحماية أقوى

export const encryptAndSave = (key, data) => {
  try {
    const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
    const encryptedData = CryptoJS.AES.encrypt(stringData, SECRET_KEY).toString();
    localStorage.setItem(key, encryptedData);
  } catch (error) {
    console.error("فشل التشفير والحفظ:", error);
  }
};

export const getAndDecrypt = (key) => {
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
