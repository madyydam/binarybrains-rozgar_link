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

