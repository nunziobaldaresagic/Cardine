import { msalInstance } from '@/lib/msalInstance'

export function logout(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('auth_user')
  void msalInstance.logoutRedirect({ postLogoutRedirectUri: '/login' })
}
