import { Rule } from '@rozgarlink/eligibility-engine';
import { LearningResource } from '@rozgarlink/pathway';
import { CandidateFacts, OpportunitySkill } from '@rozgarlink/shared-types';

export interface StoredCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'candidate';
  profileVersion: number;
  facts: CandidateFacts;
  skills: {
    skillId: string;
    proficiency: number;
    source: 'manual' | 'ai' | 'course';
    confirmed: boolean;
    confidence: number;
  }[];
  preferences: {
    commuteKm?: number;
    expectedPayMin?: number;
    shift?: string;
    workType?: string | string[];
    sector?: string | string[];
    weights?: { commute: number; pay: number; shift: number; workType: number };
  };
  interests: string[]; // opportunityIds
  completedCourses: string[]; // resourceIds
}

export interface StoredOpportunity {
  id: string;
  title: string;
  orgName: string;
  workDescription: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  status: 'open' | 'closed';
  closesOn: string;
  referenceDate?: string;
  preferenceAttrs: {
    pay?: { min: number; max: number };
    shift?: string;
    workType?: string;
    sector?: string;
  };
  skills: OpportunitySkill[];
  rules: Rule[];
  rulesVersion: number;
}

export const INITIAL_CANDIDATES: StoredCandidate[] = [
  {
    id: 'cand-asha',
    name: 'Asha Patil',
    email: 'asha@rozgarlink.gov.in',
    phone: '9876543210',
    role: 'candidate',
    profileVersion: 1,
    facts: {
      state: 'Maharashtra',
      district: 'Pune',
      dob: '2003-04-10', // Age 23
      highestQualification: { ordinal: 4, fieldCode: 'ELEC', verified: true },
      qualifications: [
        { ordinal: 2, fieldCode: 'GEN', verified: true }, // 10th
        { ordinal: 4, fieldCode: 'ELEC', verified: true } // ITI Electrical
      ],
      certifications: [],
      experienceMonths: { ELEC: 12 },
      attributes: {}
    },
    skills: [
      { skillId: 'solar-pv-install', proficiency: 4, source: 'manual', confirmed: true, confidence: 1.0 },
      { skillId: 'basic-electrical', proficiency: 4, source: 'manual', confirmed: true, confidence: 1.0 }
    ],
    preferences: {
      commuteKm: 25,
      expectedPayMin: 18000,
      shift: 'day',
      workType: 'full-time',
      weights: { commute: 0.35, pay: 0.35, shift: 0.15, workType: 0.15 }
    },
    interests: [],
    completedCourses: []
  },
  {
    id: 'cand-rahul',
    name: 'Rahul Deshmukh',
    email: 'rahul@rozgarlink.gov.in',
    phone: '9876543211',
    role: 'candidate',
    profileVersion: 1,
    facts: {
      state: 'Maharashtra',
      district: 'Nashik',
      dob: '2005-02-15', // Age 21
      highestQualification: { ordinal: 3, fieldCode: 'COMM', verified: true },
      qualifications: [{ ordinal: 3, fieldCode: 'COMM', verified: true }], // 12th pass
      certifications: [],
      experienceMonths: { OFF: 6 },
      attributes: {}
    },
    skills: [
      { skillId: 'ms-excel', proficiency: 3, source: 'manual', confirmed: true, confidence: 1.0 },
      { skillId: 'basic-computer', proficiency: 4, source: 'manual', confirmed: true, confidence: 1.0 },
      { skillId: 'data-entry', proficiency: 3, source: 'manual', confirmed: true, confidence: 1.0 }
    ],
    preferences: {
      commuteKm: 15,
      expectedPayMin: 15000,
      shift: 'day',
      workType: 'full-time',
      weights: { commute: 0.3, pay: 0.3, shift: 0.2, workType: 0.2 }
    },
    interests: [],
    completedCourses: []
  },
  {
    id: 'cand-meena',
    name: 'Meena Shinde',
    email: 'meena@rozgarlink.gov.in',
    phone: '9876543212',
    role: 'candidate',
    profileVersion: 1,
    facts: {
      state: 'Maharashtra',
      district: 'Kolhapur',
      dob: '2000-08-20', // Age 26
      highestQualification: { ordinal: 6, fieldCode: 'SCI', verified: true },
      qualifications: [{ ordinal: 6, fieldCode: 'SCI', verified: true }], // Graduate
      certifications: [{ code: 'FIRST_AID', name: 'Certified First Responder', verified: true }],
      experienceMonths: { HLTH: 18 },
      attributes: {}
    },
    skills: [
      { skillId: 'general-duty-assistant', proficiency: 4, source: 'manual', confirmed: true, confidence: 1.0 },
      { skillId: 'patient-vitals-monitoring', proficiency: 4, source: 'manual', confirmed: true, confidence: 1.0 },
      { skillId: 'first-aid', proficiency: 3, source: 'manual', confirmed: true, confidence: 1.0 }
    ],
    preferences: {
      commuteKm: 20,
      expectedPayMin: 22000,
      shift: 'flexible',
      workType: 'full-time',
      weights: { commute: 0.25, pay: 0.35, shift: 0.2, workType: 0.2 }
    },
    interests: [],
    completedCourses: []
  },
  {
    id: 'cand-edge-age',
    name: 'Ramesh Kulkarni (Over-Age Case)',
    email: 'ramesh@rozgarlink.gov.in',
    phone: '9876543213',
    role: 'candidate',
    profileVersion: 1,
    facts: {
      state: 'Maharashtra',
      district: 'Pune',
      dob: '1992-01-10', // Age 34
      highestQualification: { ordinal: 4, fieldCode: 'ELEC', verified: true },
      qualifications: [{ ordinal: 4, fieldCode: 'ELEC', verified: true }],
      certifications: [],
      experienceMonths: { ELEC: 36 },
      attributes: {}
    },
    skills: [
      { skillId: 'solar-pv-install', proficiency: 5, source: 'manual', confirmed: true, confidence: 1.0 },
      { skillId: 'panel-wiring', proficiency: 4, source: 'manual', confirmed: true, confidence: 1.0 }
    ],
    preferences: { commuteKm: 30, expectedPayMin: 25000 },
    interests: [],
    completedCourses: []
  },
  {
    id: 'cand-edge-residence',
    name: 'Sneha More (District Mismatch)',
    email: 'sneha@rozgarlink.gov.in',
    phone: '9876543214',
    role: 'candidate',
    profileVersion: 1,
    facts: {
      state: 'Maharashtra',
      district: 'Mumbai', // In Mumbai, applied to Pune-only job
      dob: '2004-06-12', // Age 22
      highestQualification: { ordinal: 5, fieldCode: 'ELEC', verified: true },
      qualifications: [{ ordinal: 5, fieldCode: 'ELEC', verified: true }],
      certifications: [],
      experienceMonths: {},
      attributes: {}
    },
    skills: [
      { skillId: 'panel-wiring', proficiency: 4, source: 'manual', confirmed: true, confidence: 1.0 },
      { skillId: 'fault-finding', proficiency: 3, source: 'manual', confirmed: true, confidence: 1.0 }
    ],
    preferences: { commuteKm: 15, expectedPayMin: 20000 },
    interests: [],
    completedCourses: []
  },
  {
    id: 'cand-edge-cert',
    name: 'Amit Gaikwad (Missing Mandatory Cert)',
    email: 'amit@rozgarlink.gov.in',
    phone: '9876543215',
    role: 'candidate',
    profileVersion: 1,
    facts: {
      state: 'Maharashtra',
      district: 'Pune',
      dob: '2002-11-05', // Age 24
      highestQualification: { ordinal: 3, fieldCode: 'GEN', verified: true },
      qualifications: [{ ordinal: 3, fieldCode: 'GEN', verified: true }],
      certifications: [], // Missing Fire Safety Certificate
      experienceMonths: {},
      attributes: {}
    },
    skills: [
      { skillId: 'safety-compliance', proficiency: 3, source: 'manual', confirmed: true, confidence: 1.0 }
    ],
    preferences: { commuteKm: 20, expectedPayMin: 18000 },
    interests: [],
    completedCourses: []
  }
];

