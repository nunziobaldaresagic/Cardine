import apiClient from '@/lib/apiClient'
import type { LoginResponse } from './types'

export async function login(role: 'employee' | 'counselor' = 'employee'): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/auth/login', { role })
  return res.data
}

export function logout(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('auth_user')
}
