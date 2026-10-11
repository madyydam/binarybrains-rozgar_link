import React, { useState } from 'react';
import { Card, Pill, ProgressBar, Button, Chip } from '@rozgarlink/ui';
import { LearningResource, PathwayResult } from '@rozgarlink/shared-types';

export interface LearnTabProps {
  courses: LearningResource[];
  activePathway: PathwayResult | null;
  onCompleteCourse: (resourceId: string) => void;
  completedCourseIds: Set<string>;
}

export type LearnSubTab = 'paths' | 'courses' | 'practice';

export const LearnTab: React.FC<LearnTabProps> = ({
  courses,
  activePathway,
  onCompleteCourse,
  completedCourseIds
}) => {
  const [subTab, setSubTab] = useState<LearnSubTab>('paths');

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0F1B3D] tracking-tight">
          Learn & Upskill
        </h1>
        <p className="text-xs text-[#64748B]">
          Pre-seeded catalogue courses and tailored skill gap pathways.
        </p>
      </div>

      {/* Pill Tabs: Paths / Courses / Practice */}
      <div className="flex items-center gap-2">
        <Pill
          active={subTab === 'paths'}
          onClick={() => setSubTab('paths')}
          count={activePathway?.steps.length || 0}
        >
          Paths
        </Pill>
        <Pill
          active={subTab === 'courses'}
          onClick={() => setSubTab('courses')}
          count={courses.length}
        >
          Courses
        </Pill>
        <Pill
          active={subTab === 'practice'}
          onClick={() => setSubTab('practice')}
        >
          Practice
        </Pill>
      </div>

      {/* Active Pathway View */}
      {subTab === 'paths' && (
        <div className="space-y-4">
          {activePathway && activePathway.steps.length > 0 ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2F5BFF]/10 to-[#5B4BEA]/10 border border-[#2F5BFF]/20 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0F1B3D]">
                    Target Opportunity Pathway
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    {activePathway.steps.length} sequential modules &bull; Total {activePathway.totalHours} hours
                  </p>
                </div>
                <span className="text-xs font-bold text-[#2F5BFF] bg-white px-3 py-1 rounded-full shadow-sm">
                  {Math.round(
                    (Array.from(completedCourseIds).filter((id) =>
                      activePathway.steps.some((s) => s.resource.id === id)
                    ).length /
                      activePathway.steps.length) *
                      100
                  )}% Done
                </span>
              </div>

              {activePathway.steps.map((step, idx) => {
                const isCompleted = completedCourseIds.has(step.resource.id);

                return (
                  <Card key={step.resource.id} className="relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#EAF0FF] text-[#2F5BFF] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            {step.isPrerequisite && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#F59E0B]">
                                Prerequisite
                              </span>
                            )}
                            <span className="text-[10px] text-[#64748B]">
                              {step.resource.provider}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#0F1B3D]">
                            {step.resource.title}
                          </h4>
                          <p className="text-xs text-[#2F5BFF] font-medium mt-0.5">
                            {step.why}
                          </p>
                        </div>
                      </div>

                      {isCompleted && (
                        <span className="text-xs font-bold text-[#12AE85] bg-[#12AE85]/10 px-2 py-1 rounded-full">
                          ✓ Completed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#E2E8F3] mt-2">
                      <span>⏱ {step.hours} hours &bull; {step.resource.mode}</span>
                      {!isCompleted ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onCompleteCourse(step.resource.id)}
                        >
                          Mark Completed
                        </Button>
                      ) : (
                        <span className="text-xs text-[#12AE85] font-semibold">Skills Credited</span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center text-xs text-[#64748B]">
              <div className="w-12 h-12 rounded-full bg-[#EAF0FF] text-[#2F5BFF] flex items-center justify-center mx-auto text-xl mb-3">
                🎯
              </div>
              <h3 className="text-sm font-bold text-[#0F1B3D] mb-1">
                No active pathway selected
              </h3>
              <p className="max-w-xs mx-auto mb-4">
                Mark any opportunity as <strong>Interested</strong> on the Match screen to generate an optimal sequential learning pathway.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Catalogue Courses View */}
      {subTab === 'courses' && (
        <div className="space-y-3">
          {courses.map((course) => {
            const isCompleted = completedCourseIds.has(course.id);

            return (
              <Card key={course.id}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] text-[#64748B] font-medium">
                      {course.provider} &bull; {course.durationHours} hrs
                    </span>
                    <h3 className="text-sm font-bold text-[#0F1B3D] leading-tight">
                      {course.title}
                    </h3>
                  </div>
                  {isCompleted ? (
                    <span className="text-xs font-bold text-[#12AE85] bg-[#12AE85]/10 px-2.5 py-1 rounded-full">
                      ✓ Done
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCompleteCourse(course.id)}
                    >
                      Complete
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {course.skillsTaught.map((st) => (
                    <Chip key={st.skillId} variant="tint">
                      {st.skillId} (Lvl {st.levelReached})
                    </Chip>
                  ))}
                  {course.qualificationAwardedOrdinal && (
                    <Chip variant="ok">Awards Diploma/Degree</Chip>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Practice View */}
      {subTab === 'practice' && (
        <Card className="p-6 text-center text-xs text-[#64748B]">
          <h3 className="text-sm font-bold text-[#0F1B3D] mb-1">Practical Skill Assessments</h3>
          <p>Online mock quizzes and trade tests for electrical wiring, IT, and tally.</p>
        </Card>
      )}
    </div>
  );
};
