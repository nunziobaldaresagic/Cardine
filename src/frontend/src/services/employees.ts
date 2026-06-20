import apiClient from '@/lib/apiClient'
import type { Employee, EmployeeSummary } from './types'

export async function listEmployees(): Promise<EmployeeSummary[]> {
  const res = await apiClient.get<EmployeeSummary[]>('/employees')
  return res.data
}

export async function getEmployee(id: string): Promise<Employee> {
  const res = await apiClient.get<Employee>(`/employees/${id}`)
  return res.data
}
