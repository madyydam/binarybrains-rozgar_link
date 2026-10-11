import { describe, expect, it } from 'vitest';
import { buildPathway } from '../src/builder.js';
import { LearningResource } from '../src/types.js';

describe('Pathway Package', () => {
  const mockCatalogue: LearningResource[] = [
    {
      id: 'course-safety',
      title: 'Basics of Industrial Safety',
      provider: 'National Skill Development Corp',
      durationHours: 10,
      level: 'beginner',
      mode: 'online',
      language: 'en',
      costInr: 0,
      skillsTaught: [{ skillId: 'safety-compliance' }],
      prerequisites: []
    },
    {
      id: 'course-wiring',
      title: 'Panel Wiring & Fault Finding',
      provider: 'State Vocational Board',
      durationHours: 40,
      level: 'intermediate',
      mode: 'blended',
      language: 'en',
      costInr: 500,
      skillsTaught: [{ skillId: 'panel-wiring' }, { skillId: 'fault-finding' }],
      prerequisites: ['course-safety'] // Safety is prerequisite!
    },
    {
      id: 'course-diploma-ee',
      title: 'Polytechnic Diploma in Electrical Engineering',
      provider: 'MSBTE',
      durationHours: 1200,
      level: 'diploma',
      mode: 'offline',
      language: 'en',
      costInr: 12000,
      qualificationAwardedOrdinal: 5, // Diploma
      skillsTaught: [{ skillId: 'electrical-engineering' }],
      prerequisites: []
    }
  ];

  it('detects missing skills and puts prerequisites in topological order', () => {
    const res = buildPathway({
      opportunitySkills: [
        { skillId: 'panel-wiring', importance: 'required' },
        { skillId: 'fault-finding', importance: 'required' }
      ],
      candidateSkills: [], // candidate has neither
      catalogue: mockCatalogue
    });

    expect(res.gaps.length).toBe(2);
    expect(res.uncoveredSkills.length).toBe(0);

    // Prerequisite 'course-safety' must come before 'course-wiring'
    expect(res.steps.length).toBe(2);
    expect(res.steps[0].resourceId).toBe('course-safety');
    expect(res.steps[1].resourceId).toBe('course-wiring');
    expect(res.totalHours).toBe(50);
  });

  it('skips prerequisites that candidate already completed', () => {
    const res = buildPathway({
      opportunitySkills: [
        { skillId: 'panel-wiring', importance: 'required' }
      ],
      candidateSkills: [],
      completedCourseIds: ['course-safety'], // already completed!
      catalogue: mockCatalogue
    });

    // Only 'course-wiring' should be scheduled
    expect(res.steps.length).toBe(1);
    expect(res.steps[0].resourceId).toBe('course-wiring');
  });

  it('suggests course for eligibility blocker when qualification missing', () => {
    const res = buildPathway({
      opportunitySkills: [],
      candidateSkills: [],
      catalogue: mockCatalogue,
      failedRules: [
        {
          label: 'Requires at least Diploma',
          type: 'QUAL_MIN_LEVEL',
          requiredValue: 'Diploma',
          minOrdinal: 5
        }
      ]
    });

    expect(res.eligibilityBlockers.length).toBe(1);
    expect(res.eligibilityBlockers[0].suggestedCourse?.resourceId).toBe('course-diploma-ee');
  });
});
