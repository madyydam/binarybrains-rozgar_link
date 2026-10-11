import {
  CandidateSkillCredit,
  LearningResource,
  OpportunitySkill,
  PathwayResult,
  PathwayStep
} from '@rozgarlink/shared-types';

export interface GapAnalysisResult {
  missingSkills: string[];
  partialGaps: string[];
  fullGaps: string[];
}

/**
 * Compares required opportunity skills with candidate skills.
 * A skill is missing if candidate relation credit is below 0.85.
 */
export function analyzeSkillGaps(
  opportunitySkills: OpportunitySkill[],
  candidateSkillCredits: CandidateSkillCredit[]
): GapAnalysisResult {
  const creditMap = new Map<string, number>();
  for (const cs of candidateSkillCredits) {
    creditMap.set(cs.skillId, cs.credit);
  }

  const missingSkills: string[] = [];
  const partialGaps: string[] = [];
  const fullGaps: string[] = [];

  for (const os of opportunitySkills) {
    // Only check required skills for strict gap analysis
    if (os.importance !== 'required') continue;

    const credit = creditMap.get(os.skillId) ?? 0;
    if (credit < 0.85) {
      missingSkills.push(os.skillId);
      if (credit > 0) {
        partialGaps.push(os.skillId);
      } else {
        fullGaps.push(os.skillId);
      }
    }
  }

  return {
    missingSkills,
    partialGaps,
    fullGaps
  };
}

/**
 * Detects whether a catalogue dependency graph has cycles.
 */
export function detectPrerequisiteCycle(
  resourceId: string,
  catalogueMap: Map<string, LearningResource>,
  visited: Set<string> = new Set(),
  stack: Set<string> = new Set()
): boolean {
  visited.add(resourceId);
  stack.add(resourceId);

  const resource = catalogueMap.get(resourceId);
  if (resource && resource.prerequisites) {
    for (const prereqId of resource.prerequisites) {
      if (!visited.has(prereqId)) {
        if (detectPrerequisiteCycle(prereqId, catalogueMap, visited, stack)) {
          return true;
        }
      } else if (stack.has(prereqId)) {
        return true; // Cycle found!
      }
    }
  }

  stack.delete(resourceId);
  return false;
}

/**
 * Greedy set cover algorithm + topological sort for prerequisites.
 * Constructs an optimal ordered learning pathway from the local catalogue.
 */
export function buildLearningPathway(
  missingSkills: string[],
  catalogue: LearningResource[],
  completedResourceIds: string[] = []
): PathwayResult {
  if (missingSkills.length === 0) {
    return {
      steps: [],
      totalHours: 0,
      totalCostInr: 0,
      unmetSkills: [],
      noCourse: false
    };
  }

  const completedSet = new Set(completedResourceIds);
  const catalogueMap = new Map<string, LearningResource>();
  for (const res of catalogue) {
    catalogueMap.set(res.id, res);
  }

  // 1. Greedy Set Cover: choose minimum-cost courses covering missing skills
  const remainingMissing = new Set(missingSkills);
  const chosenResourceIds = new Set<string>();

  while (remainingMissing.size > 0) {
    let bestResource: LearningResource | null = null;
    let bestCoveredCount = 0;
    let bestScore = -1; // covered / (hours + cost weight)

    for (const res of catalogue) {
      if (chosenResourceIds.has(res.id) || completedSet.has(res.id)) continue;

      const teachesSkills = res.skillsTaught.map((s) => s.skillId);
      const covered = teachesSkills.filter((sk) => remainingMissing.has(sk));

      if (covered.length > 0) {
        // Efficiency metric: newly covered skills per normalized duration
        const durationCost = Math.max(1, res.durationHours) + (res.costInr > 0 ? res.costInr / 500 : 0);
        const score = covered.length / durationCost;

        if (score > bestScore || (score === bestScore && res.durationHours < (bestResource?.durationHours || 999))) {
          bestScore = score;
          bestCoveredCount = covered.length;
          bestResource = res;
        }
      }
    }

    if (!bestResource || bestCoveredCount === 0) {
      // No more courses can cover remaining missing skills
      break;
    }

    chosenResourceIds.add(bestResource.id);
    for (const sk of bestResource.skillsTaught) {
      remainingMissing.delete(sk.skillId);
    }
  }

  const unmetSkills = Array.from(remainingMissing);
  const noCourse = chosenResourceIds.size === 0 && missingSkills.length > 0;

  // 2. Expand prerequisites
  const allNeededIds = new Set<string>(chosenResourceIds);
  const queue = Array.from(chosenResourceIds);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const res = catalogueMap.get(currentId);
    if (!res || !res.prerequisites) continue;

    for (const prereqId of res.prerequisites) {
      if (!allNeededIds.has(prereqId) && !completedSet.has(prereqId)) {
        allNeededIds.add(prereqId);
        queue.push(prereqId);
      }
    }
  }

  // 3. Topological sorting of allNeededIds
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const id of allNeededIds) {
    inDegree.set(id, 0);
    adj.set(id, []);
  }

  for (const id of allNeededIds) {
    const res = catalogueMap.get(id);
    if (res && res.prerequisites) {
      for (const p of res.prerequisites) {
        if (allNeededIds.has(p)) {
          // p must be completed before id (edge: p -> id)
          adj.get(p)?.push(id);
          inDegree.set(id, (inDegree.get(id) || 0) + 1);
        }
      }
    }
  }

  // Kahn's algorithm
  const topoQueue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      topoQueue.push(id);
    }
  }

  const orderedIds: string[] = [];
  while (topoQueue.length > 0) {
    const u = topoQueue.shift()!;
    orderedIds.push(u);

    for (const v of adj.get(u) || []) {
      const newDeg = (inDegree.get(v) || 1) - 1;
      inDegree.set(v, newDeg);
      if (newDeg === 0) {
        topoQueue.push(v);
      }
    }
  }

  // Fallback for circular edge: append any remaining
  for (const id of allNeededIds) {
    if (!orderedIds.includes(id)) {
      orderedIds.push(id);
    }
  }

  // 4. Assemble PathwaySteps
  let totalHours = 0;
  let totalCostInr = 0;
  const steps: PathwayStep[] = [];

  for (const id of orderedIds) {
    const resource = catalogueMap.get(id);
    if (!resource) continue;

    totalHours += resource.durationHours;
    totalCostInr += resource.costInr;

    const isPrerequisite = !chosenResourceIds.has(id);
    const skillsGained = resource.skillsTaught
      .map((s) => s.skillId)
      .filter((s) => missingSkills.includes(s));

    let why = '';
    if (isPrerequisite) {
      why = 'Prerequisite course required for subsequent modules';
    } else {
      why = `Closes ${skillsGained.length} required skill gap${skillsGained.length > 1 ? 's' : ''}`;
    }

    steps.push({
      resource,
      hours: resource.durationHours,
      skillsGained: skillsGained.length > 0 ? skillsGained : resource.skillsTaught.map((s) => s.skillId),
      why,
      isPrerequisite
    });
  }

  return {
    steps,
    totalHours,
    totalCostInr,
    unmetSkills,
    noCourse
  };
}

/**
 * Suggests courses that award qualifications to help candidates become eligible.
 */
export function buildEligibilityPathway(
  requiredOrdinal: number,
  currentOrdinal: number,
  catalogue: LearningResource[]
): LearningResource[] {
  return catalogue.filter(
    (c) =>
      c.qualificationAwardedOrdinal !== undefined &&
      c.qualificationAwardedOrdinal >= requiredOrdinal &&
      c.qualificationAwardedOrdinal > currentOrdinal
  );
}
