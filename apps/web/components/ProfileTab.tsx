import React, { useState } from 'react';
import { Card, Button, Avatar, ScoreRing, Chip } from '@rozgarlink/ui';
import { STANDARD_QUALIFICATION_LADDER } from '@rozgarlink/shared-types';

export interface ProfileTabProps {
  candidate: any;
  onUpdateDistrict: (district: string) => void;
  onAddQualification: (ordinal: number, field: string) => void;
  onSwitchCandidate: (email: string) => void;
  onToggleWhatIf: (enabled: boolean, whatIfData?: any) => void;
  isWhatIfActive: boolean;
  completedCount: number;
  interestedCount: number;
}

const MAHARASHTRA_DISTRICTS = [
  'Pune',
  'Nashik',
  'Nagpur',
  'Kolhapur',
  'Satara',
  'Mumbai',
  'Thane',
  'Chhatrapati Sambhajinagar',
  'Solapur',
  'Amravati',
  'Ahmednagar',
  'Sangli',
  'Jalgaon'
];

export const ProfileTab: React.FC<ProfileTabProps> = ({
  candidate,
  onUpdateDistrict,
  onAddQualification,
  onSwitchCandidate,
  onToggleWhatIf,
  isWhatIfActive,
  completedCount,
  interestedCount
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState(candidate?.district || 'Pune');
  const [selectedQualOrdinal, setSelectedQualOrdinal] = useState(5); // Diploma
  const [whatIfQualOrdinal, setWhatIfQualOrdinal] = useState(5);
  const [whatIfDistrict, setWhatIfDistrict] = useState('Pune');

  const highestQualOrdinal = candidate?.qualifications?.reduce(
    (max: number, q: any) => (q.levelOrdinal > max ? q.levelOrdinal : max),
    0
  ) || 0;

  const highestQualName =
    STANDARD_QUALIFICATION_LADDER.find((l) => l.ordinal === highestQualOrdinal)?.label || 'None stated';

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Header Profile Card */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={candidate?.name || 'Candidate'} size="lg" online />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold text-[#0F1B3D]">
                  {candidate?.name || 'Candidate'}
                </h1>
                <span className="w-4 h-4 rounded-full bg-[#2F5BFF] text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                {candidate?.district}, {candidate?.state} &bull; Born {candidate?.dob || 'N/A'}
              </p>
            </div>
          </div>
          <ScoreRing score={85} size={52} />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E2E8F3] text-center">
          <div className="p-2 rounded-xl bg-[#F6F8FC]">
            <span className="text-xs font-bold text-[#0F1B3D] block">{completedCount}</span>
            <span className="text-[10px] text-[#64748B]">Courses Done</span>
          </div>
          <div className="p-2 rounded-xl bg-[#F6F8FC]">
            <span className="text-xs font-bold text-[#0F1B3D] block">
              {candidate?.skills?.length || 0}
            </span>
            <span className="text-[10px] text-[#64748B]">Skills Confirmed</span>
          </div>
          <div className="p-2 rounded-xl bg-[#F6F8FC]">
            <span className="text-xs font-bold text-[#0F1B3D] block">{interestedCount}</span>
            <span className="text-[10px] text-[#64748B]">Interested</span>
          </div>
        </div>
      </Card>

      {/* Demo Persona Switcher (Asha, Rahul, Meena, etc.) */}
      <Card className="p-4 border-l-4 border-l-[#5B4BEA]">
        <h2 className="text-xs font-bold text-[#0F1B3D] uppercase tracking-wider mb-2">
          Demo Persona Switcher
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Asha (Pune, ITI)', email: 'asha@rozgarlink.gov.in' },
            { name: 'Rahul (Nagpur, 12th)', email: 'rahul@rozgarlink.gov.in' },
            { name: 'Meena (Kolhapur, 10th)', email: 'meena@rozgarlink.gov.in' },
            { name: 'Dinesh (Missing Data)', email: 'dinesh@rozgarlink.gov.in' },
            { name: 'Suresh (Age 36)', email: 'suresh@rozgarlink.gov.in' },
            { name: 'Pooja (Unverified)', email: 'pooja@rozgarlink.gov.in' }
          ].map((persona) => (
            <button
              key={persona.email}
              type="button"
              onClick={() => onSwitchCandidate(persona.email)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-[#F3F6FF] hover:bg-[#EAF0FF] text-[#0F1B3D] border border-[#E2E8F3] transition-colors"
            >
              {persona.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Quick Scenario A: Change District */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xs font-bold text-[#0F1B3D] uppercase tracking-wider">
              Scenario A: Change District
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Flipping district from Pune to Satara instantly updates residence rules live.
            </p>
          </div>
          <span className="text-xs font-bold text-[#2F5BFF] bg-[#EAF0FF] px-2.5 py-1 rounded-full">
            Current: {candidate?.district}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="flex-1 h-9 rounded-xl bg-[#F6F8FC] border border-[#E2E8F3] px-3 text-xs text-[#0F1B3D] focus:outline-none focus:ring-2 focus:ring-[#2F5BFF]"
          >
            {MAHARASHTRA_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onUpdateDistrict(selectedDistrict)}
          >
            Update District
          </Button>
        </div>
      </Card>

      {/* Quick Scenario B: Add Qualification Ladder */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xs font-bold text-[#0F1B3D] uppercase tracking-wider">
              Scenario B: Add Higher Qualification
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Adding a Diploma unlocks Diploma-required opportunities live.
            </p>
          </div>
          <span className="text-xs font-bold text-[#12AE85] bg-[#12AE85]/10 px-2.5 py-1 rounded-full">
            {highestQualName}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <select
            value={selectedQualOrdinal}
            onChange={(e) => setSelectedQualOrdinal(Number(e.target.value))}
            className="flex-1 h-9 rounded-xl bg-[#F6F8FC] border border-[#E2E8F3] px-3 text-xs text-[#0F1B3D] focus:outline-none focus:ring-2 focus:ring-[#2F5BFF]"
          >
            {STANDARD_QUALIFICATION_LADDER.map((lvl) => (
              <option key={lvl.ordinal} value={lvl.ordinal}>
                {lvl.label} (Level {lvl.ordinal})
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAddQualification(selectedQualOrdinal, 'Electrical/Engineering')}
          >
            Add Qualification
          </Button>
        </div>
      </Card>

      {/* What-If Simulation Mode (PRD FR-19) */}
      <Card className="p-4 border-2 border-dashed border-[#7C5CFF]/40 bg-[#7C5CFF]/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🔮</span>
            <div>
              <h2 className="text-xs font-bold text-[#0F1B3D] uppercase tracking-wider">
                What-If Simulation Mode
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Preview eligibility without modifying your saved profile.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (isWhatIfActive) {
                onToggleWhatIf(false);
              } else {
                onToggleWhatIf(true, {
                  district: whatIfDistrict,
                  addQualificationOrdinal: whatIfQualOrdinal
                });
              }
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              isWhatIfActive
                ? 'bg-[#7C5CFF] text-white shadow-md'
                : 'bg-white border border-[#7C5CFF] text-[#7C5CFF]'
            }`}
          >
            {isWhatIfActive ? '✓ What-If Active' : 'Simulate'}
          </button>
        </div>

        {isWhatIfActive && (
          <div className="mt-3 pt-3 border-t border-[#7C5CFF]/20 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[#64748B] block font-bold mb-1">Simulated District</label>
                <select
                  value={whatIfDistrict}
                  onChange={(e) => {
                    setWhatIfDistrict(e.target.value);
                    onToggleWhatIf(true, { district: e.target.value, addQualificationOrdinal: whatIfQualOrdinal });
                  }}
                  className="w-full h-8 rounded-lg bg-white border border-[#E2E8F3] px-2 text-xs"
                >
                  {MAHARASHTRA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#64748B] block font-bold mb-1">Simulated Qualification</label>
                <select
                  value={whatIfQualOrdinal}
                  onChange={(e) => {
                    const ord = Number(e.target.value);
                    setWhatIfQualOrdinal(ord);
                    onToggleWhatIf(true, { district: whatIfDistrict, addQualificationOrdinal: ord });
                  }}
                  className="w-full h-8 rounded-lg bg-white border border-[#E2E8F3] px-2 text-xs"
                >
                  {STANDARD_QUALIFICATION_LADDER.map((l) => (
                    <option key={l.ordinal} value={l.ordinal}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-[10px] text-[#7C5CFF] font-semibold text-center mt-1">
              ✨ Viewing simulated match outcomes. Go to Match tab to see what unlocks!
            </p>
          </div>
        )}
      </Card>

      {/* Confirmed Skills Chips */}
      <Card className="p-4">
        <h2 className="text-xs font-bold text-[#0F1B3D] uppercase tracking-wider mb-2">
          Confirmed Profile Skills ({candidate?.skills?.length || 0})
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {candidate?.skills?.map((sk: any) => (
            <Chip key={sk.skillId} variant="ok">
              {sk.skillId} &bull; Lvl {sk.proficiency}
            </Chip>
          ))}
        </div>
      </Card>
    </div>
  );
};
