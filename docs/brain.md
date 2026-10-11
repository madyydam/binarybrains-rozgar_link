# BRAIN - RozgarLink (project memory for the AI agent)

Read this file FIRST, every session. It is the short, always-true summary of the project. Details live in `prd.md` (what) and `trd.md` (how). If this file and those documents disagree, `prd.md` wins on behaviour, `trd.md` wins on implementation.

---

## 1. Who and what

| Item | Value |
|---|---|
| Product | **RozgarLink** - Skills-to-Opportunity Matching Engine (problem G-01, Domain 7: Government Systems & GovTech) |
| Owner | Futora Group (Pune, India); shipped as a **FutoraOne** product |
| Users | Candidate/trainee, opportunity officer, catalogue manager, programme admin, evaluator (read-only) |
| One-line purpose | Show each candidate the opportunities they can formally take, ranked by fit, with plain-language reasons, skill gaps and learning paths, updating instantly when their profile changes |
| Status | Documents done (`prd.md`, `trd.md`). Code: build from scratch following `master_build_prompt.md` |

---

## 2. The 9 laws (never break these)

1. **Eligibility is separate from preference.** Eligibility = mandatory criteria stated by the opportunity (qualification, residence, age, certification, experience). Preference = commute, pay, shift, work type, sector; only affects rank.
2. **Fail one eligibility rule = never an eligible match**, even with a perfect skill fit.
3. **Rank only ELIGIBLE opportunities.** Ineligible items have no score and no rank.
4. **AI never decides eligibility.** AI may extract skills and judge skill similarity, for ranking only. `eligibility-engine` must not import AI, DB, network, or ranking code (CI import-check).
5. **UNKNOWN is not PASS.** Missing candidate data puts the opportunity under "Need more information".
6. **Explain everything in plain language:** why it ranks where it does; exact failed condition + candidate's current value for every FAIL.
7. **Learning paths come only from the supplied catalogue.** No live course-provider access.
8. **Profile changes update results immediately and visibly** (live push, change banner, badges, Undo).
9. **Decision support only.** Show: "Eligibility follows the criteria stated by the opportunity. Confirm with the issuing office before applying." The app must also work fully with `AI_ENABLED=false`.

---

## 3. How the system works (30 seconds)

```
Officer enters opportunity (rules + skills + preference attrs)
Candidate enters profile (skills, qualifications, location, preferences)
  -> skill-core normalises phrases (dictionary -> embeddings -> LLM judgement, cached)
  -> eligibility-engine: each rule PASS / FAIL / UNKNOWN (pure, deterministic, no AI)
       any FAIL -> NOT_ELIGIBLE | else any UNKNOWN -> NEEDS_INFO | else ELIGIBLE
  -> ranking-engine (ELIGIBLE only): 100 x (0.55 skillFit + 0.30 prefFit + 0.15 profFit)
  -> explainer: templates over rule results + score parts (en / hi / mr)
  -> pathway: gaps for "Interested" opportunities -> catalogue courses (set cover + prerequisites)
  -> orchestrator upserts match_results, computes diff, pushes SSE "matches.updated"
```

Result lists in the UI: **Eligible (ranked)**, **Need info**, **Not eligible (with exact reason)**.

---

## 4. Glossary

| Term | Meaning |
|---|---|
| Eligibility rule | Structured mandatory criterion on an opportunity (type, operator, value, plain label) |
| Preference attribute | Opportunity attribute used only for ranking |
| Canonical skill | One taxonomy skill that many phrases/aliases map to |
| Relation credit | Skill match credit: same = 1.0, related = min(0.85, similarity), else 0 (unconfirmed AI skill capped at 0.5) |
| Gap | Required skill with credit below 0.85 |
| Pathway | Ordered catalogue courses (with prerequisites) that close the gaps |
| MatchResult | Cached, rebuildable result per candidate and opportunity; never the source of truth |
| profileVersion | Integer bumped on every profile change; orders live updates |

---

## 5. Tech stack and layout

- **Web:** Next.js (App Router), React, TypeScript (strict), Tailwind. **API:** Node 20, Express, Zod. **DB:** PostgreSQL 16 + pgvector. **Cache/queue:** Redis + BullMQ. **Realtime:** SSE. **AI:** Claude API behind `AiProvider` (mock provider for offline). **Tests:** Vitest, fast-check, Playwright, Testcontainers, k6, axe.
- Monorepo (pnpm): `apps/web`, `apps/api`, `packages/{eligibility-engine, ranking-engine, explainer, pathway, skill-core, shared-types, ui}`, `db/{migrations,seeds}`, `tooling/check-imports.ts`.
- Dependency rule: `eligibility-engine` imports nothing from other packages or AI/DB/network libraries.

