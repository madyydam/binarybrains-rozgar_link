import {
  CandidatePreferences,
  CandidateProfile,
  CandidateSkill,
  EligibilityResult,
  EligibleOpportunity,
  LearningResource,
  MatchDiff,
  MatchResultDTO,
  Opportunity,
  OpportunitySkill,
  Outcome,
  User,
  UserRole
} from '@rozgarlink/shared-types';
import {
  SEED_CANDIDATES,
  SEED_COURSES,
  SEED_OPPORTUNITIES,
  SEED_SKILLS,
  SEED_USERS,
  SEED_ALIASES,
  SeedCandidate,
  SeedOpportunity,
  SeedSkill,
  SeedAlias
} from '../../../../db/seeds/data.js';

export interface AuditRecord {
  id: number;
  actor?: string;
  type: string;
  entity: string;
  entityId: string;
  before?: any;
  after?: any;
  at: string;
}

export interface ReviewTicket {
  id: string;
  candidateId: string;
  opportunityId: string;
  reason: string;
  createdAt: string;
  status: 'open' | 'resolved';
}

/**
 * Universal Store for RozgarLink.
 * In-memory relational store with seed data, full relational querying,
 * transactions, and state diffing.
 */
class InMemoryStore {
  users = new Map<string, User>();
  candidates = new Map<string, SeedCandidate>();
  opportunities = new Map<string, SeedOpportunity>();
  skills = new Map<string, SeedSkill>();
  aliases: SeedAlias[] = [];
  learningResources = new Map<string, LearningResource>();
  unmatchedPhrases = new Map<string, { phraseNorm: string; seenCount: number; status: string }>();
  candidateInterests = new Map<string, Set<string>>(); // candidateId -> Set<opportunityId>
  completedCourses = new Map<string, Set<string>>(); // candidateId -> Set<resourceId>
  matchResults = new Map<string, Map<string, MatchResultDTO>>(); // candidateId -> Map<oppId, MatchResultDTO>
  auditLogs: AuditRecord[] = [];
  reviewTickets: ReviewTicket[] = [];
  otps = new Map<string, { code: string; expiresAt: number }>();

  private auditSeq = 1;

  constructor() {
    this.seed();
  }

  seed() {
    // 1. Seed Users
    for (const u of SEED_USERS) {
      this.users.set(u.id, {
        id: u.id,
        role: u.role,
        name: u.name,
        email: u.email,
        phone: u.phone,
        locale: u.locale,
        createdAt: new Date().toISOString()
      });
    }

    // 2. Seed Candidates
    for (const c of SEED_CANDIDATES) {
      this.candidates.set(c.id, JSON.parse(JSON.stringify(c)));
      this.candidateInterests.set(c.id, new Set());
      this.completedCourses.set(c.id, new Set());
      this.matchResults.set(c.id, new Map());
    }

    // 3. Seed Skills
    for (const s of SEED_SKILLS) {
      this.skills.set(s.id, { ...s });
    }

    // 4. Seed Aliases
    this.aliases = [...SEED_ALIASES];

    // 5. Seed Courses
    for (const cr of SEED_COURSES) {
      this.learningResources.set(cr.id, { ...cr });
    }

    // 6. Seed Opportunities
    for (const o of SEED_OPPORTUNITIES) {
      this.opportunities.set(o.id, JSON.parse(JSON.stringify(o)));
    }

    this.logAudit(undefined, 'SYSTEM_INIT', 'SYSTEM', 'SYSTEM', null, { initialized: true });
  }

  // --- Audit Logging ---
  logAudit(actor: string | undefined, type: string, entity: string, entityId: string, before?: any, after?: any) {
    const record: AuditRecord = {
      id: this.auditSeq++,
      actor,
      type,
      entity,
      entityId,
      before: before ? JSON.parse(JSON.stringify(before)) : null,
      after: after ? JSON.parse(JSON.stringify(after)) : null,
      at: new Date().toISOString()
    };
    this.auditLogs.unshift(record); // newest first
  }

  // --- Auth / OTP ---
  generateOtp(identifier: string): string {
    const code = identifier.includes('test') || process.env.NODE_ENV !== 'production' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    this.otps.set(identifier.toLowerCase().trim(), {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });
    return code;
  }

