import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n'

// الدالة المسؤولة عن إزالة شاشة التحميل الأصلية من الـ HTML
const removeLoadingScreen = () => {
  const loader = document.querySelector('.app-loading-screen');
  if (loader) loader.style.display = 'none';
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App onAppReady={removeLoadingScreen} />
  </React.StrictMode>
)
