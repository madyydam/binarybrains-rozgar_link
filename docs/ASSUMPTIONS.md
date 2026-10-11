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
