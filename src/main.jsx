import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles.css';
import App from './App.jsx';
import { I18nProvider } from './lib/i18n.jsx';
import { ClockProvider } from './lib/clock.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider><ClockProvider><App /></ClockProvider></I18nProvider>
    </BrowserRouter>
  </StrictMode>,
);
