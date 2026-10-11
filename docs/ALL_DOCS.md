# ROZGARSATHI — Unified Master Documentation

All project documents consolidated into a single file.

========================================
# FILE: docs/prd.md
========================================

# RozgarLink - Skills-to-Opportunity Matching Engine

**Product Requirements Document (PRD) v1.0** | A FutoraOne product by Futora Group | Domain 7 - Government Systems & GovTech | Problem G-01


## 1. The Entire Working of RozgarLink, End to End

RozgarLink connects **candidate profiles** with **manually entered opportunities**. Its one non-negotiable design rule: **eligibility is decided by deterministic rules stated by the opportunity; AI only helps understand skills and influence ranking.** Every result is explained in plain language, and any change to a candidate updates the screen instantly.

| # | Stage | What happens | Who decides |
|---|---|---|---|
| 1 | Opportunity entry | An officer/admin types in an opportunity: title, work involved, location, **required skills**, **mandatory eligibility criteria** (qualification, residence, age, certification, experience) and **preference attributes** (pay, shift, work type). Criteria are saved as structured rules, never as free text. | Human (officer) |
| 2 | Candidate profile | Candidate enters skills (free text allowed), qualifications, location and preferences (commute, pay, work type). AI extracts skills from free text; the candidate confirms them. | Candidate (+AI suggests) |
| 3 | Skill normalisation | 'MS Excel', 'spreadsheets', 'advanced excel' map to one canonical skill via alias dictionary first, then embedding/LLM similarity with a confidence score. Output is used for ranking only. | AI + dictionary (ranking only) |
| 4 | Eligibility gate | A pure rule engine checks every mandatory criterion: PASS, FAIL or UNKNOWN. Eligible only if **all** pass. Skill similarity never enters this step. Failed rules carry the exact condition text. | Rules only (no AI) |
| 5 | Ranking | Only eligible opportunities are scored: skill fit 55%, preference fit 30%, proficiency/experience 15%. Semantic matches earn partial, capped credit. | Formula (AI-informed inputs) |
| 6 | Explanation | Each eligible result shows why it ranks where it does (score breakdown in words). Each ineligible result names the specific failed condition and the candidate's current value. | Templates from rule/score data |
| 7 | Skill gap + pathway | For opportunities the candidate marks 'interested', missing required skills are listed and mapped to courses from the team-supplied catalogue (no live provider access), ordered by coverage, duration and prerequisites. | Catalogue lookup |
| 8 | Live recompute | Editing qualification, location, skills or preferences fires an event; the engine re-evaluates immediately; the UI updates in place and highlights what changed ('Now eligible', 'No longer eligible', rank moved). | Engine + push (SSE) |


### What the candidate sees after matching

| Eligible matches (ranked) | Not eligible (with reason) | Need more information |
|---|---|---|
| Ordered list with score, 'Why this rank' sentences, skill-gap chip and learning pathway button. | Greyed list, never mixed into ranks. Each card states the failed rule, e.g. 'Requires residence in Maharashtra. Your location: Gujarat.' | Opportunities where a criterion cannot be checked yet because profile data is missing. Prompt: 'Add your qualification to check this.' |

> **Why this matters** Treating a requirement as a preference recommends jobs a candidate cannot formally take. Treating a preference as a requirement hides options they could pursue. RozgarLink separates the two in the data model, the engine, the UI and the tests. Output is decision support; the opportunity's stated criteria always govern.


## 2. Document Control, Vision and Goals

| Item | Detail |
|---|---|
| Product | RozgarLink - Skills-to-Opportunity Matching Engine (Problem G-01) |
| Document | PRD v1.0 (20 pages), build-ready for MVP and demo |
| Owner | Futora Group - Product & Engineering |
| Audience | Product, engineering, design, QA, government/programme stakeholders, evaluators |
| Status | Draft for review. Assumptions flagged in Section 20 |


### Contents

| Pages | Sections |
|---|---|
| 1-4 | Working overview, vision, problem and users, scope and success metrics |
| 5-9 | Eligibility vs preference principle, functional requirements, data model, eligibility engine, skill normalisation and AI guardrails |
| 10-14 | Ranking, explanations, skill gaps and pathways, real-time updates, UI/UX |
| 15-18 | Architecture, API, non-functional requirements, test plan |
| 19-20 | Seed data and demo scenarios, roadmap, risks, open questions |


### Vision

Every job seeker and trainee should see opportunities they can actually take, ranked by how well they fit, with clear reasons, and a concrete path to close gaps for the ones they want.


### Product goals

- **G1 Correctness first:** zero ineligible opportunities ever shown as eligible matches.
- **G2 Vocabulary-proof:** same skill in different words resolves to one canonical skill.
- **G3 Explainable:** every result carries a plain-language reason; no black-box scores.
- **G4 Actionable:** skill gaps lead to learning pathways from a supplied catalogue.
- **G5 Live:** profile changes reflect in eligibility and ranking within one second, visibly.
- **G6 Decision support, not decision making:** opportunity-stated criteria are final; humans stay accountable.


### Guiding principles

| Principle | Meaning in the product |
|---|---|
| Rules decide, AI assists | AI never touches the eligibility result. It can suggest skills and similarity that adjust rank. |
| Unknown is not eligible | Missing data yields 'Need more information', never a silent pass or fail. |
| Show your work | Each decision stores the rule, inputs and outcome so it can be explained and audited. |
| Plain language | Explanations are readable by someone with no technical or policy background; English first, Hindi/Marathi-ready strings. |
| Manual-first data | Opportunities are entered by humans in MVP; no scraping, no assumption of external feeds. |


## 3. Problem Statement, Users and Personas


### Problem

- Listings describe one skill in many wordings, so keyword search hides qualified candidates.
- Eligibility conditions (must meet) and preferences (affect ranking) are commonly mixed up.
- Candidates do not know *why* an opportunity is missing or what to learn to qualify.
- Profile changes (a new certificate, a move to another district) do not instantly change what is available.


### User roles

| Role | Description | Key needs |
|---|---|---|
| Candidate / trainee | Job seeker or trainee building a profile | Find takeable roles, understand reasons, see gaps, learn |
| Opportunity officer | Staff who enter and maintain opportunities | Fast structured entry, validation, preview of who would match |
| Catalogue manager | Team member who maintains skills and learning catalogue | Add skills, aliases, courses, prerequisites |
| Programme admin | Oversees programme and audit | Dashboards, audit logs, configuration, role control |
| Evaluator (read-only) | Reviews decision support quality | Trace any result to its rule and inputs |


### Personas

| Persona | Situation | What RozgarLink does |
|---|---|---|
| Asha, 22, Pune | ITI Electrician, lists 'wiring, panel fitting, MCB install' | Maps to canonical 'Electrical wiring'; sees 3 eligible roles; one Nashik role marked not eligible (residence rule) with exact reason |
| Rahul, 27, Nagpur | 12th pass, 'tally, gst filing, excel' | Aliases resolve to Accounting software and Excel; diploma-required role shows 'Requires Diploma. You have: 12th pass'; learning pathway suggested |
| Meena, 34, Kolhapur | Returning to work, tailoring skills, prefers short commute | Preference-only commute filter reorders results but never hides eligible ones |
| Officer Kiran | Enters 40 apprenticeships a week | Uses a rule builder; sees live count of 'candidates who would be eligible' |


### Out-of-scope users for MVP

Employers self-serve posting, recruiters bulk-importing candidates, and minors under programme-defined minimum age are not supported in MVP.


## 4. Scope, Assumptions and Success Metrics

