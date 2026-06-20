import apiClient from '@/lib/apiClient'
import type { GapAnalysis } from './types'

export async function getGap(employeeId: string, targetLevel: string): Promise<GapAnalysis> {
  const res = await apiClient.get<GapAnalysis>(`/employees/${employeeId}/gap/${targetLevel}`)
  return res.data
}
