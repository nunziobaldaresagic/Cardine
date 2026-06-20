import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { MsalProvider } from '@azure/msal-react';
import { router } from './router';
import { msalInstance } from './lib/msalInstance';
import './index.css';

msalInstance.initialize().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <RouterProvider router={router} />
      </MsalProvider>
    </StrictMode>
  );
});
