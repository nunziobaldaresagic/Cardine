// Core domain types for Cardine PoC

// Appointments

export type AppointmentStatus = 'PENDING' | 'PROPOSED' | 'CONFIRMED' | 'CANCELLED';

export interface Appointment {
  id: string;
  employeeId: string;
  counselorId: string;
  scheduledAt: string | null;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  location: string;
}

export interface HrLevel {
  code: string;
  label: string;
}

export interface CurrentRole {
  title: string;
  company: string;
  since: string;
  hr_level: HrLevel;
}

export interface SkillEntry {
  name: string;
  level: string;
}

export interface TechnicalSkills {
  languages: SkillEntry[];
  frameworks_libraries: SkillEntry[];
  tools: SkillEntry[];
  cloud: SkillEntry[];
  databases?: SkillEntry[];
  methodologies: SkillEntry[];
}

export interface LeadershipExperience {
  has_led_people: boolean;
  details: string;
}

export interface GrowthArea {
  area: string;
  priority: string;
  actions: string[];
}

export interface CareerPath {
  current_level: HrLevel;
  suggested_next_level: HrLevel;
  estimated_timeframe_months: number;
  growth_areas: GrowthArea[];
}

export interface Employee {
  id: string;
  personal: PersonalInfo;
  current_role: CurrentRole;
  total_years_experience: number;
  education: object[];
  certifications: object[];
  technical_skills: TechnicalSkills;
  soft_skills: string[];
  languages: { language: string; level: string }[];
  leadership_experience: LeadershipExperience;
  key_achievements: string[];
  self_assessed_gaps: string[];
  career_path: CareerPath;
}

// Career map types

export type ObjectivePriority = 'mandatory' | 'recommended';

export interface Objective {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: ObjectivePriority;
}

export interface Level {
  code: string;
  label: string;
  description: string;
  next_level: HrLevel | null;
  objectives_to_reach_next_level: Objective[];
}

export interface CareerMap {
  version: string;
  description: string;
  levels_order: string[];
  levels: Level[];
}

// Proximity & Gap types

export interface GapObjective {
  id: string;
  category: string;
  title: string;
  priority: ObjectivePriority;
  covered: boolean;
}

export interface ProximityResult {
  targetLevel: string;
  targetLabel: string;
  score: number;
  coveredCount: number;
  totalMandatory: number;
  gaps: GapObjective[];
}

// Roadmap types

export type RoadmapItemStatus = 'not_started' | 'in_progress' | 'completed';

export interface RoadmapAction {
  type: 'corso' | 'certificazione' | 'milestone';
  description: string;
  estimatedHours?: number;
}

export interface RoadmapItem {
  step: number;
  competenza: string;
  title: string;
  monthRange: string;
  actions: RoadmapAction[];
  status: RoadmapItemStatus;
}

export interface Roadmap {
  employeeId: string;
  targetLevel: string;
  targetLabel: string;
  initialScore: number;
  estimatedMonths: number;
  confirmedAt?: string;
  items: RoadmapItem[];
}
