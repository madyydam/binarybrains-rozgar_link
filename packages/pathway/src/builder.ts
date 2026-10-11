import {
  LearningResource,
  PathwayResult,
  PathwayStep,
  SkillGap
} from './types.js';

export interface BuildPathwayParams {
  opportunitySkills: { skillId: string; importance: 'required' | 'preferred'; name?: string }[];
  candidateSkills: { skillId: string; credit: number }[];
  completedCourseIds?: string[];
  catalogue: LearningResource[];
  failedRules?: { label: string; type: string; requiredValue: string; minOrdinal?: number }[];
}

export function buildPathway(params: BuildPathwayParams): PathwayResult {
  const { opportunitySkills, candidateSkills, completedCourseIds = [], catalogue, failedRules = [] } = params;

  const candidateCreditMap = new Map<string, number>();
  for (const cs of candidateSkills) {
    candidateCreditMap.set(cs.skillId, cs.credit);
  }

  const completedSet = new Set(completedCourseIds);
  const resourceMap = new Map<string, LearningResource>();
  for (const r of catalogue) {
    resourceMap.set(r.id, r);
  }

  // 1. Identify Gaps
  const gaps: SkillGap[] = [];
  const missingSkillIds = new Set<string>();

  for (const os of opportunitySkills) {
    const credit = candidateCreditMap.get(os.skillId) ?? 0;
    if (credit < 0.85) {
      const teachesThis = catalogue.some((r) =>
        r.skillsTaught.some((st) => st.skillId === os.skillId)
      );

      gaps.push({
        skillId: os.skillId,
        skillName: os.name || os.skillId,
        importance: os.importance,
        currentCredit: credit,
        isPartial: credit > 0,
        hasCourse: teachesThis
      });

      missingSkillIds.add(os.skillId);
    }
  }

  // 2. Greedy Set Cover over missingSkillIds
  const uncovered = new Set(missingSkillIds);
  const pickedResourceIds = new Set<string>();

  while (uncovered.size > 0) {
    let bestResource: LearningResource | null = null;
    let maxNewlyCovered = 0;
    let minHours = Infinity;

    for (const r of catalogue) {
      if (pickedResourceIds.has(r.id) || completedSet.has(r.id)) continue;

      let newlyCoveredCount = 0;
      for (const st of r.skillsTaught) {
        if (uncovered.has(st.skillId)) {
          newlyCoveredCount++;
        }
      }

      if (newlyCoveredCount > 0) {
        if (
          newlyCoveredCount > maxNewlyCovered ||
          (newlyCoveredCount === maxNewlyCovered && r.durationHours < minHours)
        ) {
          bestResource = r;
          maxNewlyCovered = newlyCoveredCount;
          minHours = r.durationHours;
        }
      }
    }

    if (!bestResource || maxNewlyCovered === 0) {
      break; // No more courses in catalogue can cover the remaining skills
    }

    pickedResourceIds.add(bestResource.id);
    for (const st of bestResource.skillsTaught) {
      uncovered.delete(st.skillId);
    }
  }

  const uncoveredSkills = Array.from(uncovered);

  // 3. Expand Prerequisites
  const allNeededResourceIds = new Set<string>(pickedResourceIds);
  const queue = Array.from(pickedResourceIds);

  while (queue.length > 0) {
    const currId = queue.shift()!;
    const res = resourceMap.get(currId);
    if (!res) continue;

    for (const prereqId of res.prerequisites) {
      if (!completedSet.has(prereqId) && !allNeededResourceIds.has(prereqId)) {
        allNeededResourceIds.add(prereqId);
        queue.push(prereqId);
      }
    }
  }

  // 4. Topological Sort (with cycle detection)
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const id of allNeededResourceIds) {
    inDegree.set(id, 0);
    adj.set(id, []);
  }

  for (const id of allNeededResourceIds) {
    const res = resourceMap.get(id);
    if (!res) continue;

    for (const prereqId of res.prerequisites) {
      if (allNeededResourceIds.has(prereqId)) {
        // prereqId must come before id: prereqId -> id
        adj.get(prereqId)!.push(id);
        inDegree.set(id, (inDegree.get(id) || 0) + 1);
      }
    }
  }

  const topoQueue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) topoQueue.push(id);
  }

  const sortedResourceIds: string[] = [];
  while (topoQueue.length > 0) {
    const curr = topoQueue.shift()!;
    sortedResourceIds.push(curr);

    for (const neighbor of adj.get(curr) || []) {
      const newDeg = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) {
        topoQueue.push(neighbor);
      }
    }
  }

  // If cycle detected, append any remaining nodes to prevent dropping them
  if (sortedResourceIds.length < allNeededResourceIds.size) {
    for (const id of allNeededResourceIds) {
      if (!sortedResourceIds.includes(id)) {
        sortedResourceIds.push(id);
      }
    }
  }

  // 5. Construct Pathway Steps
  const steps: PathwayStep[] = [];
  let totalHours = 0;
  let totalCostInr = 0;

  let stepIdx = 1;
  for (const rId of sortedResourceIds) {
    const res = resourceMap.get(rId);
    if (!res) continue;

    const skillsGained = res.skillsTaught.map((s) => s.skillId);
    const isDirectNeed = pickedResourceIds.has(rId);

    const why = isDirectNeed
      ? `Closes required skill gap (${skillsGained.join(', ')})`
      : `Prerequisite required for advanced coursework`;

    steps.push({
      stepNumber: stepIdx++,
      resourceId: res.id,
      title: res.title,
      provider: res.provider,
      durationHours: res.durationHours,
      costInr: res.costInr,
      skillsGained,
      why,
      url: res.url,
      qualificationAwardedOrdinal: res.qualificationAwardedOrdinal
    });

    totalHours += res.durationHours;
    totalCostInr += res.costInr;
  }

  // 6. Handle Eligibility Blockers (e.g. Qualification ladder)
  const eligibilityBlockers: PathwayResult['eligibilityBlockers'] = [];
  for (const fr of failedRules) {
    if (fr.type === 'QUAL_MIN_LEVEL' && fr.minOrdinal) {
      // Find course awarding that qualification
      const awardingCourse = catalogue.find(
        (c) => (c.qualificationAwardedOrdinal || 0) >= fr.minOrdinal!
      );

      eligibilityBlockers.push({
        ruleLabel: fr.label,
        suggestedCourse: awardingCourse
          ? {
              stepNumber: 0,
              resourceId: awardingCourse.id,
              title: awardingCourse.title,
              provider: awardingCourse.provider,
              durationHours: awardingCourse.durationHours,
              costInr: awardingCourse.costInr,
              skillsGained: awardingCourse.skillsTaught.map((s) => s.skillId),
              why: `Awards ${fr.requiredValue} to fulfill mandatory eligibility`,
              url: awardingCourse.url,
              qualificationAwardedOrdinal: awardingCourse.qualificationAwardedOrdinal
            }
          : undefined
      });
    } else {
      eligibilityBlockers.push({
        ruleLabel: fr.label
      });
    }
  }

  return {
    gaps,
    steps,
    totalHours,
    totalCostInr,
    uncoveredSkills,
    eligibilityBlockers
  };
}

