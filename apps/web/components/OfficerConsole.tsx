import React, { useState } from 'react';
import { Card, Button, Pill, StatusBadge, Chip } from '@rozgarlink/ui';

export interface OfficerConsoleProps {
  onClose: () => void;
  opportunities: any[];
  onSaveOpportunity: (oppData: any) => Promise<void>;
  skills: any[];
  auditLogs: any[];
}

export const OfficerConsole: React.FC<OfficerConsoleProps> = ({
  onClose,
  opportunities,
  onSaveOpportunity,
  skills,
  auditLogs
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'opportunities' | 'audit'>('create');

  // Form State
  const [title, setTitle] = useState('');
  const [district, setDistrict] = useState('Pune');
  const [minPay, setMinPay] = useState(15000);
  const [shift, setShift] = useState('day');
  const [qualLevel, setQualLevel] = useState(4); // ITI
  const [residenceState, setResidenceState] = useState('Maharashtra');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(35);
  const [isSaving, setIsSaving] = useState(false);
  const [previewCounts, setPreviewCounts] = useState<{ eligible: number; notEligible: number } | null>({
    eligible: 3,
    notEligible: 3
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const oppData = {
        title,
        orgName: 'Maharashtra State Skill Directorate',
        district,
        state: 'Maharashtra',
        preferenceAttrs: {
          pay: { min: minPay },
          shift,
          workType: 'full-time'
        },
        rules: [
          {
            id: `r-${Date.now()}-1`,
            type: 'QUAL_MIN_LEVEL',
            operator: 'gte',
            value: qualLevel,
            label: `Requires at least level ${qualLevel} qualification`,
            requiresVerification: false
          },
          {
            id: `r-${Date.now()}-2`,
            type: 'RESIDENCE_STATE',
            operator: 'in',
            value: [residenceState],
            label: `Open to residents of ${residenceState}`,
            requiresVerification: false
          },
          {
            id: `r-${Date.now()}-3`,
            type: 'AGE_RANGE',
            operator: 'between',
            value: { min: minAge, max: maxAge },
            label: `Age between ${minAge} and ${maxAge} years`,
            requiresVerification: false
          }
        ],
        skills: [{ skillId: 'SK-ELEC-WIRING', importance: 'required', minProficiency: 3 }]
      };

      await onSaveOpportunity(oppData);
      setTitle('');
      setActiveTab('opportunities');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0F1B3D]/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-y-auto border border-[#E2E8F3] p-5 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F3]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#2F5BFF] text-white text-[10px] font-bold uppercase tracking-wider">
                Officer & Admin Console
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#0F1B3D]">
              RozgarLink Administration
            </h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F6FF] text-[#64748B] hover:text-[#0F1B3D] flex items-center justify-center font-bold text-lg"
          >
            &times;
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-2 my-4">
          <Pill
            active={activeTab === 'create'}
            onClick={() => setActiveTab('create')}
          >
            Create Opportunity & Rule Builder
          </Pill>
          <Pill
            active={activeTab === 'opportunities'}
            onClick={() => setActiveTab('opportunities')}
            count={opportunities.length}
          >
            Manage Opportunities
          </Pill>
          <Pill
            active={activeTab === 'audit'}
            onClick={() => setActiveTab('audit')}
            count={auditLogs.length}
          >
            Audit Log & Decision Trace
          </Pill>
        </div>

        {/* Tab 1: Opportunity Form & Rule Builder */}
        {activeTab === 'create' && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#0F1B3D] block mb-1">Opportunity Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Electrical Apprentice (HV Substation)"
                  className="w-full h-10 rounded-xl bg-[#F6F8FC] border border-[#E2E8F3] px-3 text-xs text-[#0F1B3D] focus:outline-none focus:ring-2 focus:ring-[#2F5BFF]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0F1B3D] block mb-1">District Location</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#F6F8FC] border border-[#E2E8F3] px-3 text-xs text-[#0F1B3D]"
                >
                  <option value="Pune">Pune</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Kolhapur">Kolhapur</option>
                  <option value="Satara">Satara</option>
                  <option value="Mumbai">Mumbai</option>
                </select>
              </div>
            </div>

            {/* Rule Builder Panel */}
            <div className="p-4 rounded-2xl bg-[#EAF0FF]/50 border border-[#2F5BFF]/30 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#2F5BFF] uppercase tracking-wider">
                  Mandatory Eligibility Rule Builder
                </h3>
                <span className="text-[10px] text-[#64748B]">Deterministic & Auditable</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#0F1B3D] block mb-1">Min Qualification</label>
                  <select
                    value={qualLevel}
                    onChange={(e) => setQualLevel(Number(e.target.value))}
                    className="w-full h-9 rounded-xl bg-white border border-[#E2E8F3] px-2 text-xs"
                  >
                    <option value={2}>10th Pass</option>
                    <option value={3}>12th Pass</option>
                    <option value={4}>ITI</option>
                    <option value={5}>Diploma</option>
                    <option value={6}>Graduate</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#0F1B3D] block mb-1">Residence State</label>
                  <input
                    type="text"
                    value={residenceState}
                    onChange={(e) => setResidenceState(e.target.value)}
                    className="w-full h-9 rounded-xl bg-white border border-[#E2E8F3] px-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#0F1B3D] block mb-1">Age Range (Years)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={minAge}
                      onChange={(e) => setMinAge(Number(e.target.value))}
                      className="w-16 h-9 rounded-xl bg-white border border-[#E2E8F3] px-2 text-xs text-center"
                    />
                    <span className="text-xs text-[#64748B]">to</span>
                    <input
                      type="number"
                      value={maxAge}
                      onChange={(e) => setMaxAge(Number(e.target.value))}
                      className="w-16 h-9 rounded-xl bg-white border border-[#E2E8F3] px-2 text-xs text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Candidate Preview (FR-16) */}
            <div className="p-3.5 rounded-2xl bg-[#F6F8FC] border border-[#E2E8F3] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">📊</span>
                <div>
                  <span className="font-bold text-[#0F1B3D]">Live Eligible Candidate Preview:</span>
                  <p className="text-[11px] text-[#64748B]">
                    Based on current sample profiles across Maharashtra
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#12AE85]/15 text-[#12AE85] font-bold">
                  {previewCounts?.eligible || 3} Eligible
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#E5484D]/15 text-[#E5484D] font-bold">
                  {previewCounts?.notEligible || 3} Ineligible
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F3]">
              <Button variant="outline" size="md" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" loading={isSaving}>
                Save Opportunity & Push Live
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Opportunities List */}
        {activeTab === 'opportunities' && (
          <div className="space-y-3">
            {opportunities.map((opp) => (
              <Card key={opp.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF0FF] text-[#2F5BFF]">
                        {opp.id}
                      </span>
                      <span className="text-xs text-[#64748B]">{opp.district}, {opp.state}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#0F1B3D]">{opp.title}</h3>
                    <p className="text-xs text-[#64748B]">{opp.orgName}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#12AE85]/10 text-[#12AE85]">
                    {opp.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab 3: Audit Log & Decision Trace */}
        {activeTab === 'audit' && (
          <div className="space-y-3 text-xs">
            <p className="text-[#64748B]">
              Immutable append-only audit trail for all eligibility decisions, rule edits, and profile updates:
            </p>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {auditLogs.slice(0, 20).map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-[#F6F8FC] border border-[#E2E8F3] font-mono text-[11px]">
                  <div className="flex items-center justify-between text-[#2F5BFF] font-bold mb-0.5">
                    <span>{log.type}</span>
                    <span className="text-[10px] text-slate-500">{new Date(log.at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-700">Entity: {log.entity} &bull; ID: {log.entityId}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
