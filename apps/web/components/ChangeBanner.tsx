import React from 'react';
import { MatchDiff } from '@rozgarlink/shared-types';

export interface ChangeBannerProps {
  changes: MatchDiff | null;
  onUndo?: () => void;
  onDismiss: () => void;
}

export const ChangeBanner: React.FC<ChangeBannerProps> = ({
  changes,
  onUndo,
  onDismiss
}) => {
  if (!changes) return null;
  const hasChanges =
    changes.newlyEligible.length > 0 ||
    changes.noLongerEligible.length > 0 ||
    changes.rankMoved > 0;

  if (!hasChanges) return null;

  const parts: string[] = [];
  if (changes.newlyEligible.length > 0) {
    parts.push(`${changes.newlyEligible.length} newly eligible`);
  }
  if (changes.noLongerEligible.length > 0) {
    parts.push(`${changes.noLongerEligible.length} no longer eligible`);
  }
  if (changes.rankMoved > 0) {
    parts.push(`${changes.rankMoved} re-ranked`);
  }

  const message = `Your change updated results: ${parts.join(', ')}.`;

  return (
    <div
      className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-[#0F1B3D] text-white p-3.5 rounded-2xl shadow-[0_8px_24px_rgba(15,27,61,0.25)] border border-[#2F5BFF]/30 animate-in fade-in slide-in-from-top-4 duration-300"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#12AE85] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#EAF0FF] leading-snug">
              Live Update
            </p>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug">
              {message}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onUndo && (
            <button
              type="button"
              onClick={onUndo}
              className="text-xs font-bold text-[#2F5BFF] bg-white px-2.5 py-1 rounded-full hover:bg-[#EAF0FF] transition-colors"
            >
              Undo
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Dismiss banner"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
};
