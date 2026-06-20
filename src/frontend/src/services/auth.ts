import apiClient from '@/lib/apiClient';
import { msalInstance } from '@/lib/msalInstance';
import type { LoginResponse } from './types';

// Usato solo per il flusso mock (Career Counselor)
export async function login(role: 'employee' | 'counselor' = 'employee'): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/auth/login', { role });
  return res.data;
}

export function logout(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('auth_user');
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    void msalInstance.logoutRedirect({ postLogoutRedirectUri: '/login' });
  }
}