| In scope (MVP) | Out of scope (later) |
|---|---|
| Candidate profile CRUD with skills, qualifications, location, preferences | Application submission and tracking |
| Manual opportunity entry with structured eligibility rules | Automated scraping or feeds |
| Skill taxonomy, aliases, AI extraction and similarity | Live course-provider APIs or enrolment |
| Eligibility engine, ranking, explanations | Resume file parsing (PDF/DOC) beyond text paste |
| Skill gap analysis and catalogue-based pathways | Predictive hiring outcomes or auto-decisions |
| Live recompute and visible change highlighting | Native mobile apps (responsive web first) |
| Role-based access, audit log, English UI with i18n hooks | Full multilingual content |


### Assumptions

- Opportunities and the learning catalogue are supplied and maintained by the team; volumes up to 10,000 opportunities and 100,000 candidates at MVP.
- A qualification ladder (e.g. 8th, 10th, 12th, ITI, Diploma, Graduate, Postgraduate) is configured by the programme.
- Location is captured as state, district and optional pincode; distance uses district centroids (no live maps needed).
- AI service is an external LLM/embedding API; the system must work, with reduced skill matching, if it is unavailable.


### Success metrics

| Metric | Target | How measured |
|---|---|---|
| Ineligible shown as eligible | 0 (hard gate) | Automated rule test suite + production audit sample |
| Alias recognition accuracy | 95% or higher on labelled test set of 300 phrases | Offline evaluation each release |
| Explanation coverage | 100% of results have a reason | Contract test on API response |
| Recompute latency (profile change to UI update) | p95 under 1 second | Performance trace |
| Candidate understands failed condition | 85% in usability test (5 users, task-based) | Moderated testing |
| Pathway availability for common gaps | 90% of gaps map to at least one catalogue course | Catalogue coverage report |


## 5. Core Principle: Eligibility vs Preference

This is the heart of RozgarLink. Every attribute of an opportunity is classified at entry time as either an **Eligibility Criterion** or a **Preference Attribute**. The classification is explicit, visible and cannot be inferred by AI.

|  | Eligibility criterion (mandatory) | Preference attribute (ranking only) |
|---|---|---|
| Examples | Minimum qualification, residence state/district, age range, required certification, minimum experience | Commute distance, pay range, shift, work type, sector interest |
| Effect if not met | Opportunity is NOT an eligible match, regardless of skill fit | Opportunity stays eligible; rank is lower |
| Defined by | The opportunity (officer enters it) | Candidate states preferences; opportunity supplies attribute values |
| Uses AI? | Never | Inputs may be AI-informed (skill similarity) |
| Appears in UI as | Pass / Fail / Unknown chips with exact condition | 'Why this ranks here' score breakdown |


### Three-valued evaluation

| Result | Meaning | Where the opportunity appears |
|---|---|---|
| PASS | Candidate data satisfies the criterion | Counts toward eligibility |
| FAIL | Candidate data present and does not satisfy it | Opportunity moves to Not eligible, with the failing criterion named |
| UNKNOWN | Candidate data required is missing or unverified | Opportunity moves to Need more information |

Opportunity status = ELIGIBLE if all mandatory criteria PASS; NOT_ELIGIBLE if any FAIL; NEEDS_INFO if none FAIL but at least one UNKNOWN.


### Decision flow

```
for each opportunity O, for candidate C:
  results = [ evaluate(rule, C) for rule in O.eligibilityRules ]
  if any(r == FAIL):        status = NOT_ELIGIBLE   (list all failed rules)
  elif any(r == UNKNOWN):   status = NEEDS_INFO     (list missing fields)
  else:                     status = ELIGIBLE       -> goes to ranking
ranking(O, C) is called ONLY when status == ELIGIBLE
```

> **Hard architectural guarantee** The ranking module cannot be imported by, and has no write access to, the eligibility module. Eligibility takes only structured profile facts as input; the AI skill layer outputs are not in its type signature. A unit test fails the build if this dependency appears.


### Edge cases

- A candidate with a perfect skill match but missing certification: NOT_ELIGIBLE, with message 'Requires Fire Safety Certificate. You have: none on profile.'
- A required skill is *not* an eligibility criterion unless the officer explicitly adds a 'Certification required' rule; skill shortfalls affect rank and appear as gaps.
- Multiple failures are all listed, ordered by candidate effort to fix (qualification, certification, experience, then residence, age).


## 6. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Candidate registers/logs in and creates a profile with skills, qualifications (level, field, year), location (state, district), and preferences | Must |
| FR-02 | Candidate may enter skills as tags or free text; system extracts canonical skills and shows them for confirm/edit | Must |
| FR-03 | Officer creates opportunities with title, description of work involved, location, required skills (with importance), optional skills | Must |
| FR-04 | Officer defines eligibility criteria via a rule builder; each rule has type, operator, value and a plain-language label | Must |
| FR-05 | Officer defines preference attributes (pay, shift, work type, sector) for ranking | Must |
| FR-06 | System evaluates all eligibility rules deterministically; AI output is never an input | Must |
| FR-07 | System ranks only eligible opportunities using skill fit, preference fit and proficiency | Must |
| FR-08 | System recognises skills described in different words via alias dictionary then AI similarity | Must |
| FR-09 | Every eligible result displays plain-language reasons for its rank | Must |
| FR-10 | Every not-eligible result names each failed condition and the candidate's current value | Must |
| FR-11 | Opportunities with missing candidate data appear under Need more information with the missing field named | Must |
| FR-12 | Candidate marks interest; system shows missing required skills (gap analysis) | Must |
| FR-13 | System suggests learning pathways from the supplied catalogue; sequencing respects prerequisites | Must |
| FR-14 | Any change in qualification, location, skills or preferences recomputes and updates results immediately with visible change markers | Must |
| FR-15 | Candidate can adjust preference weights (e.g. commute importance) and see the rank effect | Should |
| FR-16 | Officer sees preview: number of sample candidates eligible for the opportunity as rules are edited | Should |
| FR-17 | Catalogue manager maintains skills, aliases, courses, prerequisites via UI and CSV import | Must |
| FR-18 | Audit log of eligibility decisions, rule changes and AI suggestions accepted/rejected | Must |
| FR-19 | 'What if' view: candidate previews eligibility if they gained a qualification or moved (not saved) | Could |
| FR-20 | Exportable match report (PDF) for a candidate to take to a counsellor | Could |


## 7. Data Model

| Entity | Key fields | Notes |
|---|---|---|
| User | id, role, email/phone, name, language | Roles: candidate, officer, catalogue_manager, admin, evaluator |
| Candidate | id, userId, state, district, pincode, dob, preferences(json), updatedAt | One-to-one with user |
| Qualification | id, candidateId, level(ordinal), field, institution, year, verified(bool) | Level maps to configured ladder |
| Certification | id, candidateId, name, issuer, validTill | Matched by canonical certification code |
| CandidateSkill | candidateId, skillId, proficiency(1-5), source(manual/ai), confirmed(bool), confidence | AI-suggested skills need confirmation |
| Skill | id, canonicalName, category, description | Taxonomy |
| SkillAlias | id, skillId, phrase, language | Dictionary layer |
| Opportunity | id, title, workDescription, state, district, status, closesOn, createdBy | Entered manually |
| OpportunitySkill | opportunityId, skillId, importance(required/preferred), weight | Skill fit input |
| EligibilityRule | id, opportunityId, type, operator, value(json), label | Mandatory; deterministic |
| PreferenceAttribute | opportunityId, key(pay/shift/type/sector), value | Ranking only |
| LearningResource | id, title, provider, durationHours, level, mode, url(optional), cost | Team-supplied catalogue |
| ResourceSkill / Prerequisite | resourceId, skillId, depth / resourceId, requiresResourceId | Pathway graph |
| MatchResult (cache) | candidateId, opportunityId, status, score, explanation(json), computedAt | Rebuildable; never source of truth |
| AuditEvent | id, actor, type, entity, before, after, at | Immutable, append-only |


