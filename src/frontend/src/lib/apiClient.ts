import axios from 'axios';
import { msalInstance } from './msalInstance';
import { LOGIN_SCOPES } from './msalConfig';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT access token to every request
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401: tenta rinnovo silenzioso MSAL, poi riprova la request.
// Se il rinnovo fallisce (o non c'è account MSAL) → redirect /login.
apiClient.interceptors.response.use(
  response => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      // Flusso mock (counselor) — nessun account MSAL, vai a login
      localStorage.removeItem('access_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      const result = await msalInstance.acquireTokenSilent({
        scopes: LOGIN_SCOPES,
        account: accounts[0]
      });

      // Aggiorna il token in localStorage
      localStorage.setItem('access_token', result.idToken);

      // Riprova la request originale con il nuovo token
      const originalConfig = error.config!;
      originalConfig.headers['Authorization'] = `Bearer ${result.idToken}`;
      return apiClient(originalConfig);
    } catch {
      // Rinnovo silenzioso fallito: sessione scaduta, torna al login
      localStorage.removeItem('access_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }
);

export default apiClient;
