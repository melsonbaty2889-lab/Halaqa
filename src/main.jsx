/* src/main.jsx */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// مسح أي عناصر أو خلفيات ثابتة مسجلة في الـ HTML مباشرة
const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
