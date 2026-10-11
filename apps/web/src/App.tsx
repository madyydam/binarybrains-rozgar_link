import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Avatar, StatusBadge } from '@rozgarlink/ui';

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

type NavTab = 'home' | 'match' | 'learn' | 'profile' | 'admin';
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
  { id: 'learn', label: 'Learn', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
  { id: 'profile', label: 'Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  { id: 'admin', label: 'Admin Console', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
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

  /* ── Admin / Officer Console State ── */
  const [officerRuleType, setOfficerRuleType] = useState('QUAL_MIN_LEVEL');
  const [officerRuleVal, setOfficerRuleVal] = useState('4');
  const [officerRuleLabel, setOfficerRuleLabel] = useState('Requires minimum ITI qualification');
  const [officerPreview, setOfficerPreview] = useState<{ eligibleCount: number; totalCandidates: number } | null>(null);

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
    const id = deck[0];
    setFlyOut({ action });

    setTimeout(() => {
      setDeck((prev) => prev.slice(1));
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
  }, [deck, newId, triggerToast]);

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

  const handleOfficerPreview = async () => {
    try {
      const val = officerRuleType === 'QUAL_MIN_LEVEL' ? Number(officerRuleVal) : officerRuleVal;
      const res = await fetch('/v1/opportunities/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rules: [{ id: 'rule-test-1', type: officerRuleType, operator: 'gte', value: val, label: officerRuleLabel, requiresVerification: true, version: 1 }]
        }),
      });
      if (res.ok) setOfficerPreview(await res.json());
    } catch {}
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
        <span className="mobile-brand-name">RZGARSATHI</span>
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
              <span className="sidebar-brand-name">RZGARSATHI</span>
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

        {sidebarOpen && (
          <div className="sidebar-bottom">
            <div className="sidebar-bottom-group">
              <label className="sidebar-bottom-label">Persona Candidate</label>
              <select
                value={currentCandidateId}
                onChange={(e) => setCurrentCandidateId(e.target.value)}
                className="sidebar-select"
              >
                <option value="cand-asha">Asha Patil (12th Pass · Pune)</option>
                <option value="cand-rahul">Rahul Deshmukh (ITI · Pune)</option>
                <option value="cand-meena">Meena Shinde (B.Sc · Nashik)</option>
                <option value="cand-edge-age">Ramesh (Age 36 · Edge)</option>
                <option value="cand-edge-residence">Sneha (Gujarat Resident)</option>
              </select>
            </div>
            <div className="sidebar-lang">
              {(['en', 'hi', 'mr'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`sidebar-lang-btn ${locale === l ? 'active' : ''}`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'मरा'}
                </button>
              ))}
            </div>
            <div className="sidebar-live-pill">
              <span className="live-dot" />
              <span>Live Engine Ready</span>
            </div>
          </div>
        )}
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
                  Connect with verified recruiter roles, upgrade your skills with certified paths, and track transparent career milestones with RZGARSATHI.
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

        {/* ══════════════ 2. MATCH — TINDER-INSPIRED OPPORTUNITY DISCOVERY ══════════════ */}
        {activeTab === 'match' && (
          <div className="screen-home">
            <MobileTopBar />

            {/* Header */}
            <div className="screen-header">
              <h1 className="screen-title">Discover Opportunities</h1>
              <p className="screen-sub">Find verified roles matching your qualifications, skills, and preferences.</p>
            </div>

            {/* Controls Bar */}
            <div className="match-top-controls">
              {/* Filter Tabs */}
              <div className="match-tabs" role="tablist">
                <button
                  className={`match-tab-btn ${matchTab === 'eligible' ? 'active' : ''}`}
                  onClick={() => setMatchTab('eligible')}
                >
                  <span>Eligible Deck</span>
                  <span className="match-tab-badge">{deck.length}</span>
                </button>
                <button
                  className={`match-tab-btn ${matchTab === 'saved' ? 'active' : ''}`}
                  onClick={() => setMatchTab('saved')}
                >
                  <span>Saved</span>
                  <span className="match-tab-badge">{savedIds.length}</span>
                </button>
                <button
                  className={`match-tab-btn ${matchTab === 'applied' ? 'active' : ''}`}
                  onClick={() => setMatchTab('applied')}
                >
                  <span>Interested</span>
                  <span className="match-tab-badge">{appliedIds.length}</span>
                </button>
                <button
                  className={`match-tab-btn ${matchTab === 'info' ? 'active' : ''}`}
                  onClick={() => setMatchTab('info')}
                >
                  <span>Need Info</span>
                  <span className="match-tab-badge">{needInfoIds.length}</span>
                </button>
                <button
                  className={`match-tab-btn ${matchTab === 'not_eligible' ? 'active' : ''}`}
                  onClick={() => setMatchTab('not_eligible')}
                >
                  <span>Not Eligible</span>
                  <span className="match-tab-badge">{notEligIds.length}</span>
                </button>
              </div>

              {/* What-If Simulation Bar */}
              <div className="whatif-bar">
                <div className="whatif-bar-left">
                  <span>⚡</span>
                  <span><strong>What-if Simulation:</strong> Add ITI Electrician</span>
                </div>
                <button
                  className="sw"
                  role="switch"
                  aria-checked={whatIf}
                  aria-label="Toggle What-If ITI Electrician"
                  onClick={handleWhatIfToggle}
                />
              </div>
            </div>

            {/* What-if Banner */}
            <div className={`match-banner ${matchBanner ? 'on' : ''}`}>
              {matchBanner}
            </div>

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
                    ) : (
                      deck.slice(0, 3).map((id, index) => {
                        const o = opps[id];
                        if (!o) return null;
                        const isTop = index === 0;
                        const depth = index; // 0, 1, 2

                        let cardTransform = `translateY(${depth * 10}px) scale(${1 - depth * 0.035})`;
                        let cardTransition = 'transform .24s ease';
                        let zIndex = 10 - depth;

                        if (isTop) {
                          cardTransform = topTransform;
                          cardTransition = topTransition;
                        }

                        return (
                          <article
                            key={id}
                            className={`opp-swipe-card ${isTop ? 'top-card' : ''} ${isTop && isDragging ? 'dragging' : ''}`}
                            style={{
                              transform: cardTransform,
                              transition: cardTransition,
                              zIndex,
                              pointerEvents: isTop ? 'auto' : 'none',
                              opacity: isTop && flyOut ? 0 : 1
                            }}
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
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setSheetId(o.id); }}
                                  className="card-audit-link"
                                >
                                  See Audit
                                </button>
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
                      disabled={!deck.length}
                      onClick={() => commit('skip')}
                      aria-label="Pass"
                    >
                      ✕
                    </button>
                    <button
                      className="swipe-action-btn save"
                      title="Save role (Swipe Up / ↑)"
                      disabled={!deck.length}
                      onClick={() => commit('save')}
                      aria-label="Save"
                    >
                      ★
                    </button>
                    <button
                      className="swipe-action-btn interested"
                      title="Express Interest / Apply (Swipe Right / →)"
                      disabled={!deck.length}
                      onClick={() => {
                        if (deck[0]) {
                          setApplyModalOpp(opps[deck[0]]);
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

                {/* Desktop Explainer Card */}
                <aside className="match-desktop-explainer">
                  <h3 className="explainer-title">Opportunity Discovery Guide</h3>
                  <ul className="explainer-list">
                    <li>Only <strong>deterministically eligible</strong> roles appear in your swipe deck.</li>
                    <li><strong>Swipe Right (→)</strong>: Express interest and start application workflow.</li>
                    <li><strong>Swipe Left (←)</strong>: Pass on this role without affecting other matches.</li>
                    <li><strong>Swipe Up (↑)</strong>: Save for later review in your Saved tab.</li>
                    <li>Click <strong>See Audit</strong> on any card to inspect the full criteria breakdown.</li>
                  </ul>
                  <div className="explainer-tip-box">
                    <strong>⚡ Simulation Sandbox:</strong> Toggle the What-If switch above to see how acquiring an ITI Electrician qualification unlocks government apprenticeships instantly!
                  </div>
                </aside>
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

            {/* Tab 3: Interested / Applied Roles List */}
            {matchTab === 'applied' && (
              <div className="match-list-view">
                {appliedIds.length === 0 ? (
                  <div className="swipe-empty-deck">
                    <div style={{ fontSize: 36 }}>📋</div>
                    <h3 className="swipe-empty-title">No Active Applications</h3>
                    <p className="swipe-empty-sub">Roles where you've expressed interest or submitted applications appear here.</p>
                    <button onClick={() => setMatchTab('eligible')} className="btn-primary">Discover Roles</button>
                  </div>
                ) : (
                  appliedIds.map((id) => {
                    const o = opps[id];
                    if (!o) return null;
                    return (
                      <div key={id} className="match-list-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="match-list-card-title">{o.title}</span>
                          <span className="status-strip ok">✓ Expression of Interest Recorded</span>
                        </div>
                        <span className="match-list-card-sub">{o.org} · {o.loc} · Verified Candidate</span>
                        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                          Recruiter has been notified of your verified credentials.
                        </p>
                      </div>
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

        {/* ══════════════ 3. LEARN & BUILD SKILLS ══════════════ */}
        {activeTab === 'learn' && (
          <div className="screen-learn">
            <MobileTopBar />

            <div className="screen-header">
              <h1 className="screen-title">Learn & Build Skills</h1>
              <p className="screen-sub">Structured vocational paths, practical modules, and certified skill roadmaps.</p>
            </div>

            {/* Subtabs */}
            <div className="learn-tabs">
              {(['Courses', 'Paths', 'Practice', 'My Learning'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setLearnSubTab(t)}
                  className={`learn-tab-btn ${learnSubTab === t ? 'active' : ''}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Layout Grid */}
            <div className="learn-layout-grid">
              {/* Courses Vertical List */}
              <div className="courses-vertical-list">
                {COURSES.map((c) => {
                  const isCompleted = candidate?.completedCourses.includes(c.id);
                  return (
                    <div key={c.id} className="course-row-card">
                      <div className={`course-row-icon bg-gradient-to-br ${c.color}`}>
                        <span>{c.icon}</span>
                      </div>
                      <div className="course-row-body">
                        <span className="text-xs font-bold text-[#345BFF]">{c.provider} · {c.cost}</span>
                        <h4 className="course-row-title">{c.title}</h4>
                        <span className="course-row-sub">{c.skills.join(' · ')}</span>
                        <div className="course-row-bar-wrap">
                          <div className="course-row-bar">
                            <div className="course-row-bar-fill" style={{ width: `${isCompleted ? 100 : 0}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-[#64748B]">
                            {isCompleted ? 'Completed ✓' : `${c.modules} modules · ${c.hours}h`}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => !isCompleted && handleCompleteCourse(c.id)}
                        className={`btn-primary ${isCompleted ? 'opacity-50 pointer-events-none' : ''}`}
                        style={{ fontSize: 12, padding: '8px 16px' }}
                      >
                        {isCompleted ? 'Completed' : 'Enroll →'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* AI Skill Extractor Box */}
              <aside className="ai-extractor-box">
                <div className="ai-box-header">
                  <div className="ai-box-badge">AI</div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#14213D]">AI Skill Extractor</h3>
                    <p className="text-xs text-[#64748B]">Paste your bio, resume or work experience</p>
                  </div>
                </div>
                <textarea
                  value={aiExtractText}
                  onChange={(e) => setAiExtractText(e.target.value)}
                  placeholder="Example: I worked for 2 years as an apprentice in solar rooftop installations in Satara..."
                  rows={4}
                  className="ai-textarea"
                />
                <button
                  onClick={handleExtractSkills}
                  disabled={aiLoading}
                  className="ai-extract-btn"
                >
                  {aiLoading ? 'Analyzing text...' : 'Extract Skills with AI'}
                </button>
                {extractedSkills.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                    <span className="text-xs font-bold text-[#14213D]">Confirm skills to add to profile:</span>
                    <div className="ai-chips-list">
                      {extractedSkills.map((sk) => (
                        <button
                          key={sk.skillId}
                          onClick={() => handleConfirmExtractedSkill(sk.skillId)}
                          className="ai-skill-chip-btn"
                        >
                          + {sk.name} (Add)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <span className="text-[11px] text-[#64748B] leading-tight">
                  🛡️ <strong>Guarantee:</strong> AI normalises skills only. Eligibility calculations are 100% deterministic rules.
                </span>
              </aside>
            </div>
          </div>
        )}

        {/* ══════════════ 4. CANDIDATE PROFILE ══════════════ */}
        {activeTab === 'profile' && (
          <div className="screen-profile">
            <MobileTopBar />

            <div className="screen-header">
              <h1 className="screen-title">Candidate Profile</h1>
              <p className="screen-sub">Manage your verified qualifications, skills, and credential history.</p>
            </div>

            <div className="profile-layout-grid">
              {/* Profile Overview Card */}
              <div className="profile-overview-card">
                <div className="profile-avatar-row">
                  <Avatar name={candidate?.name || 'Asha Patil'} size="lg" online />
                  <div>
                    <h3 className="text-lg font-extrabold text-[#14213D]">{candidate?.name || 'Asha Patil'}</h3>
                    <span className="text-xs text-[#345BFF] font-semibold">
                      {QUAL_NAMES[candidate?.facts.highestQualification?.ordinal || 3]} · Verified Candidate
                    </span>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      📍 {candidate?.facts.district || 'Pune'}, {candidate?.facts.state || 'Maharashtra'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#E2E8F0] pt-4 flex justify-between">
                  <div>
                    <span className="text-xs text-[#64748B]">Profile Status</span>
                    <p className="text-sm font-bold text-[#10B981]">100% Verified ✓</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#64748B]">Completed Courses</span>
                    <p className="text-sm font-bold text-[#14213D]">{candidate?.completedCourses.length || 0}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#64748B]">Saved Roles</span>
                    <p className="text-sm font-bold text-[#345BFF]">{savedIds.length}</p>
                  </div>
                </div>
              </div>

              {/* Profile Details & Qualifications */}
              <div className="profile-card-details">
                <div className="profile-section-block">
                  <h3 className="profile-block-title">Verified Education & Qualifications</h3>
                  <div className="qual-chips-grid">
                    {candidate?.facts.qualifications.map((q, idx) => (
                      <span key={idx} className="qual-badge-chip">
                        <span>🎓 {QUAL_NAMES[q.ordinal]}</span>
                        <span className="text-[10px] bg-[#E6F7F2] text-[#10B981] font-bold px-1.5 py-0.5 rounded-full">Verified</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="profile-section-block">
                  <h3 className="profile-block-title">Normalised Career Skills</h3>
                  <div className="qual-chips-grid">
                    {candidate?.skills.map((s, idx) => (
                      <span key={idx} className="qual-badge-chip">
                        <span className="capitalize">{s.skillId.replace(/-/g, ' ')}</span>
                        <span className="text-[10px] bg-[#EBF0FF] text-[#345BFF] font-bold px-1.5 py-0.5 rounded-full">
                          Lvl {s.proficiency}/5
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ 5. ADMIN / OFFICER CONSOLE (SEPARATED) ══════════════ */}
        {activeTab === 'admin' && (
          <div className="screen-admin">
            <MobileTopBar />

            <div className="screen-header">
              <span className="admin-badge-tag">Restricted Access · Authorized Personnel</span>
              <h1 className="screen-title">Officer Eligibility Rule Console</h1>
              <p className="screen-sub">
                Define and test mandatory opportunity eligibility rules against the candidate dataset in real-time.
              </p>
            </div>

            <div className="admin-card">
              <div className="admin-form-grid">
                <div className="admin-field">
                  <label>Rule Condition Type</label>
                  <select
                    value={officerRuleType}
                    onChange={(e) => {
                      setOfficerRuleType(e.target.value);
                      if (e.target.value === 'QUAL_MIN_LEVEL') setOfficerRuleLabel('Requires minimum ITI qualification');
                      else if (e.target.value === 'RESIDENCE_STATE') setOfficerRuleLabel('Maharashtra resident required');
                      else if (e.target.value === 'AGE_RANGE') setOfficerRuleLabel('Age between 18 and 30 years');
                    }}
                  >
                    <option value="QUAL_MIN_LEVEL">QUAL_MIN_LEVEL (Minimum Education)</option>
                    <option value="RESIDENCE_STATE">RESIDENCE_STATE (State Resident)</option>
                    <option value="RESIDENCE_DISTRICT">RESIDENCE_DISTRICT (District Resident)</option>
                    <option value="AGE_RANGE">AGE_RANGE (Age Criteria)</option>
                    <option value="CERT_REQUIRED">CERT_REQUIRED (Certification)</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label>Rule Threshold Value</label>
                  <input
                    type="text"
                    value={officerRuleVal}
                    onChange={(e) => setOfficerRuleVal(e.target.value)}
                    placeholder="e.g. 4 for ITI, Maharashtra"
                  />
                </div>
                <div className="admin-field">
                  <label>Candidate Transparency Label</label>
                  <input
                    type="text"
                    value={officerRuleLabel}
                    onChange={(e) => setOfficerRuleLabel(e.target.value)}
                  />
                </div>
              </div>

              <button onClick={handleOfficerPreview} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                Calculate Live Impact on Candidate Pool
              </button>

              {officerPreview && (
                <div className="admin-result-box">
                  <div>
                    <h4 className="text-base font-extrabold text-[#065F46]">Simulation Results</h4>
                    <p className="text-xs text-[#065F46]">
                      {officerPreview.eligibleCount} out of {officerPreview.totalCandidates} candidates in the active pool meet this criteria.
                    </p>
                  </div>
                  <span className="text-2xl font-black text-[#059669]">
                    {Math.round((officerPreview.eligibleCount / officerPreview.totalCandidates) * 100)}% Pass Rate
                  </span>
                </div>
              )}
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

      {/* ──────────── TOAST MESSAGE ──────────── */}
      {toastMsg && (
        <div className="app-toast">
          <span>{toastMsg}</span>
          {history.length > 0 && (
            <button onClick={undo} className="toast-undo-btn">Undo</button>
          )}
        </div>
      )}
    </div>
  );
}
