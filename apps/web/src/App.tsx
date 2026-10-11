import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Avatar, StatusBadge } from '@rozgarlink/ui';
import { GrowthHub, GrowthSubTab } from './components/growth/GrowthHub';
import { LearnHub } from './components/learn/LearnHub';
import {
  SkillDemandInsights,
  AlternativeCareerPaths,
  FairnessAuditModal,
  RecruiterFeedbackCard,
  EvidenceVaultSection,
} from './components/edge/EdgeFeatures';
import { VoiceCareerAssistant } from './components/ai/VoiceCareerAssistant';
import {
  ResumeIntelligenceSection,
  ExtractedSkillItem,
  MatchedOpportunityItem,
} from './components/profile/ResumeIntelligenceSection';

/* ─────────────────────────────── Types ─────────────────────────────── */
interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  facts: {
    state?: string;
    district?: string;
    dob?: string;
    qualifications: { ordinal: number; fieldCode?: string; verified: boolean }[];
    highestQualification?: { ordinal: number; fieldCode?: string; verified: boolean };
    certifications: { code: string; name?: string; verified: boolean }[];
    experienceMonths: Record<string, number>;
  };
  skills: {
    skillId: string;
    proficiency: number;
    source: 'manual' | 'ai' | 'course';
    confirmed: boolean;
    confidence: number;
  }[];
  preferences: {
    commuteKm?: number;
    expectedPayMin?: number;
    shift?: string;
    workType?: string;
    weights?: { commute: number; pay: number; shift: number; workType: number };
  };
  profileVersion: number;
  completedCourses: string[];
}

interface OpportunityCardData {
  id: string;
  org: string;
  init: string;
  title: string;
  loc: string;
  pay: string;
  shift: string;
  type: string;
  score: number;
  hue: number;
  reasons: string[];
  skills: [string, number][]; // [skillName, isMatched (1 or 0)]
  rules: [string, string, number][]; // [ruleReq, profileState, isPass (1 or 0)]
  pref: string[];
  path: string | null;
  failed?: [string, string][];
  fixHint?: string;
  info?: [string, string];
}

type NavTab = 'home' | 'match' | 'growth' | 'learn' | 'profile' | 'admin';
type MatchTab = 'eligible' | 'saved' | 'applied' | 'info' | 'not_eligible';
type Locale = 'en' | 'hi' | 'mr';

const QUAL_NAMES: Record<number, string> = {
  1: '8th Pass', 2: '10th Pass', 3: '12th Pass',
  4: 'ITI', 5: 'Diploma', 6: 'Graduate', 7: 'Postgraduate'
};

/* ─────────────── Course Catalog ─────────────── */
const COURSES = [
  { id: 'crs-safety-basics', title: 'Foundations of Industrial Safety', provider: 'NSDC', hours: 12, skills: ['Industrial Safety'], cost: 'Free', modules: 8, color: 'from-[#6366F1] to-[#8B5CF6]', icon: '🛡️' },
  { id: 'crs-panel-wiring-adv', title: 'Industrial Control Panel Wiring', provider: 'MSBVEE', hours: 45, skills: ['Panel Wiring', 'Electrical Fault'], cost: '₹500', modules: 12, color: 'from-[#06B6D4] to-[#3B82F6]', icon: '⚡' },
  { id: 'crs-solar-mastery', title: 'Advanced Rooftop Solar PV Engineering', provider: 'Suryamitra', hours: 60, skills: ['Solar PV Installation'], cost: '₹1,200', modules: 10, color: 'from-[#F59E0B] to-[#EF4444]', icon: '☀️' },
  { id: 'crs-polytechnic-diploma-ee', title: 'Polytechnic Diploma in Electrical Engg.', provider: 'MSBTE Board', hours: 900, skills: ['Basic Electrical', 'Panel Wiring'], cost: '₹14,000', modules: 24, color: 'from-[#10B981] to-[#059669]', icon: '🎓' },
];

