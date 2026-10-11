import React, { useState } from 'react';
import { Card, Button, Chip } from '@rozgarlink/ui';
import { ExtractedSkill, MatchResultDTO } from '@rozgarlink/shared-types';

export interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  notEligibleMatches: MatchResultDTO[];
  eligibleMatches: MatchResultDTO[];
  onExtractSkills: (text: string) => Promise<ExtractedSkill[]>;
  onConfirmSkills: (skills: ExtractedSkill[]) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  notEligibleMatches,
  eligibleMatches,
  onExtractSkills,
  onConfirmSkills
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'explain' | 'learn' | 'extract'>('explain');
  const [freeText, setFreeText] = useState('');
  const [extractedSkills, setExtractedSkills] = useState<ExtractedSkill[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtract = async () => {
    if (!freeText.trim()) return;
    setIsExtracting(true);
    try {
      const skills = await onExtractSkills(freeText);
      setExtractedSkills(skills);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0F1B3D]/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto border border-[#E2E8F3] p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F3]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5B4BEA] to-[#7C5CFF] text-white flex items-center justify-center text-xs font-bold">
              AI
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F1B3D]">RozgarLink AI Assistant</h2>
              <p className="text-[10px] text-[#64748B]">Explains stored results & extracts skills</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#F3F6FF] text-[#64748B] hover:text-[#0F1B3D] flex items-center justify-center text-base font-bold"
          >
            &times;
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 my-3 p-1 rounded-xl bg-[#F6F8FC] border border-[#E2E8F3]">
          <button
            type="button"
            onClick={() => setActiveTab('explain')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'explain' ? 'bg-white text-[#2F5BFF] shadow-sm' : 'text-[#64748B]'
            }`}
          >
            Why Ineligible?
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('learn')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'learn' ? 'bg-white text-[#2F5BFF] shadow-sm' : 'text-[#64748B]'
            }`}
          >
            What To Learn?
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('extract')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'extract' ? 'bg-white text-[#2F5BFF] shadow-sm' : 'text-[#64748B]'
            }`}
          >
            Skill Extractor
          </button>
        </div>

        {/* Content 1: Why Ineligible */}
        {activeTab === 'explain' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Deterministic rule evaluation outcomes for your current profile:
            </p>

            {notEligibleMatches.length === 0 ? (
              <p className="text-xs text-[#12AE85] p-3 rounded-xl bg-[#12AE85]/10 font-medium">
                You meet eligibility criteria for all checked opportunities!
              </p>
            ) : (
              notEligibleMatches.slice(0, 4).map((m) => (
                <div key={m.opportunityId} className="p-3 rounded-xl bg-[#F6F8FC] border border-[#E2E8F3] text-xs">
                  <div className="flex items-center justify-between font-bold text-[#0F1B3D] mb-1">
                    <span>{m.title}</span>
                    <span className="text-[#E5484D] text-[10px]">✕ Not eligible</span>
                  </div>
                  {m.failedRules?.map((f, idx) => (
                    <p key={idx} className="text-slate-700 text-[11px] mt-0.5">
                      • <strong>{f.label}</strong> (Your value: <em>{f.candidateValue || 'None'}</em>, required: <em>{f.requiredValue}</em>)
                    </p>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {/* Content 2: What to Learn */}
        {activeTab === 'learn' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Top skill recommendations from your interested opportunities:
            </p>
            <div className="p-3 rounded-xl bg-[#EAF0FF] border border-[#2F5BFF]/20 text-xs">
              <h4 className="font-bold text-[#2F5BFF] mb-1">Recommended Next Step:</h4>
              <p className="text-slate-700 text-[11px]">
                Complete <strong>Panel Wiring & Fault Finding</strong> (40 hrs) to close 2 active required skill gaps.
              </p>
            </div>
          </div>
        )}

        {/* Content 3: Skill Extractor */}
        {activeTab === 'extract' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Paste or type your experience, trade words, or vernacular phrases in free text:
            </p>
            <textarea
              rows={3}
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="e.g. tally prime, gst returns, or fixing home power points..."
              className="w-full p-3 rounded-xl bg-[#F6F8FC] border border-[#E2E8F3] text-xs text-[#0F1B3D] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#5B4BEA]"
            />
            <Button
              variant="primary"
              size="sm"
              loading={isExtracting}
              onClick={handleExtract}
            >
              Extract Skills
            </Button>

            {extractedSkills.length > 0 && (
              <div className="pt-2 border-t border-[#E2E8F3] space-y-2">
                <p className="text-xs font-bold text-[#0F1B3D]">
                  Suggested Skills ({extractedSkills.length}):
                </p>
                <div className="space-y-2">
                  {extractedSkills.map((sk) => (
                    <div key={sk.skillId} className="flex items-center justify-between p-2 rounded-xl bg-[#F3F6FF] text-xs">
                      <div>
                        <span className="font-bold text-[#0F1B3D]">{sk.canonicalName || sk.skillId}</span>
                        <span className="text-[10px] text-[#5B4BEA] block">{sk.reason}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#12AE85]/15 text-[#12AE85]">
                        {sk.relation} ({Math.round(sk.confidence * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => {
                    onConfirmSkills(extractedSkills);
                    onClose();
                  }}
                >
                  Confirm & Add to Profile
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Strict Guardrail Notice */}
        <div className="mt-4 p-2.5 rounded-xl bg-[#F3F6FF] text-[#64748B] text-[10px] text-center border border-[#E2E8F3]">
          🔒 AI provides decision support & skill extraction only. Mandatory eligibility criteria are governed strictly by deterministic rules.
        </div>
      </div>
    </div>
  );
};
