# RozgarLink - Technical Requirements Document (TRD)

Version 1.0 | Futora Group | A FutoraOne product | Companion to `prd.md` and `branding.md`

This document tells engineers exactly **how to build** RozgarLink so that it works end to end: stack, repo layout, database, engines, AI service, realtime, API, security, testing and delivery.

---

## 1. Technical goals

| # | Goal | Technical consequence |
|---|---|---|
| T1 | Ineligible never shown as eligible | Pure rule engine package, no AI/DB/network imports; property tests |
| T2 | AI never decides eligibility | AI outputs are not in the eligibility function's types; static import check in CI |
| T3 | Recompute under 1 s (p95) | Per-candidate recompute, indexed prefilter, in-memory rule evaluation |
| T4 | Every result explainable and reproducible | Store rule version, weights version, AI relation credits with each MatchResult |
| T5 | Works if AI is down | Dictionary layer first; AI results cached; queue for unknown phrases |
| T6 | FutoraOne look and feel | Shared design tokens (see `branding.md`) |

---

## 2. System architecture

```
 FutoraOne App Shell (Next.js, TypeScript, Tailwind)
   Home | Match | Learn | Profile | AI button        Officer console (web)
            |  REST /v1  +  SSE /v1/events
            v
 API (Node.js + Express + TypeScript)
   |-- auth, RBAC, rate-limit, validation (Zod)
   |-- profile-service        opportunity-service       catalogue-service
   |-- match-orchestrator --> eligibility-engine (pure)
   |                      --> ranking-engine
   |                      --> explainer (templates + i18n)
   |                      --> pathway-service
   |-- skill-service --> dictionary | embeddings | LLM client | cache
   |-- event-bus (Redis pub/sub) --> SSE gateway
   |-- worker (BullMQ): recompute, embeddings backfill, audit export
            |
            v
 PostgreSQL 16 (+ pgvector)     Redis 7 (cache, queue, pub/sub)     LLM + embedding API
```

### Request lifecycle (profile edit)
1. `PUT /v1/candidates/me` validated by Zod, saved in one DB transaction, `profile_version` incremented.
2. `match-orchestrator.recompute(candidateId)` runs synchronously for the visible result set.
3. Eligibility evaluated for prefiltered opportunities; ranking and explanations computed for ELIGIBLE ones.
4. `match_results` upserted; diff against previous results computed.
5. Response returns new `profileVersion` and `changes`; SSE event `matches.updated` is published for other open sessions.

---

## 3. Technology stack

| Layer | Choice | Notes |
|---|---|---|
| Language | TypeScript 5.x (strict) | Shared types between web and API |
| Web | Next.js 14+ (App Router), React 18, Tailwind CSS | Tokens from `branding.md`; PWA manifest |
| API | Node.js 20 LTS, Express 4, Zod | OpenAPI generated from Zod |
| DB | PostgreSQL 16, pgvector | Migrations with Prisma or Drizzle (team choice; examples use SQL) |
| Cache/Queue | Redis 7, BullMQ | Skill phrase cache, recompute queue, SSE fan-out |
| Realtime | Server-Sent Events | WebSocket not required |
| AI | Claude API (structured JSON) for extraction and relation judgement; an embeddings model for similarity | Behind `AiProvider` interface |
| Auth | Email/phone OTP + JWT (15 min) + refresh (7 days) | httpOnly cookies for web |
| Testing | Vitest, fast-check, Playwright, k6, axe, Testcontainers | |
| Observability | pino logs, OpenTelemetry, Sentry | Trace id on every response |
| Infra | Docker, GitHub Actions, cloud region in India | |

---

## 4. Repository layout (monorepo, pnpm workspaces)

```
rozgarlink/
  apps/
    web/                    # Next.js FutoraOne shell + officer console
    api/                    # Express API + workers
  packages/
    eligibility-engine/     # PURE: rules, evaluate(), types. No deps on other packages
    ranking-engine/         # scoring; depends only on shared-types
    explainer/              # templates + i18n catalogue (en, hi, mr)
    pathway/                # gap analysis + learning path builder
    skill-core/             # normalisation, dictionary logic, relation credit
    shared-types/           # Zod schemas + TS types
    ui/                     # design tokens, Card, Pill, Chip, ScoreRing, FAB
  db/
    migrations/  seeds/
  tooling/
    check-imports.ts        # fails CI if eligibility-engine imports forbidden modules
  .github/workflows/ci.yml
  docker-compose.yml
```

