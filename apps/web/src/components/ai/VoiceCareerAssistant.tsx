import React, { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
 * ROZGARSATHI VOICE AI CAREER ASSISTANT & INTERACTIVE VOICE TOUR
 * ───────────────────────────────────────────────────────────────────────────── */

export type NavTab = 'home' | 'match' | 'growth' | 'learn' | 'profile' | 'admin';

interface TourStep {
  tab: NavTab;
  title: string;
  badge: string;
  speechText: string;
  highlightDescription: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    tab: 'home',
    title: 'Welcome to RozgarSathi',
    badge: 'Step 1 of 6 · Overview',
    speechText:
      'Namaste! Welcome to RozgarSathi, Bharat’s verified career and vocational intelligence platform. I am your AI Career Assistant. Let me take you on a quick voice-guided tour of your platform!',
    highlightDescription:
      'RozgarSathi bridges the gap between vocational talent, real industry demand, and verified government apprenticeships.'
  },
  {
    tab: 'home',
    title: 'Skill Demand & Alternative Pathways',
    badge: 'Step 2 of 6 · Market Intelligence',
    speechText:
      'Here on your Home dashboard, view real-time Maharashtra labor market intelligence with over 40% growth in Solar PV and Automation. Explore alternative career paths with higher target wages based on your transferable skills.',
    highlightDescription:
      'Real-time hiring trends analyzed across 5,000+ Maharashtra recruiter postings with critical skill deficit alerts.'
  },
  {
    tab: 'match',
    title: 'Match Deck & Fairness-Aware Ranking',
    badge: 'Step 3 of 6 · Opportunity Discovery',
    speechText:
      'On the Match tab, discover verified jobs and apprenticeships using our Tinder-inspired swipe deck. Every recommendation is 100% explainable with zero demographic bias. Test our What-If switch to simulate new qualifications instantly!',
    highlightDescription:
      'Swipe Right to express interest, Swipe Left to pass, Swipe Up to save. Audited 55% skill competency, 30% preferences, 15% verified practicum.'
  },
  {
    tab: 'growth',
    title: 'Growth Hub & Career Accelerators',
    badge: 'Step 4 of 6 · Skill Arena',
    speechText:
      'In the Growth Hub, sharpen your practical abilities in our browser Code Arena, practice realistic AI Mock Interviews for tech and operations roles, book senior mentorship, and participate in National Hackathons.',
    highlightDescription:
      'Interactive coding sandbox in Python, C++, and JavaScript, plus AI interview simulations and ₹25 Lakhs+ in hackathon prizes.'
  },
  {
    tab: 'learn',
    title: 'Learn Hub & Proof-of-Work Academy',
    badge: 'Step 5 of 6 · Certified Courses',
    speechText:
      'On the Learn tab, dive into our 9-category skills ecosystem, structured career roadmaps, and hands-on proof-of-work project tracks with verified government-backed diplomas.',
    highlightDescription:
      'Interactive video playlists, lesson completions, and instant DigiLocker-verifiable diploma generators.'
  },
  {
    tab: 'profile',
    title: 'Verified Skill Evidence Vault',
    badge: 'Step 6 of 6 · Cryptographic Trust',
    speechText:
      'Finally, your Profile tab features a cryptographic Evidence Vault backed by DigiLocker and the National Skill Development Corporation. All your certificates and supervisor practicum logs are verified with SHA-256 hashes.',
    highlightDescription:
      'No black-box rejection. 100% deterministic credential verification with direct proof upload.'
  }
];

export interface VoiceCareerAssistantProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  candidateName?: string;
  onWhatIfToggle?: () => void;
  whatIfActive?: boolean;
  onToast?: (msg: string) => void;
}

