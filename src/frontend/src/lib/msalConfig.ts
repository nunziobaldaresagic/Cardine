import type { Configuration, RedirectRequest } from '@azure/msal-browser'

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID as string,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID as string}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: `${window.location.origin}/login`,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
}

export const LOGIN_SCOPES = ['openid', 'profile', 'email']

export const loginRequest: RedirectRequest = {
  scopes: LOGIN_SCOPES,
}
