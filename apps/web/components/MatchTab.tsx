import React, { useState } from 'react';
import { Card, Pill, ScoreRing, Button, Chip, FailedRuleStrip, StatusBadge } from '@rozgarlink/ui';
import { MatchResultDTO } from '@rozgarlink/shared-types';

export interface MatchTabProps {
  eligibleMatches: MatchResultDTO[];
  notEligibleMatches: MatchResultDTO[];
  needsInfoMatches: MatchResultDTO[];
  onSelectOpportunity: (oppId: string) => void;
  onInterested: (oppId: string) => void;
  interestedOppIds: Set<string>;
  onNavigateTab: (tab: any) => void;
}

export type MatchFilter = 'all' | 'eligible' | 'needs_info' | 'not_eligible';

export const MatchTab: React.FC<MatchTabProps> = ({
  eligibleMatches,
  notEligibleMatches,
  needsInfoMatches,
  onSelectOpportunity,
  onInterested,
  interestedOppIds,
  onNavigateTab
}) => {
  const [filter, setFilter] = useState<MatchFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterMatches = (list: MatchResultDTO[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.orgName?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q)
    );
  };

  const filteredEligible = filterMatches(eligibleMatches);
  const filteredNotEligible = filterMatches(notEligibleMatches);
  const filteredNeedsInfo = filterMatches(needsInfoMatches);

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Screen Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F1B3D] tracking-tight">
            Match
          </h1>
          <p className="text-xs text-[#64748B]">
            Separating mandatory criteria from preference fit.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EAF0FF] text-[#2F5BFF]">
          {eligibleMatches.length} Eligible
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, organization or district..."
          className="w-full h-10 pl-9 pr-4 rounded-full bg-white border border-[#E2E8F3] text-xs text-[#0F1B3D] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2F5BFF] focus:border-transparent transition-all shadow-[0_2px_8px_rgba(15,27,61,0.03)]"
        />
        <svg
          className="w-4 h-4 text-[#64748B] absolute left-3 top-3 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Pill Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <Pill
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          count={eligibleMatches.length + needsInfoMatches.length + notEligibleMatches.length}
        >
          All
        </Pill>
        <Pill
          active={filter === 'eligible'}
          onClick={() => setFilter('eligible')}
          count={eligibleMatches.length}
        >
          Eligible
        </Pill>
        <Pill
          active={filter === 'needs_info'}
          onClick={() => setFilter('needs_info')}
          count={needsInfoMatches.length}
        >
          Need info
        </Pill>
        <Pill
          active={filter === 'not_eligible'}
          onClick={() => setFilter('not_eligible')}
          count={notEligibleMatches.length}
        >
          Not eligible
        </Pill>
      </div>

      {/* Standard Notice (Rule 8) */}
      <div className="p-3 rounded-2xl bg-[#EAF0FF]/80 text-[#0F1B3D] text-[11px] flex items-center justify-between gap-2 border border-[#2F5BFF]/20">
        <div className="flex items-center gap-2">
          <span>ℹ️</span>
          <span>Eligibility follows opportunity criteria. Confirm with issuing office before applying.</span>
        </div>
      </div>

      {/* Opportunity Lists */}
      <div className="space-y-4">
        {/* Section 1: Eligible Matches */}
        {(filter === 'all' || filter === 'eligible') && (
          <div>
            {filter === 'all' && filteredEligible.length > 0 && (
              <h2 className="text-xs font-bold text-[#12AE85] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>✓ Eligible Opportunities ({filteredEligible.length})</span>
              </h2>
            )}

            <div className="space-y-3">
              {filteredEligible.map((opp) => (
                <Card
                  key={opp.opportunityId}
                  hoverEffect
                  className="cursor-pointer border-l-4 border-l-[#12AE85]"
                  onClick={() => onSelectOpportunity(opp.opportunityId)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#12AE85]/10 text-[#12AE85]">
                          Rank #{opp.rank}
                        </span>
                        <span className="text-[11px] text-[#64748B]">{opp.location}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-[#0F1B3D] leading-tight">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-[#64748B] font-medium">{opp.orgName}</p>
                    </div>

                    {opp.score !== undefined && (
                      <ScoreRing score={opp.score} size={48} />
                    )}
                  </div>

                  {/* Reasons Breakdown in Words */}
                  {opp.reasons && opp.reasons.length > 0 && (
                    <div className="space-y-1 mb-3 pt-1 border-t border-[#E2E8F3]/60 text-xs text-[#0F1B3D]">
                      {opp.reasons.slice(0, 2).map((reason, rIdx) => (
                        <div key={rIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                          <span className="text-[#12AE85] font-bold flex-shrink-0">✓</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI-Assisted Chips */}
                  {opp.aiAssisted && opp.aiAssisted.length > 0 && (
                    <div className="mb-3 flex items-center gap-1.5">
                      <Chip variant="ai">✨ AI-assisted match</Chip>
                    </div>
                  )}

                  {/* Bottom Strip: Gaps / Interested */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F3]">
                    <div className="text-[11px] text-[#64748B]">
                      {opp.gaps && opp.gaps.length > 0 ? (
                        <span className="text-[#F59E0B] font-medium">
                          ⚠️ {opp.gaps.length} skill gap{opp.gaps.length > 1 ? 's' : ''} to learn
                        </span>
                      ) : (
                        <span className="text-[#12AE85] font-medium">
                          ✓ All required skills met
                        </span>
                      )}
                    </div>
                    <Button
                      variant={interestedOppIds.has(opp.opportunityId) ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInterested(opp.opportunityId);
                      }}
                    >
                      {interestedOppIds.has(opp.opportunityId) ? '✓ Interested' : 'Interested'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Need More Information Matches */}
        {(filter === 'all' || filter === 'needs_info') && filteredNeedsInfo.length > 0 && (
          <div>
            {filter === 'all' && (
              <h2 className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider mb-2 mt-4 flex items-center gap-1.5">
                <span>⏱ Need More Information ({filteredNeedsInfo.length})</span>
              </h2>
            )}

            <div className="space-y-3">
              {filteredNeedsInfo.map((opp) => (
                <Card
                  key={opp.opportunityId}
                  hoverEffect
                  className="cursor-pointer border-l-4 border-l-[#F59E0B]"
                  onClick={() => onSelectOpportunity(opp.opportunityId)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status="NEEDS_INFO" size="sm" />
                        <span className="text-[11px] text-[#64748B]">{opp.location}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[#0F1B3D] leading-tight">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-[#64748B]">{opp.orgName}</p>
                    </div>
                  </div>

                  {/* Missing Field Prompt */}
                  <div className="bg-[#F59E0B]/10 p-2.5 rounded-xl border border-[#F59E0B]/20 text-xs text-[#0F1B3D] flex items-center justify-between gap-2 mt-2">
                    <div>
                      <p className="font-semibold text-[#F59E0B]">Missing profile field:</p>
                      <p className="text-[11px] text-slate-700">
                        {opp.missingFields?.join(', ') || 'Additional qualifications or documents'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateTab('profile');
                      }}
                    >
                      Update Profile
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Not Eligible Matches (Never scored, exact failed condition) */}
        {(filter === 'all' || filter === 'not_eligible') && filteredNotEligible.length > 0 && (
          <div>
            {filter === 'all' && (
              <h2 className="text-xs font-bold text-[#E5484D] uppercase tracking-wider mb-2 mt-4 flex items-center gap-1.5">
                <span>✕ Not Eligible ({filteredNotEligible.length})</span>
              </h2>
            )}

            <div className="space-y-3">
              {filteredNotEligible.map((opp) => {
                const firstFail = opp.failedRules?.[0];

                return (
                  <Card
                    key={opp.opportunityId}
                    className="opacity-90 hover:opacity-100 transition-opacity cursor-pointer border-l-4 border-l-[#E5484D]"
                    onClick={() => onSelectOpportunity(opp.opportunityId)}
                  >
                    {/* Failed Rule Strip at top of card */}
                    {firstFail && (
                      <FailedRuleStrip
                        label={firstFail.label}
                        candidateValue={firstFail.candidateValue}
                        requiredValue={firstFail.requiredValue}
                        className="mb-3"
                      />
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status="NOT_ELIGIBLE" size="sm" />
                          <span className="text-[11px] text-[#64748B]">{opp.location}</span>
                        </div>
                        <h3 className="text-sm font-bold text-[#0F1B3D] leading-tight">
                          {opp.title}
                        </h3>
                        <p className="text-xs text-[#64748B]">{opp.orgName}</p>
                      </div>

                      {/* NO SCORE, NO RANK on not eligible cards */}
                    </div>

                    {opp.fixHint && (
                      <div className="mt-2 text-[11px] text-slate-600 bg-[#F3F6FF] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                        <span>💡</span>
                        <span>
                          {opp.fixHint === 'not_changeable_by_learning'
                            ? 'Cannot be changed by learning courses.'
                            : 'Can be achieved through a learning pathway.'}
                        </span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