### Key relationships

A Candidate has many Qualifications, Certifications and CandidateSkills. An Opportunity has many EligibilityRules, OpportunitySkills and PreferenceAttributes. A LearningResource teaches many Skills and may require other LearningResources. MatchResult is derived and can be deleted and recomputed at any time.


### Qualification ladder (configurable example)

| Ordinal | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| Level | 8th | 10th | 12th | ITI | Diploma | Graduate | Postgraduate |

Rule 'minimum qualification = Diploma' passes for ordinal 5 or above. Field-specific rules (e.g. 'ITI in Electrician') use level plus a field code. Equivalences (e.g. ITI counts as 12th for a given opportunity) are explicit rules, never guessed.


## 8. Eligibility Engine Specification

| Rule type | Operators | Value example | Candidate data used | Plain-language label |
|---|---|---|---|---|
| QUAL_MIN_LEVEL | gte | Diploma | Highest verified/stated qualification | Requires at least a Diploma |
| QUAL_FIELD | in | ITI: Electrician, Wireman | Qualification level and field | Requires ITI in Electrician or Wireman |
| RESIDENCE_STATE | in | Maharashtra | Candidate state | Open to residents of Maharashtra |
| RESIDENCE_DISTRICT | in | Pune, Nashik | Candidate district | Open to residents of Pune or Nashik |
| AGE_RANGE | between | 18-35 | Computed from date of birth, as on reference date | Age 18 to 35 as on 1 Jan 2027 |
| CERT_REQUIRED | has | Fire Safety Certificate | Valid certifications | Requires a valid Fire Safety Certificate |
| EXPERIENCE_MIN | gte | 12 months in electrical | Work experience entries | Requires 12 months of electrical experience |
| ATTRIBUTE | eq / in | Admin-defined field | Custom profile attribute | Programme-defined; see note |


### Evaluation contract

```
type RuleResult = { ruleId, outcome: 'PASS'|'FAIL'|'UNKNOWN',
                    label, candidateValue, requiredValue, missingField? }
evaluate(rule: EligibilityRule, profile: CandidateFacts): RuleResult   // pure, no I/O, no AI
evaluateOpportunity(rules, profile) -> { status, results[] }
```


### Behaviour requirements

- **Pure and deterministic:** same inputs always give the same output; no randomness, no network calls, no model calls.
- **Versioned rules:** editing a rule creates a new rule version; MatchResult stores the version it used.
- **Reference date:** age and validity rules use an explicit date stored on the opportunity, so results are reproducible.
- **Unknown handling:** if the needed candidate field is empty, return UNKNOWN with the missing field.
- **Exhaustive reporting:** evaluate all rules (no short-circuit) so the candidate sees every failure at once.
- **Verification flag:** programme may require 'verified' qualifications; unverified ones return UNKNOWN for rules marked requiresVerification.

> **Sensitive attributes** Rules on sensitive personal attributes (for example reservation category) are disabled by default. They can be enabled only by a programme admin where the opportunity's governing scheme requires them, with the field marked sensitive, access-controlled and excluded from AI prompts and analytics.


## 9. Skill Normalisation and AI Guardrails


### Three-layer skill recognition

| Layer | Method | Output | Used for |
|---|---|---|---|
| 1. Dictionary | Normalise text (lowercase, strip punctuation, stem), exact/fuzzy match against Skill and SkillAlias | Canonical skill, confidence 1.0 | Ranking and display |
| 2. Embedding match | Embed phrase; nearest canonical skills by cosine similarity above threshold | Candidate skill list + similarity | Ranking (partial credit) |
| 3. LLM judgement | Prompt with the phrase and shortlist; return structured JSON: skill, relation (same/related/unrelated), confidence, short reason | Validated suggestion | Suggest to candidate/officer |


### Relation credit used by ranking

| Relation | Condition | Credit |
|---|---|---|
| Same skill (alias or confirmed) | Dictionary hit or LLM 'same' and similarity at least 0.85 | 1.00 |
| Closely related | Similarity 0.70 to 0.85 or LLM 'related' with confidence at least 0.7 | min(0.85, similarity) |
| Unrelated | Below 0.70 | 0 |


### Guardrails (non-negotiable)

- **No AI in eligibility.** AI outputs are not accepted by any function in the eligibility module.
- **Human confirmation:** AI-extracted skills on a profile are flagged 'suggested' until the candidate confirms; unconfirmed ones earn at most 50% credit.
- **Structured outputs only:** LLM responses are validated against a JSON schema; invalid output is discarded and logged.
- **Cache and cost control:** phrase to skill resolutions are cached; repeated phrases never call the model again.
- **Graceful degradation:** if AI is down, layer 1 still works; new unknown phrases are queued and shown as 'we will review this skill'.
- **Learning loop:** catalogue manager reviews queued phrases weekly and promotes good ones to SkillAlias, improving the dictionary.
- **Privacy:** only skill phrases are sent to the AI service; no names, contact details or sensitive attributes.
- **Transparency:** the UI marks AI-assisted matches with a small label and the reason sentence.


### Example

| Candidate wrote | Resolved skill | Layer | Credit |
|---|---|---|---|
| advanced excel, ms-excel | Spreadsheet (Excel) | Dictionary | 1.00 |
| tally prime, gst returns | Accounting software; Tax filing | Dictionary | 1.00 |
| fixing home power points | Electrical wiring (related) | LLM + embedding, confirmed | 0.85 |
| playing cricket | No match | Embedding below threshold | 0 |


## 10. Ranking Engine

Ranking runs only on opportunities whose status is ELIGIBLE. Score is 0 to 100 and is fully decomposable into the parts below so it can be explained.

```
Score = 100 x ( 0.55 x SkillFit + 0.30 x PreferenceFit + 0.15 x ProficiencyFit )
```

| Component | Definition | Range |
|---|---|---|
| SkillFit | Weighted average over opportunity skills of relation credit. Required skills weight 3, preferred skills weight 1. Missing skill = 0 | 0 to 1 |
| PreferenceFit | Average of preference sub-scores using candidate's weights (default equal): commute, pay, shift, work type, sector | 0 to 1 |
| ProficiencyFit | For matched skills, min(1, candidate proficiency / required proficiency), weighted as above; default 1 if none specified | 0 to 1 |


### Preference sub-scores

| Preference | Rule |
|---|---|
| Commute | 1.0 within preferred km; linear fall to 0 at 2x preferred; 0.5 if remote/hybrid allowed and candidate open to it |
| Pay | 1.0 if offered at or above expected minimum; proportional below; 0.5 if pay not stated |
| Shift / work type / sector | 1.0 match, 0.5 flexible or unspecified, 0.0 mismatch (never excludes the opportunity) |


### Tie-breakers and rules

- Ties broken by: higher SkillFit, then nearer closing date, then newer posting.
- Weights live in configuration, versioned, and shown in the explanation ('skills 55%, preferences 30%, proficiency 15%').
- Candidates may re-weight preferences only; skill weight is fixed to protect fairness and explainability.
- A preference mismatch can never remove an eligible opportunity from the list; it can only lower its rank.
- Ranking is deterministic given the same inputs and AI relation credits (cached), so repeated views are stable.


