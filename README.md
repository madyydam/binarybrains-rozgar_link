# 🇮🇳 RozgarSathi (रोज़गारसाथी)
### Transparent, Deterministic Skills-to-Opportunity Engine & Career OS
> *A Production-Ready Skilling Platform Built for India's 400M+ Workforce & National Skilling Ecosystem*

[![Purity Check](https://img.shields.io/badge/Eligibility%20Engine-100%25%20Pure%20Deterministic-success?style=for-the-badge&logo=shield)](tooling/check-imports.ts)
[![Tests](https://img.shields.io/badge/Test%20Suite-51%2F51%20Passed-brightgreen?style=for-the-badge&logo=vitest)](tests/)
[![Architecture](https://img.shields.io/badge/Monorepo-pnpm%20Workspaces-orange?style=for-the-badge&logo=pnpm)](package.json)
[![Stack](https://img.shields.io/badge/Stack-TypeScript%20%7C%20React%2018%20%7C%20Next.js%20%7C%20Express%20%7C%20Tailwind-blue?style=for-the-badge&logo=typescript)](apps/web)
[![Multilingual](https://img.shields.io/badge/Languages-EN%20%7C%20HI%20%7C%20MR-purple?style=for-the-badge)](packages/explainer)

---

## 📌 Executive Summary

India produces over **2.5 million** vocational graduates (ITI, Polytechnic, PMKVY, 10th/12th vocational) every year, yet **over 85% fail to match with verified opportunities**. Why?
1. **Opaque "Black-Box" AI**: Generative AI platforms hallucinate qualifications and silently disqualify deserving candidates without lawful justification.
2. **Vocabulary Disconnect**: Candidates describe skills in colloquial or regional terms (*"wireman, panel wiring, meter reading"*), while recruiters post formal technical taxonomies (*"industrial_automation, switchgear"*).
3. **Dead-End Rejections**: Traditional portals inform candidates that they are "Not Selected" with zero actionable recourse on how to qualify.

**RozgarSathi (रोज़गारसाथी)** solves this fundamental national crisis by pairing a **100% pure, deterministic rule-based eligibility engine** with **semantic AI strictly restricted to skill vocabulary discovery**, backed by a full-fledged **Career OS** for proof-of-work acceleration.

---

## 🏛️ Core Architectural Principles

```
                  ┌─────────────────────────────────────────┐
                  │       Candidate Verified Profile        │
                  │ (Qualifications, Residency, DOB, Skills)│
                  └────────────────────┬────────────────────┘
                                       │
                ┌──────────────────────▼──────────────────────┐
                │        @rozgarlink/skill-core (AI)          │
                │  Semantic Normalisation & Vernacular Alias  │
                │     ("tally, billing" ➔ "accounting")       │
                └──────────────────────┬──────────────────────┘
                                       │
           ┌───────────────────────────┴───────────────────────────┐
           │                                                       │
 ❌ HARD RULE FAIL                                       ✅ ALL RULES PASS
┌──────────▼──────────────────────────┐               ┌────────────▼────────────────────────┐
│  @rozgarlink/eligibility-engine     │               │     @rozgarlink/ranking-engine      │
│  PURE DETERMINISTIC EVALUATOR       │               │      MULTI-FACTOR FIT SCORING       │
│  • Age Bounds (DOB)                 │               │  Score = 55% Skill Match            │
│  • District/State Residency         │               │        + 30% Candidate Preferences  │
│  • Min Educational Qualification    │               │        + 15% Verified Proficiency   │
│  • Mandatory Licenses & Medical     │               └────────────┬────────────────────────┘
└──────────┬──────────────────────────┘                            │
           │                                                       │
┌──────────▼──────────────────────────┐               ┌────────────▼────────────────────────┐
│      @rozgarlink/pathway            │               │      @rozgarlink/explainer          │
│   GREEDY SET-COVER DAG RESOLVER     │               │   MULTILINGUAL TEMPLATE EXPLAINER   │
│ Generates minimal course sequencing │               │ English · हिंदी · मराठी (100% Parity│
│ to bridge missing requirements      │               │ Clear reasons: "Why am I eligible?" │
└──────────┬──────────────────────────┘               └────────────┬────────────────────────┘
           │                                                       │
           └───────────────────────────┬───────────────────────────┘
                                       │
                      ┌────────────────▼────────────────┐
                      │    Real-Time SSE Sync Stream    │
                      │  Diff updates (< 1s) with Undo  │
                      └────────────────┬────────────────┘
                                       │
                      ┌────────────────▼────────────────┐
                      │  RozgarSathi Web & Career OS    │
                      │   Discovery, Arena, Mock, Learn │
                      └─────────────────────────────────┘
```

### 1. Zero-AI Deterministic Eligibility Guarantee
- Hard eligibility constraints (minimum education level, age boundaries, geographical residency, mandatory licenses) are verified exclusively by a **pure TypeScript function**.
- **Purity Enforcement**: An AST static analyzer ([`tooling/check-imports.ts`](file:///c:/Users/madhu/Documents/Code%20Files/DY%20pattil%20hack/tooling/check-imports.ts)) runs on every CI build, ensuring `eligibility-engine` imports **zero AI packages, zero databases, zero network APIs**.
- **Rule of Law**: An ineligible candidate is **NEVER scored, NEVER ranked, and NEVER presented as a false positive**.

### 2. Semantic AI Confined to Discovery
- Large Language Models & vector embeddings are strictly bounded to skill discovery, bio extraction, and vernacular normalisation.
- AI has **zero voting power** over who is legally eligible.

### 3. Plain-Language Multilingual Transparency
- Every candidate receives human-readable explanations answering:
  - *"Why am I eligible?"* (Points breakdown, commute fit, verified criteria).
  - *"Why am I not eligible?"* (Specific failed rules, exact profile values vs requirement).
- Native template parity in **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.

### 4. Sub-Second Real-Time Updates with Instant Undo
- When candidate profile facts change (e.g., adding an ITI certification or updating preferred district), the engine streams instant diffs in **under 1,000ms** via Server-Sent Events (SSE).
- Includes an active **Change Banner** with single-click **Snapshot Undo**.

---

## ⚡ Unified Feature Ecosystem

### 🎯 1. Opportunity Discovery & Match
- **Tinder-Style Opportunity Deck**: Intuitive card swiping (Express Interest / Skip / Save for Later).
- **Match Breakdown Tabs**:
  - `Eligible` (Matched verified criteria, multi-factor fit score, employer badges).
  - `Saved` (Bookmarked opportunities).
  - `Applied` (Formal transmission to recruiter).
  - `Information Pending` (Actionable alerts specifying missing profile documentation).
  - `Not Eligible` (Clear rule failure reasons + resolved pathway course).

### 🚀 2. Career OS Growth Hub
Unified acceleration suite bringing real-world competitive readiness:
- **💻 Code Arena & 100 Days of Code**:
  - In-browser multi-language IDE (**JavaScript**, **Python 3**, **C++**, **Java**).
  - Problem set filtered by topics (*Arrays, Two Pointers, Strings, Linked Lists, Searching, DP*).
  - Local sandbox runner, test-case verifier, and remote judge submission simulator with runtime/memory percentiles.
  - 100-Day Streak grid with daily milestones and profile XP increments.
- **🤖 AI Mock Interview Coach**:
  - 12 comprehensive interview domains (*Technical DSA, HR, Behavioral, System Design, DevOps, AI/ML, UI/UX, etc.*).
  - 12 top hiring companies (*Google, Microsoft, Razorpay, TCS, Swiggy, Zomato, Deloitte, etc.*).
  - Real-time simulation with live timer, camera/mic status, speech pace monitor, question advancement, and answer analysis.
  - Comprehensive performance scorecard with category readiness radar, strengths, and targeted improvement plans.
- **🤝 1-on-1 Industry Mentorship**:
  - Vetted mentor directory with company credentials, ratings, session topics, and free intro slots.
  - Complete 4-step calendar booking (*Topic ➔ Date ➔ Slot ➔ Agenda Note ➔ Confirmation with Google Calendar invite*).
- **🏆 National Hackathons & Competitions**:
  - Flagship competitions (*Smart India Hackathon, Flipkart GRiD 6.0, Amazon ML, Regional AI Sprints*).
  - Live countdown timers, eligibility criteria, prize pool breakdowns (**₹25L+ pool**), and team registration modals.

### 📚 3. Video Skills Academy (Learn Tab)
Directly integrated structured learning ecosystem:
- **9 High-Fidelity Categories**: *Web Development, App Development, AI & Machine Learning, UI/UX Design, Data & Analytics, Cybersecurity, Digital Marketing, Startup & Business, Freelancing*.
- **Subcategory Deep-Dives**: Subcategory pill filters and video course catalogs.
- **Interactive Course Player**: Embedded YouTube player, curriculum lessons playlist, and lesson tracking.
- **100% Verified Certificate Generation**: Issues tamper-proof, verified diplomas with credential IDs, verification board seals, and PDF download.
- **Role-Based Career Tracks**: Step-by-step syllabus (*AI Engineer, Full-Stack Developer, UI/UX Designer, Growth Marketer*) mapping courses directly to active job openings.
- **Proof-of-Work Projects**: Real-world deliverables (*AI Customer Chatbot, Task Manager, SEO Audit*) unlocking verified recruiter internships.

---

## 📐 Mathematical Formulation

### 1. Multi-Factor Ranking Engine
Eligible opportunities are ordered by a composite scoring function:

$$\text{Score} = 0.55 \cdot S_{\text{skill}} + 0.30 \cdot S_{\text{pref}} + 0.15 \cdot S_{\text{prof}}$$

Where:
- $S_{\text{skill}}$: Jaccard similarity of normalized candidate skills vs required opportunity skills:
  $$S_{\text{skill}} = \frac{|\text{Skills}_{\text{candidate}} \cap \text{Skills}_{\text{required}}|}{|\text{Skills}_{\text{required}}|}$$
- $S_{\text{pref}}$: Weighted normalized satisfaction across commute distance, minimum wage target, shift preference, and work type:
  $$S_{\text{pref}} = w_{\text{commute}} P_{\text{commute}} + w_{\text{pay}} P_{\text{pay}} + w_{\text{shift}} P_{\text{shift}} + w_{\text{type}} P_{\text{type}}$$
- $S_{\text{prof}}$: Average proficiency confidence across confirmed skills ($1.0$ for verified practicum, $0.7$ for manual self-claim).

### 2. Topological Prerequisite Set-Cover
When a candidate is ineligible due to missing required skills, the pathway engine formulates a **Directed Acyclic Graph (DAG)** of courses:

$$\min \sum_{c \in \mathcal{C}} \text{Hours}(c) \quad \text{subject to} \quad \bigcup_{c \in \mathcal{C}} \text{Skills}(c) \supseteq \text{Skills}_{\text{missing}}$$

Courses with prerequisites are topologically sorted so candidates never take advanced modules before completing foundational prerequisites.

---

## 🧪 Test Suite & Quality Verification

RozgarSathi includes a **51-test suite** validating acceptance criteria and edge cases:

```bash
# Run complete test suite (acceptance tests + end-to-end scenarios)
npm run test
```

### Verified Test Summary
| Test Suite | Tests | Result | Focus Area |
| :--- | :---: | :---: | :--- |
| `packages/eligibility-engine` | 16 | ✅ Passed | Strict deterministic rule boundaries (Age, District, Education, Licenses) |
| `packages/ranking-engine` | 3 | ✅ Passed | Multi-component weighted scoring & tie-breaking |
| `packages/explainer` | 3 | ✅ Passed | Multilingual template parity across EN, HI, MR |
| `packages/pathway` | 3 | ✅ Passed | Greedy course set-cover & DAG topological sorting |
| `packages/skill-core` | 4 | ✅ Passed | Vernacular alias normalization & offline mock fallbacks |
| `tests/acceptance-tests.test.ts` | 8 | ✅ Passed | PRD Acceptance Criteria AT-01 through AT-09 |
| `tests/demo-scenarios.test.ts` | 8 | ✅ Passed | Real-world candidate profiles (Asha, Ramesh, Sunita, etc.) |
| `apps/api/test` | 6 | ✅ Passed | SSE real-time streaming, REST endpoints, and schema validation |
| **Total** | **51** | **✅ 100%** | **Duration: 1.81 seconds** |

### Static AST Purity Check
```bash
npm run check:imports
```
```
Running eligibility-engine import purity check...
✅ PASS: packages/eligibility-engine is completely pure. Zero forbidden imports found.
```

---

## 💻 Tech Stack & Monorepo Organization

```
├── apps/
│   ├── api/                 # Express backend (Port 4000, SSE streaming, In-memory DB + Postgres schema)
│   └── web/                 # RozgarSathi Frontend (Port 3000, React 18, Vite, Tailwind CSS)
├── packages/
│   ├── eligibility-engine/  # Pure deterministic evaluator (Zero AI/DB/Network dependencies)
│   ├── ranking-engine/      # Scored fit ranker (55% skills, 30% preferences, 15% proficiency)
│   ├── explainer/           # Multilingual plain-language template engine (en, hi, mr)
│   ├── pathway/             # Topological DAG prerequisite course sequencing
│   ├── skill-core/          # 40 canonical skills, 200+ vernacular aliases, offline AI provider
│   ├── shared-types/        # Canonical Zod schemas & TypeScript contracts
│   └── ui/                  # Design system components (ScoreRing, StatusBadge, Avatar, etc.)
├── tests/
│   ├── acceptance-tests.test.ts # PRD acceptance tests AT-01 to AT-09
│   └── demo-scenarios.test.ts   # PRD live scenarios A to I
└── tooling/
    └── check-imports.ts     # AST static analysis enforcing engine purity
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (Node 20+ recommended)
- **pnpm**: v9.0.0 or higher (`npm install -g pnpm`)

### 1. Installation
```bash
# Clone repository
git clone https://github.com/madyydam/binarybrains-rozgar_link.git
cd binarybrains-rozgar_link

# Install all monorepo dependencies
pnpm install
```

### 2. Run Locally
```bash
# Concurrently runs API backend (port 4000) and Web client (port 3000)
npm run dev
```

- **Frontend Client**: [http://localhost:3000](http://localhost:3000)
- **API Backend**: [http://localhost:4000](http://localhost:4000)
- **API Health Check**: [http://localhost:4000/health](http://localhost:4000/health)

### 3. Build for Production
```bash
npm run build
```

---

## 👥 Hackathon Team & Acknowledgements

Built with passion for **DY Patil Hackathon 2026** by **Team BinaryBrains**:
- **Product Name**: RozgarSathi (रोज़गारसाथी)
- **Target Beneficiaries**: Candidates from ITIs, Polytechnics, PMKVY centers, and vocational schools across Maharashtra and India.
- **Ecosystem Partners**: MSInS (Maharashtra State Innovation Society), NSDC (National Skill Development Corporation), and MSBTE.

*RozgarSathi — Deterministic Truth in Skilling. Zero Hallucinations. 100% Opportunity.*