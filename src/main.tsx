import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { GlobalStateProvider } from './GlobalState';
import { PwaProvider } from './platform/PwaContext';
import { BrandingProvider } from './branding/BrandingContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrandingProvider>
      <PwaProvider>
        <GlobalStateProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </GlobalStateProvider>
      </PwaProvider>
    </BrandingProvider>
  </React.StrictMode>,
);
