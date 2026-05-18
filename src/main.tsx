// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// دالة لتشغيل المحاكي قبل تحميل التطبيق
async function enableMocking() {
  // لا تقم بتشغيل المحاكي في بيئة الإنتاج (Production)
  if (import.meta.env.MODE !== 'development') {
    return;
  }
  
  const { worker } = await import('./mocks/browser');
  // onUnhandledRequest: 'bypass' يمنع ظهور تحذيرات للصور والملفات العادية
  return worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});