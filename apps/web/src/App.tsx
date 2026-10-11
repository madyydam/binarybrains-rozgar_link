import React, { useEffect, useState } from 'react';
import { Avatar, ScoreRing, StatusBadge, FailedRuleStrip, Button } from '@rozgarlink/ui';

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

interface OpportunityMatch {
  opportunity: {
    id: string;
    title: string;
    orgName: string;
    workDescription: string;
    district: string;
    state: string;
    closesOn: string;
    preferenceAttrs: {
      pay?: { min: number; max: number };
      shift?: string;
      workType?: string;
      sector?: string;
    };
  };
  status: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_INFO';
  score?: number;
  rank?: number;
  components?: {
    skillFit: number;
    preferenceFit: number;
    proficiencyFit: number;
    commuteFit: number;
    distanceKm?: number;
    payFit: number;
    shiftFit: number;
  };
  explanation: {
    headline: string;
    points: string[];
    failedRules: { label: string; candidateValue: string | null; requiredValue: string }[];
    missingFields: string[];
  };
  ruleResults: {
    ruleId: string;
    type: string;
    outcome: 'PASS' | 'FAIL' | 'UNKNOWN';
    label: string;
    candidateValue: string | null;
    requiredValue: string;
  }[];
  pathway?: {
    gaps: { skillId: string; importance: string; isPartial: boolean }[];
    steps: {
      stepNumber: number;
      resourceId: string;
      title: string;
      provider: string;
      durationHours: number;
      skillsGained: string[];
      why: string;
    }[];
    totalHours: number;
    totalCostInr: number;
    eligibilityBlockers: { ruleLabel: string; suggestedCourse?: { title: string; provider: string } }[];
  };
}

type NavTab = 'home' | 'match' | 'learn' | 'profile';

const QUAL_NAMES: Record<number, string> = {
  1: '8th Pass', 2: '10th Pass', 3: '12th Pass',
  4: 'ITI', 5: 'Diploma', 6: 'Graduate', 7: 'Postgraduate'
};

/* ─────────────── Static course catalog ─────────────── */
const COURSES = [
  {
    id: 'crs-safety-basics',
    title: 'Foundations of Industrial Safety',
    provider: 'NSDC',
    hours: 12,
    skills: ['Industrial Safety'],
    cost: 'Free',
    modules: 8,
    progress: 0,
    color: 'from-[#6366F1] to-[#8B5CF6]',
    icon: '🛡️',
  },
  {
    id: 'crs-panel-wiring-adv',
    title: 'Industrial Control Panel Wiring',
    provider: 'MSBVEE',
    hours: 45,
    skills: ['Panel Wiring', 'Electrical Fault'],
    cost: '₹500',
    modules: 12,
    progress: 30,
    prereq: 'Requires Industrial Safety first',
    color: 'from-[#06B6D4] to-[#3B82F6]',
    icon: '⚡',
  },
  {
    id: 'crs-solar-mastery',
    title: 'Advanced Rooftop Solar PV Engineering',
    provider: 'Suryamitra',
    hours: 60,
    skills: ['Solar PV Installation'],
    cost: '₹1,200',
    modules: 10,
    progress: 0,
    prereq: 'Requires Industrial Safety first',
    color: 'from-[#F59E0B] to-[#EF4444]',
    icon: '☀️',
  },
  {
    id: 'crs-polytechnic-diploma-ee',
    title: 'Polytechnic Diploma in Electrical Engg.',
    provider: 'MSBTE Vocational Board',
    hours: 900,
    skills: ['Basic Electrical', 'Panel Wiring'],
    cost: '₹14,000',
    modules: 24,
    progress: 0,
    awardsQual: 'Awards Diploma (Ordinal 5)',
    color: 'from-[#10B981] to-[#059669]',
    icon: '🎓',
  },
];

/* ─────────────── Match filter categories ─────────────── */
const MATCH_FILTERS = ['All', 'Eligible', 'Needs Info', 'Not Eligible'];

/* ─────────────── Sidebar nav items ─────────────── */
const SIDEBAR_ITEMS: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'match',
    label: 'Match',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'learn',
    label: 'Learn',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