Dependency rule (enforced by `tooling/check-imports.ts` and ESLint `no-restricted-imports`):
`eligibility-engine` imports **nothing** from `skill-core`, `ranking-engine`, `apps/*`, any AI SDK, `pg`, `redis`, `fetch`.

---

## 5. Configuration and environment

| Variable | Example | Purpose |
|---|---|---|
| `DATABASE_URL` | postgres://... | Postgres connection |
| `REDIS_URL` | redis://... | Cache, queue, pub/sub |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | (vault) | Auth |
| `AI_PROVIDER` | `anthropic` | Provider switch |
| `ANTHROPIC_API_KEY` | (vault) | AI calls (skills only) |
| `AI_MODEL` | configurable | Model name kept in config, not code |
| `EMBEDDING_MODEL` | configurable | Embeddings |
| `AI_ENABLED` | `true` | Kill switch; `false` = dictionary-only |
| `AI_PHRASE_DAILY_BUDGET` | `5000` | Cost guard |
| `RANK_WEIGHTS_VERSION` | `v1` | Weights config version |
| `RELATION_THRESHOLDS` | `0.70,0.85` | Related / same cut-offs |
| `OTP_PROVIDER` | sms/email | Login |
| `DEFAULT_LOCALE` | `en` | i18n |

`config/ranking.v1.json`:
```json
{ "version": "v1", "weights": { "skill": 0.55, "preference": 0.30, "proficiency": 0.15 },
  "skillImportance": { "required": 3, "preferred": 1 },
  "relation": { "sameMin": 0.85, "relatedMin": 0.70, "relatedCap": 0.85, "unconfirmedCap": 0.5 } }
```

---

## 6. Database schema (PostgreSQL)

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TYPE user_role AS ENUM ('candidate','officer','catalogue_manager','admin','evaluator');
CREATE TYPE match_status AS ENUM ('ELIGIBLE','NOT_ELIGIBLE','NEEDS_INFO');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), role user_role NOT NULL,
  email text UNIQUE, phone text UNIQUE, name text NOT NULL, locale text DEFAULT 'en',
  created_at timestamptz DEFAULT now());

CREATE TABLE candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid UNIQUE REFERENCES users(id),
  state text, district text, pincode text, date_of_birth date,
  preferences jsonb NOT NULL DEFAULT '{}',   -- {commuteKm, minPay, shift, workType[], sector[], weights{}}
  profile_version int NOT NULL DEFAULT 1, updated_at timestamptz DEFAULT now());

CREATE TABLE qualification_levels (ordinal int PRIMARY KEY, code text UNIQUE, label text);   -- ladder
CREATE TABLE qualifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  level_ordinal int REFERENCES qualification_levels(ordinal), field_code text, institution text,
  year int, verified boolean DEFAULT false);
CREATE TABLE certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  code text NOT NULL, name text, issuer text, valid_till date, verified boolean DEFAULT false);
CREATE TABLE work_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  domain_code text, months int NOT NULL);

CREATE TABLE skills (id text PRIMARY KEY, canonical_name text NOT NULL, category text, embedding vector(1024));
CREATE TABLE skill_aliases (id bigserial PRIMARY KEY, skill_id text REFERENCES skills(id), phrase_norm text NOT NULL, language text DEFAULT 'en',
  UNIQUE (phrase_norm, language));
CREATE TABLE unmatched_phrases (id bigserial PRIMARY KEY, phrase_norm text UNIQUE, seen_count int DEFAULT 1, status text DEFAULT 'queued');

CREATE TABLE candidate_skills (
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE, skill_id text REFERENCES skills(id),
  proficiency smallint CHECK (proficiency BETWEEN 1 AND 5) DEFAULT 3,
  source text CHECK (source IN ('manual','ai','course')), confirmed boolean DEFAULT false, confidence real,
  PRIMARY KEY (candidate_id, skill_id));