/* ─────────────── Sidebar Items ─────────────── */
const SIDEBAR_ITEMS: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { id: 'match', label: 'Match', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z" /></svg> },
  { id: 'growth', label: 'Growth Hub', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
  { id: 'learn', label: 'Learn', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
  { id: 'profile', label: 'Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
];

/* ─────────────── Core Opportunities ─────────────── */
const BASE_OPPS: Record<string, OpportunityCardData> = {
  flip: {
    id: 'flip', org: 'Flipkart Logistics Hub, Bhiwandi', init: 'FL',
    title: 'E-Commerce Warehouse Sorter & Packer', loc: 'Thane, Maharashtra',
    pay: '₹17,000–21,000/mo', shift: 'Flexible shift', type: 'Full-time · On-site', score: 84, hue: 0,
    reasons: ['Matches 3 of 3 required skills', 'Commute 38 km, within district', 'Pay exceeds target minimum'],
    skills: [['Inventory handling', 1], ['Packing', 1], ['Basic computer', 1]],
    rules: [['Requires 10th pass minimum', 'Your profile: 12th pass', 1]],
    pref: ['Pay ₹17,000–21,000', 'Flexible shift', 'Commute ~38 km'], path: null
  },
  nmc: {
    id: 'nmc', org: 'Nashik Municipal Corporation (NMC)', init: 'NM',
    title: 'Digital Office & Billing Executive', loc: 'Nashik, Maharashtra',
    pay: '₹16,000–22,000/mo', shift: 'Day shift', type: 'Full-time · Govt Partner', score: 78, hue: 1,
    reasons: ['Matches 2 of 3 required skills', 'Tally was matched to Accounting software (confirmed)', 'Day shift matches preference'],
    skills: [['Computer literacy', 1], ['Accounting software', 1], ['Billing', 0]],
    rules: [
      ['Requires minimum 12th pass with computer literacy', 'Your profile: 12th pass', 1],
      ['Open to Maharashtra residents', 'Your location: Maharashtra resident', 1]
    ],
    pref: ['Pay ₹16,000–22,000', 'Day shift', 'Commute ~210 km'],
    path: 'Billing basics: 1 course, 8 hours, free. Closes your 1 missing skill.'
  },
  dmart: {
    id: 'dmart', org: 'D-Mart Retail, Pune', init: 'DM',
    title: 'Retail Store Associate & Cashier', loc: 'Pune, Maharashtra',
    pay: '₹14,000–18,000/mo', shift: 'Rotational shift', type: 'Full-time · On-site', score: 71, hue: 2,
    reasons: ['Matches 2 of 2 required skills', 'Commute 9 km, within your preference', 'Regular career progression'],
    skills: [['Customer service', 1], ['Cash handling', 1], ['Stock counting', 0]],
    rules: [
      ['Requires 10th pass minimum', 'Your profile: 12th pass', 1],
      ['Age 18 to 35 as on 1 Jan 2027', 'Your age: 24', 1]
    ],
    pref: ['Pay ₹14,000–18,000', 'Rotational shift', 'Commute ~9 km'], path: null
  },
  msedcl: {
    id: 'msedcl', org: 'MSEDCL, Pune Circle', init: 'MS',
    title: 'Control Panel Technician (Apprentice)', loc: 'Pune, Maharashtra',
    pay: '₹18,000–24,000/mo', shift: 'Day shift', type: 'Apprenticeship · Govt', score: 88, hue: 1,
    reasons: ['Matches 3 of 3 required skills', 'Commute 6 km, within your preference', 'Pay is above your target minimum'],
    skills: [['Panel wiring', 1], ['Electrical fault finding', 1], ['Industrial safety', 1]],
    rules: [
      ['Requires ITI in Electrician or Wireman', 'You now have: ITI Electrician', 1],
      ['Open to Maharashtra residents', 'Your location: Maharashtra', 1]
    ],
    pref: ['Pay ₹18,000–24,000', 'Day shift', 'Commute ~6 km'], path: null,
    failed: [['Requires ITI in Electrician or Wireman', 'Your profile: 12th pass']],
    fixHint: 'An ITI in Electrician would meet this.'
  },
  mahagen: {
    id: 'mahagen', org: 'Mahagenco, Nashik', init: 'MG',
    title: 'Plant Operator Trainee', loc: 'Nashik, Maharashtra',
    pay: '₹15,000–20,000/mo', shift: 'Shift work', type: 'Trainee', score: 65, hue: 0,
    reasons: [], skills: [], rules: [], pref: [], path: null,
    failed: [['Requires a valid Fire Safety Certificate', 'Your profile: no certificate added']],
    fixHint: 'A Fire Safety course is in the catalogue (10 hours).'
  },
  guj: {
    id: 'guj', org: 'GSECL Solar Park', init: 'GS',
    title: 'Solar Site Technician', loc: 'Surat, Gujarat',
    pay: '₹18,000–25,000/mo', shift: 'Day shift', type: 'Full-time', score: 60, hue: 2,
    reasons: [], skills: [], rules: [], pref: [], path: null,
    failed: [['Open to residents of Gujarat only', 'Your location: Pune, Maharashtra']],
    fixHint: 'State residency restricted. Update location if out of date.'
  },
  lic: {
    id: 'lic', org: 'Shivneri Transport, Pune', init: 'ST',
    title: 'Commercial Delivery Executive', loc: 'Pune, Maharashtra',
    pay: '₹16,000–20,000/mo', shift: 'Flexible shift', type: 'Contract', score: 70, hue: 0,
    reasons: [], skills: [], rules: [], pref: [], path: null,
    info: ['Requires a valid driving licence', 'Add your driving licence details to check eligibility.']
  }
};

/* ──────────────────────── Circular Ring Component ──────────────────────── */
const ScoreRingCircle: React.FC<{ score: number }> = ({ score }) => {
  const r = 20;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  return (
    <div className="ring-wrap" title={`Match Score: ${score}%`}>
      <svg width="50" height="50" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r={r} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="4.5" />
        <circle
          cx="25"
          cy="25"
          r={r}
          fill="none"
          stroke="#fff"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <em>{score}</em>
    </div>
  );
};

/* ══════════════════════════════ APPLICATION ══════════════════════════════ */
export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [growthSubTab, setGrowthSubTab] = useState<GrowthSubTab>('arena');
  const [currentCandidateId, setCurrentCandidateId] = useState('cand-asha');
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [locale, setLocale] = useState<Locale>('en');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [changeBanner, setChangeBanner] = useState<{ message: string } | null>(null);

  /* ── Match System State ── */
  const [opps, setOpps] = useState<Record<string, OpportunityCardData>>(BASE_OPPS);
  const [deck, setDeck] = useState<string[]>(['flip', 'nmc', 'dmart']);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [notEligIds, setNotEligIds] = useState<string[]>(['msedcl', 'mahagen', 'guj']);
  const [needInfoIds, setNeedInfoIds] = useState<string[]>(['lic']);
  const [history, setHistory] = useState<{ id: string; action: 'like' | 'skip' | 'save' }[]>([]);
  const [matchTab, setMatchTab] = useState<MatchTab>('eligible');
  const [whatIf, setWhatIf] = useState(false);
  const [newId, setNewId] = useState<string | null>(null);
  const [matchBanner, setMatchBanner] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [applyModalOpp, setApplyModalOpp] = useState<OpportunityCardData | null>(null);
  const [showFairnessModal, setShowFairnessModal] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<'all' | 'job' | 'apprenticeship' | 'govt' | 'trainee'>('all');

  const getOppPathway = (typeStr: string): 'job' | 'apprenticeship' | 'govt' | 'trainee' => {
    const t = (typeStr || '').toLowerCase();
    if (t.includes('apprentice')) return 'apprenticeship';
    if (t.includes('govt')) return 'govt';
    if (t.includes('trainee') || t.includes('intern')) return 'trainee';
    return 'job';
  };

  const activeDeck = deck.filter((id) => {
    if (selectedPathway === 'all') return true;
    const o = opps[id];
    return o && getOppPathway(o.type) === selectedPathway;
  });

  /* ── Drag & Swipe Interaction State ── */
  const dragRef = useRef<{ x: number; y: number; t: number; dx: number; dy: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [flyOut, setFlyOut] = useState<{ action: 'like' | 'skip' | 'save' } | null>(null);

  /* ── Learn Tab & AI State ── */
  const [learnSubTab, setLearnSubTab] = useState<'Courses' | 'Paths' | 'Practice' | 'My Learning'>('Courses');
  const [aiExtractText, setAiExtractText] = useState('');
  const [extractedSkills, setExtractedSkills] = useState<{ skillId: string; name: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);



  /* ── Floating AI Assistant State ── */
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    { sender: 'bot', text: 'Namaste Asha! I am your ROZGARSATHI AI Career Assistant. How can I assist your job search, skill roadmaps, or eligibility today?' },
  ]);
  const [aiChatInput, setAiChatInput] = useState('');

  const handleSendAiMessage = (customMsg?: string) => {
    const msg = customMsg || aiChatInput;
    if (!msg.trim()) return;
    setAiChatMessages((prev) => [...prev, { sender: 'user', text: msg }]);
    setAiChatInput('');

    setTimeout(() => {
      let reply = "Based on your verified 12th pass qualifications and electrical practicum, you have 3 eligible roles in Pune and Thane. Enrolling in the 'Industrial Control Panel Wiring' course will unlock higher pay apprenticeships at MSEDCL!";
      if (msg.toLowerCase().includes('course')) {
        reply = "Recommended for you: 'Advanced Rooftop Solar PV Engineering' (Suryamitra, 60h) and 'Panel Wiring' (MSBVEE). These match high-demand hiring cycles in Maharashtra.";
      } else if (msg.toLowerCase().includes('mahagen') || msg.toLowerCase().includes('fire')) {
        reply = "For Mahagenco Plant Operator Trainee, you currently need a valid Fire Safety Certificate. You can acquire this via our free 12-hour NSDC course on the Learn tab.";
      } else if (msg.toLowerCase().includes('salary') || msg.toLowerCase().includes('pay')) {
        reply = "Your target pay is ₹18,000–₹24,000/mo. Verified recruiter roles at Flipkart Logistics and NMC currently meet or exceed this target minimum!";
      }
      setAiChatMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 400);
  };

  /* ── Toast Helper ── */
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 3600);
  }, []);

  /* ── Data Fetching from Live Backend ── */
  const fetchProfile = async () => {
    try {
      const res = await fetch(`/v1/candidates/me?candidateId=${currentCandidateId}`);
      if (res.ok) {
        const data = await res.json();
        setCandidate(data.candidate);
      }
    } catch {}
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch(`/v1/matches?candidateId=${currentCandidateId}&locale=${locale}`);
      if (res.ok) {
        const data = await res.json();
        if (data.eligible && data.eligible.length > 0 && !whatIf) {
          const newOppsDict = { ...BASE_OPPS };
          [...(data.eligible || []), ...(data.needsInfo || []), ...(data.notEligible || [])].forEach((m: any) => {
            const opp = m.opportunity;
            if (opp && !newOppsDict[opp.id]) {
              newOppsDict[opp.id] = {
                id: opp.id,
                org: opp.orgName,
                init: opp.orgName?.substring(0, 2).toUpperCase() || 'JB',
                title: opp.title,
                loc: `${opp.district}, ${opp.state}`,
                pay: opp.preferenceAttrs?.pay ? `₹${opp.preferenceAttrs.pay.min?.toLocaleString()}–${opp.preferenceAttrs.pay.max?.toLocaleString()}/mo` : 'Market rate',
                shift: opp.preferenceAttrs?.shift ? `${opp.preferenceAttrs.shift} shift` : 'Regular',
                type: opp.preferenceAttrs?.workType || 'Full-time · On-site',
                score: m.score || 78,
                hue: Math.floor(Math.random() * 3),
                reasons: m.explanation?.points || ['Matches candidate verified profile criteria'],
                skills: (opp.skills || []).map((s: any) => [s.skillId || s, 1]),
                rules: (m.ruleResults || []).map((r: any) => [r.label, r.candidateValue || 'Verified', r.outcome === 'PASS' ? 1 : 0]),
                pref: [`Shift: ${opp.preferenceAttrs?.shift || 'Day'}`],
                path: m.pathway?.steps?.[0]?.title ? `${m.pathway.steps[0].title} (${m.pathway.steps[0].durationHours}h)` : null,
                failed: (m.explanation?.failedRules || []).map((fr: any) => [fr.label, fr.candidateValue || 'Not met']),
                fixHint: 'Review qualification criteria.',
                info: m.explanation?.missingFields?.length ? ['Requires more details', m.explanation.missingFields.join(', ')] : undefined
              };
            }
          });
          setOpps(newOppsDict);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchProfile();
    fetchMatches();
  }, [currentCandidateId, locale]);

  /* ── Real-Time SSE ── */
  useEffect(() => {
    const sse = new EventSource(`/v1/events?candidateId=${currentCandidateId}`);
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'matches.updated') {
          fetchProfile();
          fetchMatches();
          const newCount = data.changes?.newlyEligible?.length || 0;
          if (newCount > 0) setChangeBanner({ message: `🎉 ${newCount} new eligible opportunity updated!` });
        }
      } catch {}
    };
    return () => sse.close();
  }, [currentCandidateId]);

  /* ── Commit Swipe Action ── */
  const commit = useCallback((action: 'like' | 'skip' | 'save') => {
    if (!deck.length) return;
    const topCardId = (selectedPathway === 'all' ? deck[0] : (activeDeck[0] || deck[0]));
    if (!topCardId) return;
    const id = topCardId;
    setFlyOut({ action });

    setTimeout(() => {
      setDeck((prev) => prev.filter((item) => item !== id));
      setHistory((prev) => [...prev, { id, action }]);
      if (id === newId) setNewId(null);
      if (action === 'save') setSavedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      if (action === 'like') setAppliedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

      setFlyOut(null);
      setDragOffset({ dx: 0, dy: 0 });
      setIsDragging(false);
      dragRef.current = null;

      const actionText = { like: 'Expressed Interest in Role', skip: 'Passed on Opportunity', save: 'Saved to Opportunities' }[action];
      triggerToast(actionText);
    }, 240);
  }, [deck, activeDeck, selectedPathway, newId, triggerToast]);

  /* ── Undo Last Action ── */
  const undo = useCallback(() => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setDeck((prev) => [last.id, ...prev]);
    if (last.action === 'save') setSavedIds((prev) => prev.filter((x) => x !== last.id));
    if (last.action === 'like') setAppliedIds((prev) => prev.filter((x) => x !== last.id));
    setToastMsg(null);
  }, [history]);

  /* ── What-If Career Simulation Switch ── */
  const handleWhatIfToggle = () => {
    const next = !whatIf;
    setWhatIf(next);
    if (next) {
      setNotEligIds((prev) => prev.filter((x) => x !== 'msedcl'));
      setDeck((prev) => ['msedcl', ...prev.filter((x) => x !== 'msedcl')]);
      setNewId('msedcl');
      setMatchTab('eligible');
      setMatchBanner('⚡ Added ITI Electrician: 1 newly eligible opportunity unlocked, 3 re-ranked!');
    } else {
      setDeck((prev) => prev.filter((x) => x !== 'msedcl'));
      setNotEligIds((prev) => (prev.includes('msedcl') ? prev : ['msedcl', ...prev]));
      setNewId(null);
      setMatchBanner('Removed ITI Electrician: 1 role no longer eligible');
      setTimeout(() => setMatchBanner(null), 3000);
    }
  };

  /* ── Keyboard Shortcuts (←, ↑, →) ── */
  useEffect(() => {
    if (activeTab !== 'match' || matchTab !== 'eligible' || sheetId || applyModalOpp) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        commit('like');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        commit('skip');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        commit('save');
      } else if (e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (deck[0]) setSheetId(deck[0]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, matchTab, sheetId, applyModalOpp, deck, commit]);

  /* ── Drag Gesture Handlers on Top Card ── */
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      dx: 0,
      dy: 0,
    };
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !isDragging) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current.dx = dx;
    dragRef.current.dy = dy;
    setDragOffset({ dx, dy });
  };

  const handlePointerEnd = () => {
    if (!dragRef.current || !isDragging) return;
    const { dx, dy, t } = dragRef.current;
    const v = Math.abs(dx) / (performance.now() - t + 1);
    setIsDragging(false);

    if (dy < -85 && Math.abs(dy) > Math.abs(dx)) {
      commit('save');
    } else if (dx > 85 || (dx > 40 && v > 0.6)) {
      commit('like');
    } else if (dx < -85 || (dx < -40 && v > 0.6)) {
      commit('skip');
    } else {
      setDragOffset({ dx: 0, dy: 0 });
      dragRef.current = null;
    }
  };

  /* ── Course Completion & Skills Actions ── */
  const handleCompleteCourse = async (resourceId: string) => {
    try {
      await fetch(`/v1/learning/complete?candidateId=${currentCandidateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId }),
      });
      fetchProfile();
      fetchMatches();
      setSheetId(null);
      triggerToast('Course completed! Verified skill added to profile.');
    } catch {}
  };

  const handleExtractSkills = async () => {
    if (!aiExtractText.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/v1/candidates/me/skills/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiExtractText }),
      });
      if (res.ok) {
        const data = await res.json();
        setExtractedSkills(data.skills || []);
        triggerToast(`AI detected ${data.skills?.length || 0} skills.`);
      }
    } catch {
      triggerToast('Skill extraction service reached.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleConfirmExtractedSkill = async (skillId: string) => {
    if (!candidate) return;
    const current = [...candidate.skills];
    if (!current.some((s) => s.skillId === skillId)) {
      current.push({ skillId, proficiency: 3, source: 'ai', confirmed: true, confidence: 0.95 });
    }
    await fetch(`/v1/candidates/me/skills?candidateId=${currentCandidateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills: current }),
    });
    setExtractedSkills((prev) => prev.filter((s) => s.skillId !== skillId));
    fetchProfile();
    fetchMatches();
    triggerToast(`Skill added to verified profile.`);
  };

  /* ── Resume Intelligence & Skill Sync Handlers ── */
  const handleSyncResumeSkills = async (newSkills: ExtractedSkillItem[]) => {
    if (!candidate) return;
    const current = [...candidate.skills];
    newSkills.forEach((ns) => {
      if (!current.some((cs) => cs.skillId === ns.skillId)) {
        current.push({
          skillId: ns.skillId,
          proficiency: 4,
          source: 'ai',
          confirmed: true,
          confidence: ns.confidence,
        });
      }
    });

    const updated = {
      ...candidate,
      skills: current,
      profileVersion: (candidate.profileVersion || 1) + 1,
    };
    setCandidate(updated);

    // Call backend API to persist skills & trigger recalculation of matches
    try {
      await fetch(`/v1/candidates/me/skills?candidateId=${currentCandidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: current }),
      });
      fetchProfile();
      fetchMatches();
    } catch {}

    // Unlock corresponding opportunities in deck if not already there
    const unlockedIds: string[] = [];
    if (newSkills.some((s) => s.skillId.includes('solar') || s.skillId.includes('electrical') || s.skillId.includes('panel'))) {
      unlockedIds.push('msedcl', 'guj');
    }
    if (newSkills.some((s) => s.skillId.includes('warehouse') || s.skillId.includes('packing') || s.skillId.includes('inventory'))) {
      unlockedIds.push('flip');
    }
    if (newSkills.some((s) => s.skillId.includes('excel') || s.skillId.includes('data') || s.skillId.includes('computer') || s.skillId.includes('tally'))) {
      unlockedIds.push('nmc');
    }
    if (newSkills.some((s) => s.skillId.includes('safety') || s.skillId.includes('first-aid'))) {
      unlockedIds.push('mahagen');
    }
    if (unlockedIds.length > 0) {
      setDeck((prev) => Array.from(new Set([...unlockedIds, ...prev])));
      setNotEligIds((prev) => prev.filter((id) => !unlockedIds.includes(id)));
    }
  };

  const handleApplyMatchedOpp = (opp: MatchedOpportunityItem) => {
    if (!appliedIds.includes(opp.id)) {
      setAppliedIds((prev) => [...prev, opp.id]);
    }
    triggerToast(`Application submitted to ${opp.org} with verified resume!`);
  };



  /* ── Top Card Transform ── */
  const dragRot = Math.max(-12, Math.min(12, dragOffset.dx / 20));
  let topTransform = `translate(${dragOffset.dx}px, ${dragOffset.dy * 0.35}px) rotate(${dragRot}deg)`;
  let topTransition = 'none';

  if (flyOut) {
    topTransition = 'transform .26s ease-in, opacity .26s';
    if (flyOut.action === 'like') topTransform = 'translate(540px, -20px) rotate(14deg)';
    else if (flyOut.action === 'skip') topTransform = 'translate(-540px, -20px) rotate(-14deg)';
    else if (flyOut.action === 'save') topTransform = 'translate(0, -600px)';
  } else if (!isDragging) {
    topTransition = 'transform .24s cubic-bezier(.2,.9,.3,1.2)';
    topTransform = 'translate(0, 0) rotate(0deg)';
  }

  const yesOpacity = flyOut?.action === 'like' ? 1 : Math.min(1, Math.max(0, dragOffset.dx / 85));
  const noOpacity = flyOut?.action === 'skip' ? 1 : Math.min(1, Math.max(0, -dragOffset.dx / 85));
  const saveOpacity = flyOut?.action === 'save' ? 1 : Math.min(1, Math.max(0, -dragOffset.dy / 85) * (Math.abs(dragOffset.dy) > Math.abs(dragOffset.dx) ? 1 : 0));

  const activeSheetOpp = sheetId ? opps[sheetId] : null;

  /* ── Filtered Opportunities for Search ── */
  const filteredCourses = COURSES.filter((c) =>
    !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDeck = deck.filter((id) => {
    const o = opps[id];
    return !searchQuery || o?.title.toLowerCase().includes(searchQuery.toLowerCase()) || o?.org.toLowerCase().includes(searchQuery.toLowerCase());
  });

  /* ══════════════════════ MOBILE TOP BAR ══════════════════════ */
  const MobileTopBar = () => (
    <div className="mobile-topbar">
      <div className="mobile-topbar-left">
        <div className="mobile-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="mobile-brand-name">ROZGARSATHI</span>
      </div>
      <div className="mobile-topbar-right">
        <button className="mobile-icon-btn" onClick={() => setActiveTab('match')} aria-label="Matches">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z" />
          </svg>
          {deck.length > 0 && <span className="notif-badge">{deck.length}</span>}
        </button>
      </div>
    </div>
  );

  /* ══════════════════════ RENDER ══════════════════════ */
  return (
    <div className="app-shell">
      {/* ──────────── DESKTOP SIDEBAR ──────────── */}
      <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          {sidebarOpen && (
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">ROZGARSATHI</span>
              <span className="sidebar-brand-sub">National Career Match</span>
            </div>
          )}
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="sidebar-nav-label">{item.label}</span>}
                {item.id === 'match' && deck.length > 0 && (
                  <span className={sidebarOpen ? 'sidebar-badge' : 'sidebar-badge sidebar-badge-icon'}>
                    {deck.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div
            className="sidebar-user-card"
            onClick={() => setActiveTab('profile')}
            title="View Profile (Asha Patil)"
          >
            <div className="sidebar-user-avatar">
              <span>AP</span>
              <span className="sidebar-user-status" />
            </div>
            {sidebarOpen && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name-row">
                  <span className="sidebar-user-name">{candidate?.name || 'Asha Patil'}</span>
                  <span className="sidebar-verified-badge" title="Verified Candidate">✓</span>
                </div>
                <span className="sidebar-user-role">12th Pass · Pune, MH</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ──────────── MAIN CONTENT CONTAINER ──────────── */}
      <main className="main-content">
        {changeBanner && (
          <div className="live-banner">
            <span className="live-banner-dot" />
            <span>{changeBanner.message}</span>
            <button onClick={() => setChangeBanner(null)} className="live-banner-close">✕</button>
          </div>
        )}

        {/* ══════════════ 1. HOME DASHBOARD ══════════════ */}
        {activeTab === 'home' && (
          <div className="screen-home">
            <MobileTopBar />

            {/* Header: Welcome & Search */}
            <div className="home-welcome-header">
              <div className="welcome-title-wrap">
                <h1>Welcome back, {candidate?.name || 'Asha Patil'}</h1>
                <p className="welcome-subtitle">Your next career and learning opportunity starts here.</p>
              </div>
              <div className="home-search-wrap">
                <div className="home-search-bar">
                  <svg className="home-search-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search courses, jobs, recruiters, required skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="home-search-input"
                  />
                </div>
              </div>
            </div>

            {/* Well-proportioned Career Hero Banner */}
            <div className="home-hero">
              <div className="home-hero-content">
                <span className="home-hero-tagline">Build · Learn · Grow</span>
                <h2 className="home-hero-title">Your Verified Tech & Vocational Journey</h2>
                <p className="home-hero-sub">
                  Connect with verified recruiter roles, upgrade your skills with certified paths, and track transparent career milestones with ROZGARSATHI.
                </p>
                <button onClick={() => setActiveTab('match')} className="home-hero-cta">
                  <span>Discover Opportunities</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
              <div className="home-hero-illustration">
                <svg width="120" height="120" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="38" fill="white" opacity="0.12" />
                  <path d="M22 55 L40 22 L58 55" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9"/>
                  <path d="M35 45 L40 22 L45 45" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5"/>
                  <circle cx="40" cy="22" r="4.5" fill="white" opacity="0.95"/>
                </svg>
              </div>
            </div>

            {/* Quick Actions (4 in a row) */}
            <div className="home-quick-actions">
              {[
                { tab: 'match' as NavTab, label: 'Discover Opportunities', sub: 'Swipe & Match Roles', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z" /></svg> },
                { tab: 'learn' as NavTab, label: 'Continue Learning', sub: 'Build in-demand skills', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
                { tab: 'profile' as NavTab, label: 'Complete Profile', sub: 'Verify Qualifications', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
                { tab: 'learn' as NavTab, label: 'Career Pathways', sub: 'Explore Roadmaps', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
              ].map((item, idx) => (
                <button key={idx} onClick={() => setActiveTab(item.tab)} className="quick-action-btn">
                  <div className="quick-action-icon-wrap">{item.icon}</div>
                  <div className="quick-action-text">
                    <span className="quick-action-label">{item.label}</span>
                    <span className="quick-action-sub">{item.sub}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Growth OS & Career Accelerators (Integrated from Futora Career OS) */}
            <section className="home-growth-shortcuts-section">
              <div className="home-section-header">
                <div>
                  <h3 className="home-section-title">Growth Accelerators & Skill Arena</h3>
                  <p className="home-section-sub">Level up with live practice, AI mock interviews, 1:1 mentorship & national hackathons.</p>
                </div>
                <button
                  onClick={() => { setActiveTab('growth'); setGrowthSubTab('arena'); }}
                  className="home-see-all"
                >
                  Open Growth Hub →
                </button>
              </div>

              <div className="home-growth-cards-grid">
                <div
                  onClick={() => { setActiveTab('growth'); setGrowthSubTab('arena'); }}
                  className="home-growth-card arena-card"
                >
                  <div className="growth-card-top">
                    <span className="growth-card-icon">💻</span>
                    <span className="growth-card-badge">🔥 14-Day Streak</span>
                  </div>
                  <h4 className="growth-card-title">Code Arena & 100 Days</h4>
                  <p className="growth-card-desc">In-browser IDE with JavaScript, Python, C++, and Java. Solve today's challenge to earn +50 XP.</p>
                  <div className="growth-card-cta">Start Coding →</div>
                </div>

                <div
                  onClick={() => { setActiveTab('growth'); setGrowthSubTab('interview'); }}
                  className="home-growth-card interview-card"
                >
                  <div className="growth-card-top">
                    <span className="growth-card-icon">🤖</span>
                    <span className="growth-card-badge">Razorpay · Zepto</span>
                  </div>
                  <h4 className="growth-card-title">AI Mock Interview Coach</h4>
                  <p className="growth-card-desc">Simulate realistic Technical, System Design, and HR interview rounds with instant AI evaluation.</p>
                  <div className="growth-card-cta">Launch Interview →</div>
                </div>

                <div
                  onClick={() => { setActiveTab('growth'); setGrowthSubTab('mentors'); }}
                  className="home-growth-card mentor-card"
                >
                  <div className="growth-card-top">
                    <span className="growth-card-icon">🤝</span>
                    <span className="growth-card-badge">⭐ 4.9 Rated</span>
                  </div>
                  <h4 className="growth-card-title">1-on-1 Mentorship</h4>
                  <p className="growth-card-desc">Book 45-minute portfolio reviews and system design guidance with verified senior tech leads.</p>
                  <div className="growth-card-cta">Book Session →</div>
                </div>

                <div
                  onClick={() => { setActiveTab('growth'); setGrowthSubTab('events'); }}
                  className="home-growth-card comp-card"
                >
                  <div className="growth-card-top">
                    <span className="growth-card-icon">🏆</span>
                    <span className="growth-card-badge">SIH 2026 Open</span>
                  </div>
                  <h4 className="growth-card-title">Hackathons & Contests</h4>
                  <p className="growth-card-desc">Compete for ₹25 Lakhs+ in cash awards, direct incubation, and Pre-Placement Offers (PPOs).</p>
                  <div className="growth-card-cta">Explore Contests →</div>
                </div>
              </div>
            </section>

            {/* FEATURE 6: SKILL DEMAND INSIGHTS (Maharashtra Labor Market Pulse) */}
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <SkillDemandInsights onExploreSkill={() => setActiveTab('learn')} />
            </div>

            {/* FEATURE 3: ALTERNATIVE CAREER PATHS (Transferable Skills Engine) */}
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <AlternativeCareerPaths onSelectPath={() => setActiveTab('learn')} />
            </div>

            {/* Recommended Courses (Responsive 4-column Grid) */}
            <section className="home-section">
              <div className="home-section-header">
                <h3 className="home-section-title">Recommended Courses for Career Advancement</h3>
                <button onClick={() => setActiveTab('learn')} className="home-see-all">See all courses →</button>
              </div>
              <div className="recommend-list">
                {filteredCourses.map((c) => {
                  const isCompleted = candidate?.completedCourses.includes(c.id);
                  return (
                    <div key={c.id} className="recommend-card">
                      <div className={`recommend-card-thumb bg-gradient-to-br ${c.color}`}>
                        <span>{c.icon}</span>
                      </div>
                      <div className="recommend-card-body">
                        <div className="recommend-card-badges">
                          <span className="rec-badge rec-badge-popular">{isCompleted ? 'Completed ✓' : c.cost}</span>
                        </div>
                        <h4 className="recommend-card-title">{c.title}</h4>
                        <p className="recommend-card-sub">{c.provider}</p>
                        <div className="recommend-card-meta">
                          <span>{c.modules} modules</span>
                          <span>·</span>
                          <span>{c.hours} hrs</span>
                        </div>
                      </div>
                      <button
                        onClick={() => !isCompleted && handleCompleteCourse(c.id)}
                        className="recommend-card-arrow"
                        aria-label="View course"
                        title={isCompleted ? 'Completed' : 'Enroll in course'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Top Recruiter Opportunities Preview */}
            <section className="home-section">
              <div className="home-section-header">
                <h3 className="home-section-title">Verified Recruiter Opportunities</h3>
                <button onClick={() => setActiveTab('match')} className="home-see-all">Explore Match Deck →</button>
              </div>
              <div className="home-opps-grid">
                {['flip', 'nmc', 'dmart', 'msedcl'].map((id) => {
                  const o = opps[id];
                  if (!o) return null;
                  const isEligible = deck.includes(id);
                  return (
                    <div key={id} className="home-opp-card">
                      <div className="home-opp-header">
                        <div className="home-opp-logo">{o.init}</div>
                        <div className="home-opp-org-info">
                          <span className="home-opp-org">{o.org}</span>
                          <span className="home-opp-badge">Recruiter · Verified Partner</span>
                        </div>
                      </div>
                      <h4 className="home-opp-title">{o.title}</h4>
                      <div className="home-opp-meta">
                        <span className="meta-tag">{o.loc}</span>
                        <span className="meta-tag">{o.pay}</span>
                        <span className="meta-tag">{o.type}</span>
                      </div>
                      <div className="home-opp-footer">
                        <span className={`elig-pill ${isEligible ? 'pass' : 'fail'}`}>
                          {isEligible ? '✓ Eligible' : 'Requirement Gap'}
                        </span>
                        <button
                          onClick={() => { setActiveTab('match'); setSheetId(id); }}
                          className="home-opp-cta"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Summary Metrics Row */}
            <div className="home-stats-row">
              <div className="home-stat-card eligible">
                <span className="home-stat-num">{deck.length}</span>
                <span className="home-stat-label">Eligible Opportunities</span>
              </div>
              <div className="home-stat-card needsinfo">
                <span className="home-stat-num">{needInfoIds.length}</span>
                <span className="home-stat-label">In Review / Need Info</span>
              </div>
              <div className="home-stat-card applied">
                <span className="home-stat-num">{appliedIds.length}</span>
                <span className="home-stat-label">Expressed Interest</span>
              </div>
              <div className="home-stat-card courses">
                <span className="home-stat-num">{candidate?.completedCourses.length || 0}</span>
                <span className="home-stat-label">Courses Completed</span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ GROWTH HUB & CAREER OS ══════════════ */}
        {activeTab === 'growth' && (
          <div className="screen-home">
            <MobileTopBar />
            <GrowthHub
              activeSubTab={growthSubTab}
              setActiveSubTab={setGrowthSubTab}
              onToast={triggerToast}
            />
          </div>
        )}

        {/* ══════════════ 2. MATCH — TINDER-INSPIRED OPPORTUNITY DISCOVERY ══════════════ */}
        {activeTab === 'match' && (
          <div className="screen-home">
            <MobileTopBar />

            {/* Header */}
            <div className="screen-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h1 className="screen-title" style={{ margin: 0 }}>Discover Opportunities</h1>
                  <span className="card-chip" style={{ background: '#EBF0FF', color: '#345BFF', fontWeight: 700, padding: '4px 10px', fontSize: 11 }}>
                    {deck.length} Verified Eligible
                  </span>
                </div>
                <p className="screen-sub" style={{ marginTop: 4 }}>
                  Find verified roles matching your qualifications, skills, and preferences with explainable ranking.
                </p>
              </div>

              {/* Action Controls: What-If Simulation & Fairness Audit */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleWhatIfToggle}
                  style={{
                    background: whatIf ? '#10B981' : '#F1F5F9',
                    color: whatIf ? '#fff' : '#0F172A',
                    fontWeight: 700,
                    padding: '7px 14px',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: whatIf ? '#059669' : '#CBD5E1',
                    borderRadius: 12,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  title="Simulate adding ITI Electrician qualification to re-rank opportunities dynamically"
                >
                  <span>⚡</span>
                  <span>{whatIf ? 'What-If: ITI Active (+1 Role)' : 'Simulate ITI Qualification'}</span>
                </button>

                <button
                  onClick={() => setShowFairnessModal(true)}
                  style={{
                    background: '#0F1B3D',
                    color: '#fff',
                    fontWeight: 700,
                    padding: '7px 14px',
                    cursor: 'pointer',
                    borderRadius: 12,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    border: 'none',
                    boxShadow: '0 2px 6px rgba(15,27,61,0.2)'
                  }}
                  title="View audited, demographic-blind scoring methodology"
                >
                  <span>⚖️</span>
                  <span>Fairness & Bias Audit</span>
                </button>
              </div>
            </div>

            {/* Match Banner if triggered by What-If Dynamic Re-matching */}
            {matchBanner && (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                padding: '10px 16px',
                borderRadius: 14,
                marginBottom: 16,
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>{matchBanner}</span>
                <button onClick={() => setMatchBanner(null)} style={{ background: 'none', border: 'none', color: '#065F46', cursor: 'pointer', fontWeight: 800 }}>✕</button>
              </div>
            )}

            {/* Sub-Tabs Navigation Strip */}
            <div style={{
              display: 'flex',
              gap: 8,
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: 10,
              marginBottom: 16,
              overflowX: 'auto'
            }}>
              {[
                { id: 'eligible' as MatchTab, label: '🔥 Eligible Deck', count: deck.length },
                { id: 'saved' as MatchTab, label: '★ Saved', count: savedIds.length },
                { id: 'applied' as MatchTab, label: '📋 Applied & Recruiter Feedback', count: appliedIds.length },
                { id: 'info' as MatchTab, label: '⚠️ Need Info', count: needInfoIds.length },
                { id: 'not_eligible' as MatchTab, label: '🚫 Requirement Gaps', count: notEligIds.length },
              ].map((t) => {
                const isActive = matchTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setMatchTab(t.id)}
                    style={{
                      background: isActive ? '#345BFF' : '#F8FAFC',
                      color: isActive ? '#fff' : '#64748B',
                      border: '1px solid',
                      borderColor: isActive ? '#345BFF' : '#E2E8F0',
                      borderRadius: 12,
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{t.label}</span>
                    <span style={{
                      background: isActive ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                      color: isActive ? '#fff' : '#475569',
                      padding: '1px 6px',
                      borderRadius: 99,
                      fontSize: 10,
                      fontWeight: 800
                    }}>
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Multi-Pathway Recommendations Filter (Visible on Deck) */}
            {matchTab === 'eligible' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
                overflowX: 'auto',
                paddingBottom: 4
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                  Pathway Filter:
                </span>
                {[
                  { id: 'all', label: 'All Pathways' },
                  { id: 'job', label: '💼 Full-Time Jobs' },
                  { id: 'apprenticeship', label: '⚡ Apprenticeships' },
                  { id: 'govt', label: '🏛️ Govt Schemes / PSU' },
                  { id: 'trainee', label: '🎓 Trainee & Internships' },
                ].map((p) => {
                  const isSel = selectedPathway === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPathway(p.id as any)}
                      style={{
                        background: isSel ? '#EFF6FF' : '#FFF',
                        color: isSel ? '#2563EB' : '#475569',
                        border: '1px solid',
                        borderColor: isSel ? '#93C5FD' : '#E2E8F0',
                        borderRadius: 10,
                        padding: '5px 12px',
                        fontSize: 11,
                        fontWeight: isSel ? 700 : 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab 1: Eligible Swipe Deck */}
            {matchTab === 'eligible' && (
              <div className="match-deck-container">
                <div className="match-swipe-column">
                  <div className="swipe-deck-stage">
                    {deck.length === 0 ? (
                      <div className="swipe-empty-deck">
                        <div style={{ fontSize: 44 }}>🎉</div>
                        <h3 className="swipe-empty-title">You're all caught up!</h3>
                        <p className="swipe-empty-sub">
                          You've reviewed all currently eligible roles. {savedIds.length} saved, {appliedIds.length} interested.
                        </p>
                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                          <button
                            onClick={() => { setDeck(['flip', 'nmc', 'dmart']); setHistory([]); }}
                            className="btn-primary"
                          >
                            ↺ Reset Deck
                          </button>
                          <button
                            onClick={() => setMatchTab('saved')}
                            className="match-tab-btn"
                          >
                            View Saved ({savedIds.length})
                          </button>
                        </div>
                      </div>
                    ) : activeDeck.length === 0 ? (
                      <div className="swipe-empty-deck" style={{ padding: 28, textAlign: 'center', background: '#fff', borderRadius: 24, border: '1px solid #E2E8F0', maxWidth: 440, margin: '20px auto' }}>
                        <div style={{ fontSize: 36 }}>⚡</div>
                        <h3 className="swipe-empty-title" style={{ fontSize: 16, marginTop: 8 }}>No Active Roles in This Pathway</h3>
                        <p className="swipe-empty-sub" style={{ fontSize: 12, marginTop: 4 }}>
                          Your current profile meets qualifications for full-time jobs, but apprenticeships require ITI certification.
                        </p>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
                          <button
                            onClick={handleWhatIfToggle}
                            className="btn-primary"
                            style={{ fontSize: 12, padding: '7px 14px' }}
                          >
                            ⚡ Simulate ITI Qualification (+1 Role)
                          </button>
                          <button
                            onClick={() => setSelectedPathway('all')}
                            className="match-tab-btn"
                            style={{ fontSize: 12 }}
                          >
                            View All Pathways
                          </button>
                        </div>
                      </div>
                    ) : (
                      activeDeck.slice(0, 3).map((id, index) => {
                        const o = opps[id];
                        if (!o) return null;
                        const isTop = index === 0;

                        return (
                          <article
                            key={id}
                            className={`opp-swipe-card card-pos-${index} ${isTop ? 'top-card' : ''} ${isTop && isDragging ? 'dragging' : ''}`}
                            style={{
                              transform: isTop ? topTransform : undefined,
                              transition: isTop ? topTransition : undefined,
                              opacity: isTop && flyOut ? 0 : undefined,
                            }}
                            onClick={!isTop ? () => {
                              setDeck((prev) => {
                                const target = prev[index];
                                const rest = prev.filter((_, i) => i !== index);
                                return [target, ...rest];
                              });
                            } : undefined}
                            onPointerDown={isTop ? handlePointerDown : undefined}
                            onPointerMove={isTop ? handlePointerMove : undefined}
                            onPointerUp={isTop ? handlePointerEnd : undefined}
                            onPointerCancel={isTop ? handlePointerEnd : undefined}
                          >
                            {/* Card Header Band */}
                            <div className="card-header-band">
                              <div className="card-logo">{o.init}</div>
                              <div className="card-org-text">
                                <h4 className="card-org-name">{o.org}</h4>
                                <span className="card-recruiter-label">Recruiter · Verified Partner</span>
                              </div>
                              <ScoreRingCircle score={o.score} />
                            </div>

                            {/* Card Content Body */}
                            <div className="card-content-body">
                              {o.id === newId && (
                                <span className="new-badge">NEW: Qualified via What-If</span>
                              )}
                              <h3 className="card-job-title">{o.title}</h3>

                              <div className="card-meta-chips">
                                <span className="card-chip">📍 {o.loc}</span>
                                <span className="card-chip">💰 {o.pay}</span>
                                <span className="card-chip">⏱ {o.shift}</span>
                                <span className="card-chip">💼 {o.type}</span>
                              </div>

                              <div className="card-why-section">
                                <span className="card-why-title">Why this role ranks here</span>
                                <ul className="card-why-list">
                                  {o.reasons.map((r, rIdx) => (
                                    <li key={rIdx}>
                                      <i>✓</i>
                                      <span>{r}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="card-skills-row">
                                {o.skills.map(([sName, isMatch], sIdx) => (
                                  <span key={sIdx} className={`card-sk-pill ${isMatch ? 'ok' : 'gap'}`}>
                                    {isMatch ? '✓ ' : 'Learn: '}{sName}
                                  </span>
                                ))}
                              </div>

                              <div className="card-elig-banner">
                                <span>✓ You meet all {o.rules.length} mandatory criteria</span>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setShowFairnessModal(true); }}
                                    className="card-audit-link"
                                    title="View audited, bias-free scoring breakdown"
                                  >
                                    ⚖️ Bias Audit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setSheetId(o.id); }}
                                    className="card-audit-link"
                                  >
                                    See Criteria
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Tactile Action Stamps */}
                            {isTop && (
                              <>
                                <span className="swipe-stamp interested" style={{ opacity: yesOpacity }}>INTERESTED</span>
                                <span className="swipe-stamp pass" style={{ opacity: noOpacity }}>PASS</span>
                                <span className="swipe-stamp save" style={{ opacity: saveOpacity }}>SAVE</span>
                              </>
                            )}
                          </article>
                        );
                      })
                    )}
                  </div>

                  {/* Tactile Bottom Action Controls */}
                  <div className="swipe-actions-row">
                    <button
                      className="swipe-action-btn undo"
                      title="Undo last action"
                      disabled={!history.length}
                      onClick={undo}
                      aria-label="Undo"
                    >
                      ↩
                    </button>
                    <button
                      className="swipe-action-btn pass"
                      title="Pass role (Swipe Left / ←)"
                      disabled={!activeDeck.length}
                      onClick={() => commit('skip')}
                      aria-label="Pass"
                    >
                      ✕
                    </button>
                    <button
                      className="swipe-action-btn save"
                      title="Save role (Swipe Up / ↑)"
                      disabled={!activeDeck.length}
                      onClick={() => commit('save')}
                      aria-label="Save"
                    >
                      ★
                    </button>
                    <button
                      className="swipe-action-btn interested"
                      title="Express Interest / Apply (Swipe Right / →)"
                      disabled={!activeDeck.length}
                      onClick={() => {
                        const topId = activeDeck[0] || deck[0];
                        if (topId) {
                          setApplyModalOpp(opps[topId]);
                        }
                      }}
                      aria-label="Apply or Express Interest"
                    >
                      ♥
                    </button>
                  </div>
                  <span className="swipe-hint-text">
                    Drag the card left/right, use buttons, or press <strong>← ↑ →</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Tab 2: Saved Roles List */}
            {matchTab === 'saved' && (
              <div className="match-list-view">
                {savedIds.length === 0 ? (
                  <div className="swipe-empty-deck">
                    <div style={{ fontSize: 36 }}>★</div>
                    <h3 className="swipe-empty-title">No Saved Opportunities</h3>
                    <p className="swipe-empty-sub">Swipe Up on any opportunity or click the star button to save roles here.</p>
                    <button onClick={() => setMatchTab('eligible')} className="btn-primary">Return to Deck</button>
                  </div>
                ) : (
                  savedIds.map((id) => {
                    const o = opps[id];
                    if (!o) return null;
                    return (
                      <div key={id} className="match-list-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="match-list-card-title">{o.title}</span>
                          <span className="status-strip ok">★ Saved</span>
                        </div>
                        <span className="match-list-card-sub">{o.org} · {o.loc} · {o.pay}</span>
                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                          <button onClick={() => setApplyModalOpp(o)} className="btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}>
                            Express Interest / Apply
                          </button>
                          <button onClick={() => setSheetId(id)} className="match-tab-btn" style={{ height: 32, fontSize: 12 }}>
                            Audit Breakdown
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 3: Interested / Applied Roles & Recruiter Feedback Loop */}
            {matchTab === 'applied' && (
              <div className="match-list-view" style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{
                  padding: 16,
                  borderRadius: 18,
                  background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                  border: '1px solid #C7D2FE',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12
                }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>🔄</span>
                  <div style={{ fontSize: 12, color: '#1E1B4B' }}>
                    <b style={{ display: 'block', fontSize: 13, fontWeight: 800, marginBottom: 2 }}>
                      Recruiter Feedback Loop Active
                    </b>
                    <p style={{ margin: 0, color: '#3730A3', lineHeight: 1.5 }}>
                      When you express interest, employers review your verified proof-of-work and return structured ratings and interview guidance. You can also transmit questions directly to the hiring desk.
                    </p>
                  </div>
                </div>

                {appliedIds.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="swipe-empty-deck" style={{ padding: 24, textAlign: 'center', background: '#fff', borderRadius: 20, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: 36 }}>📋</div>
                      <h3 className="swipe-empty-title">No Custom Applications Yet</h3>
                      <p className="swipe-empty-sub">
                        Swipe Right on cards in the Eligible Deck, or preview live recruiter feedback below:
                      </p>
                      <button
                        onClick={() => { setAppliedIds(['flip']); triggerToast('Loaded Flipkart application with live feedback'); }}
                        className="btn-primary"
                        style={{ marginTop: 10, fontSize: 12, padding: '7px 16px' }}
                      >
                        Preview Live Feedback on Flipkart Logistics →
                      </button>
                    </div>

                    <RecruiterFeedbackCard
                      orgName="MSEDCL Circle, Pune"
                      roleTitle="Control Panel Technician (Apprentice)"
                      status="Shortlisted · Interview Scheduled"
                      rating="4.9 / 5"
                      recruiterNotes="Candidate holds verified MSBVEE control panel assembly credential and 12th technical marksheet. Priority applicant under Maharashtra State Apprenticeship Scheme. Reporting date: Next Tuesday 10:00 AM at Pune circle office."
                      onSendQuestion={() => triggerToast('Question transmitted to MSEDCL talent acquisition coordinator.')}
                    />
                  </div>
                ) : (
                  appliedIds.map((id) => {
                    const o = opps[id];
                    if (!o) return null;
                    return (
                      <RecruiterFeedbackCard
                        key={id}
                        orgName={o.org}
                        roleTitle={o.title}
                        status="Application Under Active Review"
                        rating={o.score ? `${(o.score / 20).toFixed(1)} / 5` : '4.8 / 5'}
                        recruiterNotes={
                          id === 'flip'
                            ? "Candidate verified for 12th pass and Bhiwandi warehouse intake accuracy. High suitability for RF scanner dispatch operations. Shift coordinator will confirm induction slot."
                            : id === 'msedcl'
                            ? "Priority apprentice candidate under National Apprenticeship Promotion Scheme. Practicum schematics match panel wiring requirements."
                            : `Profile verified against ${o.rules.length} mandatory criteria. Recruiter notified of deterministic credentials.`
                        }
                        onSendQuestion={() => triggerToast(`Question transmitted to ${o.org} recruitment desk.`)}
                      />
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 4: Need Info Roles List */}
            {matchTab === 'info' && (
              <div className="match-list-view">
                {needInfoIds.map((id) => {
                  const o = opps[id];
                  if (!o) return null;
                  return (
                    <div key={id} className="match-list-card">
                      <span className="match-list-card-title">{o.title}</span>
                      <span className="match-list-card-sub">{o.org} · {o.loc}</span>
                      <div className="status-strip info">
                        <b>Information Pending: {o.info?.[0]}</b>
                        {o.info?.[1]}
                      </div>
                      <button onClick={() => setActiveTab('profile')} className="card-audit-link" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                        Update Candidate Profile →
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 5: Not Eligible Roles List */}
            {matchTab === 'not_eligible' && (
              <div className="match-list-view">
                {notEligIds.map((id) => {
                  const o = opps[id];
                  if (!o) return null;
                  return (
                    <div key={id} className="match-list-card">
                      <span className="match-list-card-title">{o.title}</span>
                      <span className="match-list-card-sub">{o.org} · {o.loc}</span>
                      <div className="status-strip fail">
                        <b>Eligibility Criteria Not Met: {o.failed?.[0]?.[0]}</b>
                        <span>Candidate record: {o.failed?.[0]?.[1]}</span>
                      </div>
                      <small style={{ color: 'var(--muted)' }}>Pathway Solution: {o.fixHint}</small>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════ 3. LEARN & BUILD SKILLS (FUTORA CAREER OS ACADEMY) ══════════════ */}
        {activeTab === 'learn' && (
          <div className="screen-home">
            <MobileTopBar />
            <LearnHub
              candidate={candidate}
              onToast={triggerToast}
              handleCompleteCourse={handleCompleteCourse}
            />
          </div>
        )}

        {/* ══════════════ 4. CANDIDATE PROFILE (LINKEDIN & RESUME FORMAT) ══════════════ */}
        {activeTab === 'profile' && (
          <div className="screen-profile">
            <MobileTopBar />

            <div className="linkedin-profile-container">
              {/* Profile Hero Card with Cover & Avatar */}
              <div className="profile-hero-card">
                <div className="profile-cover-photo">
                  <div className="profile-cover-pattern" />
                </div>
                <div className="profile-header-content">
                  <div className="profile-avatar-action-row">
                    <div className="profile-avatar-large">
                      <span>AP</span>
                      <span className="profile-avatar-online" title="Active on Portal" />
                    </div>
                    <div className="profile-action-btn-group">
                      <button
                        onClick={() => {
                          const el = document.getElementById('resume-intelligence-card');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            el.classList.add('ring-4', 'ring-blue-400');
                            setTimeout(() => el.classList.remove('ring-4', 'ring-blue-400'), 2500);
                          }
                          triggerToast('Upload or pick a sample resume below to auto-fetch skills & match opportunities!');
                        }}
                        className="profile-btn-primary"
                        style={{
                          background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
                          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Upload Resume (AI Match)
                      </button>
                      <button
                        onClick={() => triggerToast('Generating Verified Resume PDF...')}
                        className="profile-btn-secondary"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Download Resume (PDF)
                      </button>
                      <button
                        onClick={() => triggerToast('Profile is up to date and verified.')}
                        className="profile-btn-secondary"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        Edit Profile
                      </button>
                      <button
                        onClick={() => triggerToast('Public profile link copied to clipboard!')}
                        className="profile-btn-secondary"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        Share
                      </button>
                    </div>
                  </div>

                  <div className="profile-headline-block">
                    <div className="profile-name-row">
                      <h2 className="profile-name-title">{candidate?.name || 'Asha Patil'}</h2>
                      <span className="profile-verified-badge">✓ Verified Candidate</span>
                      <span className="profile-verified-id">ID: NSR-2026-MH-94812</span>
                    </div>
                    <p className="profile-headline-text">
                      Aspiring Industrial Automation & Electrical Systems Technician | Certified Vocational Graduate
                    </p>
                    <div className="profile-meta-tags-row">
                      <span className="profile-meta-item">
                        📍 {candidate?.facts.district || 'Pune'}, {candidate?.facts.state || 'Maharashtra'}, India
                      </span>
                      <span>·</span>
                      <span className="profile-meta-item" style={{ color: '#059669', fontWeight: 600 }}>
                        🟢 Immediate Joining
                      </span>
                      <span>·</span>
                      <span className="profile-meta-item">
                        🎓 {QUAL_NAMES[candidate?.facts.highestQualification?.ordinal || 3]} (MSBSHSE Board)
                      </span>
                    </div>
                  </div>

                  <div className="profile-open-work-banner">
                    <div className="open-work-text">
                      <strong>Open to work</strong>
                      <span>Electrical Technician, Warehouse Operations Associate, Solar PV Installer · Pune & Mumbai Region</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('match')}
                      className="profile-btn-primary"
                      style={{ fontSize: 12, padding: '6px 14px' }}
                    >
                      View 3 Matched Roles →
                    </button>
                  </div>
                </div>
              </div>

              {/* 4-Stat Strip */}
              <div className="profile-stats-strip">
                <div className="profile-stat-box">
                  <span className="profile-stat-box-num green">100%</span>
                  <span className="profile-stat-box-label">Deterministic Verification</span>
                </div>
                <div className="profile-stat-box">
                  <span className="profile-stat-box-num blue">{candidate?.completedCourses.length || 4}</span>
                  <span className="profile-stat-box-label">Verified Course Certifications</span>
                </div>
                <div className="profile-stat-box">
                  <span className="profile-stat-box-num">{deck.length}</span>
                  <span className="profile-stat-box-label">Eligible Job Matches</span>
                </div>
                <div className="profile-stat-box">
                  <span className="profile-stat-box-num">48</span>
                  <span className="profile-stat-box-label">Recruiter Profile Views</span>
                </div>
              </div>

              {/* FEATURE: RESUME INTELLIGENCE & AUTO SKILL-OPPORTUNITY MATCHER */}
              <div style={{ marginTop: 24, marginBottom: 24 }}>
                <ResumeIntelligenceSection
                  currentSkills={(candidate?.skills || []).map((s) => ({ skillId: s.skillId, proficiency: s.proficiency }))}
                  onSyncSkills={handleSyncResumeSkills}
                  onApplyOpportunity={handleApplyMatchedOpp}
                  appliedOpportunityIds={appliedIds}
                  onToast={triggerToast}
                  onNavigateToMatch={() => setActiveTab('match')}
                />
              </div>

              {/* FEATURE 1: VERIFIED SKILL EVIDENCE VAULT & CRYPTOGRAPHIC CREDENTIALS */}
              <div style={{ marginTop: 24, marginBottom: 24 }}>
                <EvidenceVaultSection onAddEvidence={() => triggerToast('Skill evidence registered and verified with cryptographic hash!')} />
              </div>

              {/* Two-Column Grid: Left (Experience & Education & Skills), Right (Credentials & Preferences) */}
              <div className="profile-sections-grid">
                {/* Left Column */}
                <div className="profile-section-col">
                  {/* About Block */}
                  <div className="profile-card-block">
                    <h3 className="profile-card-block-title">About</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: '#334155' }}>
                      Dedicated and disciplined vocational technical graduate with verified competencies in industrial control panel wiring, workplace safety standards, basic electrical systems, and logistics inventory management. Holds 100% verified deterministic credentials on the National Career Exchange. Highly motivated to contribute practical, hands-on field expertise in manufacturing, power utilities, or fast-growing supply chain hubs.
                    </p>
                  </div>

                  {/* Experience & Apprenticeships */}
                  <div className="profile-card-block">
                    <h3 className="profile-card-block-title">Experience & Practical Apprenticeships</h3>
                    <div className="profile-timeline">
                      <div className="profile-timeline-item">
                        <div className="timeline-icon-box">⚡</div>
                        <div className="timeline-content">
                          <h4 className="timeline-role">Apprentice Electrical Technician</h4>
                          <span className="timeline-company">MSEDCL Circle · Pune, Maharashtra</span>
                          <span className="timeline-duration">Jul 2025 – Present · 8 mos · Government Apprenticeship</span>
                          <p className="timeline-desc">
                            Assisting senior engineers with control panel assembly, 3-phase circuit diagnostics, and preventive electrical maintenance. Adhering strictly to industrial safety protocols (IS/BIS guidelines).
                          </p>
                        </div>
                      </div>

                      <div className="profile-timeline-item">
                        <div className="timeline-icon-box">📦</div>
                        <div className="timeline-content">
                          <h4 className="timeline-role">Warehouse Logistics Associate</h4>
                          <span className="timeline-company">Flipkart Logistics Hub · Bhiwandi, Maharashtra</span>
                          <span className="timeline-duration">Jan 2025 – Apr 2025 · 4 mos · Vocational Practicum</span>
                          <p className="timeline-desc">
                            Carried out inbound inventory intake, barcode RF scanning, batch sorting, and secure packaging dispatch with 99.8% compliance accuracy.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verified Education */}
                  <div className="profile-card-block">
                    <h3 className="profile-card-block-title">Verified Education</h3>
                    <div className="profile-timeline">
                      <div className="profile-timeline-item">
                        <div className="timeline-icon-box">🎓</div>
                        <div className="timeline-content">
                          <h4 className="timeline-role">Higher Secondary Certificate (12th Vocational Technical)</h4>
                          <span className="timeline-company">Maharashtra State Board (MSBSHSE) · Pune Division</span>
                          <span className="timeline-duration">2021 – 2023 · First Class with Distinction · Verified via DigiLocker ✓</span>
                          <p className="timeline-desc">
                            Major coursework in Applied Sciences, Engineering Drawing, and Workshop Technology.
                          </p>
                        </div>
                      </div>

                      <div className="profile-timeline-item">
                        <div className="timeline-icon-box">📜</div>
                        <div className="timeline-content">
                          <h4 className="timeline-role">Secondary School Certificate (SSC 10th)</h4>
                          <span className="timeline-company">Pune Divisional Board</span>
                          <span className="timeline-duration">2019 – 2021 · First Class · Verified ✓</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verified Skills */}
                  <div className="profile-card-block">
                    <h3 className="profile-card-block-title">Verified Technical Skills & Competencies</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div className="profile-skills-group">
                        <span className="profile-skills-group-label">Core Technical & Vocational</span>
                        <div className="profile-skill-chips">
                          <span className="profile-skill-chip verified">
                            <span>🛡️ Industrial Safety</span>
                            <span className="profile-skill-chip-level">Lvl 4/5 · NSDC ✓</span>
                          </span>
                          <span className="profile-skill-chip verified">
                            <span>⚡ Control Panel Wiring</span>
                            <span className="profile-skill-chip-level">Lvl 4/5 · MSBVEE ✓</span>
                          </span>
                          <span className="profile-skill-chip verified">
                            <span>🔌 Basic Electrical Systems</span>
                            <span className="profile-skill-chip-level">Lvl 5/5 ✓</span>
                          </span>
                          <span className="profile-skill-chip verified">
                            <span>☀️ Solar PV Installation</span>
                            <span className="profile-skill-chip-level">Lvl 3/5 · Suryamitra ✓</span>
                          </span>
                          <span className="profile-skill-chip verified">
                            <span>🔍 Electrical Fault Finding</span>
                            <span className="profile-skill-chip-level">Lvl 3/5 ✓</span>
                          </span>
                        </div>
                      </div>

                      <div className="profile-skills-group">
                        <span className="profile-skills-group-label">Operational & Digital</span>
                        <div className="profile-skill-chips">
                          <span className="profile-skill-chip verified">
                            <span>📦 Inventory & Packing</span>
                            <span className="profile-skill-chip-level">Lvl 4/5 ✓</span>
                          </span>
                          <span className="profile-skill-chip verified">
                            <span>💻 Computer Literacy</span>
                            <span className="profile-skill-chip-level">Lvl 4/5 ✓</span>
                          </span>
                          <span className="profile-skill-chip verified">
                            <span>📊 Tally & Billing Basics</span>
                            <span className="profile-skill-chip-level">Lvl 3/5 ✓</span>
                          </span>
                          <span className="profile-skill-chip verified">
                            <span>🤝 Customer Service</span>
                            <span className="profile-skill-chip-level">Lvl 4/5 ✓</span>
                          </span>
                        </div>
                      </div>

                      {/* Dynamic Resume-Extracted Skills Group */}
                      {candidate?.skills && candidate.skills.some((s) => s.source === 'ai') && (
                        <div className="profile-skills-group">
                          <span className="profile-skills-group-label" style={{ color: '#2563EB', fontWeight: 700 }}>
                            ⚡ Resume Extracted & Verified (AI Match)
                          </span>
                          <div className="profile-skill-chips">
                            {candidate.skills
                              .filter((s) => s.source === 'ai')
                              .map((s) => {
                                const formattedName = s.skillId
                                  .split('-')
                                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                  .join(' ');
                                return (
                                  <span key={s.skillId} className="profile-skill-chip verified" style={{ borderColor: '#3B82F6', background: '#EFF6FF' }}>
                                    <span style={{ color: '#1D4ED8', fontWeight: 600 }}>✨ {formattedName}</span>
                                    <span className="profile-skill-chip-level" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                                      Lvl {s.proficiency}/5 · Parsed ✓
                                    </span>
                                  </span>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Verification & Preferences */}
                <div className="profile-section-col">
                  {/* Government Verification Card */}
                  <div className="profile-card-block">
                    <h3 className="profile-card-block-title">Identity & Government KYC</h3>
                    <div className="verification-checklist">
                      <div className="verify-item">
                        <div className="verify-item-left">
                          <span>🆔</span>
                          <div>
                            <b className="block text-xs text-[#14213D]">Aadhaar e-KYC</b>
                            <span className="text-[11px] text-[#64748B]">UIDAI Masked: XXXX-XXXX-4819</span>
                          </div>
                        </div>
                        <span className="verify-item-status">✓ Verified</span>
                      </div>

                      <div className="verify-item">
                        <div className="verify-item-left">
                          <span>🏛️</span>
                          <div>
                            <b className="block text-xs text-[#14213D]">Domicile Certificate</b>
                            <span className="text-[11px] text-[#64748B]">Maharashtra Resident</span>
                          </div>
                        </div>
                        <span className="verify-item-status">✓ Verified</span>
                      </div>

                      <div className="verify-item">
                        <div className="verify-item-left">
                          <span>🛡️</span>
                          <div>
                            <b className="block text-xs text-[#14213D]">National Skill Registry</b>
                            <span className="text-[11px] text-[#64748B]">NSR-2026-MH-94812</span>
                          </div>
                        </div>
                        <span className="verify-item-status">✓ Active</span>
                      </div>

                      <div className="verify-item">
                        <div className="verify-item-left">
                          <span>📋</span>
                          <div>
                            <b className="block text-xs text-[#14213D]">DigiLocker Integration</b>
                            <span className="text-[11px] text-[#64748B]">All Board Marksheets Linked</span>
                          </div>
                        </div>
                        <span className="verify-item-status">✓ Linked</span>
                      </div>
                    </div>
                  </div>

                  {/* Certifications & Licences */}
                  <div className="profile-card-block">
                    <h3 className="profile-card-block-title">Certifications & Accreditations</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>🏅</span>
                        <div>
                          <b className="block text-xs text-[#14213D]">NSQF Level 4 Electrical Specialist</b>
                          <span className="text-[11px] text-[#64748B]">National Skill Development Corp · Jan 2025</span>
                          <span className="block text-[10.5px] text-[#345BFF] mt-0.5">ID: NSDC-MH-88192 ✓</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>⚡</span>
                        <div>
                          <b className="block text-xs text-[#14213D]">Industrial Control Panel Practicum</b>
                          <span className="text-[11px] text-[#64748B]">MSBVEE Technical Board · Dec 2024</span>
                          <span className="block text-[10.5px] text-[#345BFF] mt-0.5">ID: MSB-EL-4912 ✓</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>🛡️</span>
                        <div>
                          <b className="block text-xs text-[#14213D]">Workplace Safety Compliance (BIS)</b>
                          <span className="text-[11px] text-[#64748B]">Directorate of Vocational Education · Aug 2024</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job Preferences */}
                  <div className="profile-card-block">
                    <h3 className="profile-card-block-title">Job Preferences & Availability</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: 11 }}>Expected Monthly Pay</span>
                        <b style={{ color: '#14213D' }}>₹18,000 – ₹24,000 / month</b>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: 11 }}>Shift Preferences</span>
                        <b style={{ color: '#14213D' }}>Day Shift, Flexible / Rotational</b>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: 11 }}>Preferred Locations</span>
                        <b style={{ color: '#14213D' }}>Pune, Thane, Navi Mumbai, Nashik</b>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: 11 }}>Availability for Joining</span>
                        <b style={{ color: '#059669' }}>Immediate (within 7 business days)</b>
                      </div>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="profile-card-block">
                    <h3 className="profile-card-block-title">Languages Known</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <b>मराठी (Marathi)</b>
                        <span style={{ color: '#64748B' }}>Native / Fluent</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <b>हिंदी (Hindi)</b>
                        <span style={{ color: '#64748B' }}>Fluent</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <b>English</b>
                        <span style={{ color: '#64748B' }}>Professional Working</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ──────────── MOBILE BOTTOM NAVIGATION ──────────── */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`bottom-nav-btn ${isActive ? 'active' : ''}`}
            >
              <div className="bottom-nav-icon-wrap">
                {item.icon}
                {item.id === 'match' && deck.length > 0 && (
                  <span className="bottom-nav-badge">{deck.length}</span>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ──────────── DETAILS & AUDIT MODAL ──────────── */}
      {sheetId && activeSheetOpp && (
        <div className="modal-overlay" onClick={() => setSheetId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSheetId(null)} className="modal-close-btn" aria-label="Close">✕</button>
            <span className="text-xs font-bold text-[#345BFF]">Deterministic Eligibility Audit</span>
            <h2 className="text-xl font-black text-[#14213D] leading-tight">{activeSheetOpp.title}</h2>
            <p className="text-xs text-[#64748B]">{activeSheetOpp.org} · {activeSheetOpp.loc}</p>

            <div style={{ marginTop: 8 }}>
              <h4 className="text-xs font-bold text-[#14213D] uppercase tracking-wider mb-2">Mandatory Criteria Checks</h4>
              {activeSheetOpp.rules.map((r, idx) => (
                <div key={idx} className="audit-rule-item">
                  <span className={`audit-status-tag ${r[2] ? 'pass' : 'fail'}`}>
                    {r[2] ? '✓ PASS' : '✕ FAIL'}
                  </span>
                  <div>
                    <b className="text-xs text-[#14213D] block">{r[0]}</b>
                    <span className="text-xs text-[#64748B]">{r[1]}</span>
                  </div>
                </div>
              ))}
            </div>

            {activeSheetOpp.path && (
              <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 12, padding: 12 }}>
                <b className="text-xs text-[#5B4BEA] block mb-1">Recommended Pathway to Close Gap:</b>
                <span className="text-xs text-[#14213D]">{activeSheetOpp.path}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button
                onClick={() => {
                  setSheetId(null);
                  setApplyModalOpp(activeSheetOpp);
                }}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                Express Interest / Apply
              </button>
              <button onClick={() => setSheetId(null)} className="match-tab-btn" style={{ height: 40 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────── FORMAL APPLICATION WORKFLOW MODAL ──────────── */}
      {applyModalOpp && (
        <div className="modal-overlay" onClick={() => setApplyModalOpp(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setApplyModalOpp(null)} className="modal-close-btn" aria-label="Close">✕</button>
            <span className="text-xs font-bold text-[#10B981]">Verified Application Submission</span>
            <h2 className="text-xl font-black text-[#14213D] leading-tight">{applyModalOpp.title}</h2>
            <p className="text-xs text-[#64748B]">{applyModalOpp.org}</p>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 14 }}>
              <h4 className="text-xs font-bold text-[#14213D] mb-1">Application Confirmation</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                By confirming, your verified credentials ({QUAL_NAMES[candidate?.facts.highestQualification?.ordinal || 3]}, residency in {candidate?.facts.district || 'Pune'}) will be transmitted to {applyModalOpp.org}.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                onClick={() => {
                  commit('like');
                  setApplyModalOpp(null);
                  triggerToast(`Successfully transmitted interest to ${applyModalOpp.org}!`);
                }}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                Confirm Expression of Interest
              </button>
              <button onClick={() => setApplyModalOpp(null)} className="match-tab-btn" style={{ height: 40 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────── FLOATING AI ASSISTANT ──────────── */}
      {/* ──────────── FLOATING AI CAREER ASSISTANT & VOICE TOUR ──────────── */}
      <VoiceCareerAssistant
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        candidateName={candidate?.name || 'Asha'}
        onWhatIfToggle={handleWhatIfToggle}
        whatIfActive={whatIf}
        onToast={triggerToast}
      />

      {/* ──────────── MOBILE BOTTOM NAVIGATION BAR ──────────── */}
      <nav className="mobile-bottom-nav">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              <div className="mobile-bottom-icon-wrap">
                {item.icon}
                {item.id === 'match' && deck.length > 0 && (
                  <span className="mobile-bottom-badge">{deck.length}</span>
                )}
              </div>
              <span className="mobile-bottom-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ──────────── TOAST MESSAGE ──────────── */}
      {toastMsg && (
        <div className="app-toast">
          <span>{toastMsg}</span>
          {history.length > 0 && (
            <button onClick={undo} className="toast-undo-btn">Undo</button>
          )}
        </div>
      )}

      {/* ──────────── FAIRNESS-AWARE RANKING AUDIT MODAL ──────────── */}
      <FairnessAuditModal
        isOpen={showFairnessModal}
        onClose={() => setShowFairnessModal(false)}
      />
    </div>
  );
}