### Worked example

| Opportunity (eligible) | SkillFit | PrefFit | ProfFit | Score | Reason in words |
|---|---|---|---|---|---|
| Electrician Apprentice, Pune | 0.92 | 0.85 | 1.00 | 91 | Matches all required skills; 8 km commute within your 15 km; pay meets target |
| Wiring Technician, Pimpri | 0.78 | 0.60 | 0.90 | 74 | One related skill (partial credit); night shift differs from preference |


## 11. Explanation Engine

Explanations are generated by **templates over structured data** (rule results and score components), not free-form AI text, so they are always accurate and consistent. An optional language polish step may rephrase, but cannot add facts.


### Eligible match explanation template

```
Ranked #{rank} (score {score}/100) because:
  + Skills: you have {n_exact} of {n_required} required skills ({list}); {related_note}
  + Preferences: {commute_sentence}; {pay_sentence}; {shift_sentence}
  - Gaps: {missing_required_skills or 'none'}
You meet all eligibility conditions: {criteria_list}
```


### Not-eligible explanation template

```
Not eligible: {failed_label}.
Your profile: {candidate_value}.   Required: {required_value}.
How you could qualify: {fix_hint or 'not changeable'}
```


### Examples

| Case | Message shown |
|---|---|
| Eligible, rank 1 | Ranked #1 (91/100): you have 4 of 4 required skills. 'Fixing home power points' was matched to Electrical wiring and confirmed by you. Commute is 8 km, within your 15 km preference. You meet all conditions: ITI Electrician, resident of Maharashtra, age 22. |
| Not eligible - residence | Not eligible: open to residents of Nashik and Pune districts only. Your profile: district Satara. This cannot be changed by learning; update your location if it is out of date. |
| Not eligible - qualification | Not eligible: requires at least a Diploma. Your profile: 12th pass. A Diploma in Electrical Engineering would meet this. |
| Not eligible - two failures | Two conditions not met: (1) requires Fire Safety Certificate, you have none; (2) age limit 18-30, you are 32. |
| Needs info | We cannot check this yet: requires a valid driving licence. Add your licence details to see if you are eligible. |


### Requirements

- Reasons must name the **specific** condition, never generic text like 'does not meet criteria'.
- Reading level target: Grade 8; no jargon such as 'embedding' or 'threshold' in candidate-facing text.
- All strings are keyed for translation (English, Hindi, Marathi) with the same placeholders.
- Explanations are stored with MatchResult and the rule/weight versions used, for audit.


## 12. Skill Gaps and Learning Pathways


### Gap analysis (triggered when candidate marks 'Interested')

- Compare the opportunity's required and preferred skills to the candidate's confirmed skills (with relation credit below 0.85 counted as partial gap).
- Gap list shows each missing skill, importance, and whether it is a full gap or a partial gap ('you have related experience').
- Gap analysis also runs for Not eligible opportunities the candidate is interested in, but it shows eligibility blockers separately from skill gaps, because courses cannot fix residence.


### Learning catalogue (supplied by the team)

| Field | Description |
|---|---|
| id, title, provider (text label) | Provider is a name only; no live access assumed |
| skillsTaught[] | Canonical skill ids with level reached |
| prerequisites[] | Other catalogue items or skills required first |
| durationHours, mode, language, cost | Used for sorting and filters |
| url (optional) | Static link opened by the candidate; system never calls it |
| qualificationAwarded (optional) | Lets pathways suggest ways to meet eligibility, e.g. a Diploma or certificate |


### Pathway algorithm

```
missing = requiredSkills - candidateSkills                    (partial gaps included)
candidates = catalogue items teaching any skill in missing
choose a minimum-cost cover of 'missing' (greedy set cover, tie-break: fewer hours, lower cost)
expand prerequisites by topological order, skipping ones candidate already has
output ordered steps with total hours and 'skills you will gain' per step
```


### Pathway output

| Step | Course | Hours | Skills gained | Why |
|---|---|---|---|---|
| 1 | Basics of Industrial Safety | 10 | Safety procedures | Prerequisite for step 2 |
| 2 | Panel Wiring and Fault Finding | 40 | Panel wiring, Fault finding | Closes 2 of 2 missing required skills |

- If no catalogue item teaches a missing skill, the UI says 'No course in our catalogue yet' and logs it for the catalogue manager.
- Eligibility blockers with a qualification route (e.g. Diploma) are shown as 'To become eligible' pathways using qualificationAwarded.
- Pathways recompute when the candidate marks a course as completed, which adds the skill as 'learned (self-reported)' pending verification.


## 13. Real-Time Updates

Requirement: when a candidate changes qualifications or location (and also skills or preferences), eligibility and rankings update **immediately and visibly**.


### Event flow

| Step | Action | Target time |
|---|---|---|
| 1 | Candidate saves a change (e.g. adds ITI qualification). API validates and writes in one transaction | under 100 ms |
| 2 | Change triggers recompute job for that candidate only (not the whole system) | under 50 ms |
| 3 | Engine prefilters opportunities (open, relevant geography) then evaluates rules in memory | under 300 ms for 10k opportunities |
| 4 | Ranking and explanations built for eligible ones; MatchResult upserted | under 300 ms |
| 5 | Server-Sent Event 'matches.updated' with diff pushed to open sessions | under 100 ms |
| 6 | UI animates changes and shows a change banner | immediate |


### Visible change markers

| Change | UI treatment |
|---|---|
| Became eligible | Card moves up with 'New: now eligible' badge and the rule that flipped (e.g. 'You now meet: ITI Electrician') |
| No longer eligible | Card moves to Not eligible with 'Changed' badge and the failed rule |
| Rank moved | Arrow with delta, e.g. '+3 places'; explanation refreshed |
| Needs info resolved | Card leaves 'Need more information' into the correct list |
| Summary banner | 'Your change updated 6 results: 2 newly eligible, 1 no longer eligible, 3 re-ranked' with Undo (restores previous profile value) |


### Consistency requirements

- The save call returns only after recompute finishes for the optimistic result, so a refresh never shows stale state.
- Opportunity or rule edits by an officer trigger recompute for affected candidates in a background queue; candidates with an open session receive a push.
- Rapid successive edits are debounced (150 ms) and collapsed; the latest state always wins.
- If push fails, the client polls /matches?since=version every 5 seconds as a fallback.
- Every result carries profileVersion so the UI can detect and discard out-of-order updates.


## 14. UI/UX Specification (FutoraOne Design Language)

RozgarLink ships inside the **FutoraOne** app shell: mobile-first, white rounded cards on a soft grey-blue canvas, pill filters, blue primary actions, a four-tab bottom bar (**Home, Match, Learn, Profile**) and a floating **AI** button. Same patterns, new content.

| FutoraOne screen | RozgarLink content | Key elements |
|---|---|---|
| Home | 'Your Career Path Starts Here' hero, search (opportunities, skills, courses), quick tiles: Match, Learn, Explore, Profile | Recommended for you = top eligible matches; Top Matches strip; profile-strength nudge |
| Match | Header 'Match' with pill filters: **All, Eligible, Need info, Not eligible** | Card = title, location, 'Eligible' green dot, score, top 3 reasons, skill chips, **Interested** button (replaces Connect); Not-eligible cards show the failed rule in a red-tinted strip, no score |
| Opportunity detail | Work involved; two blocks: 'You must have' (eligibility) and 'These affect ranking' (preferences); your status per rule | Reinforces the eligibility vs preference split |
| Learn | Pill tabs **Courses, Paths, Practice**; course-path cards with progress bar and 'x/y modules' | Paths = gap pathways from the catalogue; 'Mark completed' adds a self-reported skill |
| Profile | Stats row: Courses completed, Skills confirmed, Interested; profile-strength ring; learning streak | Menu: My Courses, Saved, Settings, Help & Support; inline edit of qualification/location with instant recompute and Undo |
| AI button (floating) | Ask AI: 'Why am I not eligible?', 'What should I learn?', skill extraction from free text | Explains stored rule results; **never** changes eligibility; AI-assisted items carry a small label |
| Officer console (web) | Opportunity form, rule builder, eligible-candidate preview, catalogue manager, audit, admin | Desktop layout using the same cards, pills and blue actions |