CREATE TABLE opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, org_name text, work_description text,
  state text, district text, lat real, lng real, status text DEFAULT 'open', closes_on date,
  reference_date date,                       -- used by AGE/validity rules
  preference_attrs jsonb NOT NULL DEFAULT '{}',   -- {pay:{min,max}, shift, workType, sector, remote}
  created_by uuid REFERENCES users(id), rules_version int DEFAULT 1, updated_at timestamptz DEFAULT now());
CREATE INDEX ON opportunities (status, state, district, closes_on);

CREATE TABLE opportunity_skills (
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE, skill_id text REFERENCES skills(id),
  importance text CHECK (importance IN ('required','preferred')), min_proficiency smallint,
  PRIMARY KEY (opportunity_id, skill_id));

CREATE TABLE eligibility_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  type text NOT NULL,            -- QUAL_MIN_LEVEL | QUAL_FIELD | RESIDENCE_STATE | RESIDENCE_DISTRICT | AGE_RANGE | CERT_REQUIRED | EXPERIENCE_MIN | ATTRIBUTE
  operator text NOT NULL, value jsonb NOT NULL, label text NOT NULL,
  requires_verification boolean DEFAULT false, sensitive boolean DEFAULT false, version int NOT NULL DEFAULT 1);

CREATE TABLE learning_resources (
  id text PRIMARY KEY, title text, provider text, duration_hours int, level text, mode text, language text,
  cost_inr int DEFAULT 0, url text, qualification_awarded_ordinal int);
CREATE TABLE resource_skills (resource_id text REFERENCES learning_resources(id), skill_id text REFERENCES skills(id), level_reached smallint, PRIMARY KEY (resource_id, skill_id));
CREATE TABLE resource_prereqs (resource_id text REFERENCES learning_resources(id), requires_resource_id text REFERENCES learning_resources(id), PRIMARY KEY (resource_id, requires_resource_id));
CREATE TABLE candidate_courses (candidate_id uuid REFERENCES candidates(id), resource_id text REFERENCES learning_resources(id), status text, completed_at date, PRIMARY KEY (candidate_id, resource_id));

CREATE TABLE interests (candidate_id uuid REFERENCES candidates(id), opportunity_id uuid REFERENCES opportunities(id), created_at timestamptz DEFAULT now(), PRIMARY KEY (candidate_id, opportunity_id));

CREATE TABLE match_results (
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE, opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  status match_status NOT NULL, score numeric(5,2), rank int, explanation jsonb NOT NULL,
  profile_version int, rules_version int, weights_version text, computed_at timestamptz DEFAULT now(),
  PRIMARY KEY (candidate_id, opportunity_id));
CREATE INDEX ON match_results (candidate_id, status, rank);

CREATE TABLE audit_events (
  id bigserial PRIMARY KEY, actor uuid, type text NOT NULL, entity text, entity_id text,
  before jsonb, after jsonb, at timestamptz DEFAULT now());     -- append-only (no UPDATE/DELETE grants)
```

`match_results` is a cache and can be truncated and rebuilt at any time.

---

## 7. Eligibility engine (`packages/eligibility-engine`)

### Types
```ts
export type Outcome = 'PASS' | 'FAIL' | 'UNKNOWN';
export interface CandidateFacts {
  state?: string; district?: string; dob?: string;
  highestQualification?: { ordinal: number; fieldCode?: string; verified: boolean };
  qualifications: { ordinal: number; fieldCode?: string; verified: boolean }[];
  certifications: { code: string; validTill?: string; verified: boolean }[];
  experienceMonths: Record<string, number>;           // by domain code
  attributes: Record<string, string | undefined>;     // admin-defined, sensitive ones flagged
}
export interface Rule { id: string; type: RuleType; operator: string; value: unknown;
  label: string; requiresVerification: boolean; version: number; referenceDate?: string }
export interface RuleResult { ruleId: string; outcome: Outcome; label: string;
  candidateValue: string | null; requiredValue: string; missingField?: string }
