export interface SkillGap {
  skillId: string;
  skillName?: string;
  importance: 'required' | 'preferred';
  currentCredit: number;
  isPartial: boolean;
  hasCourse: boolean;
}

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  durationHours: number;
  level: string;
  mode: string;
  language: string;
  costInr: number;
  url?: string;
  qualificationAwardedOrdinal?: number;
  skillsTaught: { skillId: string; levelReached?: number }[];
  prerequisites: string[]; // resource ids
}

export interface PathwayStep {
  stepNumber: number;
  resourceId: string;
  title: string;
  provider: string;
  durationHours: number;
  costInr: number;
  skillsGained: string[];
  why: string;
  url?: string;
  qualificationAwardedOrdinal?: number;
}

export interface PathwayResult {
  gaps: SkillGap[];
  steps: PathwayStep[];
  totalHours: number;
  totalCostInr: number;
  uncoveredSkills: string[];
  eligibilityBlockers: {
    ruleLabel: string;
    suggestedCourse?: PathwayStep;
  }[];
}
