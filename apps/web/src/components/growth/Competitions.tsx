import React, { useState } from 'react';
import { GROWTH_COMPETITIONS, Competition } from '../../data/growthData';

interface CompetitionsProps {
  onToast: (msg: string) => void;
}

export const Competitions: React.FC<CompetitionsProps> = ({ onToast }) => {
  const [filterCat, setFilterCat] = useState<'All' | 'Hackathon' | 'Coding Contest' | 'Case Study'>('All');
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [teamMode, setTeamMode] = useState<'solo' | 'team'>('team');
  const [teamName, setTeamName] = useState('');
  const [registeredIds, setRegisteredIds] = useState<string[]>(['comp-1']);

  const filtered = filterCat === 'All'
    ? GROWTH_COMPETITIONS
    : GROWTH_COMPETITIONS.filter(c => c.category === filterCat);

  const handleRegisterConfirm = () => {
    if (!selectedComp) return;
    if (!registeredIds.includes(selectedComp.id)) {
      setRegisteredIds(prev => [...prev, selectedComp.id]);
    }
    onToast(`Successfully registered for ${selectedComp.title}! Confirmation ticket generated.`);
    setSelectedComp(null);
  };

  return (
    <div className="competitions-container">
      {/* ── Hero Banner ── */}
      <div className="competitions-hero">
        <div className="hero-text-side">
          <span className="hero-tag">National Challenges & Contests</span>
          <h2>Hackathons, Contests & PPO Fast-Tracks</h2>
          <p>Compete in flagship Indian hackathons and coding tournaments. Win cash prizes, angel incubation, and direct Pre-Placement Offers (PPOs).</p>
        </div>
        <div className="hero-stats-badge">
          <div className="stat-item">
            <span className="num">₹25L+</span>
            <span className="lbl">Cumulative Prize Pool</span>
          </div>
          <div className="stat-item">
            <span className="num">{registeredIds.length}</span>
            <span className="lbl">Your Active Entries</span>
          </div>
        </div>
      </div>

      {/* ── Category Filters ── */}
      <div className="comp-filters-row">
        <span className="filter-label">Category:</span>
        <div className="filter-pills">
          {(['All', 'Hackathon', 'Coding Contest', 'Case Study'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`topic-pill ${filterCat === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Competitions Grid ── */}
      <div className="competitions-grid">
        {filtered.map(comp => {
          const isRegistered = registeredIds.includes(comp.id);
          return (
            <div key={comp.id} className="comp-card">
              <div className="comp-card-header">
                <div className="comp-badge-row">
                  <span className="comp-cat-tag">{comp.category}</span>
                  <span className={`comp-mode-tag ${comp.mode.toLowerCase()}`}>{comp.mode}</span>
                  {isRegistered && <span className="comp-registered-badge">✓ Registered</span>}
                </div>
                <h3 className="comp-title">{comp.title}</h3>
                <span className="comp-organizer">Organized by {comp.organizer}</span>
              </div>

              <div className="comp-prize-banner">
                <span className="prize-icon">🏆</span>
                <div>
                  <span className="prize-label">Prize Pool / Rewards</span>
                  <span className="prize-value">{comp.prize}</span>
                </div>
              </div>

              <p className="comp-desc">{comp.desc}</p>

              <div className="comp-meta-strip">
                <div className="meta-item">
                  <span className="meta-lbl">Registration Deadline</span>
                  <span className="meta-val">{comp.deadline}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-lbl">Event Timeline</span>
                  <span className="meta-val">{comp.dateStr}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-lbl">Participants</span>
                  <span className="meta-val">{comp.participants}</span>
                </div>
              </div>

              <div className="comp-perk-box">
                <b>⭐ Key Advantage:</b> {comp.perks}
              </div>

              <div className="comp-tags-row">
                {comp.tags.map((t, idx) => (
                  <span key={idx} className="skill-tag">{t}</span>
                ))}
              </div>

              <div className="comp-card-footer">
                <button
                  onClick={() => setSelectedComp(comp)}
                  className={`btn-comp-action ${isRegistered ? 'view-entry' : 'register'}`}
                >
                  {isRegistered ? 'View Registration Ticket ✓' : 'Register for Challenge →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── REGISTRATION MODAL ── */}
      {selectedComp && (
        <div className="modal-overlay" onClick={() => setSelectedComp(null)}>
          <div className="modal-box comp-modal" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedComp(null)} className="modal-close-btn">✕</button>

            <span className="text-xs font-bold text-[#345BFF]">Challenge Entry Registration</span>
            <h2 className="text-xl font-black text-[#14213D] leading-tight">{selectedComp.title}</h2>
            <p className="text-xs text-[#64748B] mb-3">{selectedComp.organizer} · {selectedComp.mode}</p>

            <div className="comp-modal-info-box">
              <div className="info-row">
                <span>Total Prize:</span> <b>{selectedComp.prize}</b>
              </div>
              <div className="info-row">
                <span>Timeline:</span> <b>{selectedComp.dateStr}</b>
              </div>
              <div className="info-row">
                <span>Application Deadline:</span> <b>{selectedComp.deadline}</b>
              </div>
            </div>

            <div className="team-mode-selector">
              <label className="text-xs font-bold text-[#14213D] block mb-2">Participation Mode:</label>
              <div className="mode-btn-row">
                <button
                  onClick={() => setTeamMode('solo')}
                  className={`mode-btn ${teamMode === 'solo' ? 'active' : ''}`}
                >
                  Solo Participant
                </button>
                <button
                  onClick={() => setTeamMode('team')}
                  className={`mode-btn ${teamMode === 'team' ? 'active' : ''}`}
                >
                  Team (2-4 Members)
                </button>
              </div>
            </div>

            {teamMode === 'team' && (
              <div className="team-name-input-wrap">
                <label className="text-xs font-bold text-[#14213D] block mb-1">Team Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Pune Binary Brains"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  className="team-name-input"
                />
              </div>
            )}

            <div className="auto-credential-note">
              <span className="check-icon">✓</span>
              <span>Your verified candidate credentials (12th Pass / ITI, District: Pune) will be linked automatically.</span>
            </div>

            <div className="modal-action-row">
              <button onClick={handleRegisterConfirm} className="btn-primary flex-1">
                Confirm Registration Ticket
              </button>
              <button onClick={() => setSelectedComp(null)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