export const VoiceCareerAssistant: React.FC<VoiceCareerAssistantProps> = ({
  activeTab,
  setActiveTab,
  candidateName = 'Asha',
  onWhatIfToggle,
  whatIfActive = false,
  onToast
}) => {
  /* ── Drawer & Speech States ── */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [voiceNarrationEnabled, setVoiceNarrationEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcriptInput, setTranscriptInput] = useState('');

  /* ── Voice Platform Tour States ── */
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  /* ── Chat Messages ── */
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; tabContext?: string }>>([
    {
      sender: 'bot',
      text: `Namaste ${candidateName}! I am your ROZGARSATHI AI Career Assistant. I can speak and listen to you in real-time. Ask me about job matches, courses, salary trends, or say "start platform tour" anytime!`
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  /* ── Auto-scroll Chat ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Preload and Cache Available Speech Voices ── */
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const preloadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    preloadVoices();
    window.speechSynthesis.onvoiceschanged = preloadVoices;
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  /* ─────────────────────────────────────────────────────────────────────────────
   * FEMALE SOFT & TECHNICAL VOICE SELECTOR
   * ───────────────────────────────────────────────────────────────────────────── */
  const selectFemaleSoftTechnicalVoice = (allVoices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    if (!allVoices || allVoices.length === 0) return null;

    const FEMALE_IDENTIFIERS = [
      'heera', 'neerja', 'zira', 'jenny', 'aria', 'samantha', 'karen', 'victoria',
      'veena', 'priya', 'kalpana', 'swara', 'female', 'woman', 'susan', 'catherine',
      'hazel', 'stephanie', 'sonia', 'natasha', 'serena', 'ava', 'allison', 'alva'
    ];

    const MALE_IDENTIFIERS = [
      'male', 'david', 'ravi', 'hemant', 'george', 'mark', 'richard', 'guy',
      'james', 'brian', 'stefan', 'paul', 'daniel', 'oliver', 'alexander', 'cosimo'
    ];

    const isMale = (name: string) => {
      const lower = name.toLowerCase();
      return MALE_IDENTIFIERS.some(m => lower.includes(m));
    };

    const isFemale = (name: string) => {
      const lower = name.toLowerCase();
      return FEMALE_IDENTIFIERS.some(f => lower.includes(f));
    };

    // 1. First priority: Indian English Female (soft, authentic, technical regional resonance)
    const indianFemale = allVoices.find(
      v =>
        (v.lang === 'en-IN' || v.name.toLowerCase().includes('india') || v.lang.includes('hi')) &&
        isFemale(v.name) &&
        !isMale(v.name)
    );
    if (indianFemale) return indianFemale;

    // 2. Second priority: Natural / Neural Premium Female voices (Microsoft Natural, Google US/UK Female)
    const naturalFemale = allVoices.find(
      v =>
        (v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('online') ||
          v.name.toLowerCase().includes('google') ||
          v.name.toLowerCase().includes('microsoft')) &&
        isFemale(v.name) &&
        !isMale(v.name)
    );
    if (naturalFemale) return naturalFemale;

    // 3. Third priority: Standard English Female voices (e.g., Microsoft Zira, Samantha)
    const englishFemale = allVoices.find(
      v => v.lang.startsWith('en') && isFemale(v.name) && !isMale(v.name)
    );
    if (englishFemale) return englishFemale;

    // 4. Fourth priority: Any voice explicitly tagged female
    const anyFemale = allVoices.find(v => isFemale(v.name) && !isMale(v.name));
    if (anyFemale) return anyFemale;

    // 5. Fallback: Any non-male English voice
    const nonMale = allVoices.find(v => v.lang.startsWith('en') && !isMale(v.name));
    if (nonMale) return nonMale;

    return allVoices[0] || null;
  };

  /* ─────────────────────────────────────────────────────────────────────────────
   * TEXT-TO-SPEECH (TTS) ENGINE - FEMALE SOFT & TECHNICAL CALIBRATION
   * ───────────────────────────────────────────────────────────────────────────── */
  const speak = (text: string, onDone?: () => void) => {
    if (!voiceNarrationEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onDone?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      // Acoustic calibration for soft, technical, poised feminine delivery:
      utterance.rate = 0.96;  // Measured, composed, articulate technical cadence
      utterance.pitch = 1.15; // Soft, bright, gentle feminine pitch
      utterance.volume = 1.0;

      const allVoices = window.speechSynthesis.getVoices();
      const femaleVoice = selectFemaleSoftTechnicalVoice(allVoices);
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onDone?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onDone?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
      onDone?.();
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  /* ─────────────────────────────────────────────────────────────────────────────
   * SPEECH-TO-TEXT (STT) ENGINE
   * ───────────────────────────────────────────────────────────────────────────── */
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onToast?.('Speech recognition is not supported in this browser. Please use text input.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        stopSpeaking();
        onToast?.('🎙️ Listening... Speak your question now');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setTranscriptInput(transcript);
          handleUserMessage(transcript);
        }
      };

      recognition.onerror = (e: any) => {
        setIsListening(false);
        if (e.error !== 'no-speech') {
          onToast?.(`Voice recognition: ${e.error || 'Please try again'}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      onToast?.('Microphone could not be accessed.');
    }
  };

  /* ─────────────────────────────────────────────────────────────────────────────
   * VOICE PLATFORM TOUR CONTROLLER
   * ───────────────────────────────────────────────────────────────────────────── */
  const startTour = (stepIndex = 0) => {
    setShowWelcomeBanner(false);
    setIsTourActive(true);
    setTourStepIndex(stepIndex);
    const step = TOUR_STEPS[stepIndex];
    if (step) {
      setActiveTab(step.tab);
      speak(step.speechText, () => {
        // Can optionally wait for user or advance
      });
    }
  };

  const nextTourStep = () => {
    if (tourStepIndex < TOUR_STEPS.length - 1) {
      const nextIdx = tourStepIndex + 1;
      setTourStepIndex(nextIdx);
      const step = TOUR_STEPS[nextIdx];
      setActiveTab(step.tab);
      speak(step.speechText);
    } else {
      endTour();
    }
  };

  const prevTourStep = () => {
    if (tourStepIndex > 0) {
      const prevIdx = tourStepIndex - 1;
      setTourStepIndex(prevIdx);
      const step = TOUR_STEPS[prevIdx];
      setActiveTab(step.tab);
      speak(step.speechText);
    }
  };

  const endTour = () => {
    setIsTourActive(false);
    stopSpeaking();
    setDrawerOpen(true);
    const completionMsg =
      "Voice tour complete! You can now speak to me using the microphone button or ask about any role, skills gap, or certification!";
    setMessages(prev => [
      ...prev,
      {
        sender: 'bot',
        text: `🎉 ${completionMsg}`
      }
    ]);
    speak(completionMsg);
  };

  /* ─────────────────────────────────────────────────────────────────────────────
   * INTELLIGENT VOICE & TEXT INTENT PROCESSOR
   * ───────────────────────────────────────────────────────────────────────────── */
  const handleUserMessage = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    // Add user message to log
    setMessages(prev => [...prev, { sender: 'user', text, tabContext: activeTab }]);
    setTranscriptInput('');

    const lower = text.toLowerCase();

    setTimeout(() => {
      let reply = '';
      let targetTabChange: NavTab | null = null;

      // Command: Tour
      if (lower.includes('tour') || lower.includes('walkthrough') || lower.includes('guide')) {
        reply = 'Starting the voice-guided tour of RozgarSathi now!';
        setDrawerOpen(false);
        startTour(0);
        return;
      }

      // Command: Match Tab Navigation
      if (lower.includes('match') || lower.includes('job') || lower.includes('deck') || lower.includes('swipe')) {
        targetTabChange = 'match';
        reply =
          'Navigating to your Match Deck! Here you have 3 eligible verified roles in Pune and Thane. Swiping right records your interest with the recruiter with zero demographic bias.';
      }
      // Command: Growth Hub Navigation
      else if (lower.includes('growth') || lower.includes('code') || lower.includes('arena') || lower.includes('interview') || lower.includes('hackathon')) {
        targetTabChange = 'growth';
        reply =
          'Switching to Growth Hub! Practice coding in Code Arena, schedule an AI Mock Interview round, or participate in the open Smart India Hackathon!';
      }
      // Command: Learn Tab Navigation
      else if (lower.includes('course') || lower.includes('learn') || lower.includes('study') || lower.includes('academy')) {
        targetTabChange = 'learn';
        reply =
          'Opening the Learn Hub! I recommend the 12-hour Industrial Safety module or Rooftop Solar PV track to close your skill gap and qualify for higher pay.';
      }
      // Command: Resume Upload & Skill Extraction
      else if (lower.includes('resume') || lower.includes('upload') || lower.includes('cv') || lower.includes('extract skill')) {
        targetTabChange = 'profile';
        reply =
          'Navigating to your Profile! You can upload your PDF or TXT resume using our AI Resume Intelligence tool. It will automatically extract your technical skills and display matching opportunities instantly!';
        setTimeout(() => {
          const el = document.getElementById('resume-intelligence-card');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 600);
      }
      // Command: Profile Tab Navigation
      else if (lower.includes('profile') || lower.includes('vault') || lower.includes('certificate') || lower.includes('digilocker')) {
        targetTabChange = 'profile';
        reply =
          'Opening your Verified Candidate Profile! Your DigiLocker credentials and MSBVEE electrical practicum are cryptographically registered in your Evidence Vault.';
      }
      // Query: What-If simulation
      else if (lower.includes('what if') || lower.includes('iti') || lower.includes('simulate') || lower.includes('rerank')) {
        reply =
          'Toggling What-If simulation! Simulating an ITI Electrician degree adds MSEDCL Apprentice to your eligible deck and re-ranks your matches dynamically.';
        if (onWhatIfToggle) onWhatIfToggle();
      }
      // Query: Salary / Pay
      else if (lower.includes('salary') || lower.includes('pay') || lower.includes('wage')) {
        reply =
          'Your expected minimum pay is ₹18,000/month. Verified roles at Flipkart Logistics (₹17k–21k) and NMC (₹16k–22k) meet this range, while MSEDCL offers up to ₹24,000/month for apprentices!';
      }
      // Query: Flipkart match reason
      else if (lower.includes('flipkart')) {
        reply =
          'You match Flipkart Logistics at 84% because your verified profile includes inventory handling, packing, and 12th pass qualifications within the Thane district commute radius!';
      }
      // Fallback
      else {
        reply = `I heard: "${text}". Based on your verified vocational profile in ${activeTab.toUpperCase()} tab, your credentials are in strong standing across Maharashtra industrial hubs. How else can I guide your career roadmap?`;
      }

      if (targetTabChange) {
        setActiveTab(targetTabChange);
      }

      setMessages(prev => [...prev, { sender: 'bot', text: reply, tabContext: targetTabChange || activeTab }]);
      speak(reply);
    }, 450);
  };

  /* ─────────────────────────────────────────────────────────────────────────────
   * CONTEXTUAL TAB SUGGESTIONS
   * ───────────────────────────────────────────────────────────────────────────── */
  const TAB_PROMPTS: Record<NavTab, string[]> = {
    home: ['Trending skills in Maharashtra', 'Explore alternative career paths', 'Start Voice Guided Tour'],
    match: ['Why am I matched with Flipkart?', 'Simulate ITI qualification (What-If)', 'Explain Fairness Bias Audit'],
    growth: ['Launch Zepto mock interview', 'What coding challenge is open?', 'View SIH 2026 hackathons'],
    learn: ['Recommend highest-pay course', 'Explore Solar PV Engineering track', 'Show free NSDC modules'],
    profile: ['Upload resume & auto-match jobs', 'How do I upload new evidence?', 'What is my National Skill Registry ID?'],
    admin: ['Platform verification statistics', 'Audit transparency logs', 'Candidate match throughput']
  };

  return (
    <>
      {/* ────────────────── 1. WELCOME VOICE TOUR INVITATION BANNER ────────────────── */}
      {showWelcomeBanner && !isTourActive && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[92%] bg-gradient-to-r from-[#0F1B3D] via-[#1E3A8A] to-[#345BFF] text-white p-4 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md animate-in slide-in-from-top duration-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0 animate-pulse">
              🎙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-900 px-2 py-0.5 rounded-full">
                  AI Voice Ready
                </span>
                <span className="text-xs font-bold text-blue-200">Interactive Walkthrough</span>
              </div>
              <h4 className="text-sm font-extrabold tracking-tight mt-0.5">
                Welcome to RozgarSathi! Take our Voice Tour?
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => startTour(0)}
              className="px-3.5 py-2 rounded-xl bg-white text-[#0F1B3D] hover:bg-blue-50 text-xs font-black transition-all flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
            >
              <span>▶</span> Start Voice Tour
            </button>
            <button
              onClick={() => setShowWelcomeBanner(false)}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 text-xs"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ────────────────── 2. LIVE VOICE TOUR HUD (HEADS-UP DISPLAY) ────────────────── */}
      {isTourActive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] bg-slate-900/95 backdrop-blur-xl border border-blue-500/40 rounded-3xl p-5 shadow-2xl text-white space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                {TOUR_STEPS[tourStepIndex].badge} · 🌸 Female (Soft & Technical)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  else speak(TOUR_STEPS[tourStepIndex].speechText);
                }}
                className="text-[11px] font-bold px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-200"
              >
                {isSpeaking ? '⏸ Pause Voice' : '🔊 Replay Voice'}
              </button>
              <button
                onClick={endTour}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10"
              >
                Exit Tour ✕
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>📍</span> {TOUR_STEPS[tourStepIndex].title}
            </h3>
            <p className="text-xs text-blue-100/90 leading-relaxed italic bg-white/5 p-3 rounded-xl border border-white/5">
              "{TOUR_STEPS[tourStepIndex].speechText}"
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              💡 {TOUR_STEPS[tourStepIndex].highlightDescription}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={prevTourStep}
              disabled={tourStepIndex === 0}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold transition-all"
            >
              ← Previous
            </button>

            {/* Progress dots */}
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === tourStepIndex ? 'w-6 bg-[#345BFF]' : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTourStep}
              className="px-4 py-1.5 rounded-xl bg-[#345BFF] hover:bg-[#2348E0] text-white text-xs font-extrabold transition-all shadow-md flex items-center gap-1"
            >
              {tourStepIndex === TOUR_STEPS.length - 1 ? 'Finish & Chat →' : 'Next Step →'}
            </button>
          </div>
        </div>
      )}

      {/* ────────────────── 3. FLOATING TRIGGER BUTTON ────────────────── */}
      <button
        onClick={() => {
          setDrawerOpen(prev => !prev);
          stopSpeaking();
        }}
        className={`fixed bottom-6 right-6 z-40 px-5 py-3 rounded-full bg-gradient-to-r from-[#1E3A8A] via-[#345BFF] to-[#6366F1] text-white font-black text-xs shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border border-white/20 backdrop-blur-sm group ${
          isSpeaking ? 'ring-4 ring-emerald-400/50' : ''
        }`}
        aria-label="Open AI Career Assistant"
      >
        <span className="text-base group-hover:rotate-12 transition-transform">
          {isSpeaking ? '🔊' : isListening ? '🎙️' : '✨'}
        </span>
        <span className="tracking-tight">
          {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'AI Career Assistant'}
        </span>
        <span className="px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-200 text-[10px] font-mono border border-pink-400/30">
          FEMALE VOICE
        </span>
      </button>

      {/* ────────────────── 4. COMPLETE VOICE AI CHAT DRAWER ────────────────── */}
      {drawerOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[95vw] sm:w-[410px] max-h-[82vh] h-[580px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#0F1B3D] to-[#1E3A8A] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg">
                ✨
              </div>
              <div>
                <h3 className="text-sm font-extrabold flex items-center gap-1.5">
                  ROZGARSATHI Voice AI
                  <span className="text-[9px] bg-pink-500/30 text-pink-200 border border-pink-400/30 px-1.5 py-0.2 rounded-full font-mono">
                    FEMALE · TECHNICAL
                  </span>
                </h3>
                <span className="text-[10px] text-blue-200 flex items-center gap-1 mt-0.5">
                  <span className="text-pink-300 font-semibold">🌸 Soft & Technical</span>
                  <span>·</span>
                  <b className="capitalize text-white">{activeTab} Tab</b>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Test voice preview */}
              <button
                onClick={() => speak("Hello! I am your RozgarSathi Career Assistant. My voice is calibrated to a soft, technical tone. How can I guide your vocational growth today?")}
                className="px-2 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-400/30 text-[10px] font-bold flex items-center gap-1 transition-colors"
                title="Preview soft technical female voice"
              >
                <span>🌸</span> Test
              </button>

              {/* Tour trigger */}
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  startTour(0);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold"
                title="Restart Platform Tour"
              >
                🎙️ Tour
              </button>

              {/* TTS mute toggle */}
              <button
                onClick={() => {
                  setVoiceNarrationEnabled(prev => !prev);
                  if (voiceNarrationEnabled) stopSpeaking();
                }}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  voiceNarrationEnabled ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-300'
                }`}
                title={voiceNarrationEnabled ? 'Voice Narration ON' : 'Voice Narration MUTED'}
              >
                {voiceNarrationEnabled ? '🔊' : '🔇'}
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  stopSpeaking();
                }}
                className="w-7 h-7 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Active Listening Indicator */}
          {isListening && (
            <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                Listening to your voice... Speak now
              </div>
              <button
                onClick={toggleListening}
                className="text-[11px] font-extrabold text-red-800 hover:underline"
              >
                Stop ⏹
              </button>
            </div>
          )}

          {/* Active Speaking Indicator */}
          {isSpeaking && (
            <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-700">
                <span>🔊</span> Speaking response aloud...
              </div>
              <button
                onClick={stopSpeaking}
                className="text-[10px] font-extrabold text-indigo-800 hover:underline"
              >
                Mute Voice
              </button>
            </div>
          )}

          {/* Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#345BFF] text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.sender === 'bot' && (
                    <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>ROZGARSATHI AI</span>
                      <button
                        onClick={() => speak(m.text)}
                        className="text-[#345BFF] hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>🔊</span> Replay
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Contextual Tab Quick Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Suggested for {activeTab.toUpperCase()} tab:
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {TAB_PROMPTS[activeTab]?.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleUserMessage(prompt)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#345BFF] text-slate-600 text-[11px] font-medium whitespace-nowrap border border-slate-200 transition-colors"
                >
                  ⚡ {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Wrap with Voice Microphone Button */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleUserMessage(transcriptInput);
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            {/* Microphone button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-base transition-all shrink-0 ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-lg ring-4 ring-red-200'
                  : 'bg-indigo-50 text-[#345BFF] hover:bg-indigo-100 border border-indigo-200'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input (Speech to Text)'}
            >
              {isListening ? '⏹' : '🎙️'}
            </button>

            <input
              type="text"
              value={transcriptInput}
              onChange={e => setTranscriptInput(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Type or speak your question...'}
              className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#345BFF] focus:bg-white text-slate-800"
            />

            <button
              type="submit"
              disabled={!transcriptInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#345BFF] hover:bg-[#2348E0] disabled:opacity-40 text-white text-xs font-bold transition-all shrink-0 shadow-sm"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};
