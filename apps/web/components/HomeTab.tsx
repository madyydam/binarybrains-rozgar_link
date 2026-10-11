import React from 'react';
import { Card, ScoreRing, Button, Avatar } from '@rozgarlink/ui';
import { MatchResultDTO } from '@rozgarlink/shared-types';

export interface HomeTabProps {
  onNavigateTab: (tab: 'home' | 'match' | 'learn' | 'profile') => void;
  eligibleMatches: MatchResultDTO[];
  candidateName: string;
  onSelectOpportunity: (oppId: string) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  onNavigateTab,
  eligibleMatches,
  candidateName,
  onSelectOpportunity
}) => {
  const topMatches = eligibleMatches.slice(0, 3);

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Header Profile Greeting */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={candidateName} size="md" online />
          <div>
            <p className="text-xs text-[#64748B] font-medium">Welcome back,</p>
            <h1 className="text-base sm:text-lg font-bold text-[#0F1B3D] leading-tight">
              {candidateName}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEC723]/15 border border-[#FEC723]/30 text-xs font-bold text-[#0F1B3D]">
          <span>🔥</span>
          <span>7-Day Streak</span>
        </div>
      </div>

      {/* Hero Banner: "Your Career Path Starts Here" */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2F5BFF] to-[#5B4BEA] p-5 sm:p-6 text-white shadow-[0_8px_24px_rgba(47,91,255,0.2)]">
        <div className="relative z-10 max-w-sm">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wider uppercase mb-2">
            Build . Learn . Grow
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold leading-tight mb-2">
            Your Career Path Starts Here
          </h2>
          <p className="text-xs text-white/80 leading-relaxed mb-4">
            Find opportunities you can formally take, verified by deterministic eligibility rules.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('match')}
              className="px-4 py-2 rounded-full bg-white text-[#2F5BFF] text-xs font-bold shadow-sm hover:bg-[#EAF0FF] transition-all min-h-[36px]"
            >
              Explore Matches ({eligibleMatches.length})
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('learn')}
              className="px-4 py-2 rounded-full bg-white/15 text-white text-xs font-semibold hover:bg-white/25 transition-all min-h-[36px]"
            >
              Start Learning
            </button>
          </div>
        </div>

        {/* Decorative graphic motif */}
        <div className="absolute right-2 -bottom-4 opacity-15 pointer-events-none select-none">
          <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
          </svg>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { id: 'match', label: 'Match', icon: '🎯', desc: 'Jobs' },
          { id: 'learn', label: 'Learn', icon: '📚', desc: 'Courses' },
          { id: 'explore', label: 'Explore', icon: '🔍', desc: 'Sectors' },
          { id: 'profile', label: 'Profile', icon: '👤', desc: 'Skills' }
        ].map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={() => {
              if (tile.id === 'explore') onNavigateTab('match');
              else onNavigateTab(tile.id as any);
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E2E8F3] hover:border-[#2F5BFF]/40 hover:bg-[#F3F6FF] transition-all shadow-[0_2px_8px_rgba(15,27,61,0.03)] text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EAF0FF] flex items-center justify-center text-lg mb-1.5 group-hover:scale-105 transition-transform">
              {tile.icon}
            </div>
            <span className="text-xs font-bold text-[#0F1B3D]">{tile.label}</span>
            <span className="text-[10px] text-[#64748B]">{tile.desc}</span>
          </button>
        ))}
      </div>

      {/* Profile Strength Nudge */}
      <Card className="flex items-center justify-between gap-4 p-4 border border-[#E2E8F3]">
        <div className="flex items-center gap-3">
          <ScoreRing score={80} size={44} strokeWidth={3.5} />
          <div>
            <h3 className="text-xs font-bold text-[#0F1B3D]">Profile Strength: 80%</h3>
            <p className="text-[11px] text-[#64748B]">Add certifications to unlock more roles</p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onNavigateTab('profile')}
        >
          Edit
        </Button>
      </Card>

      {/* Recommended for You Section (Top Eligible Matches) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#0F1B3D]">
            Recommended For You
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab('match')}
            className="text-xs font-semibold text-[#2F5BFF] hover:underline"
          >
            See all ({eligibleMatches.length})
          </button>
        </div>

        {topMatches.length === 0 ? (
          <Card className="p-6 text-center text-xs text-[#64748B]">
            <p>No eligible matches found yet. Update your profile or qualification to unlock opportunities.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {topMatches.map((opp) => (
              <Card
                key={opp.opportunityId}
                hoverEffect
                className="cursor-pointer"
                onClick={() => onSelectOpportunity(opp.opportunityId)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#12AE85]/10 text-[#12AE85]">
                        ✓ Rank #{opp.rank}
                      </span>
                      <span className="text-[10px] text-[#64748B]">{opp.location}</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#0F1B3D] leading-tight">
                      {opp.title}
                    </h4>
                    <p className="text-xs text-[#64748B] mb-2">{opp.orgName}</p>

                    {/* Top Reason */}
                    {opp.reasons && opp.reasons.length > 0 && (
                      <div className="text-[11px] text-[#2F5BFF] font-medium bg-[#EAF0FF]/60 px-2.5 py-1 rounded-lg inline-block">
                        💡 {opp.reasons[0]}
                      </div>
                    )}
                  </div>

                  {opp.score !== undefined && (
                    <ScoreRing score={opp.score} size={48} />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
