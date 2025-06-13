import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.tsx';
import { setupAxiosInterceptors } from './api/interceptors.ts';
import log from 'loglevel';

setupAxiosInterceptors();

log.setLevel(import.meta.env.DEV ? 'debug' : 'warn');

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}