export const INITIAL_OPPORTUNITIES: StoredOpportunity[] = [
  {
    id: 'OPP-101',
    title: 'Rooftop Solar PV Installation Technician',
    orgName: 'Maharashtra State Renewable Energy Corp (MAHADISCOM)',
    workDescription: 'Assembly and wiring of distributed rooftop solar PV arrays across Pune municipal zone. Mandatory ITI / Diploma and domicile.',
    state: 'Maharashtra',
    district: 'Pune',
    lat: 18.5204,
    lng: 73.8567,
    status: 'open',
    closesOn: '2026-12-31',
    preferenceAttrs: {
      pay: { min: 20000, max: 28000 },
      shift: 'day',
      workType: 'full-time',
      sector: 'Renewable Energy'
    },
    skills: [
      { skillId: 'solar-pv-install', importance: 'required', minProficiency: 3 },
      { skillId: 'basic-electrical', importance: 'required', minProficiency: 2 },
      { skillId: 'safety-compliance', importance: 'preferred', minProficiency: 2 }
    ],
    rules: [
      {
        id: 'r101-qual',
        type: 'QUAL_MIN_LEVEL',
        operator: 'gte',
        value: 4, // ITI minimum
        label: 'Requires at least ITI qualification',
        requiresVerification: true,
        version: 1
      },
      {
        id: 'r101-res',
        type: 'RESIDENCE_STATE',
        operator: 'eq',
        value: 'Maharashtra',
        label: 'Must be resident of Maharashtra',
        requiresVerification: false,
        version: 1
      },
      {
        id: 'r101-age',
        type: 'AGE_RANGE',
        operator: 'between',
        value: { min: 18, max: 30 },
        label: 'Age between 18 and 30 years',
        requiresVerification: false,
        version: 1
      }
    ],
    rulesVersion: 1
  },
  {
    id: 'OPP-102',
    title: 'Electrical Control Panel Wireman',
    orgName: 'Siemens Industrial Systems',
    workDescription: 'Wiring and assembly of industrial distribution boards, switchgear and control cabinets.',
    state: 'Maharashtra',
    district: 'Pune',
    lat: 18.5400,
    lng: 73.8100,
    status: 'open',
    closesOn: '2026-11-30',
    preferenceAttrs: {
      pay: { min: 22000, max: 30000 },
      shift: 'day',
      workType: 'full-time',
      sector: 'Manufacturing'
    },
    skills: [
      { skillId: 'panel-wiring', importance: 'required', minProficiency: 3 },
      { skillId: 'fault-finding', importance: 'required', minProficiency: 2 },
      { skillId: 'safety-compliance', importance: 'preferred', minProficiency: 2 }
    ],
    rules: [
      {
        id: 'r102-qual',
        type: 'QUAL_MIN_LEVEL',
        operator: 'gte',
        value: 4, // ITI
        label: 'Requires ITI in Electrical/Wireman trade',
        requiresVerification: true,
        version: 1
      },
      {
        id: 'r102-age',
        type: 'AGE_RANGE',
        operator: 'between',
        value: { min: 18, max: 35 },
        label: 'Age between 18 and 35 years',
        requiresVerification: false,
        version: 1
      }
    ],
    rulesVersion: 1
  },
  {
    id: 'OPP-103',
    title: 'Government Hospital General Duty Assistant',
    orgName: 'District Civil Hospital, Kolhapur',
    workDescription: 'In-patient bedside assistance, vital signs recording, ward hygiene and patient transfer.',
    state: 'Maharashtra',
    district: 'Kolhapur',
    lat: 16.705,
    lng: 74.2433,
    status: 'open',
    closesOn: '2026-10-31',
    preferenceAttrs: {
      pay: { min: 18000, max: 24000 },
      shift: 'flexible',
      workType: 'full-time',
      sector: 'Healthcare'
    },
    skills: [
      { skillId: 'general-duty-assistant', importance: 'required', minProficiency: 3 },
      { skillId: 'patient-vitals-monitoring', importance: 'required', minProficiency: 2 },
      { skillId: 'first-aid', importance: 'preferred', minProficiency: 2 }
    ],
    rules: [
      {
        id: 'r103-qual',
        type: 'QUAL_MIN_LEVEL',
        operator: 'gte',
        value: 3, // 12th pass
        label: 'Requires at least 12th pass',
        requiresVerification: true,
        version: 1
      },
      {
        id: 'r103-dist',
        type: 'RESIDENCE_DISTRICT',
        operator: 'eq',
        value: 'Kolhapur',
        label: 'Kolhapur district domicile required',
        requiresVerification: false,
        version: 1
      }
    ],
    rulesVersion: 1
  },
  {
    id: 'OPP-104',
    title: 'Digital Office & Billing Executive',
    orgName: 'Nashik Municipal Corporation (NMC)',
    workDescription: 'Citizen revenue portal data entry, spreadsheet consolidation, tax receipts and front counter query support.',
    state: 'Maharashtra',
    district: 'Nashik',
    lat: 19.9975,
    lng: 73.7898,
    status: 'open',
    closesOn: '2026-12-15',
    preferenceAttrs: {
      pay: { min: 16000, max: 22000 },
      shift: 'day',
      workType: 'full-time',
      sector: 'GovTech'
    },
    skills: [
      { skillId: 'ms-excel', importance: 'required', minProficiency: 3 },
      { skillId: 'data-entry', importance: 'required', minProficiency: 3 },
      { skillId: 'basic-computer', importance: 'preferred', minProficiency: 3 }
    ],
    rules: [
      {
        id: 'r104-qual',
        type: 'QUAL_MIN_LEVEL',
        operator: 'gte',
        value: 3, // 12th pass
        label: 'Requires minimum 12th pass with computer literacy',
        requiresVerification: true,
        version: 1
      },
      {
        id: 'r104-state',
        type: 'RESIDENCE_STATE',
        operator: 'eq',
        value: 'Maharashtra',
        label: 'Maharashtra resident',
        requiresVerification: false,
        version: 1
      }
    ],
    rulesVersion: 1
  },
  {
    id: 'OPP-105',
    title: 'Industrial Fire Safety Marshal',
    orgName: 'MIDC Chakan Industrial Association',
    workDescription: 'Safety compliance inspections, hot work permits, fire fighting equipment verification in manufacturing units.',
    state: 'Maharashtra',
    district: 'Pune',
    lat: 18.7500,
    lng: 73.8500,
    status: 'open',
    closesOn: '2026-11-20',
    preferenceAttrs: {
      pay: { min: 25000, max: 32000 },
      shift: 'day',
      workType: 'full-time',
      sector: 'Safety'
    },
    skills: [
      { skillId: 'safety-compliance', importance: 'required', minProficiency: 4 },
      { skillId: 'first-aid', importance: 'preferred', minProficiency: 3 }
    ],
    rules: [
      {
        id: 'r105-qual',
        type: 'QUAL_MIN_LEVEL',
        operator: 'gte',
        value: 3,
        label: 'Minimum 12th pass',
        requiresVerification: true,
        version: 1
      },
      {
        id: 'r105-cert',
        type: 'CERT_REQUIRED',
        operator: 'has',
        value: 'FIRE_SAFETY',
        label: 'Requires Certified Fire Safety Marshal Certificate',
        requiresVerification: true,
        version: 1
      }
    ],
    rulesVersion: 1
  },
  {
    id: 'OPP-106',
    title: 'E-Commerce Warehouse Sorter & Packer',
    orgName: 'Flipkart Logistics Hub, Bhiwandi',
    workDescription: 'Order picking, barcode scanning, packing parcel crates for dispatch in shifts.',
    state: 'Maharashtra',
    district: 'Thane',
    lat: 19.2900,
    lng: 73.0600,
    status: 'open',
    closesOn: '2026-12-31',
    preferenceAttrs: {
      pay: { min: 17000, max: 21000 },
      shift: 'flexible',
      workType: 'full-time',
      sector: 'Logistics'
    },
    skills: [
      { skillId: 'warehouse-packing', importance: 'required', minProficiency: 2 },
      { skillId: 'inventory-management', importance: 'preferred', minProficiency: 2 }
    ],
    rules: [
      {
        id: 'r106-qual',
        type: 'QUAL_MIN_LEVEL',
        operator: 'gte',
        value: 2, // 10th pass
        label: 'Requires 10th pass minimum',
        requiresVerification: true,
        version: 1
      }
    ],
    rulesVersion: 1
  },
  {
    id: 'OPP-107',
    title: 'Electric Two-Wheeler Service Specialist',
    orgName: 'Ather Energy Authorized Center',
    workDescription: 'Diagnostics of battery management systems, motor hub servicing and preventive maintenance of EVs.',
    state: 'Maharashtra',
    district: 'Pune',
    lat: 18.5204,
    lng: 73.8567,
    status: 'open',
    closesOn: '2026-11-25',
    preferenceAttrs: {
      pay: { min: 21000, max: 28000 },
      shift: 'day',
      workType: 'full-time',
      sector: 'Automotive'
    },
    skills: [
      { skillId: 'ev-maintenance', importance: 'required', minProficiency: 3 },
      { skillId: 'two-wheeler-repair', importance: 'required', minProficiency: 3 },
      { skillId: 'basic-electrical', importance: 'preferred', minProficiency: 2 }
    ],
    rules: [
      {
        id: 'r107-qual',
        type: 'QUAL_MIN_LEVEL',
        operator: 'gte',
        value: 4, // ITI
        label: 'ITI Motor Mechanic / Electrician required',
        requiresVerification: true,
        version: 1
      }
    ],
    rulesVersion: 1
  },
  {
    id: 'OPP-108',
    title: 'Retail Store Sales Associate',
    orgName: 'D-Mart Supermarket, Pune Aundh',
    workDescription: 'Floor merchandising, shelf replenishment, POS register assistance and customer assistance.',
    state: 'Maharashtra',
    district: 'Pune',
    lat: 18.5600,
    lng: 73.8050,
    status: 'open',
    closesOn: '2026-12-20',
    preferenceAttrs: {
      pay: { min: 15000, max: 19000 },
      shift: 'day',
      workType: 'full-time',
      sector: 'Retail'
    },
    skills: [
      { skillId: 'retail-sales', importance: 'required', minProficiency: 2 },
      { skillId: 'customer-service', importance: 'preferred', minProficiency: 2 }
    ],
    rules: [
      {
        id: 'r108-qual',
        type: 'QUAL_MIN_LEVEL',
        operator: 'gte',
        value: 2, // 10th pass
        label: 'Requires 10th pass',
        requiresVerification: false,
        version: 1
      }
    ],
    rulesVersion: 1
  }
];