export interface EligibilityResult { status: 'ELIGIBLE'|'NOT_ELIGIBLE'|'NEEDS_INFO'; results: RuleResult[] }
```

### Algorithm
```ts
export function evaluateOpportunity(rules: Rule[], c: CandidateFacts): EligibilityResult {
  const results = rules.map(r => evaluateRule(r, c));            // no short-circuit
  const status = results.some(r => r.outcome === 'FAIL') ? 'NOT_ELIGIBLE'
               : results.some(r => r.outcome === 'UNKNOWN') ? 'NEEDS_INFO' : 'ELIGIBLE';
  return { status, results };
}
```

### Rule semantics

| Type | Missing data (UNKNOWN when) | PASS when | Notes |
|---|---|---|---|
| QUAL_MIN_LEVEL | no qualification, or unverified and `requiresVerification` | highest ordinal >= value | ladder from `qualification_levels` |
| QUAL_FIELD | no qualification | any qualification with level >= min and `fieldCode` in set | explicit equivalence via extra rules |
| RESIDENCE_STATE | state empty | state in set (normalised) | normalise with lookup table |
| RESIDENCE_DISTRICT | district empty | district in set | |
| AGE_RANGE | dob empty | age on `referenceDate` within range (inclusive) | age computed exactly (birthday boundary) |
| CERT_REQUIRED | none listed and unverified when required | cert code present, `validTill >= referenceDate` | |
| EXPERIENCE_MIN | domain missing | months >= value | |
| ATTRIBUTE | attribute undefined | equals / in set | sensitive rules need admin flag |

Invariants (property-tested): deterministic; order-independent; adding a FAIL rule can never turn an opportunity ELIGIBLE; removing candidate data can never turn FAIL into PASS.

---

## 8. Ranking engine (`packages/ranking-engine`)

Input: ELIGIBLE opportunity + candidate skill credits + preferences. The function signature does not accept non-eligible input (type `EligibleOpportunity` brand).

```ts
score = 100 * (W.skill * skillFit + W.pref * prefFit + W.prof * profFit)

skillFit = sum_i(weight_i * credit_i) / sum_i(weight_i)           // required=3, preferred=1
credit_i = 1.0                      if same skill (alias or confirmed)
         = min(0.85, similarity)    if related (0.70 <= similarity < 0.85)
         = 0                        otherwise
         (x 0.5 cap if candidate skill unconfirmed)
profFit  = avg_i( min(1, candidateProf_i / requiredProf_i) )       // default 1
prefFit  = weighted avg of: commute, pay, shift, workType, sector sub-scores (each 0..1)
```

Preference sub-scores: commute = 1 within preferred km, linear to 0 at 2x; pay = 1 at or above minimum, proportional below, 0.5 unstated; shift/workType/sector = 1 match, 0.5 flexible/unspecified, 0 mismatch (never excludes).

Tie-break: higher skillFit, earlier `closes_on`, newer `updated_at`. Output includes each component so the explainer can narrate it.

Distance: haversine between candidate district centroid and opportunity coordinates (table `district_centroids`); no map API.

---

## 9. Skill service (`apps/api/src/skill-service`)

### Pipeline
1. **Normalise**: lowercase, trim, remove punctuation, collapse spaces, light stemming, transliteration table for common Hindi/Marathi Latin spellings.
2. **Dictionary lookup**: exact match on `skill_aliases.phrase_norm`; then trigram fuzzy match (`pg_trgm`, similarity >= 0.8). Hit = credit 1.0.
3. **Embedding match**: `embedding(phrase)` -> nearest 5 `skills.embedding` by cosine; keep >= 0.70.
4. **LLM judgement** (only for phrases with no dictionary hit, shortlist from step 3): returns strict JSON.
5. **Cache** result in Redis (`skill:phrase:{norm}` TTL 30 days) and `skill_resolutions` table. Unknown phrases go to `unmatched_phrases`.

### LLM contract
System prompt (summary): "You map a short skills phrase to canonical skills from the provided list. Return JSON only. Never invent skill ids. You judge skill relationship only. You do not decide eligibility, jobs or suitability."

Output schema (Zod, validated, invalid = discarded and logged):
```json
{ "phrase": "fixing home power points",
  "matches": [ { "skillId": "SK-ELEC-WIRING", "relation": "related", "confidence": 0.78,
                 "reason": "Basic domestic electrical work overlaps with wiring." } ] }
