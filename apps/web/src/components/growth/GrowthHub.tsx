import React from 'react';
import { CodeArena } from './CodeArena';
import { MockInterview } from './MockInterview';
import { Mentorship } from './Mentorship';
import { Competitions } from './Competitions';

export type GrowthSubTab = 'arena' | 'interview' | 'mentors' | 'events';

interface GrowthHubProps {
  activeSubTab: GrowthSubTab;
  setActiveSubTab: (tab: GrowthSubTab) => void;
  onToast: (msg: string) => void;
}

export const GrowthHub: React.FC<GrowthHubProps> = ({
  activeSubTab,
  setActiveSubTab,
  onToast
}) => {
  const SUB_TABS = [
    { id: 'arena' as const, label: 'Code Arena & 100 Days', icon: '💻', badge: 'Streak Active' },
    { id: 'interview' as const, label: 'AI Mock Interview', icon: '🤖', badge: 'New AI' },
    { id: 'mentors' as const, label: '1-on-1 Mentorship', icon: '🤝', badge: 'Top Leads' },
    { id: 'events' as const, label: 'Hackathons & Contests', icon: '🏆', badge: '₹25L+ Pool' }
  ];

  return (
    <div className="growth-hub-screen">
      {/* ── Top Header Hero ── */}
      <div className="growth-header-wrap">
        <div className="growth-title-row">
          <div className="growth-title-left">
            <div className="growth-tag-pill">
              <span className="spark-icon">✨</span>
              <span>RozgarLink Career OS · Skill Acceleration Hub</span>
            </div>
            <h1 className="growth-main-title">Build Proof-of-Work. Crack Interviews.</h1>
            <p className="growth-sub-title">
              Bypass generic resume filters. Solve daily coding challenges, practice live AI mock rounds, book 1-on-1 mentor guidance, and compete in national hackathons.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="growth-metrics-card">
            <div className="metric-box">
              <span className="metric-icon">🔥</span>
              <div>
                <span className="metric-value">14 Days</span>
                <span className="metric-label">Coding Streak</span>
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-icon">💻</span>
              <div>
                <span className="metric-value">18 Done</span>
                <span className="metric-label">DSA Challenges</span>
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-icon">🤖</span>
              <div>
                <span className="metric-value">88%</span>
                <span className="metric-label">AI Readiness</span>
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-icon">🏆</span>
              <div>
                <span className="metric-value">1 SIH</span>
                <span className="metric-label">Active Contest</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── High-Contrast Sub-Navigation Pill Switcher ── */}
        <div className="growth-subnav-bar">
          {SUB_TABS.map(tab => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`growth-tab-pill ${isActive ? 'active' : ''}`}
              >
                <span className="tab-pill-icon">{tab.icon}</span>
                <span className="tab-pill-label">{tab.label}</span>
                <span className="tab-pill-badge">{tab.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Sub-View Body ── */}
      <div className="growth-tab-body">
        {activeSubTab === 'arena' && <CodeArena onToast={onToast} />}
        {activeSubTab === 'interview' && <MockInterview onToast={onToast} />}
        {activeSubTab === 'mentors' && <Mentorship onToast={onToast} />}
        {activeSubTab === 'events' && <Competitions onToast={onToast} />}
      </div>
    </div>
  );
};