---

## 6. UI summary (FutoraOne look)

- Mobile-first shell: bottom tabs **Home, Match, Learn, Profile** + floating **AI** button; officer/admin console on desktop.
- Match screen pills: **All / Eligible / Need info / Not eligible**. Eligible card: score ring, top 3 reasons, skill chips, **Interested** button. Not-eligible card: red-tinted strip with the failed rule, no score.
- Status = icon + word + colour, never colour alone. WCAG 2.1 AA. English, Hindi, Marathi.
- Tokens: blue `#2F5BFF`, indigo `#5B4BEA`, violet `#7C5CFF`, ink `#0F1B3D`, slate `#64748B`, canvas `#F6F8FC`, tint `#EAF0FF`, line `#E2E8F3`; ok `#12AE85`, warn `#F59E0B`, fail `#E5484D`. Cards: white, radius 16, soft shadow. Pills and primary buttons fully rounded. Font Inter.
- Tone: plain, specific, encouraging. Say "Requires at least a Diploma. You have: 12th pass." Never "Does not meet criteria."

---

## 7. Coding conventions

- TypeScript strict; no `any` in engines; Zod at every boundary; parameterised SQL only.
- Engines are pure functions with no I/O; side effects live in `apps/api` services.
- Rules and weights are versioned; each MatchResult stores `rules_version`, `weights_version`, `profile_version`.
- Never put free-form AI text into a decision or explanation; explanations come from templates.
- Rule evaluation errors become UNKNOWN for that rule and are logged; they never become PASS.
- All user-facing strings go through the i18n catalogue (en, hi, mr must have identical keys).
- Sensitive attribute rules are disabled by default; never send names, contact details, location, or sensitive attributes to the AI provider (skill phrases only).
- Small commits per phase; each phase ends with tests green.

---

## 8. Commands

```bash
pnpm install
docker compose up -d db redis
pnpm db:migrate && pnpm db:seed
pnpm dev                    # web :3000, api :4000
AI_ENABLED=false pnpm dev   # dictionary-only mode
pnpm test                   # unit + property + contract + integration
pnpm test:e2e               # Playwright scenarios A-I
pnpm check:imports          # eligibility-engine purity
pnpm rebuild:matches        # recompute all MatchResults
```

---

## 9. Definition of done (checklist the agent keeps updated)

- [ ] Monorepo, CI, DB schema, auth + RBAC
- [ ] eligibility-engine (all 8 rule types) + property tests
- [ ] ranking-engine, explainer (en/hi/mr), pathway
- [ ] skill service: dictionary, embeddings, LLM client, cache, mock provider, kill switch
- [ ] API (all endpoints in `trd.md` section 13) + orchestrator + audit log
- [ ] SSE live updates, change banner, Undo, what-if
- [ ] Candidate UI: Home, Match, opportunity detail, Learn, Profile, AI button
- [ ] Officer/admin console: rule builder, preview, catalogue manager, audit, decision trace
- [ ] Seed data (40 skills, 200+ aliases, 30 opportunities, 6 candidates, 20 courses)
- [ ] AT-01 to AT-09 pass; scenarios A-I pass in Playwright
- [ ] `AI_ENABLED=false` gives identical eligibility output to `true`
- [ ] Recompute p95 under 1 s on 10,000 opportunities
- [ ] README, ASSUMPTIONS.md, requirement-to-code checklist

---

## 10. Decision log (append new decisions here)

| Date | Decision | Why |
|---|---|---|
| 2026-10-11 | Eligibility engine is a pure package with a CI import check | Guarantees AI cannot influence eligibility |
| 2026-10-11 | Unknown data returns UNKNOWN, shown as "Need more information" | Avoids silent pass or silent hide |
| 2026-10-11 | Ranking weights 55 / 30 / 15, relation thresholds 0.70 and 0.85 | Explainable, tunable via versioned config |
| 2026-10-11 | Real-time via SSE with polling fallback | Simple, proxy friendly |
| 2026-10-11 | Dictionary-first skill matching, AI optional | Product works with no API key |
| 2026-10-11 | Delivered inside FutoraOne look (Home, Match, Learn, Profile, AI button) | Brand consistency |

---

## 11. How to behave in this project

1. Re-read sections 2 and 7 before any change to eligibility, ranking, or skill code.
2. Never "improve" results by letting a preference or AI score override a failed rule.
3. When unsure, choose the option that keeps eligibility deterministic and explainable, and log it in `ASSUMPTIONS.md`.
4. Before declaring work done, run the commands in section 8 and update the checklist in section 9.
5. Keep answers to the user short and concrete: what changed, what passed, what is next.