### UX requirements

- Colour is never the only signal: Pass/Fail/Unknown use icons and words as well as colour.
- Failed conditions appear as a plain sentence at the top of an ineligible card, not hidden in details.
- Eligible and Not eligible lists are visually separate; scores never appear on ineligible cards.
- Accessibility WCAG 2.1 AA, 44 px tap targets, screen-reader labels, light on bandwidth (initial JS under 300 KB).
- English plus Hindi and Marathi string files ready; empty states guide the next action ('Add your qualification to unlock 4 more opportunities').
- Live change banner after any profile edit: '2 newly eligible, 1 no longer eligible, 3 re-ranked' with Undo.


### Key user flow

```
Sign in -> Complete profile -> Match loads (eligible ranked, not eligible with reasons)
-> Tap card -> why / failed rule -> Interested -> gap + Learn path
-> Edit location or qualification -> results change instantly with banner and badges
```


## 15. System Architecture and Technology

```
[ Web app: Next.js + TypeScript + Tailwind ]
          |  REST + Server-Sent Events
          v
[ API: Node.js + Express + TypeScript ]
   |-- Auth and RBAC middleware
   |-- Profile service      |-- Opportunity service
   |-- Matching service:  eligibility-engine (pure) | ranking-engine | explainer
   |-- Skill service: dictionary + embeddings + LLM client + cache
   |-- Pathway service (catalogue graph)
   |-- Event bus (in-process / Redis pub-sub) -> SSE gateway
          |
          v
[ PostgreSQL + pgvector ]   [ Redis cache / queue ]   [ External LLM / embedding API ]
```

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind | Company standard stack; SSR for fast low-bandwidth loads |
| Backend | Node.js, Express, TypeScript, Zod validation | Shared types with frontend; schema-validated inputs |
| Database | PostgreSQL with pgvector (or in-memory vectors for MVP) | Relational integrity for rules; vector search for skills |
| Cache and queue | Redis (BullMQ) | Skill phrase cache, background recompute |
| Realtime | Server-Sent Events (WebSocket optional) | Simple, one-way updates, proxy friendly |
| AI | Claude API for extraction and relation judgement, embeddings model for similarity | Structured JSON output, swap-able provider interface |
| Hosting | Containerised (Docker), cloud region in India | Data residency; easy scaling |
| Observability | Structured logs, OpenTelemetry traces, Sentry | Trace any decision |


### Module boundaries

- **eligibility-engine**: pure TypeScript package, zero dependencies on AI, DB or network; 100% unit-test coverage target.
- **ranking-engine**: receives only ELIGIBLE opportunities and cached relation credits.
- **explainer**: templates plus i18n catalogue; deterministic.
- **skill-service**: only component that talks to the AI provider; returns structured, validated results.
- **match-orchestrator**: coordinates the above, writes MatchResult, publishes events.


### Scaling notes

Prefilter by state/district, closing date and status using indexed columns before in-memory rule evaluation. For 10k opportunities, evaluation is a tight loop of simple comparisons. Recompute is per candidate; officer rule changes enqueue affected candidates in batches.


## 16. API Specification (REST + SSE)

| Method and path | Purpose | Notes |
|---|---|---|
| POST /auth/login, /auth/otp | Authenticate | JWT with role claim |
| GET/PUT /candidates/me | Read/update profile | Triggers recompute; returns profileVersion |
| POST /candidates/me/qualifications | Add qualification | Also PATCH/DELETE by id |
| POST /candidates/me/skills/extract | Free text to suggested canonical skills | AI-assisted; returns confidence and reason |
| PUT /candidates/me/skills | Confirm/edit skills | Sets confirmed=true |
| GET /matches | Eligible, needsInfo, notEligible with explanations | Query: since, filters, weights |
| GET /matches/{opportunityId} | Full per-rule breakdown | Includes rule results and score parts |
| POST /matches/whatif | Preview with hypothetical profile changes | Not persisted |
| POST /interests | Mark Interested | Returns gap analysis |
| GET /opportunities/{id}/gap | Skill gap and pathway | Uses catalogue |
| POST/PUT /opportunities | Create/update opportunity with rules | Officer only; validates rules |
| POST /opportunities/{id}/preview-eligibility | Sample-candidate eligibility count | Officer tool |
| CRUD /skills, /aliases, /courses | Catalogue management | Catalogue manager; CSV import endpoint |
| GET /audit | Search audit events | Admin, evaluator |
| GET /events (SSE) | Stream matches.updated, catalogue.updated | Auth by token |


### Sample response: GET /matches

```
{ "profileVersion": 42,
  "eligible": [ { "opportunityId": "OP-117", "rank": 1, "score": 91,
       "reasons": ["Has 4 of 4 required skills", "Commute 8 km within preference"],
       "criteria": [ {"label":"ITI Electrician","outcome":"PASS"} ],
       "gaps": [] } ],
  "notEligible": [ { "opportunityId": "OP-203",
       "failed": [ {"label":"Open to residents of Nashik or Pune","candidateValue":"Satara",
                    "outcome":"FAIL"} ] } ],
  "needsInfo": [ { "opportunityId": "OP-301", "missingField": "drivingLicence" } ],
  "changes": { "newlyEligible": ["OP-117"], "noLongerEligible": [], "rankMoved": 3 } }
```

- All inputs validated with Zod; all endpoints rate limited; errors use RFC 7807 problem details.
- Idempotency key supported on POST requests that create data; API versioned under /v1.


## 17. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | Recompute p95 under 1 s end-to-end; matches list loads under 2 s on 3G; supports 500 concurrent sessions at MVP |
| Availability | 99.5% monthly; AI outage must not stop matching (degrades to dictionary-only) |
| Security | OWASP ASVS L2; JWT with short expiry and refresh; RBAC on every endpoint; rate limiting; secrets in vault; dependency scanning |
| Privacy and compliance | Align with India's Digital Personal Data Protection Act 2023: purpose limitation, consent capture, data export and delete on request, minimal data to AI vendor, India data residency |
| Auditability | Append-only AuditEvent for rule edits, eligibility decisions, AI suggestions and overrides; retained 3 years; searchable by candidate and opportunity |
| Fairness | No use of gender, religion, caste or disability in ranking; sensitive eligibility fields only where scheme demands; quarterly review of outcome distribution by district and qualification level |
| Explainability | Every result reproducible from stored inputs, rule versions, weights version and cached AI relation credits |
| Accessibility | WCAG 2.1 AA; screen-reader and keyboard friendly; plain-language content |
| Localisation | String catalogue for English, Hindi, Marathi; right-to-left not required at MVP |
| Maintainability | TypeScript strict mode; CI with lint, type-check, unit, integration and E2E tests; infra as code |
| Data quality | Opportunity form blocks conflicting rules (e.g. age 30-20), flags missing eligibility; skill dictionary reviewed weekly |
| Backup and recovery | Daily backups, RPO 24 h, RTO 4 h; MatchResult can be rebuilt from source of truth |


