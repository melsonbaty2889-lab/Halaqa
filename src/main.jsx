import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// إزالة كل شيء، فقط عرض أبسط نسخة من التطبيق
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div style={{color: 'red', fontSize: '30px', textAlign: 'center', marginTop: '100px'}}>
      التطبيق يعمل الآن!
    </div>
  </React.StrictMode>
)