```
`relation` is one of `same | related | unrelated`.

### Interface
```ts
interface AiProvider {
  extractSkills(text: string, shortlist: SkillRef[]): Promise<ExtractedSkill[]>;
  embed(phrases: string[]): Promise<number[][]>;
}
```
Timeouts 6 s, 2 retries with jitter, circuit breaker opens after 5 failures in 60 s (then dictionary-only). Only skill phrases are sent: no names, contact details, locations, or sensitive attributes.

### Review loop
Weekly job lists `unmatched_phrases` ordered by `seen_count`; catalogue manager promotes to `skill_aliases` or creates a skill. Accepted/rejected AI suggestions are written to `audit_events`.

---

## 10. Explainer (`packages/explainer`)

Deterministic templates over structured data; no LLM text in decisions.

```ts
explainEligible(result: EligibleMatch, locale): { headline: string; reasons: string[]; criteria: Chip[]; gaps: string[] }
explainNotEligible(failed: RuleResult[], locale): { strip: string; details: Detail[]; fixHint?: string }
explainNeedsInfo(unknown: RuleResult[], locale): { message: string; missingFields: string[] }
```

i18n keys, e.g. `fail.residence = "Open to residents of {places} only. Your profile: {value}."`. All three locale files must contain every key (CI check). Fix hints: qualification and certification are "changeable" (pathway offered); residence and age are "not changeable by learning".

---

## 11. Gap analysis and pathways (`packages/pathway`)

```
missing = required skills where credit < 0.85          (partial gaps flagged)
cands   = resources teaching any skill in missing
pick    = greedy set cover: maximise newly covered skills / (hours + cost weight); tie: fewer hours
steps   = topological order of pick plus unmet prerequisites (cycle detection; reject cyclic catalogue on import)
output  = [{resource, hours, skillsGained, why}], totalHours
```
Eligibility blockers are reported separately; a `qualification_awarded_ordinal` resource can be offered under "To become eligible". No network calls to providers; `url` is a static link only. If nothing teaches a skill: return `noCourse: true` and log to `catalogue_gaps`.

---

## 12. Realtime

- Endpoint `GET /v1/events` (SSE), auth by cookie/token, heartbeat comment every 25 s, `Last-Event-ID` resume.
- Redis channel per candidate: `cand:{id}`; opportunity/rule edits enqueue `recompute-batch` jobs for affected candidates (found via prefilter by state/district/skills).
- Event payload:
```json
{ "type": "matches.updated", "profileVersion": 43,
  "changes": { "newlyEligible": ["OP-117"], "noLongerEligible": ["OP-203"], "rankMoved": 3 } }