/* ═══════════════════════════════ APP ═══════════════════════════════ */
export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentCandidateId, setCurrentCandidateId] = useState('cand-asha');
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [locale, setLocale] = useState<'en' | 'hi' | 'mr'>('en');

  const [matches, setMatches] = useState<{
    eligible: OpportunityMatch[];
    needsInfo: OpportunityMatch[];
    notEligible: OpportunityMatch[];
  }>({ eligible: [], needsInfo: [], notEligible: [] });

  const [matchFilter, setMatchFilter] = useState('All');
  const [selectedMatch, setSelectedMatch] = useState<OpportunityMatch | null>(null);

  const [changeBanner, setChangeBanner] = useState<{ message: string } | null>(null);

  const [whatIfEnabled, setWhatIfEnabled] = useState(false);
  const [whatIfQual, setWhatIfQual] = useState(4);
  const [whatIfCommute, setWhatIfCommute] = useState(25);

  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiExtractText, setAiExtractText] = useState('');
  const [extractedSkills, setExtractedSkills] = useState<{ skillId: string; name: string }[]>([]);

  const [learnSubTab, setLearnSubTab] = useState<'Courses' | 'Paths' | 'Practice'>('Courses');

  const [officerRuleType, setOfficerRuleType] = useState('QUAL_MIN_LEVEL');
  const [officerRuleVal, setOfficerRuleVal] = useState('4');
  const [officerRuleLabel, setOfficerRuleLabel] = useState('Requires minimum ITI qualification');
  const [officerPreview, setOfficerPreview] = useState<{ eligibleCount: number; totalCandidates: number } | null>(null);

  /* ── Search bar value ── */
  const [searchQuery, setSearchQuery] = useState('');

  /* ── Sidebar collapsed (desktop only) ── */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ── Fetch profile & matches ── */
  useEffect(() => {
    fetchProfile();
    fetchMatches();
  }, [currentCandidateId, locale]);

  /* ── SSE ── */
  useEffect(() => {
    const sse = new EventSource(`/v1/events?candidateId=${currentCandidateId}`);
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'matches.updated') {
          fetchProfile();
          fetchMatches();
          const newCount = data.changes?.newlyEligible?.length || 0;
          if (newCount > 0)
            setChangeBanner({ message: `🎉 ${newCount} new eligible opportunity!` });
        }
      } catch {}
    };
    return () => sse.close();
  }, [currentCandidateId]);

  /* ── What-If simulator ── */
  useEffect(() => {
    if (!whatIfEnabled) { fetchMatches(); return; }
    const run = async () => {
      try {
        const res = await fetch(`/v1/matches/whatif?candidateId=${currentCandidateId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patchFacts: { highestQualification: { ordinal: whatIfQual, verified: true }, qualifications: [{ ordinal: whatIfQual, verified: true }] },
            patchPreferences: { commuteKm: whatIfCommute },
            locale
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setMatches({ eligible: data.eligible || [], needsInfo: data.needsInfo || [], notEligible: data.notEligible || [] });
        }
      } catch {}
    };
    run();
  }, [whatIfEnabled, whatIfQual, whatIfCommute]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/v1/candidates/me?candidateId=${currentCandidateId}`);
      if (res.ok) {
        const data = await res.json();
        setCandidate(data.candidate);
        if (data.candidate.facts.highestQualification) setWhatIfQual(data.candidate.facts.highestQualification.ordinal);
        if (data.candidate.preferences.commuteKm) setWhatIfCommute(data.candidate.preferences.commuteKm);
      }
    } catch {}
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch(`/v1/matches?candidateId=${currentCandidateId}&locale=${locale}`);
      if (res.ok) {
        const data = await res.json();
        setMatches({ eligible: data.eligible || [], needsInfo: data.needsInfo || [], notEligible: data.notEligible || [] });
      }
    } catch {}
  };

  const handleUndo = async () => {
    try {
      await fetch(`/v1/candidates/me/undo?candidateId=${currentCandidateId}`, { method: 'POST' });
      fetchProfile(); fetchMatches();
    } catch {}
  };

  const handleAddQualification = async (ordinal: number) => {
    try {
      await fetch(`/v1/candidates/me/qualifications?candidateId=${currentCandidateId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordinal, fieldCode: 'VOC', verified: true }),
      });
      fetchProfile(); fetchMatches();
    } catch {}
  };

  const handleCompleteCourse = async (resourceId: string) => {
    try {
      await fetch(`/v1/learning/complete?candidateId=${currentCandidateId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId }),
      });
      fetchProfile(); fetchMatches(); setSelectedMatch(null);
    } catch {}
  };

  const handleExtractSkills = async () => {
    if (!aiExtractText) return;
    try {
      const res = await fetch('/v1/candidates/me/skills/extract', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiExtractText }),
      });
      if (res.ok) setExtractedSkills((await res.json()).skills);
    } catch {}
  };

  const handleConfirmExtractedSkill = async (skillId: string) => {
    if (!candidate) return;
    const current = [...candidate.skills];
    if (!current.some((s) => s.skillId === skillId))
      current.push({ skillId, proficiency: 3, source: 'ai', confirmed: true, confidence: 0.95 });
    await fetch(`/v1/candidates/me/skills?candidateId=${currentCandidateId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills: current }),
    });
    setExtractedSkills((prev) => prev.filter((s) => s.skillId !== skillId));
    fetchProfile(); fetchMatches();
  };

  const handleOfficerPreview = async () => {
    try {
      const val = officerRuleType === 'QUAL_MIN_LEVEL' ? Number(officerRuleVal) : officerRuleVal;
      const res = await fetch('/v1/opportunities/preview', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: [{ id: 'rule-test-1', type: officerRuleType, operator: 'gte', value: val, label: officerRuleLabel, requiresVerification: true, version: 1 }] }),
      });
      if (res.ok) setOfficerPreview(await res.json());
    } catch {}
  };

  /* ── Filtered match list ── */
  const filteredMatches = (() => {
    if (matchFilter === 'Eligible') return matches.eligible;
    if (matchFilter === 'Needs Info') return matches.needsInfo;
    if (matchFilter === 'Not Eligible') return matches.notEligible;
    return [...matches.eligible, ...matches.needsInfo, ...matches.notEligible];
  })();

  /* ── Total eligible count for badge ── */
  const eligibleCount = matches.eligible.length;

  /* ══════════════════════ RENDER ══════════════════════ */
  return (
    <div className="app-shell">
      {/* ──────────── DESKTOP LEFT SIDEBAR ──────────── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          {sidebarOpen && (
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">FutoraOne</span>
              <span className="sidebar-brand-sub">RozgarLink</span>
            </div>
          )}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
            </svg>
          </button>
        </div>

        {/* Nav Items */}
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
                {item.id === 'match' && eligibleCount > 0 && (
                  <span className={`sidebar-badge ${sidebarOpen ? '' : 'sidebar-badge-icon'}`}>
                    {eligibleCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: Persona + Language */}
        {sidebarOpen && (
          <div className="sidebar-bottom">
            <div className="sidebar-bottom-group">
              <label className="sidebar-bottom-label">Persona</label>
              <select
                value={currentCandidateId}
                onChange={(e) => setCurrentCandidateId(e.target.value)}
                className="sidebar-select"
              >
                <option value="cand-asha">Asha Patil</option>
                <option value="cand-rahul">Rahul Deshmukh</option>
                <option value="cand-meena">Meena Shinde</option>
                <option value="cand-edge-age">Ramesh (Age Edge)</option>
                <option value="cand-edge-residence">Sneha (Residence)</option>
                <option value="cand-edge-cert">Amit (Cert Missing)</option>
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
              <span>Live Engine</span>
            </div>
          </div>
        )}
      </aside>

      {/* ──────────── MAIN CONTENT ──────────── */}
      <main className="main-content">

        {/* Live Banner */}
        {changeBanner && (
          <div className="live-banner">
            <span className="live-banner-dot" />
            <span>{changeBanner.message}</span>
            <button onClick={() => setChangeBanner(null)} className="live-banner-close">✕</button>
          </div>
        )}

        {/* ══════════════ HOME TAB ══════════════ */}
        {activeTab === 'home' && (
          <div className="screen-home">
            {/* Mobile top bar */}
            <div className="mobile-topbar">
              <div className="mobile-topbar-left">
                <div className="mobile-logo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                </div>
                <span className="mobile-brand-name">FutoraOne</span>
              </div>
              <div className="mobile-topbar-right">
                <button className="mobile-icon-btn" aria-label="Messages">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
                <button className="mobile-icon-btn relative" aria-label="Notifications">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {eligibleCount > 0 && <span className="notif-badge">{eligibleCount}</span>}
                </button>
              </div>
            </div>

            {/* Hero Section */}
            <div className="home-hero">
              <div className="home-hero-content">
                <p className="home-hero-tagline">Build · Learn · Grow</p>
                <h1 className="home-hero-title">Your Tech Journey<br />Starts Here</h1>
                <p className="home-hero-sub">
                  Connect with people, learn new skills,<br />find opportunities and build your future.
                </p>
              </div>
              <div className="home-hero-illustration" aria-hidden="true">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="38" fill="url(#heroGrad)" opacity="0.2" />
                  <path d="M20 55 L40 20 L60 55" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8"/>
                  <path d="M35 45 L40 20 L45 45" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
                  <circle cx="40" cy="20" r="4" fill="white" opacity="0.9"/>
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="80" y2="80">
                      <stop stopColor="#fff" />
                      <stop offset="1" stopColor="#a5b4fc" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Search Bar */}
            <div className="home-search-wrap">
              <div className="home-search-bar">
                <svg className="home-search-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search courses, people, opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="home-search-input"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="home-quick-actions">
              {[
                { tab: 'learn' as NavTab, label: 'Learn', sub: 'Build Skills', icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                )},
                { tab: 'match' as NavTab, label: 'Match', sub: 'Find People', icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )},
                { tab: 'home' as NavTab, label: 'Explore', sub: 'Opportunities', icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
                )},
                { tab: 'profile' as NavTab, label: 'Community', sub: 'Join Now', icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                )},
              ].map((item) => (
                <button key={item.label} onClick={() => setActiveTab(item.tab)} className="quick-action-btn">
                  <div className="quick-action-icon-wrap">{item.icon}</div>
                  <span className="quick-action-label">{item.label}</span>
                  <span className="quick-action-sub">{item.sub}</span>
                </button>
              ))}
            </div>

            {/* Left col: Recommended for you */}
            <div className="home-section">
              <div className="home-section-header">
                <h2 className="home-section-title">Recommended for you</h2>
                <button onClick={() => setActiveTab('learn')} className="home-see-all">See all →</button>
              </div>
              <div className="recommend-list">
                {COURSES.slice(0, 2).map((c) => {
                  const isCompleted = candidate?.completedCourses.includes(c.id);
                  return (
                    <div key={c.id} className="recommend-card">
                      <div className={`recommend-card-thumb bg-gradient-to-br ${c.color}`}>
                        <span className="text-2xl">{c.icon}</span>
                      </div>
                      <div className="recommend-card-body">
                        <div className="recommend-card-badges">
                          <span className="rec-badge rec-badge-popular">Popular</span>
                        </div>
                        <h4 className="recommend-card-title">{c.title}</h4>
                        <p className="recommend-card-sub">{c.provider}</p>
                        <div className="recommend-card-meta">
                          <span className="rec-meta">{c.modules} modules</span>
                          <span className="rec-meta">⭐ 4.8</span>
                          <span className="rec-meta">6.2k learners</span>
                        </div>
                      </div>
                      <button
                        onClick={() => !isCompleted && handleCompleteCourse(c.id)}
                        className="recommend-card-arrow"
                        aria-label="View course"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop Right Panel — Top Matches + What-If stacked */}
            <div className="home-desktop-right">
              {/* Top Matches */}
              <div className="home-section" style={{ padding: 0, marginBottom: 0 }}>
                <div className="home-section-header">
                  <h2 className="home-section-title">Top Matches</h2>
                  <button onClick={() => setActiveTab('match')} className="home-see-all">See all →</button>
                </div>
                <div className="top-matches-row">
                  {matches.eligible.slice(0, 5).map((m) => (
                    <button
                      key={m.opportunity.id}
                      onClick={() => { setActiveTab('match'); setSelectedMatch(m); }}
                      className="top-match-avatar-btn"
                    >
                      <div className="top-match-avatar">
                        <span>{m.opportunity.orgName?.substring(0, 2).toUpperCase() || 'OP'}</span>
                      </div>
                      <span className="top-match-name">{m.opportunity.title?.split(' ').slice(0, 2).join(' ')}</span>
                    </button>
                  ))}
                  {matches.eligible.length === 0 && (
                    <p className="text-xs text-slate-400 py-2">Loading matches...</p>
                  )}
                </div>
              </div>

              {/* What-If Card */}
              <div style={{ marginTop: 20 }}>
                <div className="whatif-card" onClick={() => { setWhatIfEnabled(true); setActiveTab('match'); }}>
                  <div className="whatif-card-left">
                    <div className="whatif-icon">⚡</div>
                    <div>
                      <p className="whatif-title">Career Simulation</p>
                      <p className="whatif-sub">See how upgrading skills changes your matches</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-[#5B4BEA]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Eligible count summary */}
              <div style={{ marginTop: 16, background: 'white', border: '1.5px solid var(--border)', borderRadius: 16, padding: '16px 20px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 8px' }}>Your Stats</p>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--ok)', margin: 0 }}>{eligibleCount}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>Eligible</p>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--warn)', margin: 0 }}>{matches.needsInfo.length}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>Needs Info</p>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--fail)', margin: 0 }}>{matches.notEligible.length}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>Not Eligible</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ MATCH TAB ══════════════ */}
        {activeTab === 'match' && (
          <div className="screen-match">
            {/* Mobile top bar */}
            <div className="mobile-topbar">
              <div className="mobile-topbar-left">
                <div className="mobile-logo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                </div>
                <span className="mobile-brand-name">FutoraOne</span>
              </div>
              <div className="mobile-topbar-right">
                <button className="mobile-icon-btn" aria-label="Messages">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </button>
                <button className="mobile-icon-btn relative" aria-label="Notifications">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  {eligibleCount > 0 && <span className="notif-badge">{eligibleCount}</span>}
                </button>
              </div>
            </div>

            <div className="screen-header">
              <h1 className="screen-title">Match</h1>
              <p className="screen-sub">Connect with developers, founders, freelancers and tech enthusiasts.</p>
            </div>

            {/* Filter chips */}
            <div className="filter-chips-row">
              {MATCH_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setMatchFilter(f)}
                  className={`filter-chip ${matchFilter === f ? 'active' : ''}`}
                >
                  {f}
                  {f === 'Eligible' && eligibleCount > 0 && (
                    <span className="chip-badge">{eligibleCount}</span>
                  )}
                </button>
              ))}
            </div>

            {/* What-If Toggle */}
            <div className="whatif-toggle-row">
              <span className="whatif-toggle-label">⚡ What-If Simulation</span>
              <button
                type="button"
                onClick={() => setWhatIfEnabled(!whatIfEnabled)}
                className={`toggle-switch ${whatIfEnabled ? 'on' : ''}`}
              >
                <span className="toggle-knob" />
              </button>
            </div>

            {/* What-If Controls */}
            {whatIfEnabled && (
              <div className="whatif-panel">
                <div className="whatif-panel-header">
                  <span>⚡ Hypothetical Sandbox</span>
                  <button onClick={() => setWhatIfEnabled(false)} className="whatif-panel-close">Reset & Exit</button>
                </div>
                <div className="whatif-panel-grid">
                  <div>
                    <label className="whatif-field-label">
                      Qualification: <strong>{QUAL_NAMES[whatIfQual]}</strong>
                    </label>
                    <input type="range" min="2" max="6" value={whatIfQual} onChange={(e) => setWhatIfQual(Number(e.target.value))} className="whatif-range" />
                  </div>
                  <div>
                    <label className="whatif-field-label">
                      Max Commute: <strong>{whatIfCommute} km</strong>
                    </label>
                    <input type="range" min="5" max="60" step="5" value={whatIfCommute} onChange={(e) => setWhatIfCommute(Number(e.target.value))} className="whatif-range" />
                  </div>
                </div>
              </div>
            )}

            {/* Match Cards */}
            <div className="match-list">
              {filteredMatches.length === 0 && (
                <div className="empty-state">
                  <p>No matches found in this category.</p>
                </div>
              )}
              {filteredMatches.map((item) => (
                <div
                  key={item.opportunity.id}
                  className={`match-card ${item.status === 'ELIGIBLE' ? 'match-card-eligible' : item.status === 'NEEDS_INFO' ? 'match-card-needsinfo' : 'match-card-noteligible'}`}
                  onClick={() => setSelectedMatch(item)}
                >
                  <div className="match-card-top">
                    <div className="match-card-avatar">
                      <span>{item.opportunity.orgName?.substring(0, 2).toUpperCase() || 'OP'}</span>
                      {item.status === 'ELIGIBLE' && <span className="online-dot" />}
                    </div>
                    <div className="match-card-info">
                      <div className="match-card-name-row">
                        <h3 className="match-card-name">{item.opportunity.title}</h3>
                        {item.status === 'ELIGIBLE' && (
                          <span className="online-label">● Eligible</span>
                        )}
                        {item.status === 'NEEDS_INFO' && (
                          <span className="online-label warn">● Needs Info</span>
                        )}
                        {item.status === 'NOT_ELIGIBLE' && (
                          <span className="online-label fail">● Not Eligible</span>
                        )}
                      </div>
                      <p className="match-card-sub">{item.opportunity.orgName}</p>
                      <p className="match-card-loc">
                        <svg className="w-3 h-3 inline mr-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {item.opportunity.district}, {item.opportunity.state}
                      </p>
                    </div>
                    {item.score !== undefined ? (
                      <ScoreRing score={item.score} size={48} strokeWidth={4} />
                    ) : (
                      <button
                        className="connect-btn"
                        onClick={(e) => { e.stopPropagation(); setSelectedMatch(item); }}
                      >
                        Connect
                      </button>
                    )}
                  </div>

                  {/* Tags / Explanation points */}
                  <div className="match-card-tags">
                    {item.explanation.points.slice(0, 3).map((pt, idx) => (
                      <span key={idx} className="match-tag">{pt}</span>
                    ))}
                    {item.opportunity.preferenceAttrs.pay && (
                      <span className="match-tag">₹{item.opportunity.preferenceAttrs.pay.min?.toLocaleString()}/mo</span>
                    )}
                    {item.opportunity.preferenceAttrs.shift && (
                      <span className="match-tag">{item.opportunity.preferenceAttrs.shift} shift</span>
                    )}
                  </div>

                  {/* Failed rules (not eligible) */}
                  {item.status === 'NOT_ELIGIBLE' && item.explanation.failedRules.length > 0 && (
                    <div className="match-card-failed-rules">
                      {item.explanation.failedRules.map((fr, idx) => (
                        <FailedRuleStrip key={idx} label={fr.label} candidateValue={fr.candidateValue} requiredValue={fr.requiredValue} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Right Panel: sticky info card */}
            <div className="match-desktop-hint">
              <div className="match-desktop-hint-icon">👆</div>
              <p className="match-desktop-hint-title">
                {selectedMatch ? selectedMatch.opportunity.title : 'Select a Match'}
              </p>
              <p className="match-desktop-hint-sub">
                {selectedMatch
                  ? `${selectedMatch.opportunity.orgName} · ${selectedMatch.opportunity.district} · Closes ${selectedMatch.opportunity.closesOn}`
                  : 'Click any match card to see the full eligibility audit, rule trail, and your learning pathway.'}
              </p>
              {selectedMatch && (
                <div style={{ width: '100%', marginTop: 12 }}>
                  <ScoreRing score={selectedMatch.score ?? 0} size={72} strokeWidth={6} />
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedMatch.ruleResults.slice(0, 4).map((r, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 6, fontWeight: 700, fontSize: 10,
                          background: r.outcome === 'PASS' ? '#ECFDF5' : r.outcome === 'FAIL' ? '#FEF2F2' : '#FEF3C7',
                          color: r.outcome === 'PASS' ? '#065F46' : r.outcome === 'FAIL' ? '#991B1B' : '#92400E'
                        }}>{r.outcome}</span>
                        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{r.label}</span>
                      </div>
                    ))}
                  </div>
                  {selectedMatch.pathway && selectedMatch.pathway.steps.length > 0 && (
                    <div style={{ marginTop: 12, padding: '10px 12px', background: '#F5F3FF', borderRadius: 12, fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                      🎓 {selectedMatch.pathway.steps.length} learning steps · {selectedMatch.pathway.totalHours}h · ₹{selectedMatch.pathway.totalCostInr}
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedMatch(null)}
                    style={{ marginTop: 12, width: '100%', padding: '8px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--muted)', background: 'white' }}
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ LEARN TAB ══════════════ */}
        {activeTab === 'learn' && (
          <div className="screen-learn">
            {/* Mobile top bar */}
            <div className="mobile-topbar">
              <div className="mobile-topbar-left">
                <div className="mobile-logo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                </div>
                <span className="mobile-brand-name">FutoraOne</span>
              </div>
              <div className="mobile-topbar-right">
                <button className="mobile-icon-btn" aria-label="Messages">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </button>
                <button className="mobile-icon-btn relative" aria-label="Notifications">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  {eligibleCount > 0 && <span className="notif-badge">{eligibleCount}</span>}
                </button>
              </div>
            </div>

            <div className="screen-header">
              <h1 className="screen-title">Learn</h1>
              <p className="screen-sub">Structured learning paths, practical projects, and real-world skills.</p>
            </div>

            {/* Sub-tabs */}
            <div className="learn-subtabs">
              {(['Courses', 'Paths', 'Practice'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setLearnSubTab(t)}
                  className={`learn-subtab ${learnSubTab === t ? 'active' : ''}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Course Cards */}
            <div className="course-list">
              {COURSES.map((c) => {
                const isCompleted = candidate?.completedCourses.includes(c.id);
                return (
                  <div key={c.id} className="course-card">
                    <div className={`course-card-thumb bg-gradient-to-br ${c.color}`}>
                      <span className="course-card-icon-text">{c.icon}</span>
                    </div>
                    <div className="course-card-body">
                      <p className="course-card-type">Course Path</p>
                      <h4 className="course-card-title">{c.title}</h4>
                      <p className="course-card-tags-row">
                        {c.skills.join(' · ')}
                      </p>
                      <div className="course-progress-row">
                        <div className="course-progress-bar">
                          <div
                            className="course-progress-fill"
                            style={{ width: `${isCompleted ? 100 : c.progress}%` }}
                          />
                        </div>
                        <span className="course-progress-label">
                          {isCompleted ? 'Completed' : `${c.modules} modules`}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => !isCompleted && handleCompleteCourse(c.id)}
                      className="course-card-action"
                      aria-label="Go to course"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* AI Skill Extractor */}
            <div className="ai-extractor-card">
              <div className="ai-extractor-header">
                <div className="ai-extractor-title-row">
                  <div className="ai-icon-badge">AI</div>
                  <div>
                    <h3 className="ai-extractor-title">AI Skill Extractor</h3>
                    <p className="ai-extractor-sub">Paste your resume or bio to auto-detect skills</p>
                  </div>
                </div>
                <span className="ai-guarantee-badge">AI Never Decides Eligibility</span>
              </div>
              <textarea
                value={aiExtractText}
                onChange={(e) => setAiExtractText(e.target.value)}
                placeholder="Example: I have 2 years of experience in solar panel installation and electrical repair..."
                rows={3}
                className="ai-textarea"
              />
              <button onClick={handleExtractSkills} className="ai-extract-btn">
                Extract Skills with AI
              </button>
              {extractedSkills.length > 0 && (
                <div className="extracted-skills-list">
                  <p className="extracted-skills-title">Click to confirm and add to profile:</p>
                  <div className="extracted-skills-chips">
                    {extractedSkills.map((sk) => (
                      <button
                        key={sk.skillId}
                        onClick={() => handleConfirmExtractedSkill(sk.skillId)}
                        className="extracted-skill-chip"
                      >
                        + {sk.name} <span className="confirm-label">Confirm</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ PROFILE TAB ══════════════ */}
        {activeTab === 'profile' && (
          <div className="screen-profile">
            {/* Mobile top bar */}
            <div className="mobile-topbar">
              <div className="mobile-topbar-left">
                <div className="mobile-logo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                </div>
                <span className="mobile-brand-name">FutoraOne</span>
              </div>
              <div className="mobile-topbar-right">
                <button className="mobile-icon-btn" aria-label="Messages">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </button>
                <button className="mobile-icon-btn relative" aria-label="Notifications">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  {eligibleCount > 0 && <span className="notif-badge">{eligibleCount}</span>}
                </button>
              </div>
            </div>

            {/* Profile Card */}
            <div className="profile-hero-card">
              {candidate ? (
                <>
                  <div className="profile-hero-top">
                    <Avatar name={candidate.name} size="lg" online />
                    <div className="profile-hero-info">
                      <div className="profile-name-row">
                        <h2 className="profile-name">{candidate.name}</h2>
                        <svg className="w-4 h-4 text-[#2F5BFF]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="profile-role">
                        {QUAL_NAMES[candidate.facts.highestQualification?.ordinal || 1]} · Candidate
                      </p>
                      <p className="profile-location">
                        <svg className="w-3 h-3 inline mr-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {candidate.facts.district}, {candidate.facts.state}
                      </p>
                    </div>
                  </div>
                  <button onClick={handleUndo} className="edit-profile-btn">Edit Profile</button>

                  {/* Stats Row */}
                  <div className="profile-stats-row">
                    <div className="profile-stat">
                      <span className="stat-num">{candidate.completedCourses.length}</span>
                      <span className="stat-label">Courses Done</span>
                    </div>
                    <div className="profile-stat-divider" />
                    <div className="profile-stat">
                      <span className="stat-num">{eligibleCount}</span>
                      <span className="stat-label">Connections</span>
                    </div>
                    <div className="profile-stat-divider" />
                    <div className="profile-stat">
                      <span className="stat-num">{candidate.skills.length}</span>
                      <span className="stat-label">Skills</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="profile-loading">Loading profile...</div>
              )}
            </div>

            {/* Progress Card */}
            {candidate && (
              <div className="progress-card">
                <div className="progress-card-left">
                  <ScoreRing
                    score={Math.round(
                      (candidate.completedCourses.length / Math.max(COURSES.length, 1)) * 100
                    )}
                    size={64}
                    strokeWidth={5}
                  />
                  <div>
                    <p className="progress-card-title">Your Progress</p>
                    <p className="progress-card-sub">
                      {candidate.completedCourses.length}/{COURSES.length} courses
                    </p>
                  </div>
                </div>
                <div className="progress-card-right">
                  <p className="learning-streak-label">🔥 Learning Streak</p>
                  <p className="learning-streak-days">7 days</p>
                </div>
                <button className="progress-card-arrow" onClick={() => setActiveTab('learn')} aria-label="Go to learn">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Menu Items */}
            {candidate && (
              <div className="profile-menu">
                {[
                  { icon: '📚', label: 'My Courses', sub: 'View your enrolled courses', tab: 'learn' as NavTab },
                  { icon: '🔖', label: 'Saved', sub: 'Courses, resources & people', tab: 'home' as NavTab },
                  { icon: '⚙️', label: 'Settings', sub: 'App preferences & account', tab: null },
                  { icon: '❓', label: 'Help & Support', sub: 'Get help or contact us', tab: null },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => item.tab && setActiveTab(item.tab)}
                    className="profile-menu-item"
                  >
                    <div className="profile-menu-icon">{item.icon}</div>
                    <div className="profile-menu-text">
                      <p className="profile-menu-label">{item.label}</p>
                      <p className="profile-menu-sub">{item.sub}</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {/* Qualifications & Skills */}
            {candidate && (
              <div className="profile-details-grid">
                <div className="profile-detail-card">
                  <h3 className="profile-detail-title">Qualifications</h3>
                  <div className="profile-detail-list">
                    {candidate.facts.qualifications.map((q, idx) => (
                      <div key={idx} className="profile-detail-item">
                        <span className="detail-item-label">{QUAL_NAMES[q.ordinal]}</span>
                        <span className={`detail-item-badge ${q.verified ? 'verified' : 'self'}`}>
                          {q.verified ? 'Verified' : 'Self-Reported'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="profile-add-row">
                    <button onClick={() => handleAddQualification(4)} className="profile-add-btn blue">+ Add ITI</button>
                    <button onClick={() => handleAddQualification(5)} className="profile-add-btn purple">+ Add Diploma</button>
                  </div>
                </div>
                <div className="profile-detail-card">
                  <h3 className="profile-detail-title">Skills</h3>
                  <div className="profile-detail-list">
                    {candidate.skills.slice(0, 5).map((s, idx) => (
                      <div key={idx} className="profile-detail-item">
                        <span className="detail-item-label capitalize">{s.skillId.replace(/-/g, ' ')}</span>
                        <span className={`detail-item-badge ${s.confirmed ? 'verified' : 'self'}`}>
                          {s.confirmed ? `${s.proficiency}/5 ✓` : `${s.proficiency}/5`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Officer Console (profile only on desktop) */}
            <div className="officer-card">
              <h3 className="officer-card-title">🏛️ Officer Console</h3>
              <p className="officer-card-sub">Define mandatory eligibility rules and preview impact.</p>
              <div className="officer-form">
                <div>
                  <label className="officer-label">Rule Type</label>
                  <select
                    value={officerRuleType}
                    onChange={(e) => {
                      setOfficerRuleType(e.target.value);
                      if (e.target.value === 'QUAL_MIN_LEVEL') setOfficerRuleLabel('Requires minimum ITI qualification');
                      else if (e.target.value === 'RESIDENCE_STATE') setOfficerRuleLabel('Maharashtra resident required');
                      else if (e.target.value === 'AGE_RANGE') setOfficerRuleLabel('Age between 18 and 30 years');
                    }}
                    className="officer-select"
                  >
                    <option value="QUAL_MIN_LEVEL">QUAL_MIN_LEVEL</option>
                    <option value="RESIDENCE_STATE">RESIDENCE_STATE</option>
                    <option value="RESIDENCE_DISTRICT">RESIDENCE_DISTRICT</option>
                    <option value="AGE_RANGE">AGE_RANGE</option>
                    <option value="CERT_REQUIRED">CERT_REQUIRED</option>
                  </select>
                </div>
                <div>
                  <label className="officer-label">Required Value</label>
                  <input
                    type="text"
                    value={officerRuleVal}
                    onChange={(e) => setOfficerRuleVal(e.target.value)}
                    placeholder="e.g. 4 for ITI"
                    className="officer-input"
                  />
                </div>
                <div>
                  <label className="officer-label">Plain Language Label</label>
                  <input
                    type="text"
                    value={officerRuleLabel}
                    onChange={(e) => setOfficerRuleLabel(e.target.value)}
                    className="officer-input"
                  />
                </div>
                <button onClick={handleOfficerPreview} className="officer-preview-btn">
                  Calculate Live Preview
                </button>
              </div>
              {officerPreview && (
                <div className="officer-preview-result">
                  <span className="officer-preview-num">{officerPreview.eligibleCount}/{officerPreview.totalCandidates}</span>
                  <span className="officer-preview-label">candidates pass this rule</span>
                  <span className="officer-preview-pct">
                    {Math.round((officerPreview.eligibleCount / officerPreview.totalCandidates) * 100)}% pass rate
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ──────────── MOBILE BOTTOM NAV ──────────── */}
      <nav className="mobile-bottom-nav" aria-label="Bottom Navigation">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`bottom-nav-btn ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="bottom-nav-icon-wrap">
                {item.icon}
                {item.id === 'match' && eligibleCount > 0 && (
                  <span className="bottom-nav-badge">{eligibleCount}</span>
                )}
              </div>
              <span className="bottom-nav-label">{item.label}</span>
            </button>
          );
        })}
        {/* AI FAB */}
        <button
          onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
          className="ai-fab-bottom"
          aria-label="AI Assistant"
        >
          <span className="ai-fab-text">AI</span>
        </button>
      </nav>

      {/* ──────────── MATCH DETAIL MODAL ──────────── */}
      {selectedMatch && (
        <div className="modal-backdrop" onClick={() => setSelectedMatch(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-handle" />
            <div className="modal-header">
              <div>
                <StatusBadge status={selectedMatch.status} />
                <h3 className="modal-title">{selectedMatch.opportunity.title}</h3>
                <p className="modal-sub">{selectedMatch.opportunity.orgName} · {selectedMatch.opportunity.district}</p>
              </div>
              <button onClick={() => setSelectedMatch(null)} className="modal-close">✕</button>
            </div>

            {/* Rule Audit Trail */}
            <div className="modal-section">
              <h4 className="modal-section-title">📋 Deterministic Eligibility Audit</h4>
              <div className="audit-list">
                {selectedMatch.ruleResults.map((r, idx) => (
                  <div key={idx} className="audit-row">
                    <span className={`audit-outcome ${r.outcome === 'PASS' ? 'pass' : r.outcome === 'FAIL' ? 'fail' : 'unknown'}`}>
                      {r.outcome}
                    </span>
                    <div className="audit-info">
                      <p className="audit-label">{r.label}</p>
                      <p className="audit-values">
                        Yours: <strong>{r.candidateValue || 'Not stated'}</strong> · Required: <strong>{r.requiredValue}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Pathway */}
            {selectedMatch.pathway && selectedMatch.pathway.steps.length > 0 && (
              <div className="modal-section modal-section-purple">
                <div className="modal-pathway-header">
                  <h4 className="modal-section-title-purple">🎓 Learning Pathway to Close Gaps</h4>
                  <span className="modal-pathway-meta">
                    {selectedMatch.pathway.totalHours}h · ₹{selectedMatch.pathway.totalCostInr}
                  </span>
                </div>
                <div className="pathway-steps">
                  {selectedMatch.pathway.steps.map((st) => (
                    <div key={st.resourceId} className="pathway-step">
                      <div className="pathway-step-info">
                        <p className="pathway-step-title">Step {st.stepNumber}: {st.title}</p>
                        <p className="pathway-step-meta">{st.provider} · {st.durationHours}h</p>
                        <p className="pathway-step-why">{st.why}</p>
                      </div>
                      <button
                        onClick={() => handleCompleteCourse(st.resourceId)}
                        className="pathway-complete-btn"
                      >
                        Complete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button onClick={() => setSelectedMatch(null)} className="modal-close-btn">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────── AI DRAWER ──────────── */}
      {aiDrawerOpen && (
        <div className="ai-drawer">
          <div className="ai-drawer-header">
            <div className="ai-drawer-title-row">
              <div className="ai-drawer-icon">AI</div>
              <div>
                <h4 className="ai-drawer-name">RozgarLink AI Co-Pilot</h4>
                <p className="ai-drawer-sub">Advisory and Ranking Support</p>
              </div>
            </div>
            <button onClick={() => setAiDrawerOpen(false)} className="ai-drawer-close">✕</button>
          </div>
          <div className="ai-drawer-guarantee">
            <p className="ai-guarantee-title">🛡️ Non-negotiable Guarantee:</p>
            <p className="ai-guarantee-text">AI never decides eligibility. Rules are pure deterministic logic. AI only normalises skills for better ranking.</p>
          </div>
          <div className="ai-drawer-actions">
            <button
              onClick={() => { setActiveTab('profile'); setAiDrawerOpen(false); }}
              className="ai-quick-action blue"
            >
              📝 Extract skills from my work experience
            </button>
            <button
              onClick={() => { setWhatIfEnabled(true); setActiveTab('match'); setAiDrawerOpen(false); }}
              className="ai-quick-action purple"
            >
              ⚡ Open What-If Career Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
