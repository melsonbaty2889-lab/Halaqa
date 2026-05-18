# 🕌 الحلقة الذكية — نظام إدارة حلقات تحفيظ القرآن

## 🚀 الرفع على Vercel (خطوات بسيطة)

### الطريقة الأولى: بدون GitHub (الأسرع)

1. ثبّت Vercel CLI:
```
npm install -g vercel
```

2. افتح الفولدر ورفع مباشرة:
```
cd halqa-app
npm install
vercel
```

3. اتبع التعليمات → رابطك يظهر فورًا ✅

---

### الطريقة الثانية: عبر GitHub (الأفضل)

1. **ارفع الفولدر على GitHub:**
   - اذهب إلى github.com → New Repository
   - اسمه: `halqa-smart`
   - ارفع كل الملفات

2. **اربط بـ Vercel:**
   - اذهب إلى vercel.com
   - سجّل دخول بحساب GitHub
   - اضغط "Add New Project"
   - اختر الـ repo `halqa-smart`
   - اضغط Deploy ✅

3. **رابطك سيكون:**
   ```
   https://halqa-smart.vercel.app
   ```

---

## 💻 تشغيل محلي للتجربة

```bash
npm install
npm run dev
```

افتح: http://localhost:5173

---

## 🔑 بيانات الدخول

- المستخدم: `admin`
- الباسورد: `1234`

---

## 📁 هيكل الملفات

```
halqa-app/
├── index.html          ← الصفحة الرئيسية
├── vite.config.js      ← إعدادات Vite
├── package.json        ← المكتبات
├── vercel.json         ← إعدادات Vercel
└── src/
    ├── main.jsx        ← نقطة البداية
    └── App.jsx         ← النظام الكامل
```

---

## 🔗 ربط Systeme

بعد الرفع، اذهب لصفحة **Systeme** داخل النظام وأضف رابط فانلك.

---

صُنع بـ ❤️ — نظام الحلقة الذكية
