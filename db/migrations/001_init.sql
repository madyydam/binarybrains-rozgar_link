-- RozgarLink Database Schema (PostgreSQL + pgvector)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('candidate', 'officer', 'catalogue_manager', 'admin', 'evaluator');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE match_status AS ENUM ('ELIGIBLE', 'NOT_ELIGIBLE', 'NEEDS_INFO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  email text UNIQUE,
  phone text UNIQUE,
  name text NOT NULL,
  locale text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  state text,
  district text,
  pincode text,
  date_of_birth date,
  preferences jsonb NOT NULL DEFAULT '{}',
  profile_version int NOT NULL DEFAULT 1,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS qualification_levels (
  ordinal int PRIMARY KEY,
  code text UNIQUE,
  label text
);

CREATE TABLE IF NOT EXISTS qualifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  level_ordinal int REFERENCES qualification_levels(ordinal),
  field_code text,
  institution text,
  year int,
  verified boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text,
  issuer text,
  valid_till date,
  verified boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS work_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  domain_code text,
  months int NOT NULL
);

CREATE TABLE IF NOT EXISTS skills (
  id text PRIMARY KEY,
  canonical_name text NOT NULL,
  category text,
  embedding vector(1024)
);

CREATE TABLE IF NOT EXISTS skill_aliases (
  id bigserial PRIMARY KEY,
  skill_id text REFERENCES skills(id) ON DELETE CASCADE,
  phrase_norm text NOT NULL,
  language text DEFAULT 'en',
  UNIQUE (phrase_norm, language)
);

CREATE TABLE IF NOT EXISTS unmatched_phrases (
  id bigserial PRIMARY KEY,
  phrase_norm text UNIQUE,
  seen_count int DEFAULT 1,
  status text DEFAULT 'queued',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidate_skills (
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  skill_id text REFERENCES skills(id) ON DELETE CASCADE,
  proficiency smallint CHECK (proficiency BETWEEN 1 AND 5) DEFAULT 3,
  source text CHECK (source IN ('manual', 'ai', 'course')),
  confirmed boolean DEFAULT false,
  confidence real,
  PRIMARY KEY (candidate_id, skill_id)
);

CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  org_name text,
  work_description text,
  state text,
  district text,
  lat real,
  lng real,
  status text DEFAULT 'open',
  closes_on date,
  reference_date date,
  preference_attrs jsonb NOT NULL DEFAULT '{}',
  created_by uuid REFERENCES users(id),
  rules_version int DEFAULT 1,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_filter ON opportunities (status, state, district, closes_on);

CREATE TABLE IF NOT EXISTS opportunity_skills (
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  skill_id text REFERENCES skills(id) ON DELETE CASCADE,
  importance text CHECK (importance IN ('required', 'preferred')),
  min_proficiency smallint DEFAULT 1,
  PRIMARY KEY (opportunity_id, skill_id)
);

CREATE TABLE IF NOT EXISTS eligibility_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  type text NOT NULL,
  operator text NOT NULL,
  value jsonb NOT NULL,
  label text NOT NULL,
  requires_verification boolean DEFAULT false,
  sensitive boolean DEFAULT false,
  version int NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS learning_resources (
  id text PRIMARY KEY,
  title text NOT NULL,
  provider text,
  duration_hours int NOT NULL,
  level text,
  mode text,
  language text DEFAULT 'en',
  cost_inr int DEFAULT 0,
  url text,
  qualification_awarded_ordinal int REFERENCES qualification_levels(ordinal)
);

CREATE TABLE IF NOT EXISTS resource_skills (
  resource_id text REFERENCES learning_resources(id) ON DELETE CASCADE,
  skill_id text REFERENCES skills(id) ON DELETE CASCADE,
  level_reached smallint DEFAULT 1,
  PRIMARY KEY (resource_id, skill_id)
);

CREATE TABLE IF NOT EXISTS resource_prereqs (
  resource_id text REFERENCES learning_resources(id) ON DELETE CASCADE,
  requires_resource_id text REFERENCES learning_resources(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, requires_resource_id)
);

CREATE TABLE IF NOT EXISTS candidate_courses (
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  resource_id text REFERENCES learning_resources(id) ON DELETE CASCADE,
  status text DEFAULT 'enrolled',
  completed_at date,
  PRIMARY KEY (candidate_id, resource_id)
);

CREATE TABLE IF NOT EXISTS interests (
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (candidate_id, opportunity_id)
);

CREATE TABLE IF NOT EXISTS match_results (
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  status match_status NOT NULL,
  score numeric(5,2),
  rank int,
  explanation jsonb NOT NULL,
  profile_version int,
  rules_version int,
  weights_version text,
  computed_at timestamptz DEFAULT now(),
  PRIMARY KEY (candidate_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_match_results_cand_status ON match_results (candidate_id, status, rank);

CREATE TABLE IF NOT EXISTS audit_events (
  id bigserial PRIMARY KEY,
  actor uuid,
  type text NOT NULL,
  entity text,
  entity_id text,
  before jsonb,
  after jsonb,
  at timestamptz DEFAULT now()
);
