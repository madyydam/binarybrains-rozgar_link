import React, { useState, useEffect } from 'react';
import { INTERVIEW_QUESTIONS, InterviewQuestion } from '../../data/growthData';

interface MockInterviewProps {
  onToast: (msg: string) => void;
}

export const MockInterview: React.FC<MockInterviewProps> = ({ onToast }) => {
  const [stage, setStage] = useState<'config' | 'live' | 'report'>('config');
  const [selectedRole, setSelectedRole] = useState<'tech' | 'hr' | 'system_design'>('tech');
  const [selectedCompany, setSelectedCompany] = useState('Razorpay');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  // Filter questions for the selected role
  const filteredQuestions = INTERVIEW_QUESTIONS.filter(q => q.category === selectedRole);
  const currentQ: InterviewQuestion = filteredQuestions[currentQIndex] || INTERVIEW_QUESTIONS[0];

  // Timer in live stage
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (stage === 'live') {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartInterview = () => {
    setStage('live');
    setCurrentQIndex(0);
    setTimerSeconds(0);
    setUserAnswers([]);
    setCandidateAnswer('');
    setShowTips(false);
    onToast(`AI Interview started for ${selectedCompany}!`);
  };

  const handleNextQuestion = () => {
    setUserAnswers(prev => [...prev, candidateAnswer]);
    setCandidateAnswer('');
    setShowTips(false);

    if (currentQIndex + 1 < filteredQuestions.length) {
      setCurrentQIndex(prev => prev + 1);
      onToast(`Proceeding to question ${currentQIndex + 2}...`);
    } else {
      setStage('report');
      onToast('Interview completed! Performance report generated.');
    }
  };

  return (
    <div className="interview-container">
      {/* ── STAGE 1: CONFIGURATION ── */}
      {stage === 'config' && (
        <div className="interview-config-card">
          <div className="config-hero">
            <div className="config-icon-badge">🤖</div>
            <h2>AI Mock Interview Coach & Simulator</h2>
            <p>Practice realistic technical and HR interview rounds with real-time feedback, scoring algorithms, and role-specific rubrics.</p>
          </div>

          <div className="config-grid">
            <div className="config-box">
              <label className="config-label">1. Choose Interview Track</label>
              <div className="track-options">
                {[
                  { id: 'tech' as const, title: 'Technical / Full-Stack', desc: 'DSA, React Reconciliation, System APIs' },
                  { id: 'system_design' as const, title: 'System Design & Architecture', desc: 'Microservices, Caching, Concurrency' },
                  { id: 'hr' as const, title: 'HR & Behavioral Round', desc: 'STAR Method, Team Collaboration, Conflict' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedRole(t.id)}
                    className={`track-card ${selectedRole === t.id ? 'active' : ''}`}
                  >
                    <div className="track-title">{t.title}</div>
                    <div className="track-desc">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="config-box">
              <label className="config-label">2. Target Company Interview Persona</label>
              <div className="company-pills">
                {['Razorpay', 'Zepto', 'CRED', 'Google', 'TCS Prime', 'High-Growth Startup'].map(comp => (
                  <button
                    key={comp}
                    onClick={() => setSelectedCompany(comp)}
                    className={`company-pill ${selectedCompany === comp ? 'active' : ''}`}
                  >
                    {comp}
                  </button>
                ))}
              </div>

              <div className="config-meta-info">
                <div className="meta-info-item">
                  <span>Duration:</span> <b>~10-15 Minutes</b>
                </div>
                <div className="meta-info-item">
                  <span>Questions:</span> <b>{filteredQuestions.length || 3} Dynamic Prompts</b>
                </div>
                <div className="meta-info-item">
                  <span>Scoring:</span> <b>Instant AI Diagnostic Report</b>
                </div>
              </div>

              <button onClick={handleStartInterview} className="btn-start-interview">
                Launch Live Interview Session ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 2: LIVE INTERVIEW ROOM ── */}
      {stage === 'live' && (
        <div className="interview-live-room">
          {/* Header Bar */}
          <div className="live-room-header">
            <div className="room-meta-left">
              <span className="live-indicator-dot" />
              <span className="room-role-tag">{selectedCompany} · {selectedRole.toUpperCase()}</span>
              <span className="room-progress-text">
                Question {currentQIndex + 1} of {filteredQuestions.length}
              </span>
            </div>

            <div className="room-timer-badge">
              <span>⏱ Elapsed:</span> <b>{formatTimer(timerSeconds)}</b>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Quit current interview session?')) setStage('config');
              }}
              className="room-exit-btn"
            >
              Exit
            </button>
          </div>

          {/* Interactive Tiles */}
          <div className="live-room-grid">
            {/* Left Tile: AI Interviewer Video/Avatar */}
            <div className="interviewer-tile">
              <div className="avatar-screen">
                <div className="ai-persona-avatar">
                  <span>AI</span>
                </div>
                <div className="ai-speaking-bars">
                  <span className="bar" />
                  <span className="bar" />
                  <span className="bar" />
                  <span className="bar" />
                </div>
                <span className="ai-persona-name">RozgarLink AI Evaluator ({selectedCompany} Lead)</span>
              </div>

              <div className="ai-question-bubble">
                <div className="bubble-tag">Current Interview Question:</div>
                <h3 className="bubble-q-text">"{currentQ.question}"</h3>

                {/* Progressive Answer Tips */}
                <div className="bubble-tips-toggle">
                  <button
                    onClick={() => setShowTips(!showTips)}
                    className="tips-toggle-btn"
                  >
                    {showTips ? '▲ Hide Scoring Rubric & Tips' : '💡 Peek Ideal Answer Key / Key Concepts'}
                  </button>
                  {showTips && (
                    <div className="tips-list">
                      <b>Key Concepts Evaluator Looks For:</b>
                      <ul>
                        {currentQ.idealAnswerTips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Tile: Candidate Response Scratchpad */}
            <div className="candidate-tile">
              <div className="candidate-toolbar">
                <div className="cam-mic-controls">
                  <button
                    onClick={() => setMicActive(!micActive)}
                    className={`device-btn ${micActive ? 'on' : 'off'}`}
                    title="Toggle Microphone"
                  >
                    {micActive ? '🎙 Mic Active' : '🔇 Mic Muted'}
                  </button>
                  <button
                    onClick={() => setCameraActive(!cameraActive)}
                    className={`device-btn ${cameraActive ? 'on' : 'off'}`}
                    title="Toggle Camera"
                  >
                    {cameraActive ? '📹 Cam Active' : '📷 Cam Off'}
                  </button>
                </div>
                <span className="scratchpad-tag">Candidate Notes & Response</span>
              </div>

              <textarea
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                placeholder="Type your structured technical answer, explanation, or pseudocode here (or speak aloud)...&#10;&#10;Pro-tip: Start with an executive summary, list the core tradeoffs, and explain how you handle edge cases."
                className="candidate-textarea"
              />

              <div className="candidate-footer-actions">
                <span className="char-count">{candidateAnswer.length} characters typed</span>
                <button
                  onClick={handleNextQuestion}
                  className="btn-submit-answer"
                >
                  {currentQIndex + 1 < filteredQuestions.length ? 'Submit & Next Question →' : 'Finish & Generate Scorecard ✓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 3: EVALUATION REPORT CARD ── */}
      {stage === 'report' && (
        <div className="interview-report-card">
          <div className="report-header">
            <div className="report-badge-top">AI Assessment Completed</div>
            <h2>Interview Performance Scorecard: {selectedCompany}</h2>
            <p>Session Duration: {formatTimer(timerSeconds)} · Questions Answered: {filteredQuestions.length}</p>
          </div>

          <div className="report-stats-grid">
            <div className="stat-card main-score">
              <span className="stat-num">88%</span>
              <span className="stat-label">Overall Readiness Index</span>
              <span className="stat-sub">Strong Hire Threshold (85%+) Achieved</span>
            </div>
            <div className="stat-card">
              <span className="stat-num">92%</span>
              <span className="stat-label">Technical Precision</span>
              <span className="stat-sub">Reconciliation & concurrency models well understood</span>
            </div>
            <div className="stat-card">
              <span className="stat-num">84%</span>
              <span className="stat-label">Structured Communication</span>
              <span className="stat-sub">Clear problem breakdown & tradeoff analysis</span>
            </div>
            <div className="stat-card">
              <span className="stat-num">88%</span>
              <span className="stat-label">Edge Case Handling</span>
              <span className="stat-sub">Good awareness of scale & latency bottlenecks</span>
            </div>
          </div>

          <div className="report-feedback-section">
            <h3>Detailed Diagnostic Feedback</h3>
            <div className="feedback-item positive">
              <span className="feedback-icon">✓</span>
              <div>
                <b>Strong Technical Terminology:</b>
                <p>You effectively referenced architectural patterns and core algorithmic complexities without hesitation.</p>
              </div>
            </div>
            <div className="feedback-item positive">
              <span className="feedback-icon">✓</span>
              <div>
                <b>Business Impact Awareness:</b>
                <p>You articulated how technical solutions map to user latency and revenue impact, which hiring leads look for.</p>
              </div>
            </div>
            <div className="feedback-item improvement">
              <span className="feedback-icon">▲</span>
              <div>
                <b>Growth Recommendation:</b>
                <p>Spend a little more time explicitly stating testing strategies and fault-tolerance fallbacks early in the answer.</p>
              </div>
            </div>
          </div>

          <div className="report-actions-row">
            <button onClick={() => setStage('config')} className="btn-primary">
              Take Another Mock Interview
            </button>
            <button
              onClick={() => {
                onToast('Scorecard saved to candidate proof-of-work profile!');
              }}
              className="btn-secondary"
            >
              Pin Scorecard to Profile (88%)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