### Human oversight

RozgarLink is decision support. Screens display 'Eligibility follows the criteria stated by the opportunity; confirm with the issuing office before applying.' Officers can correct an opportunity's rules at any time; candidates can contest a result by flagging it, which creates a review ticket with the full decision trace attached.


## 18. Test Plan and Acceptance Criteria


### Acceptance criteria mapped to the challenge

| Challenge requirement | Acceptance test | Pass condition |
|---|---|---|
| Eligibility separate from preference ranking | AT-01: candidate with 100% skill match fails residence rule | Opportunity in Not eligible; never in ranked list |
| Rank only eligible opportunities | AT-02: inspect ranking input in 1,000 randomised profiles | Zero non-eligible items scored |
| Different wording, same skill | AT-03: 300 labelled phrases | At least 95% resolve correctly; failures logged |
| AI must not decide eligibility | AT-04: disable AI entirely; compare eligibility outputs | Identical eligibility results with and without AI |
| Explain eligible rank | AT-05: all eligible results include reasons | 100% coverage, readable, correct figures |
| Explain failed condition | AT-06: each failed rule shown with candidate value | Specific rule label present for 100% |
| Skill gaps and pathways | AT-07: mark interested; compare to catalogue | Gaps correct; pathway respects prerequisites; no network calls |
| Immediate visible updates | AT-08: change qualification and location | UI updates under 1 s with banner and badges |
| Decision support | AT-09: disclaimer and audit trail present | Decision trace retrievable for any result |


### Test layers

| Layer | Scope | Tooling |
|---|---|---|
| Unit | Every rule type with pass/fail/unknown boundaries (age on exact birthday, ladder boundaries); score components; explanation templates | Vitest, property-based tests (fast-check) |
| Contract | API schemas, i18n placeholders, SSE event shapes | Zod schemas, Pact-style tests |
| Integration | DB, queues, recompute, caching, AI client with mocked responses | Testcontainers |
| AI evaluation | Alias and relation accuracy on labelled set; prompt regression | Offline eval harness each release |
| E2E | Candidate and officer journeys, including live update scenarios | Playwright |
| Non-functional | Load, accessibility, security scans | k6, axe, ZAP |


### Critical guard tests (block release)

- Eligibility module has no import path to AI or ranking modules (static dependency check).
- Property test: for any profile, any opportunity with a FAIL rule is never returned in eligible list.
- Determinism test: same inputs give byte-identical eligibility output across 100 runs.


## 19. Seed Data and Demo Scenarios


### Seed dataset (for demo and tests)

| Dataset | Size | Contents |
|---|---|---|
| Skills | 40 canonical | Electrical wiring, Panel fitting, Spreadsheet, Accounting software, Tax filing, Tailoring, CNC basics, Customer service, Data entry, etc. |
| Aliases | 200+ | 'ms excel', 'advanced excel', 'tally', 'gst filing', 'stitching', 'sewing machine operation', 'mcb installation' ... |
| Opportunities | 30 | Apprenticeships and jobs across Maharashtra districts with mixed rules and preferences |
| Candidates | 6 | Asha, Rahul, Meena and three edge-case profiles (missing data, borderline age, unverified qualification) |
| Courses | 20 | Safety basics, Panel wiring, Excel for work, Tally with GST, Diploma bridging, Spoken English, etc., with prerequisites |


### Demo scenarios (must work end to end)

| # | Scenario | Expected outcome |
|---|---|---|
| A | Asha moves her district from Pune to Satara | Two residence-restricted roles flip to Not eligible instantly; banner reports changes; explanation names 'Open to residents of Pune or Nashik' |
| B | Rahul adds a Diploma | Two Diploma-required roles become eligible and appear ranked with 'New: now eligible' badges |
| C | Alias test: Rahul writes 'tally prime, gst returns' | Mapped to Accounting software and Tax filing; matched without keyword overlap; marked as dictionary match |
| D | Meena sets commute importance to high | Order of eligible list changes; nothing disappears; explanation updates |
| E | Candidate with perfect skills but too old | Role is Not eligible with 'age limit 18-30, you are 32'; rank not computed |
| F | Mark 'Interested' on role needing two missing skills | Gap list plus 2-step pathway with prerequisites and total hours |
| G | Missing licence data | Role appears in Need more information with the missing field |
| H | AI service switched off | Dictionary matching and all eligibility work unchanged; new phrase queued for review |
| I | Officer changes a rule on a live opportunity | Affected candidates receive push; lists update; audit log shows before/after |

> **Demo script (8 minutes)** 1) Show opportunity form with rule builder  2) Log in as Asha, view matches  3) Change district, watch live update  4) Open a not-eligible card  5) Mark interested, show pathway  6) Add Diploma as Rahul  7) Turn AI off, show eligibility unchanged  8) Show audit trace.


## 20. Roadmap, Risks and Open Questions


### Delivery plan (10 weeks)

| Phase | Weeks | Deliverables | Exit criteria |
|---|---|---|---|
| 0. Foundations | 1 | Repo, CI, schema, auth/RBAC, design system | Hello-world deploy |
| 1. Core engine | 2-4 | Eligibility engine, rule builder, ranking, explainer, seed data | AT-01, AT-02, AT-04, AT-05, AT-06 pass |
| 2. Skills and AI | 4-6 | Dictionary, embeddings, LLM extraction, confirmation UI, cache | AT-03 at 95% or higher |
| 3. Gaps and pathways | 6-7 | Catalogue management, gap analysis, pathway builder | AT-07 pass |
| 4. Live updates | 7-8 | Recompute pipeline, SSE, change markers, what-if | AT-08 pass; p95 under 1 s |
| 5. Hardening | 9-10 | Accessibility, security, load test, audit, i18n, demo polish | All acceptance tests green; pilot ready |


### Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| AI maps unrelated skills as the same | Poor ranking | Confidence thresholds, candidate confirmation, weekly review, capped credit |
| Officers enter rules wrongly | Wrong eligibility | Rule builder validation, plain-language preview, second-officer approval option, audit |
| Candidate gives inaccurate data | Wrong results | Verification flag, disclaimers, 'confirm with issuing office' notice |
| Catalogue lacks courses | Weak pathways | Gap queue to catalogue manager; show honest 'no course yet' |
| Ambiguous equivalence (e.g. ITI vs 12th) | Wrong pass/fail | Explicit equivalence rules per opportunity, never inferred |
| Bias in ranking | Unfair outcomes | No protected attributes in ranking; quarterly distribution review |
| AI vendor outage or cost spike | Reduced skill matching | Dictionary fallback, cache, rate budget |


### Open questions for stakeholders

- Which qualification ladder and equivalences does the programme officially recognise?
- Are any sensitive-attribute eligibility rules legally required for the first schemes, and who approves them?
- Is candidate qualification self-declared in MVP, or must it be verified against documents?
- Which languages are mandatory at launch, and who supplies translations?
- What is the format of the team-supplied learning catalogue (CSV, sheet), and who owns updates?

> **Definition of done** All 20 requirements of the challenge demonstrated through acceptance tests AT-01 to AT-09, scenarios A to I run live, audit trace retrievable for any result, and zero ineligible opportunities ever shown as eligible.



---

========================================
# FILE: docs/trd.md
========================================

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


---

========================================
# FILE: docs/brain.md
========================================

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


---

========================================
# FILE: docs/ASSUMPTIONS.md
========================================

# ASSUMPTIONS - RozgarLink

This document records sensible engineering and product decisions made during implementation where specifications were open or environment constraints applied.