export function analyzeSkillGaps(
  oppSkills: { skillId: string; importance?: string; minProficiency?: number }[],
  candidateSkills: { skillId: string; credit?: number }[]
) {
  const candSet = new Set(candidateSkills.filter((s) => (s.credit ?? 1) >= 0.85).map((s) => s.skillId));
  const missingSkills = oppSkills.filter((s) => !candSet.has(s.skillId)).map((s) => s.skillId);
  return { missingSkills };
}

export function buildLearningPathway(
  missingSkillIds: string[],
  catalogue: any[],
  completedCourseIds: string[] = []
) {
  const completed = new Set(completedCourseIds);
  const resourceMap = new Map<string, any>(catalogue.map((c) => [c.id, c]));

  // Find courses that teach missing skills
  const neededCourses = new Set<string>();
  for (const skillId of missingSkillIds) {
    const course = catalogue.find((c) =>
      c.skillsTaught?.some((st: any) => st.skillId === skillId)
    );
    if (course && !completed.has(course.id)) {
      neededCourses.add(course.id);
    }
  }

  // Prerequisite expansion
  const finalSequence: { resource: any; isPrerequisite: boolean }[] = [];
  const added = new Set<string>();

  for (const courseId of neededCourses) {
    const course = resourceMap.get(courseId);
    if (!course) continue;

    // Add prerequisites first
    for (const prereqId of course.prerequisites || []) {
      if (!completed.has(prereqId) && !added.has(prereqId)) {
        const prereq = resourceMap.get(prereqId);
        if (prereq) {
          finalSequence.push({ resource: prereq, isPrerequisite: true });
          added.add(prereqId);
        }
      }
    }

    if (!added.has(courseId)) {
      finalSequence.push({ resource: course, isPrerequisite: false });
      added.add(courseId);
    }
  }

  const totalHours = finalSequence.reduce((sum, s) => sum + (s.resource.durationHours || 0), 0);

  return {
    steps: finalSequence,
    totalHours
  };
}

