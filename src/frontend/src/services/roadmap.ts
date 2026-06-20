import apiClient from '@/lib/apiClient'
import type { Roadmap } from './types'

export async function getRoadmap(
  employeeId: string
): Promise<{ confirmed: boolean; roadmap: Roadmap }> {
  const res = await apiClient.get<{ confirmed: boolean; roadmap: Roadmap }>(
    `/employees/${employeeId}/roadmap`
  )
  return res.data
}

export async function confirmRoadmap(
  employeeId: string,
  roadmap: Roadmap
): Promise<{ ok: boolean; roadmap: Roadmap }> {
  const res = await apiClient.post<{ ok: boolean; roadmap: Roadmap }>(
    `/employees/${employeeId}/roadmap/confirm`,
    roadmap
  )
  return res.data
}

/**
 * Avvia la generazione della roadmap via SSE.
 * @returns cleanup function che interrompe lo stream
 */
export function generateRoadmapStream(
  employeeId: string,
  targetLevel: string | undefined,
  onText: (chunk: string) => void,
  onMeta: (roadmap: Roadmap) => void,
  onDone: () => void,
  onError: (err: Error) => void
): () => void {
  const controller = new AbortController()

  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'
  const token = localStorage.getItem('access_token')
  const url = `${baseUrl}/employees/${employeeId}/roadmap/generate`

  fetch(url, {
    method: 'POST',
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(targetLevel ? { targetLevel } : {}),
  })
    .then(async (response) => {
      if (!response.body) throw new Error('No response body')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          const dataLine = part
            .split('\n')
            .find((l) => l.startsWith('data: '))
          if (!dataLine) continue
          const raw = dataLine.slice(6).trim()
          if (raw === '[DONE]') { onDone(); return }
          try {
            const parsed = JSON.parse(raw) as { type: string; content?: string; roadmap?: Roadmap }
            if (parsed.type === 'text' && parsed.content) onText(parsed.content)
            else if (parsed.type === 'meta' && parsed.roadmap) onMeta(parsed.roadmap)
          } catch { /* ignora eventi malformati */ }
        }
      }
    })
    .catch((err: unknown) => {
      if (err instanceof Error && err.name === 'AbortError') return
      onError(err instanceof Error ? err : new Error(String(err)))
    })

  return () => controller.abort()
}
