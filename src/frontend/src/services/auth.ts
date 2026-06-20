import apiClient from '@/lib/apiClient'

export interface LoginResponse {
  ok: boolean
  token: string
  user: { id: string; role: string; name: string }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/auth/login', { email, password })
  return res.data
}

export function logout(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('auth_user')
}
