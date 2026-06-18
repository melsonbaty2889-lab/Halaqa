import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // 🎨 حقن ملف التايلوند والتنسيقات العالمية في نقطة الإنطلاق الأساسية
import './i18n'      // 🌐 تشغيل محرك اللغات الفوري وثنائي الاتجاه

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
