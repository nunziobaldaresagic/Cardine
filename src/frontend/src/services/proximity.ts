import apiClient from '@/lib/apiClient'
import type { ProximityResult } from './types'

export async function getProximity(employeeId: string): Promise<ProximityResult[]> {
  const res = await apiClient.get<ProximityResult[]>(`/employees/${employeeId}/proximity`)
  return res.data
}