export const INITIAL_CATALOGUE: LearningResource[] = [
  {
    id: 'crs-safety-basics',
    title: 'Foundations of Industrial Safety & Hazard Prevention',
    provider: 'National Skill Development Corporation (NSDC)',
    durationHours: 12,
    level: 'Beginner',
    mode: 'Online',
    language: 'English/Hindi',
    costInr: 0,
    skillsTaught: [{ skillId: 'safety-compliance', levelReached: 3 }],
    prerequisites: []
  },
  {
    id: 'crs-panel-wiring-adv',
    title: 'Industrial Control Panel Wiring & Switchgear Assembly',
    provider: 'Maharashtra State Vocational Training Council (MSBVEE)',
    durationHours: 45,
    level: 'Intermediate',
    mode: 'Blended',
    language: 'Marathi/English',
    costInr: 500,
    skillsTaught: [
      { skillId: 'panel-wiring', levelReached: 4 },
      { skillId: 'fault-finding', levelReached: 3 }
    ],
    prerequisites: ['crs-safety-basics']
  },
  {
    id: 'crs-solar-mastery',
    title: 'Advanced Rooftop Solar PV Engineering & Commissioning',
    provider: 'Suryamitra Skill Development Mission',
    durationHours: 60,
    level: 'Advanced',
    mode: 'Offline Workshop',
    language: 'Hindi/English',
    costInr: 1200,
    skillsTaught: [{ skillId: 'solar-pv-install', levelReached: 4 }],
    prerequisites: ['crs-safety-basics']
  },
  {
    id: 'crs-ev-service',
    title: 'Electric Vehicle Battery Diagnostics & Powertrain Servicing',
    provider: 'Automotive Skills Development Council (ASDC)',
    durationHours: 40,
    level: 'Intermediate',
    mode: 'Hands-on Lab',
    language: 'English',
    costInr: 1500,
    skillsTaught: [{ skillId: 'ev-maintenance', levelReached: 3 }],
    prerequisites: []
  },
  {
    id: 'crs-first-aid-cert',
    title: 'Certified Workplace First Aid & CPR Training',
    provider: 'Indian Red Cross Society',
    durationHours: 16,
    level: 'Beginner',
    mode: 'Offline',
    language: 'English/Marathi',
    costInr: 300,
    skillsTaught: [{ skillId: 'first-aid', levelReached: 3 }],
    prerequisites: []
  },
  {
    id: 'crs-tally-gst',
    title: 'Tally Prime & GST Corporate Accounting Assistant',
    provider: 'Maharashtra Knowledge Corporation Ltd (MKCL)',
    durationHours: 35,
    level: 'Intermediate',
    mode: 'Online',
    language: 'English/Marathi',
    costInr: 800,
    skillsTaught: [{ skillId: 'tally-accounting', levelReached: 3 }],
    prerequisites: []
  },
  {
    id: 'crs-polytechnic-diploma-ee',
    title: 'Government Polytechnic Diploma in Electrical Engineering',
    provider: 'MSBTE (Maharashtra State Board of Technical Education)',
    durationHours: 900,
    level: 'Diploma',
    mode: 'Offline College',
    language: 'English',
    costInr: 14000,
    qualificationAwardedOrdinal: 5, // Awards Diploma (Ordinal 5)
    skillsTaught: [
      { skillId: 'basic-electrical', levelReached: 5 },
      { skillId: 'panel-wiring', levelReached: 4 }
    ],
    prerequisites: []
  }
];
