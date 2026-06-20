import * as fs from 'fs';
import * as path from 'path';
import type { Employee, CareerMap, Level } from '../types';

const MOCK_ROOT = path.resolve(__dirname, '..', '..', '..', 'mock-json');

function loadJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

// Load all 6 employee CVs
const employeesMap = new Map<string, Employee>();

const cvDir = path.join(MOCK_ROOT, 'cv');
const cvFiles = fs.readdirSync(cvDir).filter(f => f.endsWith('.json'));

for (const file of cvFiles) {
  const emp = loadJson<Employee>(path.join(cvDir, file));
  employeesMap.set(emp.id, emp);
}

// Load career map
const careerMap = loadJson<CareerMap>(path.join(MOCK_ROOT, 'career_map.json'));

// Index levels by code for fast lookup
const levelsMap = new Map<string, Level>();
for (const level of careerMap.levels) {
  levelsMap.set(level.code, level);
}

export function getAllEmployees(): Employee[] {
  return Array.from(employeesMap.values());
}

export function getEmployeeById(id: string): Employee {
  return employeesMap.get(id) ?? getAllEmployees()[0];
}

export function getCareerMap(): CareerMap {
  return careerMap;
}

export function getLevelByCode(code: string): Level | undefined {
  return levelsMap.get(code);
}

export function getLevelsOrder(): string[] {
  return careerMap.levels_order;
}
