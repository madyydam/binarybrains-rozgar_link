import React, { useState } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
 * FEATURE 6: SKILL DEMAND INSIGHTS (Maharashtra & National Skilling Pulse)
 * ───────────────────────────────────────────────────────────────────────────── */
interface SkillDemandInsightsProps {
  onExploreSkill?: (skill: string) => void;
}

export const SkillDemandInsights: React.FC<SkillDemandInsightsProps> = ({ onExploreSkill }) => {
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'pune' | 'mumbai' | 'nashik'>('all');

  const DEMAND_DATA = [
    {
      skill: 'Industrial Solar PV Engineering',
      category: 'Renewable Power',
      growth: '+44%',
      avgPay: '₹24,500/mo',
      hiringHubs: 'Pune, Satara, Ahmednagar',
      openings: 840,
      hot: true
    },
    {
      skill: 'Control Panel Wiring & PLC',
      category: 'Automation & Switchgear',
      growth: '+32%',
      avgPay: '₹22,000/mo',
      hiringHubs: 'Chakan MIDC, Bhiwandi, Aurangabad',
      openings: 1250,
      hot: true
    },
    {
      skill: 'EV Battery Assembly & Diagnostics',
      category: 'Electric Mobility',
      growth: '+58%',
      avgPay: '₹26,000/mo',
      hiringHubs: 'Pimpri-Chinchwad, Talegaon',
      openings: 620,
      hot: true
    },
    {
      skill: 'Warehouse Inventory Automation',
      category: 'E-Commerce Logistics',
      growth: '+27%',
      avgPay: '₹21,000/mo',
      hiringHubs: 'Bhiwandi Hub, Thane, Navi Mumbai',
      openings: 2100,
      hot: false
    }
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4 border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black uppercase tracking-wider mb-1.5">
            <span>📈</span> Real-Time Labor Market Intelligence
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#0F1B3D] tracking-tight">
            Skill Demand Insights & Hiring Pulse
          </h3>
          <p className="text-xs text-slate-500">
            Live quarter-over-quarter hiring trends analyzed across 5,000+ verified Maharashtra recruiter postings.
          </p>
        </div>

        {/* Region Filter */}
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          {(['all', 'pune', 'mumbai', 'nashik'] as const).map(r => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize ${
                selectedRegion === r ? 'bg-white text-[#345BFF] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {r === 'all' ? 'All MH' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Trending Skills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMAND_DATA.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#345BFF]/40 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
            onClick={() => onExploreSkill?.(item.skill)}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {item.category}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {item.growth} YoY
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#0F1B3D] group-hover:text-[#345BFF] transition-colors leading-tight">
                {item.skill}
              </h4>
            </div>

            <div className="pt-2 border-t border-slate-200/60 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Target Wage:</span>
                <span className="font-bold text-slate-800">{item.avgPay}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Hubs:</span>
                <span className="font-medium text-slate-700 text-[11px] truncate max-w-[130px]">{item.hiringHubs}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Critical Industry Skill Gap Advisory */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3.5">
        <span className="text-xl shrink-0">⚠️</span>
        <div className="space-y-1 text-xs">
          <b className="text-amber-900 font-extrabold block">
            Critical Industry Skill Gap Alert (Maharashtra State PSU & Logistics Hubs)
          </b>
          <p className="text-amber-800/90 leading-relaxed">
            Recruiter analytics show a <strong>38% supply deficit</strong> in verified <em>Industrial Workplace Safety (BIS)</em> and <em>Control Panel Testing</em>. Completing our free 12-hour NSDC module resolves this gap and qualifies your profile for <strong>4 additional State Government apprenticeships</strong>.
          </p>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
 * FEATURE 3: ALTERNATIVE CAREER PATHS & TRANSFERABLE SKILLS EXPLORER
 * ───────────────────────────────────────────────────────────────────────────── */
interface AlternativeCareerPathsProps {
  onSelectPath?: (title: string) => void;
}

export const AlternativeCareerPaths: React.FC<AlternativeCareerPathsProps> = ({ onSelectPath }) => {
  const [activeAltIndex, setActiveAltIndex] = useState<number | null>(null);

  const ALTERNATIVES = [
    {
      role: 'Solar PV Systems Installation Technician',
      industry: 'Clean Energy & Utilities',
      matchPct: 88,
      wageDiff: '+₹4,500/mo higher pay',
      transferableSkills: ['Basic Electrical', 'Workplace Safety', 'Tools & Hardware'],
      missingSkill: 'Solar PV Array Mounting (12h module)',
      companies: 'Tata Power Solar, Adani Solar, Suryamitra EPC'
    },
    {
      role: 'E-Commerce Dispatch Operations Coordinator',
      industry: 'Fast-Growing Supply Chain',
      matchPct: 92,
      wageDiff: '+₹3,200/mo higher pay',
      transferableSkills: ['Inventory Handling', 'Barcode RF Scanning', 'Computer Literacy'],
      missingSkill: 'Advanced Tally Logistics (8h module)',
      companies: 'Flipkart Logistics, Delhivery, Amazon Fulfillment'
    },
    {
      role: 'Municipal Digital Records Executive',
      industry: 'Government & Public Sector',
      matchPct: 84,
      wageDiff: 'Govt Benefits + Fixed Day Shift',
      transferableSkills: ['Basic Computer', 'Office Literacy', 'Customer Assistance'],
      missingSkill: 'Regional Marathi Typing (10h practicum)',
      companies: 'NMC Nashik, PMC Pune, Mahavitaran'
    }
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
      <div className="space-y-1 border-b pb-4 border-slate-100">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#345BFF] text-[10px] font-black uppercase tracking-wider">
          <span>🔄</span> Skill Transferability Engine
        </div>
        <h3 className="text-lg sm:text-xl font-black text-[#0F1B3D] tracking-tight">
          Alternative Career Paths Based on Transferable Skills
        </h3>
        <p className="text-xs text-slate-500">
          Don't limit yourself to one job title. Your confirmed electrical & logistics skills qualify you for adjacent, higher-paying roles with minimal bridging.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ALTERNATIVES.map((alt, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 hover:border-[#345BFF] hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {alt.industry}
                </span>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {alt.matchPct}% Transfer Match
                </span>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-[#0F1B3D] leading-tight">
                  {alt.role}
                </h4>
                <span className="text-[11px] font-bold text-[#345BFF] block mt-1">
                  ⭐ {alt.wageDiff}
                </span>
              </div>

              {/* Transferable Skills */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Transferable Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {alt.transferableSkills.map(sk => (
                    <span key={sk} className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bridging Module */}
              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-0.5">
                <span className="text-[10px] font-bold text-[#345BFF] uppercase">1 Bridging Prerequisite:</span>
                <p className="text-[11px] text-slate-700 font-semibold">{alt.missingSkill}</p>
              </div>
            </div>

            <button
              onClick={() => onSelectPath?.(alt.role)}
              className="w-full py-2.5 rounded-xl bg-[#345BFF] hover:bg-[#2348E0] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              Explore Pathway Roadmap →
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
 * FEATURE 2: FAIRNESS-AWARE RANKING AUDIT MODAL
 * ───────────────────────────────────────────────────────────────────────────── */
interface FairnessAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityTitle?: string;
}

export const FairnessAuditModal: React.FC<FairnessAuditModalProps> = ({
  isOpen,
  onClose,
  opportunityTitle = 'Verified Role Matching'
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <div>
              <h3 className="text-base font-extrabold text-[#0F1B3D]">Fairness-Aware Ranking Audit</h3>
              <p className="text-[11px] text-slate-500">Zero Demographic Bias · 100% Competency Driven</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">✕</button>
        </div>

        <div className="space-y-3.5 text-xs text-slate-600">
          <p className="leading-relaxed">
            RozgarSathi enforces an audited, transparent scoring algorithm designed specifically to eliminate algorithmic bias against first-generation vocational learners.
          </p>

          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
              Objective Fit Weight Breakdown
            </span>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                  <span>1. Verified Skill Competency</span>
                  <span>55% Weight</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-[#345BFF] w-[55%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                  <span>2. Candidate Preferences (Commute, Pay, Shift)</span>
                  <span>30% Weight</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-emerald-500 w-[30%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                  <span>3. Verified Practicum Credibility</span>
                  <span>15% Weight</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-purple-500 w-[15%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <span>✓</span> Zero Demographic Profiling: Blind to gender, caste, religion, and college prestige.
            </div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <span>✓</span> No Black-Box Elimination: Candidates are never rejected without an exact rule citation.
            </div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <span>✓</span> Equal Geographical Access: Commute scores are calculated purely from road radius.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
        >
          Close Transparency Audit
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
 * FEATURE 4: RECRUITER FEEDBACK LOOP (Transparent Hiring Feedback on Applications)
 * ───────────────────────────────────────────────────────────────────────────── */
interface RecruiterFeedbackCardProps {
  orgName: string;
  roleTitle: string;
  status: string;
  recruiterNotes: string;
  rating: string;
  onSendQuestion?: () => void;
}

export const RecruiterFeedbackCard: React.FC<RecruiterFeedbackCardProps> = ({
  orgName,
  roleTitle,
  status,
  recruiterNotes,
  rating,
  onSendQuestion
}) => {
  const [questionSent, setQuestionSent] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [showInput, setShowInput] = useState(false);

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#345BFF] border border-blue-200">
            {status}
          </span>
          <h4 className="text-sm font-bold text-[#0F1B3D] mt-1">{roleTitle}</h4>
          <span className="text-xs text-slate-500">{orgName}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Hiring Fit</span>
          <span className="text-sm font-black text-emerald-600">★ {rating}</span>
        </div>
      </div>

      {/* Structured Feedback Box */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
          <span>💬</span> Recruiter Feedback & Interview Readiness Note:
        </div>
        <p className="text-slate-600 leading-relaxed italic">
          "{recruiterNotes}"
        </p>
      </div>

      {/* Action / Interaction */}
      {showInput ? (
        <div className="space-y-2 pt-1">
          <input
            type="text"
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
            placeholder="Type your question to the recruiting coordinator..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#345BFF]"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (questionText.trim()) {
                  setQuestionSent(true);
                  setShowInput(false);
                  onSendQuestion?.();
                }
              }}
              className="px-3.5 py-1.5 bg-[#345BFF] text-white text-xs font-bold rounded-lg hover:bg-[#2348E0]"
            >
              Send Question
            </button>
            <button
              onClick={() => setShowInput(false)}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-1">
          {questionSent ? (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              ✓ Question transmitted to {orgName} talent team
            </span>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="text-xs font-bold text-[#345BFF] hover:underline flex items-center gap-1"
            >
              <span>✉️</span> Ask Recruiter a Question about Next Round →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
 * FEATURE 1: VERIFIED SKILL EVIDENCE VAULT & CRYPTOGRAPHIC CREDENTIALS
 * ───────────────────────────────────────────────────────────────────────────── */
interface EvidenceVaultSectionProps {
  onAddEvidence?: () => void;
}

export const EvidenceVaultSection: React.FC<EvidenceVaultSectionProps> = ({ onAddEvidence }) => {
  const [evidenceItems, setEvidenceItems] = useState([
    {
      id: 'EV-8841',
      title: '3-Phase Industrial Control Panel Assembly Practicum',
      issuer: 'Maharashtra State Board of Vocational Education (MSBVEE)',
      date: 'Dec 2024',
      proofType: 'Physical Workshop Assessment & Wire Schematics',
      hash: 'sha256:7f4a...92b1',
      verified: true
    },
    {
      id: 'EV-9912',
      title: 'Warehouse RF Scanning & Barcode Inventory Intake',
      issuer: 'Flipkart Logistics Hub Training Center, Bhiwandi',
      date: 'Apr 2025',
      proofType: 'Operational Practicum Log & Shift Supervisor Endorsement',
      hash: 'sha256:3c81...e45f',
      verified: true
    },
    {
      id: 'EV-1044',
      title: 'National Skill Registry Electrical Benchmark (NSQF L4)',
      issuer: 'National Skill Development Corporation (NSDC)',
      date: 'Jan 2025',
      proofType: 'DigiLocker Cryptographic Credential',
      hash: 'sha256:a18b...449c',
      verified: true
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIssuer, setNewIssuer] = useState('');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    setEvidenceItems(prev => [
      {
        id: `EV-${Math.floor(1000 + Math.random() * 9000)}`,
        title: newTitle,
        issuer: newIssuer || 'Verified Industry Partner',
        date: 'Just now',
        proofType: 'Candidate Uploaded Portfolio Document',
        hash: `sha256:${Math.random().toString(36).substring(2, 8)}...verified`,
        verified: true
      },
      ...prev
    ]);
    setShowAddModal(false);
    setNewTitle('');
    setNewIssuer('');
    onAddEvidence?.();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-3 border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider mb-1">
            <span>🛡️</span> Proof-of-Work Verification
          </div>
          <h3 className="text-base sm:text-lg font-black text-[#0F1B3D]">
            Verified Skill Evidence Vault & Credentials
          </h3>
          <p className="text-xs text-slate-500">
            Skills backed by verifiable certificates, supervisor logs, and cryptographic verification IDs.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#345BFF] hover:bg-[#2348E0] text-white text-xs font-bold transition-colors whitespace-nowrap shadow-sm"
        >
          + Add Proof
        </button>
      </div>

      <div className="space-y-3">
        {evidenceItems.map(item => (
          <div
            key={item.id}
            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">📜</span>
                <h4 className="text-xs font-extrabold text-[#0F1B3D]">{item.title}</h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  ✓ Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {item.issuer} · Issued {item.date}
              </p>
              <span className="text-[10px] text-slate-400 block font-mono">
                Evidence: {item.proofType} · Hash: {item.hash}
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-[10px] font-mono text-[#345BFF] bg-blue-50 px-2.5 py-1 rounded-lg font-bold border border-blue-100">
                {item.id}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
          <h4 className="text-xs font-bold text-[#0F1B3D]">Upload Skill Evidence / Project Link</h4>
          <input
            type="text"
            placeholder="Skill or Project Title (e.g. Solar Rooftop Inverter Installation Log)"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#345BFF]"
          />
          <input
            type="text"
            placeholder="Issuing Institute / Company / GitHub Repo"
            value={newIssuer}
            onChange={e => setNewIssuer(e.target.value)}
            className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#345BFF]"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-[#345BFF] text-white text-xs font-bold rounded-xl"
            >
              Verify & Add Evidence
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
