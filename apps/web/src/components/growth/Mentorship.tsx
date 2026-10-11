import React, { useState } from 'react';
import { GROWTH_MENTORS, Mentor } from '../../data/growthData';

interface MentorshipProps {
  onToast: (msg: string) => void;
}

export const Mentorship: React.FC<MentorshipProps> = ({ onToast }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDate, setSelectedDate] = useState<string>('Tomorrow, Oct 12');
  const [selectedSlot, setSelectedSlot] = useState<string>('2:00 PM');
  const [agenda, setAgenda] = useState<string>('');
  const [scheduledSessions, setScheduledSessions] = useState<Array<{ mentorName: string; date: string; slot: string; topic: string }>>([]);

  const topics = ['All', 'System Design', 'React & Node', 'Startup Strategy', 'Payment Pipelines', 'Product Sense', 'Design Systems'];

  const filteredMentors = selectedTopic === 'All'
    ? GROWTH_MENTORS
    : GROWTH_MENTORS.filter(m => m.topics.some(t => t.toLowerCase().includes(selectedTopic.toLowerCase())));

  const handleOpenBooking = (m: Mentor) => {
    setBookingMentor(m);
    setBookingStep(1);
    setSelectedSlot(m.availableSlots[0] || '10:00 AM');
    setAgenda('');
  };

  const handleConfirmBooking = () => {
    if (!bookingMentor) return;
    setScheduledSessions(prev => [
      { mentorName: bookingMentor.name, date: selectedDate, slot: selectedSlot, topic: agenda || 'Career & Portfolio Review' },
      ...prev
    ]);
    setBookingStep(4);
    onToast(`1-on-1 Session confirmed with ${bookingMentor.name}!`);
  };

  const next7Days = [
    'Today, Oct 11', 'Tomorrow, Oct 12', 'Mon, Oct 13', 'Tue, Oct 14',
    'Wed, Oct 15', 'Thu, Oct 16', 'Fri, Oct 17'
  ];

  return (
    <div className="mentorship-container">
      {/* ── Top Header Hero ── */}
      <div className="mentorship-hero">
        <div className="hero-text-side">
          <span className="hero-tag">Verified Industry Mentors</span>
          <h2>Connect 1-on-1 with Senior Engineers & Founders</h2>
          <p>Get your portfolio reviewed, practice mock system design, and accelerate your career with leaders from Razorpay, Zepto, CRED, and Career OS.</p>
        </div>

        {scheduledSessions.length > 0 && (
          <div className="scheduled-sessions-strip">
            <span className="strip-title">Upcoming Booked Sessions ({scheduledSessions.length}):</span>
            <div className="strip-items">
              {scheduledSessions.map((s, idx) => (
                <div key={idx} className="strip-badge">
                  <span>📅 {s.mentorName} · {s.date} @ {s.slot}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Filter Pills ── */}
      <div className="mentor-topic-filters">
        <span className="filter-label">Filter by Expertise:</span>
        <div className="filter-pills">
          {topics.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`topic-pill ${selectedTopic === t ? 'active' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mentors Grid ── */}
      <div className="mentors-grid">
        {filteredMentors.map(m => (
          <div key={m.id} className="mentor-card">
            <div className="mentor-card-top">
              <div className="mentor-avatar">
                <span>{m.initials}</span>
                <span className="mentor-online-dot" />
              </div>

              <div className="mentor-meta">
                <div className="mentor-name-row">
                  <h3 className="mentor-name">{m.name}</h3>
                  <span className="mentor-badge">{m.badge}</span>
                </div>
                <div className="mentor-role">{m.role} · <span className="company-highlight">{m.company}</span></div>
                <div className="mentor-stats-row">
                  <span className="stat-star">⭐ {m.rating}</span>
                  <span className="dot-sep">·</span>
                  <span>{m.sessions} Sessions</span>
                  <span className="dot-sep">·</span>
                  <span>{m.experience} Exp</span>
                </div>
              </div>
            </div>

            <p className="mentor-desc">{m.desc}</p>

            <div className="mentor-topics-wrap">
              {m.topics.map((top, i) => (
                <span key={i} className="skill-tag">{top}</span>
              ))}
            </div>

            <div className="mentor-card-footer">
              <div className="slots-info">
                <span>Next slot:</span> <b>{m.availableSlots[0]}</b>
              </div>
              <button
                onClick={() => handleOpenBooking(m)}
                className="btn-book-session"
              >
                Book 1:1 Session →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── 4-STEP BOOKING MODAL ── */}
      {bookingMentor && (
        <div className="modal-overlay" onClick={() => setBookingMentor(null)}>
          <div className="modal-box booking-modal" onClick={e => e.stopPropagation()}>
            <button onClick={() => setBookingMentor(null)} className="modal-close-btn">✕</button>

            {/* Modal Header */}
            <div className="booking-modal-header">
              <div className="mentor-brief-avatar">{bookingMentor.initials}</div>
              <div>
                <h3 className="modal-title">Book 1:1 Session with {bookingMentor.name}</h3>
                <p className="modal-subtitle">{bookingMentor.role} at {bookingMentor.company}</p>
              </div>
            </div>

            {/* Progress Stepper */}
            <div className="booking-stepper">
              {['1. Select Date', '2. Time Slot', '3. Agenda', '4. Confirmed'].map((stepName, i) => (
                <div
                  key={i}
                  className={`step-indicator ${bookingStep === i + 1 ? 'active' : bookingStep > i + 1 ? 'done' : ''}`}
                >
                  <span>{stepName}</span>
                </div>
              ))}
            </div>

            {/* STEP 1: DATE */}
            {bookingStep === 1 && (
              <div className="step-content">
                <h4 className="step-title">Choose Preferred Date (Next 7 Days):</h4>
                <div className="dates-pill-grid">
                  {next7Days.map((d, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(d)}
                      className={`date-pill ${selectedDate === d ? 'active' : ''}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <div className="step-actions">
                  <button onClick={() => setBookingStep(2)} className="btn-primary">
                    Continue to Time Slots →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: TIME SLOT */}
            {bookingStep === 2 && (
              <div className="step-content">
                <h4 className="step-title">Available Slots for {selectedDate}:</h4>
                <div className="slots-grid">
                  {bookingMentor.availableSlots.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(s)}
                      className={`slot-card ${selectedSlot === s ? 'active' : ''}`}
                    >
                      <span className="slot-time">{s}</span>
                      <span className="slot-dur">45 Min Google Meet</span>
                    </button>
                  ))}
                </div>
                <div className="step-actions dual">
                  <button onClick={() => setBookingStep(1)} className="btn-secondary">
                    ← Back
                  </button>
                  <button onClick={() => setBookingStep(3)} className="btn-primary">
                    Next: Discussion Topic →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: AGENDA */}
            {bookingStep === 3 && (
              <div className="step-content">
                <h4 className="step-title">What would you like to focus on during this 45-min call?</h4>
                <textarea
                  value={agenda}
                  onChange={e => setAgenda(e.target.value)}
                  placeholder="e.g. I want to get my React portfolio reviewed, understand how Razorpay handles backend scaling, and ask about the best path to transition into full-stack engineering."
                  className="agenda-textarea"
                />
                <div className="step-actions dual">
                  <button onClick={() => setBookingStep(2)} className="btn-secondary">
                    ← Back
                  </button>
                  <button onClick={handleConfirmBooking} className="btn-primary">
                    Confirm & Schedule Session ✓
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: CONFIRMATION */}
            {bookingStep === 4 && (
              <div className="step-content confirmation-view">
                <div className="success-icon-wrap">🎉</div>
                <h3 className="confirm-title">Session Successfully Confirmed!</h3>
                <p className="confirm-sub">
                  Your 1-on-1 mentorship session with <b>{bookingMentor.name}</b> has been locked into your RozgarLink schedule.
                </p>

                <div className="meeting-details-box">
                  <div className="detail-row">
                    <span>Date & Time:</span> <b>{selectedDate} @ {selectedSlot}</b>
                  </div>
                  <div className="detail-row">
                    <span>Meeting Link:</span>
                    <a href="https://meet.google.com" target="_blank" rel="noreferrer" className="meet-link">
                      meet.google.com/rzg-link-mentor ↗
                    </a>
                  </div>
                  <div className="detail-row">
                    <span>Format:</span> <b>45 Minutes 1:1 Video Call</b>
                  </div>
                </div>

                <button
                  onClick={() => setBookingMentor(null)}
                  className="btn-primary full-w"
                >
                  Done & Return to Mentors
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
