import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { GlobalStateProvider } from './GlobalState';
import { PwaProvider } from './platform/PwaContext';
import { appTheme } from './theme';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <PwaProvider>
        <GlobalStateProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </GlobalStateProvider>
      </PwaProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
