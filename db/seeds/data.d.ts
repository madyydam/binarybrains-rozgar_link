import { CandidatePreferences, LearningResource, QualificationLevel } from '@rozgarlink/shared-types';
export interface SeedUser {
    id: string;
    role: 'candidate' | 'officer' | 'catalogue_manager' | 'admin' | 'evaluator';
    name: string;
    email: string;
    phone: string;
    locale: string;
}
export interface SeedCandidate {
    id: string;
    userId: string;
    name: string;
    state: string;
    district: string;
    pincode: string;
    dob: string;
    preferences: CandidatePreferences;
    qualifications: {
        id: string;
        levelOrdinal: number;
        fieldCode?: string;
        institution?: string;
        year?: number;
        verified: boolean;
    }[];
    certifications: {
        id: string;
        code: string;
        name: string;
        issuer?: string;
        validTill?: string;
        verified: boolean;
    }[];
    experience: {
        domainCode: string;
        months: number;
    }[];
    skills: {
        skillId: string;
        proficiency: number;
        source: 'manual' | 'ai' | 'course';
        confirmed: boolean;
    }[];
}
export interface SeedSkill {
    id: string;
    canonicalName: string;
    category: string;
    embedding?: number[];
}
export interface SeedAlias {
    skillId: string;
    phraseNorm: string;
}
export interface SeedOpportunity {
    id: string;
    title: string;
    orgName: string;
    workDescription: string;
    state: string;
    district: string;
    lat: number;
    lng: number;
    status: string;
    closesOn: string;
    referenceDate: string;
    preferenceAttrs: {
        pay?: {
            min?: number;
            max?: number;
        };
        shift?: string;
        workType?: string;
        sector?: string;
        remote?: boolean;
    };
    rules: {
        id: string;
        type: 'QUAL_MIN_LEVEL' | 'QUAL_FIELD' | 'RESIDENCE_STATE' | 'RESIDENCE_DISTRICT' | 'AGE_RANGE' | 'CERT_REQUIRED' | 'EXPERIENCE_MIN' | 'ATTRIBUTE';
        operator: string;
        value: unknown;
        label: string;
        requiresVerification: boolean;
        sensitive?: boolean;
        referenceDate?: string;
    }[];
    skills: {
        skillId: string;
        importance: 'required' | 'preferred';
        minProficiency: number;
    }[];
}
export declare const SEED_QUAL_LEVELS: QualificationLevel[];
export declare const SEED_USERS: SeedUser[];
export declare const SEED_CANDIDATES: SeedCandidate[];
export declare const SEED_SKILLS: SeedSkill[];
export declare const SEED_ALIASES: SeedAlias[];
export declare const SEED_COURSES: LearningResource[];
export declare const SEED_OPPORTUNITIES: SeedOpportunity[];
//# sourceMappingURL=data.d.ts.map