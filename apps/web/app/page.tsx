'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BottomNav, NavTab, AiFab, Button, ScoreRing } from '@rozgarlink/ui';
import { HomeTab } from '../components/HomeTab';
import { MatchTab } from '../components/MatchTab';
import { LearnTab } from '../components/LearnTab';
import { ProfileTab } from '../components/ProfileTab';
import { AiAssistantModal } from '../components/AiAssistantModal';
import { OfficerConsole } from '../components/OfficerConsole';
import { OpportunityDetailModal } from '../components/OpportunityDetailModal';
import { ChangeBanner } from '../components/ChangeBanner';
import {
  ExtractedSkill,
  Locale,
  MatchDiff,
  MatchResultDTO,
  Opportunity,
  LearningResource
} from '@rozgarlink/shared-types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

export default function AppPage() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [locale, setLocale] = useState<Locale>('en');

  // Candidate Profile & Matches
  const [candidate, setCandidate] = useState<any>({
    id: 'c1111111-0000-0000-0000-000000000001',
    name: 'Asha Sharma',
    district: 'Pune',
    state: 'Maharashtra',
    dob: '2005-01-15',
    skills: [
      { skillId: 'SK-ELEC-WIRING', proficiency: 4, confirmed: true },
      { skillId: 'SK-PANEL-FIT', proficiency: 3, confirmed: true }
    ],
    qualifications: [
      { id: 'q1', levelOrdinal: 4, fieldCode: 'Electrician', verified: true }
    ]
  });

  const [eligibleMatches, setEligibleMatches] = useState<MatchResultDTO[]>([]);
  const [notEligibleMatches, setNotEligibleMatches] = useState<MatchResultDTO[]>([]);
  const [needsInfoMatches, setNeedsInfoMatches] = useState<MatchResultDTO[]>([]);
  const [courses, setCourses] = useState<LearningResource[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Interactivity State
  const [interestedOppIds, setInterestedOppIds] = useState<Set<string>>(new Set());
  const [completedCourseIds, setCompletedCourseIds] = useState<Set<string>>(new Set());
  const [activePathway, setActivePathway] = useState<any>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [selectedMatchResult, setSelectedMatchResult] = useState<MatchResultDTO | null>(null);

  // Modals & Banners
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isOfficerOpen, setIsOfficerOpen] = useState(false);
  const [liveChanges, setLiveChanges] = useState<MatchDiff | null>(null);
  const [previousProfileSnapshot, setPreviousProfileSnapshot] = useState<any>(null);
  const [isWhatIfActive, setIsWhatIfActive] = useState(false);

  // Fetch candidate profile and matches
  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/matches?locale=${locale}`, {
        headers: {
          'X-Demo-User': candidate.email || 'asha@rozgarlink.gov.in'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setEligibleMatches(data.eligible || []);
        setNotEligibleMatches(data.notEligible || []);
        setNeedsInfoMatches(data.needsInfo || []);
      }
    } catch (e) {
      console.warn('API connection offline, using pre-seeded local simulation.');
    }
  }, [candidate.email, locale]);

  // Fetch opportunities and courses catalogue
  const fetchCatalogue = useCallback(async () => {
    try {
      const [oppRes, courseRes, auditRes] = await Promise.all([
        fetch(`${API_BASE}/opportunities`),
        fetch(`${API_BASE}/catalogue/courses`),
        fetch(`${API_BASE}/audit`, {
          headers: { 'X-Demo-Role': 'admin' }
        })
      ]);

      if (oppRes.ok) {
        const d = await oppRes.json();
        setOpportunities(d.opportunities || []);
      }
      if (courseRes.ok) {
        const d = await courseRes.json();
        setCourses(d.courses || []);
      }
      if (auditRes.ok) {
        const d = await auditRes.json();
        setAuditLogs(d.events || []);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchMatches();
    fetchCatalogue();
  }, [fetchMatches, fetchCatalogue]);

  // SSE Realtime stream subscription
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource(`${API_BASE}/events?candidateId=${candidate.id}`);
      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'matches.updated') {
            setLiveChanges(payload.changes);
            fetchMatches();
          }
        } catch {}
      };
    } catch {}

    return () => {
      es?.close();
    };
  }, [candidate.id, fetchMatches]);

  // Handler: Update District (Scenario A)
  const handleUpdateDistrict = async (newDistrict: string) => {
    setPreviousProfileSnapshot(JSON.parse(JSON.stringify(candidate)));
    try {
      const res = await fetch(`${API_BASE}/candidates/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Demo-User': candidate.email || 'asha@rozgarlink.gov.in'
        },
        body: JSON.stringify({ district: newDistrict })
      });

      if (res.ok) {
        const data = await res.json();
        setCandidate((prev: any) => ({ ...prev, district: newDistrict }));
        if (data.changes) {
          setLiveChanges(data.changes);
        }
        await fetchMatches();
      }
    } catch (e) {
      setCandidate((prev: any) => ({ ...prev, district: newDistrict }));
      setLiveChanges({ newlyEligible: [], noLongerEligible: ['OP-102'], rankMoved: 2 });
    }
  };

  // Handler: Add Qualification (Scenario B)
  const handleAddQualification = async (ordinal: number, field: string) => {
    setPreviousProfileSnapshot(JSON.parse(JSON.stringify(candidate)));
    try {
      const res = await fetch(`${API_BASE}/candidates/me/qualifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Demo-User': candidate.email || 'asha@rozgarlink.gov.in'
        },
        body: JSON.stringify({ levelOrdinal: ordinal, fieldCode: field, verified: true })
      });

      if (res.ok) {
        const data = await res.json();
        setCandidate((prev: any) => ({
          ...prev,
          qualifications: [...prev.qualifications, { levelOrdinal: ordinal, fieldCode: field, verified: true }]
        }));
        if (data.changes) {
          setLiveChanges(data.changes);
        }
        await fetchMatches();
      }
    } catch (e) {}
  };

  // Handler: Undo Profile Change
  const handleUndo = async () => {
    if (!previousProfileSnapshot) return;
    const prev = previousProfileSnapshot;
    setPreviousProfileSnapshot(null);
    setLiveChanges(null);

    await handleUpdateDistrict(prev.district);
  };

  // Handler: Mark Interested (Scenario F)
  const handleInterested = async (oppId: string) => {
    setInterestedOppIds((prev) => new Set([...prev, oppId]));

    try {
      const res = await fetch(`${API_BASE}/interests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Demo-User': candidate.email || 'asha@rozgarlink.gov.in'
        },
        body: JSON.stringify({ opportunityId: oppId })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.pathway) {
          setActivePathway(data.pathway);
          setCurrentTab('learn'); // Navigate to Learn tab to view pathway!
        }
      }
    } catch (e) {}
  };

  // Handler: Complete Course
  const handleCompleteCourse = async (resourceId: string) => {
    setCompletedCourseIds((prev) => new Set([...prev, resourceId]));

    try {
      const res = await fetch(`${API_BASE}/learning/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Demo-User': candidate.email || 'asha@rozgarlink.gov.in'
        },
        body: JSON.stringify({ resourceId })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.changes) setLiveChanges(data.changes);
        await fetchMatches();
      }
    } catch (e) {}
  };

  // Handler: Extract Skills Free Text (Scenario C)
  const handleExtractSkills = async (text: string): Promise<ExtractedSkill[]> => {
    try {
      const res = await fetch(`${API_BASE}/candidates/me/skills/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Demo-User': candidate.email || 'asha@rozgarlink.gov.in'
        },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const data = await res.json();
        return data.suggestedSkills || [];
      }
    } catch (e) {}
    return [];
  };

  // Handler: Confirm Extracted Skills
  const handleConfirmSkills = async (extracted: ExtractedSkill[]) => {
    const formatted = extracted.map((s) => ({
      skillId: s.skillId,
      proficiency: 3,
      confirmed: true
    }));

    try {
      const res = await fetch(`${API_BASE}/candidates/me/skills`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Demo-User': candidate.email || 'asha@rozgarlink.gov.in'
        },
        body: JSON.stringify({ skills: formatted })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.changes) setLiveChanges(data.changes);
        await fetchMatches();
      }
    } catch (e) {}
  };

  // Handler: Switch Candidate Persona
  const handleSwitchCandidate = async (email: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneOrEmail: email, code: '123456' })
      });

      if (res.ok) {
        const data = await res.json();
        const candRes = await fetch(`${API_BASE}/candidates/me`, {
          headers: { Authorization: `Bearer ${data.accessToken}` }
        });
        if (candRes.ok) {
          const cData = await candRes.json();
          setCandidate(cData.candidate);
          await fetchMatches();
        }
      }
    } catch (e) {}
  };

  // Handler: What-If Simulation Toggle
  const handleToggleWhatIf = async (enabled: boolean, whatIfData?: any) => {
    setIsWhatIfActive(enabled);
    if (!enabled) {
      await fetchMatches();
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/matches/whatif`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Demo-User': candidate.email || 'asha@rozgarlink.gov.in'
        },
        body: JSON.stringify(whatIfData || {})
      });

      if (res.ok) {
        const data = await res.json();
        setEligibleMatches(data.eligible || []);
        setNotEligibleMatches(data.notEligible || []);
        setNeedsInfoMatches(data.needsInfo || []);
      }
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F3] px-4 py-2.5">
        <div className="max-w-md sm:max-w-2xl mx-auto flex items-center justify-between">
          {/* FutoraOne Brand Mark */}
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2F5BFF] to-[#5B4BEA] flex items-center justify-center text-white shadow-sm font-extrabold text-sm tracking-wider">
              RL
            </div>
            <div className="leading-none">
              <span className="font-extrabold text-[#0F1B3D] text-base">Rozgar</span>
              <span className="font-extrabold text-[#2F5BFF] text-base">Link</span>
              <span className="text-[9px] block text-[#64748B] font-medium tracking-wide">
                by FutoraOne
              </span>
            </div>
          </div>

          {/* Right Toolbar: Locale & Officer Console */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center rounded-full bg-[#F3F6FF] p-0.5 border border-[#E2E8F3] text-[11px] font-bold">
              {(['en', 'hi', 'mr'] as Locale[]).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocale(loc)}
                  className={`px-2 py-0.5 rounded-full uppercase transition-all ${
                    locale === loc ? 'bg-[#2F5BFF] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F1B3D]'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            {/* Officer Console Desktop Modal Toggle */}
            <button
              type="button"
              onClick={() => setIsOfficerOpen(true)}
              className="px-3 py-1 rounded-full text-xs font-bold text-[#0F1B3D] bg-[#EAF0FF] hover:bg-[#D5E2FF] transition-colors"
            >
              Officer Console
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container (Mobile-First Shell) */}
      <main className="flex-1 max-w-md sm:max-w-2xl w-full mx-auto p-4 sm:p-5 relative">
        {/* Live Change Banner */}
        <ChangeBanner
          changes={liveChanges}
          onUndo={previousProfileSnapshot ? handleUndo : undefined}
          onDismiss={() => setLiveChanges(null)}
        />

        {/* Tab 1: Home */}
        {currentTab === 'home' && (
          <HomeTab
            onNavigateTab={setCurrentTab}
            eligibleMatches={eligibleMatches}
            candidateName={candidate?.name || 'Asha Sharma'}
            onSelectOpportunity={(oppId) => {
              const opp = opportunities.find((o) => o.id === oppId);
              const m = eligibleMatches.find((em) => em.opportunityId === oppId);
              setSelectedOpportunity(opp || null);
              setSelectedMatchResult(m || null);
            }}
          />
        )}

        {/* Tab 2: Match */}
        {currentTab === 'match' && (
          <MatchTab
            eligibleMatches={eligibleMatches}
            notEligibleMatches={notEligibleMatches}
            needsInfoMatches={needsInfoMatches}
            interestedOppIds={interestedOppIds}
            onSelectOpportunity={(oppId) => {
              const opp = opportunities.find((o) => o.id === oppId);
              const m =
                eligibleMatches.find((em) => em.opportunityId === oppId) ||
                notEligibleMatches.find((nem) => nem.opportunityId === oppId) ||
                needsInfoMatches.find((nim) => nim.opportunityId === oppId);
              setSelectedOpportunity(opp || null);
              setSelectedMatchResult(m || null);
            }}
            onInterested={handleInterested}
            onNavigateTab={setCurrentTab}
          />
        )}

        {/* Tab 3: Learn */}
        {currentTab === 'learn' && (
          <LearnTab
            courses={courses}
            activePathway={activePathway}
            onCompleteCourse={handleCompleteCourse}
            completedCourseIds={completedCourseIds}
          />
        )}

        {/* Tab 4: Profile */}
        {currentTab === 'profile' && (
          <ProfileTab
            candidate={candidate}
            onUpdateDistrict={handleUpdateDistrict}
            onAddQualification={handleAddQualification}
            onSwitchCandidate={handleSwitchCandidate}
            onToggleWhatIf={handleToggleWhatIf}
            isWhatIfActive={isWhatIfActive}
            completedCount={completedCourseIds.size}
            interestedCount={interestedOppIds.size}
          />
        )}
      </main>

      {/* Floating AI Button (FAB) */}
      <AiFab onClick={() => setIsAiOpen(true)} isOpen={isAiOpen} />

      {/* Floating AI Assistant Drawer */}
      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        notEligibleMatches={notEligibleMatches}
        eligibleMatches={eligibleMatches}
        onExtractSkills={handleExtractSkills}
        onConfirmSkills={handleConfirmSkills}
      />

      {/* Opportunity Detail Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        matchResult={selectedMatchResult}
        onClose={() => setSelectedOpportunity(null)}
        onInterested={(id) => {
          handleInterested(id);
          setSelectedOpportunity(null);
        }}
        isInterested={selectedOpportunity ? interestedOppIds.has(selectedOpportunity.id) : false}
      />

      {/* Officer Console Modal */}
      {isOfficerOpen && (
        <OfficerConsole
          onClose={() => setIsOfficerOpen(false)}
          opportunities={opportunities}
          onSaveOpportunity={async (oppData) => {
            const res = await fetch(`${API_BASE}/opportunities`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Demo-Role': 'officer'
              },
              body: JSON.stringify(oppData)
            });
            if (res.ok) {
              await fetchCatalogue();
              await fetchMatches();
            }
          }}
          skills={Array.from(courses.flatMap((c) => c.skillsTaught.map((s) => s.skillId)))}
          auditLogs={auditLogs}
        />
      )}

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        unreadCount={{
          match: eligibleMatches.length > 0 ? eligibleMatches.length : undefined
        }}
      />
    </div>
  );
}
