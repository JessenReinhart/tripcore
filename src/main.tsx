import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import { LanguageProvider } from './lib/i18n.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

registerSW({
  onNeedRefresh() {
    // We could show a prompt here, but for now we'll just wait for the next load
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