---

### 1. Database & Persistence Layer
- **PostgreSQL + In-Memory Fallback Adapter**: `docker-compose.yml` defines Postgres 16 (with pgvector) and Redis 7. For environments where Docker or external PostgreSQL/Redis is not running (e.g. offline testing or local evaluation without Docker daemon), the API includes an intelligent fallback store with identical relational interfaces and in-memory cosine vector similarity. This ensures zero-friction demo and test execution in any evaluation environment while fully supporting PostgreSQL production deployment.
- **pgvector vs In-Memory Similarity**: Vector dimensions for skill embeddings are set to 1536 (or 1024 as in TRD schema). The vector comparison layer uses cosine similarity.

### 2. Authentication & OTP in Development Mode
- **OTP Generation**: In dev/test mode, OTP generation logs the generated 6-digit code directly to the server console and API response (when `NODE_ENV !== 'production'`) for frictionless evaluator login. Default test code `123456` is also accepted in development.
- **Default Test Accounts**:
  - Candidate (Asha): `asha@rozgarlink.gov.in` (Phone: `9876543210`)
  - Candidate (Rahul): `rahul@rozgarlink.gov.in` (Phone: `9876543211`)
  - Candidate (Meena): `meena@rozgarlink.gov.in` (Phone: `9876543212`)
  - Officer (Kiran): `kiran@rozgarlink.gov.in` (Phone: `9876543220`)
  - Catalogue Manager (Deepa): `deepa@rozgarlink.gov.in` (Phone: `9876543230`)
  - Admin (Vikram): `admin@rozgarlink.gov.in` (Phone: `9876543240`)
  - Evaluator: `evaluator@rozgarlink.gov.in` (Phone: `9876543250`)

### 3. Eligibility Engine Isolation
- The `packages/eligibility-engine` package is strictly pure. It does not import anything from `ranking-engine`, `skill-core`, `apps/*`, AI SDKs, `pg`, `redis`, or network libraries. This is enforced with `tooling/check-imports.ts` in CI and build scripts.

### 4. Ranking Formula & Defaults
- Formula: `100 * (0.55 * skillFit + 0.30 * prefFit + 0.15 * profFit)`.
- Required skills weight: 3; Preferred skills weight: 1.
- Candidate skills unconfirmed by user receive at most 0.50 relation credit.
- Commute distance is computed using the Haversine formula between the candidate's district centroid and opportunity coordinates.
- Preference sub-scores default to 0.5 when unspecified or flexible, ensuring eligible opportunities are never hidden or penalized unfairly.

### 5. AI Service & Mock Provider
- `AI_ENABLED=false` switches the skill matching pipeline to pure deterministic dictionary and alias matching.
- When `AI_ENABLED=true` without external API credentials (`ANTHROPIC_API_KEY`), the built-in deterministic mock provider handles embeddings and LLM relation judgments according to the TRD schema without external network calls.
- The system guarantees that for identical candidate facts and opportunities, `AI_ENABLED=false` and `AI_ENABLED=true` produce **byte-identical eligibility outcomes** (since AI never enters eligibility).

### 6. Multilingual Explanations
- The explainer package provides identical key coverage across `en` (English), `hi` (Hindi), and `mr` (Marathi). The active locale can be toggled dynamically in the UI.


---

========================================
# FILE: docs/branding.md
========================================

# FutoraOne / RozgarLink - Branding Guide

Version 1.0 | Futora Group | Derived from the FutoraOne app UI (Home, Match, Learn, Profile)

RozgarLink is delivered as a **FutoraOne product**. It inherits the FutoraOne look, tone and components so the app, the console and every document feel like one family.

---

## 1. Brand essence

| Item | Definition |
|---|---|
| Parent brand | FutoraOne (by Futora Group, Pune, India) |
| Product | RozgarLink - Skills-to-Opportunity Matching Engine |
| Tagline (brand) | **Build . Learn . Grow** |
| Product line | "Find what you can take. Learn what you need." |
| Personality | Clear, friendly, modern, trustworthy, practical |
| Promise | Every candidate sees opportunities they can actually take, with honest reasons and a path forward |

### Wordmark
- "FutoraOne" in bold dark navy, with the winged mark to its left.
- Product wordmark: **Rozgar** in ink + **Link** in brand blue (as on the PRD cover).
- Keep clear space equal to the height of the "F" on all sides. Minimum logo height 20 px on screen.

### Logo mark
A stylised bird/paper-plane built from two overlapping wing shapes: a blue wing (`#2F5BFF`) and an indigo wing (`#5B4BEA`). Use on white or the canvas colour only; on dark backgrounds use the all-white version.

---

## 2. Colour system

Sampled from the FutoraOne screens.

| Token | Hex | Use |
|---|---|---|
| `--brand-blue` | `#2F5BFF` | Primary buttons (Connect/Interested), active tab, active pills, links, table headers |
| `--brand-blue-dark` | `#1E3FCC` | Pressed state, strong emphasis |
| `--brand-indigo` | `#5B4BEA` | Gradient partner to blue, AI button, logo second wing |
| `--brand-violet` | `#7C5CFF` | AI accents, "Trending" style badges, highlight boxes |
| `--ink` | `#0F1B3D` | Headings, wordmark, primary text |
| `--text` | `#1B2438` | Body text |
| `--slate` | `#64748B` | Secondary text, captions, placeholder |
| `--canvas` | `#F6F8FC` | App/page background |
| `--card` | `#FFFFFF` | Cards, sheets |
| `--tint` | `#EAF0FF` | Light blue chips, hero panel, info boxes |
| `--tint-2` | `#F3F6FF` | Zebra rows, code blocks |
| `--line` | `#E2E8F3` | Card borders, dividers |

### Status colours (RozgarLink specific)

| Token | Hex | Meaning | Always pair with |
|---|---|---|---|
| `--ok` | `#12AE85` | Eligible / PASS / Online dot | check icon + word "Eligible" |
| `--warn` | `#F59E0B` | Need more information / UNKNOWN | clock icon + word "Need info" |
| `--fail` | `#E5484D` | Not eligible / FAIL | cross icon + exact failed rule |
| `--streak` | `#FEC723` | Learning streak flame, highlights | flame icon |

Colour is never the only signal. Every status has an icon and text.

### Gradients
- Hero / primary: `linear-gradient(135deg, #2F5BFF 0%, #5B4BEA 100%)`
- AI button: `linear-gradient(135deg, #5B4BEA 0%, #7C5CFF 100%)`
- Hero background wash: `linear-gradient(180deg, #EAF0FF 0%, #FFFFFF 100%)`

---

## 3. Typography

| Role | Font | Weight | Size (mobile) |
|---|---|---|---|
| Display / hero | Inter (fallback: system-ui, Helvetica) | 700 | 28 / 34 |
| Screen title ("Match", "Learn") | Inter | 700 | 24 / 30 |
| Card title | Inter | 600 | 16 / 22 |
| Body | Inter | 400 | 14 / 20 |
| Caption, chips, nav labels | Inter | 500 | 12 / 16 |
| Numbers (stats, scores) | Inter, tabular figures | 700 | 20-28 |

- Hindi/Marathi: Noto Sans Devanagari at the same sizes (add 2 px line height).
- Highlight one key word in a headline with brand blue, e.g. "Your **Tech** Journey" or "Roz gar**Link**".
- Sentence case for UI text. Title case only for product names.

---

## 4. Layout, shape and spacing

