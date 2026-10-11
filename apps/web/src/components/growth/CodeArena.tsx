import React, { useState } from 'react';
import { GROWTH_PROBLEMS, DSAProblem } from '../../data/growthData';

interface CodeArenaProps {
  onToast: (msg: string) => void;
}

export const CodeArena: React.FC<CodeArenaProps> = ({ onToast }) => {
  const [selectedProblem, setSelectedProblem] = useState<DSAProblem>(GROWTH_PROBLEMS[0]);
  const [language, setLanguage] = useState<'javascript' | 'python' | 'cpp' | 'java'>('javascript');
  const [code, setCode] = useState(selectedProblem.starterCode.javascript);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<{ status: 'idle' | 'success' | 'running'; message: string }>({
    status: 'idle',
    message: ''
  });
  const [leftTab, setLeftTab] = useState<'desc' | 'cases' | 'hints' | 'submissions'>('desc');
  const [solvedIds, setSolvedIds] = useState<string[]>(['1', '4']);
  const [submissions, setSubmissions] = useState<Array<{ lang: string; time: string; status: string; runtime: string }>>([
    { lang: 'JavaScript', time: 'Yesterday', status: 'Accepted', runtime: '54ms' }
  ]);
  const [currentDayTaskSolved, setCurrentDayTaskSolved] = useState(false);

  // Switch problem
  const handleSelectProblem = (prob: DSAProblem) => {
    setSelectedProblem(prob);
    setCode(prob.starterCode[language]);
    setConsoleOpen(false);
    setOutput({ status: 'idle', message: '' });
  };

  // Switch language
  const handleLanguageChange = (lang: 'javascript' | 'python' | 'cpp' | 'java') => {
    setLanguage(lang);
    setCode(selectedProblem.starterCode[lang]);
  };

  // Run test cases
  const handleRunCode = () => {
    setConsoleOpen(true);
    setRunning(true);
    setOutput({ status: 'running', message: 'Compiling code & running test cases against local sandbox...' });

    setTimeout(() => {
      setRunning(false);
      setOutput({
        status: 'success',
        message: `Case 1: Passed (0.8ms)\nCase 2: Passed (1.2ms)\nCase 3: Passed (0.9ms)\n\nAll ${selectedProblem.sampleCases.length} sample test cases executed successfully! Output matches expected constraints.`
      });
      onToast(`Test cases passed for ${selectedProblem.title}!`);
    }, 1100);
  };

  // Submit to remote judge
  const handleSubmitCode = () => {
    setConsoleOpen(true);
    setRunning(true);
    setOutput({ status: 'running', message: 'Transmitting solution to RozgarLink Judge Engine (45 hidden test cases)...' });

    setTimeout(() => {
      setRunning(false);
      if (!solvedIds.includes(selectedProblem.id)) {
        setSolvedIds(prev => [...prev, selectedProblem.id]);
      }
      setSubmissions(prev => [
        { lang: language.toUpperCase(), time: 'Just now', status: 'Accepted 🎉', runtime: '48ms' },
        ...prev
      ]);
      setOutput({
        status: 'success',
        message: `VERDICT: ACCEPTED 🎉\nRuntime: 48 ms (Beats 92.4% of submissions)\nMemory: 41.2 MB (Beats 84.1% of submissions)\nHidden Cases: 45 / 45 Passed\n\n+50 XP credited to your RozgarLink Skill Readiness Index!`
      });
      onToast(`Accepted! +50 XP added to verified profile.`);
    }, 1500);
  };

  // Reset code
  const handleReset = () => {
    if (window.confirm('Reset code to starter template?')) {
      setCode(selectedProblem.starterCode[language]);
      setOutput({ status: 'idle', message: '' });
    }
  };

  return (
    <div className="arena-container">
      {/* ── Top Habit Strip: 100 Days of Code ── */}
      <div className="streak-card">
        <div className="streak-header">
          <div className="streak-badge-left">
            <span className="flame-icon">🔥</span>
            <div>
              <div className="streak-title-row">
                <h3 className="streak-title">100 Days of Code & DSA Sprint</h3>
                <span className="streak-count">Day 14 / 100 · 14-Day Streak</span>
              </div>
              <p className="streak-sub">Solve 1 challenge daily to boost your candidate Readiness Score.</p>
            </div>
          </div>
          <div className="streak-action">
            <button
              onClick={() => {
                if (!currentDayTaskSolved) {
                  setCurrentDayTaskSolved(true);
                  onToast('Daily Streak logged! 🔥 +25 XP credited.');
                }
              }}
              className={`streak-btn ${currentDayTaskSolved ? 'claimed' : ''}`}
            >
              {currentDayTaskSolved ? '✓ Day 14 Completed' : '🔥 Check-in Day 14 (+25 XP)'}
            </button>
          </div>
        </div>

        {/* 100-Day Mini Contribution Grid */}
        <div className="streak-grid-wrap">
          <div className="streak-grid">
            {Array.from({ length: 50 }).map((_, i) => {
              const isPast = i < 14;
              const isToday = i === 14;
              return (
                <div
                  key={i}
                  className={`streak-dot ${isPast || (isToday && currentDayTaskSolved) ? 'filled' : isToday ? 'today' : ''}`}
                  title={`Day ${i + 1}: ${isPast ? 'Completed ✓' : isToday ? 'Today' : 'Upcoming'}`}
                />
              );
            })}
          </div>
          <span className="streak-grid-label">Showing first 50 days</span>
        </div>
      </div>

      {/* ── Problem Quick Selector Tabs ── */}
      <div className="problem-picker-row">
        <span className="problem-picker-label">Select Problem:</span>
        <div className="problem-pills">
          {GROWTH_PROBLEMS.map(p => {
            const isSelected = selectedProblem.id === p.id;
            const isDone = solvedIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => handleSelectProblem(p)}
                className={`problem-pill ${isSelected ? 'active' : ''} ${isDone ? 'solved' : ''}`}
              >
                <span>{isDone ? '✓' : '#' + p.id}</span>
                <span className="problem-pill-title">{p.title}</span>
                <span className={`diff-tag ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Split-Screen IDE Workspace ── */}
      <div className="ide-split-workspace">
        {/* Left Side: Problem Statement & Hints */}
        <div className="ide-panel ide-left">
          <div className="ide-panel-tabs">
            <button
              onClick={() => setLeftTab('desc')}
              className={`ide-tab-btn ${leftTab === 'desc' ? 'active' : ''}`}
            >
              Problem
            </button>
            <button
              onClick={() => setLeftTab('cases')}
              className={`ide-tab-btn ${leftTab === 'cases' ? 'active' : ''}`}
            >
              Test Cases ({selectedProblem.sampleCases.length})
            </button>
            <button
              onClick={() => setLeftTab('hints')}
              className={`ide-tab-btn ${leftTab === 'hints' ? 'active' : ''}`}
            >
              Hints
            </button>
            <button
              onClick={() => setLeftTab('submissions')}
              className={`ide-tab-btn ${leftTab === 'submissions' ? 'active' : ''}`}
            >
              Submissions ({submissions.length})
            </button>
          </div>

          <div className="ide-left-content">
            {leftTab === 'desc' && (
              <div className="problem-desc-content">
                <div className="problem-title-header">
                  <h2>{selectedProblem.id}. {selectedProblem.title}</h2>
                  <div className="problem-meta-badges">
                    <span className={`diff-tag ${selectedProblem.difficulty.toLowerCase()}`}>
                      {selectedProblem.difficulty}
                    </span>
                    <span className="meta-badge-item">Acceptance: {selectedProblem.acceptance}</span>
                    <span className="meta-badge-item">{selectedProblem.category}</span>
                  </div>
                </div>

                <div className="problem-body">
                  <p>{selectedProblem.desc}</p>

                  <h4>Example Test Cases:</h4>
                  {selectedProblem.sampleCases.map((c, idx) => (
                    <div key={idx} className="example-box">
                      <div className="ex-line"><b>Input:</b> <code>{c.input}</code></div>
                      <div className="ex-line"><b>Expected:</b> <code>{c.expected}</code></div>
                    </div>
                  ))}

                  <h4>Constraints:</h4>
                  <ul className="constraints-list">
                    {selectedProblem.constraints.map((cn, i) => (
                      <li key={i}><code>{cn}</code></li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {leftTab === 'cases' && (
              <div className="cases-tab-content">
                <h3>Sample Test Inputs</h3>
                {selectedProblem.sampleCases.map((c, idx) => (
                  <div key={idx} className="case-item-card">
                    <div className="case-item-header">Case {idx + 1}</div>
                    <div className="case-item-row"><b>Input:</b> <code>{c.input}</code></div>
                    <div className="case-item-row"><b>Output:</b> <code>{c.expected}</code></div>
                  </div>
                ))}
              </div>
            )}

            {leftTab === 'hints' && (
              <div className="hints-tab-content">
                <div className="hint-card">
                  <div className="hint-num">Hint 1</div>
                  <p>Can you use a Hash Table to keep track of elements you have already seen in linear O(N) time?</p>
                </div>
                <div className="hint-card">
                  <div className="hint-num">Hint 2</div>
                  <p>Check if <code>target - nums[i]</code> already exists in your map before storing the current element index.</p>
                </div>
              </div>
            )}

            {leftTab === 'submissions' && (
              <div className="submissions-tab-content">
                <h3>Your Submissions History</h3>
                {submissions.length === 0 ? (
                  <p className="text-muted">No submissions yet for this problem.</p>
                ) : (
                  <div className="submissions-table">
                    {submissions.map((s, idx) => (
                      <div key={idx} className="sub-table-row">
                        <span className="sub-status-tag pass">{s.status}</span>
                        <span className="sub-lang">{s.lang}</span>
                        <span className="sub-runtime">{s.runtime}</span>
                        <span className="sub-time">{s.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Code Editor & Execution Console */}
        <div className="ide-panel ide-right">
          <div className="ide-editor-header">
            <div className="ide-lang-selector">
              {(['javascript', 'python', 'cpp', 'java'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => handleLanguageChange(l)}
                  className={`lang-btn ${language === l ? 'active' : ''}`}
                >
                  {l === 'javascript' ? 'JavaScript' : l === 'python' ? 'Python 3' : l === 'cpp' ? 'C++ 20' : 'Java 17'}
                </button>
              ))}
            </div>

            <div className="ide-editor-actions">
              <button onClick={handleReset} className="ide-action-btn secondary" title="Reset starter code">
                ↺ Reset
              </button>
              <button
                onClick={handleRunCode}
                disabled={running}
                className="ide-action-btn run"
              >
                ▶ Run Test Cases
              </button>
              <button
                onClick={handleSubmitCode}
                disabled={running}
                className="ide-action-btn submit"
              >
                ✓ Submit Solution
              </button>
            </div>
          </div>

          {/* Interactive Code Editor TextArea */}
          <div className="ide-code-area-wrap">
            <div className="code-line-numbers">
              {Array.from({ length: Math.max(16, code.split('\n').length) }).map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="ide-textarea"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
            />
          </div>

          {/* Execution Console Footer */}
          {consoleOpen && (
            <div className="ide-console-drawer">
              <div className="console-drawer-header">
                <span className="console-title">Execution Console / Verdict</span>
                <button onClick={() => setConsoleOpen(false)} className="console-close-btn">✕</button>
              </div>
              <div className="console-drawer-body">
                {running ? (
                  <div className="console-running">
                    <span className="spinner-dots" /> Compiling & executing tests...
                  </div>
                ) : (
                  <pre className="console-pre">{output.message}</pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
