import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { MsalProvider } from '@azure/msal-react';
import { router } from './router';
import { msalInstance } from './lib/msalInstance';
import { LOGIN_SCOPES } from './lib/msalConfig';
import './index.css';

msalInstance.initialize().then(async () => {
  // Processa il callback MSAL prima del render:
  // dopo loginRedirect, Microsoft torna su / — qui salviamo il token
  // in localStorage prima che il router faccia qualsiasi redirect.
  const result = await msalInstance.handleRedirectPromise();
  if (result?.account) {
    const account = result.account;
    // Salviamo l'idToken come access_token (usato da apiClient)
    localStorage.setItem('access_token', result.idToken);
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: account.homeAccountId,
        name: account.name ?? account.username,
        role: 'employee'
      })
    );
  } else if (!result) {
    // Nessun redirect in corso: se c'è già un account MSAL ma non il nostro
    // token (es. dopo refresh pagina), acquisiamo silenziosamente.
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0 && !localStorage.getItem('access_token')) {
      try {
        const silent = await msalInstance.acquireTokenSilent({
          scopes: LOGIN_SCOPES,
          account: accounts[0]
        });
        localStorage.setItem('access_token', silent.idToken);
        localStorage.setItem(
          'auth_user',
          JSON.stringify({
            id: accounts[0].homeAccountId,
            name: accounts[0].name ?? accounts[0].username,
            role: 'employee'
          })
        );
      } catch {
        // Token scaduto o non rinnovabile: l'AuthLayout reindirizzerà a /login
      }
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <RouterProvider router={router} />
      </MsalProvider>
    </StrictMode>
  );
});