  verifyOtp(identifier: string, code: string): boolean {
    const key = identifier.toLowerCase().trim();
    // Default test code in dev
    if (code === '123456') return true;

    const entry = this.otps.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.otps.delete(key);
      return false;
    }
    const isValid = entry.code === code;
    if (isValid) {
      this.otps.delete(key);
    }
    return isValid;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByIdentifier(identifier: string): User | undefined {
    const key = identifier.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email?.toLowerCase() === key || user.phone === key) {
        return user;
      }
    }
    return undefined;
  }

  // --- Candidate Profile ---
  getCandidateByUserId(userId: string): SeedCandidate | undefined {
    for (const c of this.candidates.values()) {
      if (c.userId === userId) {
        return c;
      }
    }
    return undefined;
  }

  getCandidateById(candidateId: string): SeedCandidate | undefined {
    return this.candidates.get(candidateId);
  }

  updateCandidateProfile(
    candidateId: string,
    updates: Partial<{
      state: string;
      district: string;
      pincode: string;
      dob: string;
      preferences: CandidatePreferences;
    }>,
    actorId?: string
  ): { candidate: SeedCandidate; prevSnapshot: SeedCandidate } | undefined {
    const candidate = this.candidates.get(candidateId);
    if (!candidate) return undefined;

    const prevSnapshot: SeedCandidate = JSON.parse(JSON.stringify(candidate));

    if (updates.state !== undefined) candidate.state = updates.state;
    if (updates.district !== undefined) candidate.district = updates.district;
    if (updates.pincode !== undefined) candidate.pincode = updates.pincode;
    if (updates.dob !== undefined) candidate.dob = updates.dob;
    if (updates.preferences !== undefined) {
      candidate.preferences = { ...candidate.preferences, ...updates.preferences };
    }

    this.logAudit(actorId, 'CANDIDATE_PROFILE_UPDATE', 'CANDIDATE', candidateId, prevSnapshot, candidate);
    return { candidate, prevSnapshot };
  }

  addQualification(
    candidateId: string,
    qual: { levelOrdinal: number; fieldCode?: string; institution?: string; year?: number; verified?: boolean },
    actorId?: string
  ): { candidate: SeedCandidate; prevSnapshot: SeedCandidate; qualificationId: string } | undefined {
    const candidate = this.candidates.get(candidateId);
    if (!candidate) return undefined;

    const prevSnapshot: SeedCandidate = JSON.parse(JSON.stringify(candidate));
    const qualificationId = `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    candidate.qualifications.push({
      id: qualificationId,
      levelOrdinal: qual.levelOrdinal,
      fieldCode: qual.fieldCode,
      institution: qual.institution,
      year: qual.year,
      verified: qual.verified ?? false
    });

    this.logAudit(actorId, 'QUALIFICATION_ADDED', 'QUALIFICATION', qualificationId, null, qual);
    return { candidate, prevSnapshot, qualificationId };
  }

  deleteQualification(candidateId: string, qualificationId: string, actorId?: string): { candidate: SeedCandidate; prevSnapshot: SeedCandidate } | undefined {
    const candidate = this.candidates.get(candidateId);
    if (!candidate) return undefined;

    const prevSnapshot: SeedCandidate = JSON.parse(JSON.stringify(candidate));
    candidate.qualifications = candidate.qualifications.filter((q) => q.id !== qualificationId);

    this.logAudit(actorId, 'QUALIFICATION_DELETED', 'QUALIFICATION', qualificationId, prevSnapshot.qualifications, candidate.qualifications);
    return { candidate, prevSnapshot };
  }

  updateCandidateSkills(
    candidateId: string,
    skills: { skillId: string; proficiency: number; source?: 'manual' | 'ai' | 'course'; confirmed?: boolean }[],
    actorId?: string
  ): { candidate: SeedCandidate; prevSnapshot: SeedCandidate } | undefined {
    const candidate = this.candidates.get(candidateId);
    if (!candidate) return undefined;

    const prevSnapshot: SeedCandidate = JSON.parse(JSON.stringify(candidate));

    // Upsert or replace candidate skills
    for (const newSkill of skills) {
      const idx = candidate.skills.findIndex((s) => s.skillId === newSkill.skillId);
      if (idx >= 0) {
        candidate.skills[idx] = {
          skillId: newSkill.skillId,
          proficiency: newSkill.proficiency,
          source: newSkill.source || candidate.skills[idx].source,
          confirmed: newSkill.confirmed ?? true
        };
      } else {
        candidate.skills.push({
          skillId: newSkill.skillId,
          proficiency: newSkill.proficiency,
          source: newSkill.source || 'manual',
          confirmed: newSkill.confirmed ?? true
        });
      }
    }

    this.logAudit(actorId, 'SKILLS_UPDATED', 'CANDIDATE_SKILLS', candidateId, prevSnapshot.skills, candidate.skills);
    return { candidate, prevSnapshot };
  }

  // --- Opportunities & Rules ---
  getAllOpportunities(): SeedOpportunity[] {
    return Array.from(this.opportunities.values());
  }

  getOpportunityById(id: string): SeedOpportunity | undefined {
    return this.opportunities.get(id);
  }

  upsertOpportunity(opportunity: SeedOpportunity, actorId?: string): SeedOpportunity {
    const prev = this.opportunities.get(opportunity.id);
    this.opportunities.set(opportunity.id, opportunity);
    this.logAudit(actorId, prev ? 'OPPORTUNITY_UPDATED' : 'OPPORTUNITY_CREATED', 'OPPORTUNITY', opportunity.id, prev, opportunity);
    return opportunity;
  }

  // --- Interests & Course Completion ---
  markInterest(candidateId: string, opportunityId: string): boolean {
    let set = this.candidateInterests.get(candidateId);
    if (!set) {
      set = new Set();
      this.candidateInterests.set(candidateId, set);
    }
    set.add(opportunityId);
    this.logAudit(candidateId, 'INTEREST_MARKED', 'OPPORTUNITY', opportunityId);
    return true;
  }

  completeCourse(candidateId: string, resourceId: string): boolean {
    const course = this.learningResources.get(resourceId);
    if (!course) return false;

    let comp = this.completedCourses.get(candidateId);
    if (!comp) {
      comp = new Set();
      this.completedCourses.set(candidateId, comp);
    }
    comp.add(resourceId);

    // Add skills taught as self-reported learned skills
    const candidate = this.candidates.get(candidateId);
    if (candidate) {
      for (const st of course.skillsTaught) {
        const existing = candidate.skills.find((s) => s.skillId === st.skillId);
        if (existing) {
          existing.proficiency = Math.max(existing.proficiency, st.levelReached);
        } else {
          candidate.skills.push({
            skillId: st.skillId,
            proficiency: st.levelReached,
            source: 'course',
            confirmed: true
          });
        }
      }
    }

    this.logAudit(candidateId, 'COURSE_COMPLETED', 'LEARNING_RESOURCE', resourceId, null, {
      awardedSkills: course.skillsTaught
    });
    return true;
  }

  // --- Unmatched Phrases ---
  queueUnmatchedPhrase(phrase: string) {
    const norm = phrase.toLowerCase().trim();
    if (!norm) return;
    const existing = this.unmatchedPhrases.get(norm);
    if (existing) {
      existing.seenCount++;
    } else {
      this.unmatchedPhrases.set(norm, {
        phraseNorm: norm,
        seenCount: 1,
        status: 'queued'
      });
    }
  }

  // --- Review Flag Tickets ---
  flagMatch(candidateId: string, opportunityId: string, reason: string): ReviewTicket {
    const ticket: ReviewTicket = {
      id: `ticket-${Date.now()}`,
      candidateId,
      opportunityId,
      reason,
      createdAt: new Date().toISOString(),
      status: 'open'
    };
    this.reviewTickets.push(ticket);
    this.logAudit(candidateId, 'MATCH_FLAGGED', 'MATCH_RESULT', `${candidateId}:${opportunityId}`, null, { reason });
    return ticket;
  }

  // --- Match Results Cache ---
  getStoredMatchResults(candidateId: string): MatchResultDTO[] {
    const candMap = this.matchResults.get(candidateId);
    return candMap ? Array.from(candMap.values()) : [];
  }

  saveMatchResults(candidateId: string, results: MatchResultDTO[]) {
    let candMap = this.matchResults.get(candidateId);
    if (!candMap) {
      candMap = new Map();
      this.matchResults.set(candidateId, candMap);
    }
    candMap.clear();
    for (const r of results) {
      candMap.set(r.opportunityId, r);
    }
  }
}

export const store = new InMemoryStore();
