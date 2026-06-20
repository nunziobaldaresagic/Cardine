export interface HrLevel {
  code: string
  label: string
}

export interface LoginResponse {
  ok: boolean
  token: string
  user: { id: string; role: string; name: string }
}

export interface EmployeeSummary {
  id: string
  name: string
  email: string
  location: string
  currentRole: string
  company: string
  hrLevel: HrLevel
  totalYearsExperience: number
}

export interface GrowthArea {
  area: string
  priority: string
  actions: string[]
}

export interface Employee {
  id: string
  personal: { name: string; email: string; location: string }
  current_role: { title: string; company: string; since: string; hr_level: HrLevel }
  total_years_experience: number
  certifications: unknown[]
  technical_skills: Record<string, unknown>
  soft_skills: string[]
  career_path: {
    current_level: HrLevel
    suggested_next_level: HrLevel
    estimated_timeframe_months: number
    growth_areas: GrowthArea[]
  }
}

export interface Objective {
  id: string
  category: string
  title: string
  description: string
  priority: 'mandatory' | 'recommended'
}

export interface Level {
  code: string
  label: string
  description: string
  next_level: HrLevel
  objectives_to_reach_next_level: Objective[]
}

export interface CareerMap {
  version: string
  description: string
  levels_order: string[]
  levels: Level[]
}

export interface GapObjective extends Objective {
  covered: boolean
}

export interface ProximityResult {
  targetLevel: string
  targetLabel: string
  score: number
  coveredCount: number
  totalMandatory: number
  gaps: GapObjective[]
}

export interface GapAnalysis {
  employee: { id: string; name: string; currentLevel: HrLevel }
  targetLevel: string
  targetLabel: string
  score: number
  coveredCount: number
  totalMandatory: number
  objectives: GapObjective[]
}

export type RoadmapActionType = 'corso' | 'certificazione' | 'milestone'

export interface RoadmapAction {
  type: RoadmapActionType
  description: string
  estimatedHours: number
}

export type RoadmapItemStatus = 'not_started' | 'in_progress' | 'completed'

export interface RoadmapItem {
  step: number
  competenza: string
  title: string
  monthRange: string
  actions: RoadmapAction[]
  status: RoadmapItemStatus
}

export interface Roadmap {
  employeeId: string
  targetLevel: string
  targetLabel: string
  initialScore: number
  estimatedMonths: number
  confirmedAt?: string
  items: RoadmapItem[]
}
