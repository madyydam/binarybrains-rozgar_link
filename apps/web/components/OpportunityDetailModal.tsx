import React from 'react';
import { Card, Button, StatusBadge, Chip } from '@rozgarlink/ui';
import { MatchResultDTO, Opportunity } from '@rozgarlink/shared-types';

export interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  matchResult: MatchResultDTO | null;
  onClose: () => void;
  onInterested: (oppId: string) => void;
  isInterested?: boolean;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  matchResult,
  onClose,
  onInterested,
  isInterested = false
}) => {
  if (!opportunity) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1B3D]/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-y-auto border border-[#E2E8F3] p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E2E8F3]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF0FF] text-[#2F5BFF]">
                {opportunity.district}, {opportunity.state}
              </span>
              {matchResult?.status && (
                <StatusBadge status={matchResult.status} size="sm" />
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0F1B3D] leading-tight">
              {opportunity.title}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-medium">
              {opportunity.orgName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F6FF] text-[#64748B] hover:text-[#0F1B3D] hover:bg-[#E2E8F3] flex items-center justify-center text-lg font-bold"
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        {/* Work Description */}
        {opportunity.workDescription && (
          <div className="py-3 text-xs text-[#1B2438] leading-relaxed border-b border-[#E2E8F3]">
            <p className="font-semibold text-[#0F1B3D] mb-1">Work Description:</p>
            <p>{opportunity.workDescription}</p>
          </div>
        )}

        {/* Block 1: Mandatory Eligibility Criteria */}
        <div className="py-4 border-b border-[#E2E8F3]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-[#2F5BFF] text-white flex items-center justify-center text-xs font-bold">
              1
            </div>
            <h3 className="text-sm font-bold text-[#0F1B3D]">
              You must have (Eligibility Criteria)
            </h3>
          </div>
          <p className="text-[11px] text-[#64748B] mb-3">
            Mandatory criteria stated by the opportunity. Deterministic rule engine checks every condition.
          </p>

          <div className="space-y-2.5">
            {matchResult?.criteria && matchResult.criteria.length > 0 ? (
              matchResult.criteria.map((crit, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#F6F8FC] border border-[#E2E8F3] text-xs"
                >
                  <span className="font-medium text-[#0F1B3D]">{crit.label}</span>
                  <StatusBadge status={crit.outcome} size="sm" />
                </div>
              ))
            ) : matchResult?.failedRules && matchResult.failedRules.length > 0 ? (
              matchResult.failedRules.map((failed, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#E5484D]">{failed.label}</span>
                    <StatusBadge status="FAIL" size="sm" />
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Your profile: <strong className="text-[#0F1B3D]">{failed.candidateValue || 'None'}</strong> &bull; Required: <strong className="text-[#0F1B3D]">{failed.requiredValue}</strong>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No specific eligibility rules recorded.</p>
            )}
          </div>
        </div>

        {/* Block 2: Preferences (Affect Ranking Only) */}
        <div className="py-4 border-b border-[#E2E8F3]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-[#5B4BEA] text-white flex items-center justify-center text-xs font-bold">
              2
            </div>
            <h3 className="text-sm font-bold text-[#0F1B3D]">
              These affect ranking (Preferences)
            </h3>
          </div>
          <p className="text-[11px] text-[#64748B] mb-3">
            Does NOT exclude the opportunity. Affects relative position and fit score only.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#F6F8FC] border border-[#E2E8F3]">
              <span className="text-[10px] text-[#64748B] uppercase font-bold block">Offered Pay</span>
              <span className="font-semibold text-[#0F1B3D]">
                {opportunity.preferenceAttrs?.pay?.min ? `₹${opportunity.preferenceAttrs.pay.min.toLocaleString('en-IN')}/mo` : 'Not specified'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F6F8FC] border border-[#E2E8F3]">
              <span className="text-[10px] text-[#64748B] uppercase font-bold block">Shift Type</span>
              <span className="font-semibold text-[#0F1B3D] capitalize">
                {opportunity.preferenceAttrs?.shift || 'Flexible'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F6F8FC] border border-[#E2E8F3]">
              <span className="text-[10px] text-[#64748B] uppercase font-bold block">Work Type</span>
              <span className="font-semibold text-[#0F1B3D] capitalize">
                {opportunity.preferenceAttrs?.workType || 'Full-time'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F6F8FC] border border-[#E2E8F3]">
              <span className="text-[10px] text-[#64748B] uppercase font-bold block">Sector</span>
              <span className="font-semibold text-[#0F1B3D] capitalize">
                {opportunity.preferenceAttrs?.sector || 'General'}
              </span>
            </div>
          </div>
        </div>

        {/* Notice (Rule 8) */}
        <div className="my-4 p-3 rounded-xl bg-[#EAF0FF] text-[#0F1B3D] text-[11px] flex items-start gap-2">
          <svg className="w-4 h-4 text-[#2F5BFF] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <strong>Decision support only:</strong> Eligibility follows the criteria stated by the opportunity. Confirm with the issuing office before applying.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="md" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => onInterested(opportunity.id)}
          >
            {isInterested ? '✓ Marked Interested' : 'Interested'}
          </Button>
        </div>
      </div>
    </div>
  );
};