```
- Client keeps `profileVersion`; ignores older events; if SSE drops, polls `GET /v1/matches?since=<version>` every 5 s.
- Debounce edits 150 ms; the last write wins. UI shows the change banner with Undo (restores the previous profile snapshot, which triggers a normal recompute).

Performance plan: prefilter SQL (`status='open' AND closes_on >= today AND (state matches OR no residence rule)`) returns candidate set; rules are loaded once per opportunity into an in-memory LRU keyed by `(id, rules_version)`; evaluate up to 10,000 opportunities in a tight loop (target under 150 ms), ranking only ELIGIBLE (typically under 500).

---

## 13. API contracts (v1)

Base `/v1`, JSON, auth `Authorization: Bearer` or cookie. Errors use RFC 7807 (`application/problem+json`). POSTs accept `Idempotency-Key`.

| Method | Path | Role | Request -> Response |
|---|---|---|---|
| POST | `/auth/otp/request` | public | `{phoneOrEmail}` -> 202 |
| POST | `/auth/otp/verify` | public | `{phoneOrEmail,code}` -> tokens |
| GET | `/candidates/me` | candidate | -> profile, `profileVersion` |
| PUT | `/candidates/me` | candidate | location, dob, preferences -> profile + `changes` |
| POST | `/candidates/me/qualifications` | candidate | `{levelOrdinal,fieldCode,year}` -> list + `changes` |
| PATCH/DELETE | `/candidates/me/qualifications/{id}` | candidate | -> list + `changes` |
| POST | `/candidates/me/skills/extract` | candidate | `{text}` -> suggested skills (not saved) |
| PUT | `/candidates/me/skills` | candidate | `[{skillId,proficiency}]` -> saved + `changes` |
| GET | `/matches` | candidate | `?status=&since=&weights=` -> `{eligible,needsInfo,notEligible,changes,profileVersion}` |
| GET | `/matches/{opportunityId}` | candidate | -> full rule results + score parts |
| POST | `/matches/whatif` | candidate | hypothetical profile patch -> same shape, not saved |
| POST | `/interests` | candidate | `{opportunityId}` -> gap + pathway |
| GET | `/opportunities/{id}/gap` | candidate | -> missing skills, pathway, blockers |
| POST | `/learning/complete` | candidate | `{resourceId}` -> updated skills + `changes` |
| POST/PUT | `/opportunities` | officer | opportunity + rules + skills + preference attrs |
| POST | `/opportunities/{id}/preview-eligibility` | officer | -> counts across sample candidates |
| CRUD | `/skills`, `/aliases`, `/resources` | catalogue_manager | CSV import `POST /catalogue/import` |
| GET | `/audit` | admin, evaluator | filters by entity/actor/date |
| GET | `/events` | any | SSE |
| POST | `/matches/{opportunityId}/flag` | candidate | `{reason}` -> review ticket with decision trace |

### `GET /matches` example
```json
{ "profileVersion": 42,
  "eligible": [ { "opportunityId": "OP-117", "rank": 1, "score": 91,
     "reasons": ["Has 4 of 4 required skills", "Commute 8 km within your 15 km"],
     "criteria": [ { "label": "ITI Electrician", "outcome": "PASS" } ], "gaps": [], "aiAssisted": ["SK-ELEC-WIRING"] } ],
  "notEligible": [ { "opportunityId": "OP-203",
     "failed": [ { "label": "Open to residents of Nashik or Pune", "candidateValue": "Satara", "outcome": "FAIL" } ],
     "fixHint": "not_changeable_by_learning" } ],
  "needsInfo": [ { "opportunityId": "OP-301", "missingField": "drivingLicence" } ],
  "changes": { "newlyEligible": ["OP-117"], "noLongerEligible": [], "rankMoved": 3 } }