| Element | Spec |
|---|---|
| Grid | 4 px base unit; screen padding 16-20 px |
| Card | White, 1 px `--line` border, radius 16 px, soft shadow `0 4px 16px rgba(15,27,61,0.06)` |
| Pill / chip | Height 32 px, radius 999 px; inactive `--tint-2` + slate text; active `--brand-blue` + white text |
| Primary button | Height 40 px, radius 999 px, fill `--brand-blue`, white 600 text |
| Secondary button | Outline `--line`, ink text, radius 999 px |
| Tags (skills) | Radius 10 px, 1 px border, 12 px text (React, Node.js style) |
| Progress bar | 6 px high, radius 3 px, fill `--brand-blue`, track `--tint` |
| Progress ring | 4 px stroke, `--brand-blue`, centre shows percentage |
| Avatar | Circle, 48 px in lists, 72 px on profile, green online dot bottom-right |
| Verified tick | Small blue circle with white check beside names |
| Floating AI button | 56 px circle, indigo-violet gradient, white "AI" with sparkle, bottom-right above tab bar |
| Bottom navigation | 4 tabs: Home, Match, Learn, Profile; active tab blue icon + label, inactive slate |

---

## 5. Iconography and imagery

- Line icons, 1.75 px stroke, rounded caps (Lucide set recommended).
- Home = house, Match = two people, Learn = open book, Profile = person; quick tiles use a filled-tint square (`--tint`) with a blue icon.
- Course/path thumbnails: rounded 12 px squares with blue-indigo gradients and a single white glyph (code, AI, shield, phone).
- Avoid stock photos of handshakes; prefer real avatars, simple illustrations and the paper-plane motif.

---

## 6. Component patterns (from the FutoraOne screens)

| Pattern | FutoraOne | RozgarLink adaptation |
|---|---|---|
| Home hero | "Build . Learn . Grow" + "Your Tech Journey Starts Here", search bar | "Your Career Path Starts Here" with search for opportunities, skills, courses |
| Quick tiles | Learn, Match, Explore, Community | Match, Learn, Explore, Profile |
| Recommended list | Course cards with Popular/Trending badge | Top eligible matches with score and "Why this rank" |
| Top Matches | Avatar strip | Newly eligible strip |
| Match cards | Person, role, location, skill tags, Connect | Opportunity, org, location, skill tags, **Interested** |
| Filter pills | All, Developers, Founders, Freelancers | All, Eligible, Need info, Not eligible |
| Learn cards | Course path, tech tags, progress bar, "3/12 modules" | Gap pathway steps, skills gained, progress |
| Profile stats | Courses completed, Connections, Projects | Courses completed, Skills confirmed, Interested |
| Progress ring + streak | 60% + 7-day flame | Profile strength + learning streak |
| Menu rows | My Courses, Saved, Settings, Help | Same |
| AI button | Floating assistant | Explains results, extracts skills; never decides eligibility |

### RozgarLink-only components
- **Eligibility chip row**: PASS / FAIL / UNKNOWN per rule with icon, rule label, and candidate value.
- **Failed-rule strip**: a red-tinted bar at the top of a Not-eligible card, e.g. "Requires residence in Maharashtra. Your location: Gujarat."
- **Score ring** on eligible cards only; never on Not-eligible cards.
- **Change banner**: "2 newly eligible, 1 no longer eligible, 3 re-ranked" with Undo.
- **AI-assisted label**: small violet pill "AI-assisted" next to AI-matched skills.

---

## 7. Voice and tone

| Principle | Do | Do not |
|---|---|---|
| Plain and specific | "Requires at least a Diploma. You have: 12th pass." | "Does not meet criteria." |
| Encouraging, never blaming | "Add your qualification to unlock 4 more opportunities." | "Your profile is incomplete." |
| Honest about limits | "No course in our catalogue yet." | Invent a course |
| Short | Under 20 words per sentence, Grade 8 reading level | Policy jargon, "embedding", "threshold" |
| Neutral on people | Describe conditions | Judge the candidate |

Standard notice on result screens: *"Eligibility follows the criteria stated by the opportunity. Confirm with the issuing office before applying."*

---

## 8. Document and PDF style

Used for PRD, TRD, proposals and reports.

- Page: A4, canvas background `#F6F8FC`, content in white rounded cards.
- Header: logo mark + "FutoraOne" wordmark left; document name right; 0.6 pt `--line` rule.
- Footer: "Futora Group | Confidential | vX.Y" left; blue-tint pill "Page n of N" right.
- Section heading: blue rounded square with the section number + ink H1.
- Sub-heading: brand blue, bold.
- Tables: blue header row, white rows with `--tint-2` zebra, rounded outer corners, 0.4 pt `--line` grid.
- Callout boxes: `--tint` (info) or `#F1EDFF` (key rule), radius 8, no border.
- Cover: hero card with "Build . Learn . Grow", two-tone product name, paper-plane graphic, pill chips for key themes.

---

## 9. Accessibility

- Text contrast at least 4.5:1 (ink on white is 15:1; white on `#2F5BFF` is 4.9:1).
- Do not place slate text on `--tint` below 14 px.
- Tap targets at least 44 x 44 px; visible focus ring `2px solid #2F5BFF` with 2 px offset.
- Support dynamic type to 200% and reduced-motion (disable score-ring and card-move animations, keep the banner).

---

## 10. Design tokens (copy-paste)

### CSS variables
```css
:root{
  --brand-blue:#2F5BFF; --brand-blue-dark:#1E3FCC; --brand-indigo:#5B4BEA; --brand-violet:#7C5CFF;
  --ink:#0F1B3D; --text:#1B2438; --slate:#64748B;
  --canvas:#F6F8FC; --card:#FFFFFF; --tint:#EAF0FF; --tint-2:#F3F6FF; --line:#E2E8F3;
  --ok:#12AE85; --warn:#F59E0B; --fail:#E5484D; --streak:#FEC723;
  --radius-card:16px; --radius-pill:999px; --shadow-card:0 4px 16px rgba(15,27,61,.06);
  --font:'Inter',system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;
}
@media (prefers-color-scheme: dark){
  :root{ --canvas:#0B1224; --card:#121B33; --ink:#EAF0FF; --text:#D6DEF0; --slate:#94A3B8; --tint:#18264A; --tint-2:#141F3B; --line:#22305A; }
}
```

### Tailwind (tailwind.config.ts)
```ts
export default {
  theme: { extend: {
    colors: {
      brand: { blue:'#2F5BFF', dark:'#1E3FCC', indigo:'#5B4BEA', violet:'#7C5CFF' },
      ink:'#0F1B3D', slate:'#64748B', canvas:'#F6F8FC', tint:'#EAF0FF', line:'#E2E8F3',
      ok:'#12AE85', warn:'#F59E0B', fail:'#E5484D', streak:'#FEC723'
    },
    borderRadius: { card:'16px' },
    boxShadow: { card:'0 4px 16px rgba(15,27,61,.06)' },
    fontFamily: { sans:['Inter','system-ui','sans-serif'] }
  } }
}
```

---

## 11. Do and do not

| Do | Do not |
|---|---|
| Use white cards on the soft canvas | Use dark heavy backgrounds in light mode |
| Use one primary blue action per screen | Mix several bright accent colours |
| Show status with icon + word + colour | Rely on red/green alone |
| Keep the AI button visible but unobtrusive | Let AI text imply a decision on eligibility |
| Name the exact failed rule | Show generic rejection text |
| Keep the paper-plane motif simple | Add stock imagery or busy patterns |

---

*Brand note: the colour values above were sampled from the supplied FutoraOne mockup. Replace them with the official brand file values if Futora Group has final design tokens.*
