import React from 'react';
import ReactDOM from 'react-dom/client';
import SnackbarProvider from 'react-simple-snackbar';

import 'bulma/css/bulma.min.css';
import './index.scss';

import AppRouting from './app-routing';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <SnackbarProvider>
    <AppRouting />
  </SnackbarProvider>
);
