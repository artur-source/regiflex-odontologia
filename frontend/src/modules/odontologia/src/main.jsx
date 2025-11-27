import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';\nimport { AuthProvider } from 'regiflex-core/contexts/AuthContext';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(\n    <AuthProvider>
    <React.StrictMode>
      <App />
    </AuthProvider>\n    </React.StrictMode>
  );
}

