# RozgarLink (रोज़गारलिंक)
### Transparent Skills-to-Opportunity Engine for India's Skilling Ecosystem
*A FutoraOne Product — Built for Maharashtra State Innovation Society & NSDC Ecosystem*

[![Purity Check](https://img.shields.io/badge/Eligibility%20Engine-100%25%20Pure-success)](tooling/check-imports.ts)
[![Tests](https://img.shields.io/badge/Tests-51%20Passed-brightgreen)](tests/)
[![Stack](https://img.shields.io/badge/Stack-TypeScript%20%7C%20React%20%7C%20Next.js%20%7C%20Express%20%7C%20Tailwind-blue)](package.json)

---

## 1. What is RozgarLink?

**RozgarLink** is an end-to-end, production-grade matching engine connecting vocational candidates (ITI, polytechnic, PMKVY, diploma holders) to jobs, apprenticeships, and government schemes across Maharashtra.

Unlike black-box AI platforms that hallucinate job matches, RozgarLink enforces **strict, deterministic eligibility** while using semantic AI strictly for vocabulary discovery and ranking:

1. **Eligibility is Pure & Deterministic**: Hard constraints (age, district residency, educational qualification level, mandatory licenses) are evaluated by a pure rule engine with **zero AI, zero network, zero database imports**. An ineligible candidate is **NEVER** scored and **NEVER** ranked under any circumstances.
2. **AI Never Decides Eligibility**: Semantic AI (embeddings + LLMs) only bridges vocabulary gaps (e.g., mapping *"tally prime, gst"* to canonical accounting skills). It has zero say in who qualifies.
3. **Plain-Language Explanations**: Every result clearly answers *"Why am I eligible?"* or *"Why not?"* in English, Hindi, and Marathi with 100% template parity.
4. **Realtime Recompute (< 1s)**: Updates to candidate profiles recompute matches in milliseconds, streaming diffs via Server-Sent Events (SSE) with an instant **Change Banner** and **Undo** snapshot restoration.
5. **Actionable Career Pathways**: When ineligible, candidates don't get a dead end — they receive a minimal course pathway resolving prerequisite skill gaps.
6. **100% Offline Capable**: Runs completely offline with `AI_ENABLED=false` using dictionary-first resolution and a deterministic mock provider.

---

## 2. Technology Stack

- **Monorepo**: `pnpm` workspaces, TypeScript 5.5+ (strict mode)
- **Frontend (`apps/web`)**: 
  - React 18, TSX, Next.js 14 App Router + Vite dev server
  - Tailwind CSS + custom design tokens matching **FutoraOne** brand standards
  - Google Fonts (Outfit & Inter), Glassmorphism, Micro-animations
  - Responsive Mobile Bottom Navigation + Desktop Navigation
- **Backend (`apps/api`)**: 
  - Node.js (LTS), Express 4, RESTful APIs, Server-Sent Events (SSE)
  - Zod runtime validation
  - In-memory relational store with seeded demo fixtures + PostgreSQL 16 / pgvector schema
- **Engine Packages (`packages/*`)**:
  - `@rozgarlink/eligibility-engine`: 100% pure deterministic rule evaluator
  - `@rozgarlink/ranking-engine`: 3-component weighted ranker (55% skills, 30% preferences, 15% proficiency)
  - `@rozgarlink/explainer`: Multilingual deterministic template explainer (`en`, `hi`, `mr`)
  - `@rozgarlink/pathway`: Greedy set-cover learning pathway & prerequisite DAG resolver
  - `@rozgarlink/skill-core`: 40 canonical skills, 200+ vernacular aliases, offline AI provider
  - `@rozgarlink/shared-types`: Canonical Zod schemas & TypeScript contracts
  - `@rozgarlink/ui`: FutoraOne components (`ScoreRing`, `StatusBadge`, `FailedRuleStrip`, `Avatar`, etc.)

---

## 3. Quick Start

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- `pnpm` v9+ (`npm install -g pnpm`)

### Installation & Run

```bash
# 1. Install dependencies
pnpm install

# 2. Run both API and Web concurrently
npm run dev
```

- **Web Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Backend**: [http://localhost:4000](http://localhost:4000)
- **Health Check**: [http://localhost:4000/health](http://localhost:4000/health)

---

## 4. Test Suite

Run unit, property-based, and end-to-end acceptance tests:

```bash
# Run all 51 Vitest test suites (acceptance AT-01 to AT-09 + Scenarios A to I)
npm run test

# Run CI Import check ensuring eligibility engine remains 100% pure
npm run check:imports
```

---

## 5. Repository Structure

```
├── apps/
│   ├── api/                 # Express backend (port 4000, SSE, REST, Seed fixtures)
│   └── web/                 # FutoraOne React/Vite/Next.js frontend (port 3000)
├── packages/
│   ├── eligibility-engine/  # PURE: 8 rule types, zero AI/DB/network dependencies
│   ├── ranking-engine/      # Scored fit ranker (only ranks eligible matches)
│   ├── explainer/           # Plain-language multilingual templates (en, hi, mr)
│   ├── pathway/             # Topological DAG course sequencing & skill gaps
│   ├── skill-core/          # Taxonomy, 200+ vernacular aliases, embeddings
│   ├── shared-types/        # Shared TypeScript interfaces & Zod schemas
│   └── ui/                  # FutoraOne design system components
├── tests/
│   ├── acceptance-tests.test.ts # PRD acceptance tests AT-01 to AT-09
│   └── demo-scenarios.test.ts   # PRD live scenarios A to I
└── tooling/
    └── check-imports.ts     # AST static analysis enforcing engine purity
```