```

Rules for responses: `notEligible` items never include `score` or `rank`; every item includes `explanation` fields; `eligible` is sorted by rank.

---

## 14. Security and privacy

| Area | Requirement |
|---|---|
| Auth | OTP + short-lived JWT, refresh rotation, lockout after 5 failed OTPs |
| RBAC | Middleware checks role per route; officers can edit only their programme's opportunities |
| Input | Zod validation everywhere; parameterised SQL only; output encoding in UI |
| Transport/storage | TLS 1.2+, encrypted DB volumes, secrets in vault, field-level encryption for DOB and phone |
| Rate limits | 100 req/min per user, 10 AI-extract calls/min per user |
| Sensitive attributes | `sensitive=true` rules disabled by default; admin-only; excluded from AI prompts, logs and analytics |
| Privacy | Align with India DPDP Act 2023: consent capture, purpose limitation, export and delete; India region hosting |
| AI data | Send only skill phrases; no PII; vendor retention off where offered |
| Audit | Append-only `audit_events`; DB role has INSERT only; 3-year retention |
| Dependencies | `pnpm audit`, Dependabot, SBOM in CI |
| Fairness | No protected attributes in ranking; quarterly distribution report by district and qualification level |

---

## 15. Observability

- Structured logs (pino) with `traceId`, `candidateId` (hashed), `opportunityId`.
- Metrics: `recompute_ms` histogram, `eligible_count`, `ai_calls_total`, `ai_failures_total`, `dictionary_hit_ratio`, `sse_clients`, `unmatched_phrases_open`.
- Alerts: recompute p95 > 1 s for 5 min; AI failure rate > 20%; queue lag > 30 s.
- Decision trace page (admin): shows inputs, rule versions, results and score components for any match.

---

## 16. Testing strategy

| Layer | What | Tools |
|---|---|---|
| Unit | Each rule type boundaries (exact birthday, ladder edges, missing data); ranking components; explainer keys | Vitest |
| Property | `FAIL` never yields ELIGIBLE; determinism; monotonicity | fast-check |
| Static | `check-imports.ts` forbids AI/DB/network imports in `eligibility-engine` | CI |
| Contract | API schemas, SSE payloads, i18n keys complete | Zod, custom |
| Integration | Postgres, Redis, recompute, cache, mocked `AiProvider` | Testcontainers |
| AI eval | 300 labelled phrases: alias/relation accuracy >= 95%; prompt regression | eval harness |
| E2E | Scenarios A-I from PRD section 19 | Playwright |
| Performance | 10k opportunities, 500 sessions, recompute p95 < 1 s | k6 |
| Accessibility | WCAG 2.1 AA on all key screens | axe, manual |
| Security | OWASP ZAP baseline, dependency scan | CI |

Release gate: all PRD acceptance tests AT-01 to AT-09 pass; zero failing guard tests.

---

## 17. CI/CD and environments

- Branches: `main` (protected), feature branches; PR requires lint, type-check, unit, property, import-check, integration.
- Pipeline: install -> lint -> typecheck -> unit/property -> import-check -> integration (Testcontainers) -> build -> E2E on preview -> deploy.
- Environments: `dev` (auto), `staging` (on merge), `prod` (manual approval). DB migrations run before deploy; backward-compatible only.
- Containers: `web`, `api`, `worker`; `docker-compose.yml` for local (Postgres+pgvector, Redis).
- Backups: daily DB snapshots (RPO 24 h, RTO 4 h); `match_results` rebuild job `pnpm rebuild:matches`.

---

## 18. Seed data and local setup

```bash
pnpm install
docker compose up -d db redis
pnpm db:migrate && pnpm db:seed          # 40 skills, 200+ aliases, 30 opportunities, 6 candidates, 20 courses
pnpm dev                                  # web :3000, api :4000
AI_ENABLED=false pnpm dev                 # dictionary-only mode for offline demos
```

Seed contents match PRD section 19 (Asha, Rahul, Meena and three edge-case profiles; scenarios A-I).

---

## 19. Error handling

| Case | Behaviour |
|---|---|
| AI timeout/invalid JSON | Fall back to dictionary; queue phrase; response flagged `aiDegraded: true` |
| Rule evaluation exception | Treat as UNKNOWN for that rule, log error with rule id, never PASS |
| Recompute failure | Return last good `match_results` with `stale: true`; retry job; banner "Updating..." |
| SSE drop | Client polling fallback |
| Conflicting rules at entry (age 30-20) | 422 with field-level messages |
| Catalogue cycle | Import rejected with cycle path |

---

## 20. Build order (for a 10-week plan)

1. Week 1: monorepo, CI, schema, auth/RBAC, `ui` tokens from `branding.md`.
2. Weeks 2-4: `eligibility-engine`, rule builder, `ranking-engine`, `explainer`, seeds; Match screen with eligible / need info / not eligible lists.
3. Weeks 4-6: `skill-core` dictionary, embeddings, LLM client, confirmation UI, AI button.
4. Weeks 6-7: catalogue manager, gap analysis, Learn tab with pathways.
5. Weeks 7-8: recompute pipeline, SSE, change banner, what-if.
6. Weeks 9-10: accessibility, security, load tests, audit views, i18n, demo polish.

---

## 21. Definition of done

All nine acceptance tests pass; scenarios A-I run live; audit trace is retrievable for any result; the guard tests prove that no AI output can influence eligibility; no ineligible opportunity is ever shown as eligible.
