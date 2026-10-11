"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEED_OPPORTUNITIES = exports.SEED_COURSES = exports.SEED_ALIASES = exports.SEED_SKILLS = exports.SEED_CANDIDATES = exports.SEED_USERS = exports.SEED_QUAL_LEVELS = void 0;
const shared_types_1 = require("@rozgarlink/shared-types");
exports.SEED_QUAL_LEVELS = shared_types_1.STANDARD_QUALIFICATION_LADDER;
exports.SEED_USERS = [
    { id: '11111111-0000-0000-0000-000000000001', role: 'candidate', name: 'Asha Sharma', email: 'asha@rozgarlink.gov.in', phone: '9876543210', locale: 'en' },
    { id: '11111111-0000-0000-0000-000000000002', role: 'candidate', name: 'Rahul Patil', email: 'rahul@rozgarlink.gov.in', phone: '9876543211', locale: 'en' },
    { id: '11111111-0000-0000-0000-000000000003', role: 'candidate', name: 'Meena Kadam', email: 'meena@rozgarlink.gov.in', phone: '9876543212', locale: 'mr' },
    { id: '11111111-0000-0000-0000-000000000004', role: 'candidate', name: 'Dinesh Mane (Missing Data)', email: 'dinesh@rozgarlink.gov.in', phone: '9876543213', locale: 'en' },
    { id: '11111111-0000-0000-0000-000000000005', role: 'candidate', name: 'Suresh Deshmukh (Age Edge Case)', email: 'suresh@rozgarlink.gov.in', phone: '9876543214', locale: 'en' },
    { id: '11111111-0000-0000-0000-000000000006', role: 'candidate', name: 'Pooja Jadhav (Unverified)', email: 'pooja@rozgarlink.gov.in', phone: '9876543215', locale: 'hi' },
    { id: '22222222-0000-0000-0000-000000000001', role: 'officer', name: 'Officer Kiran More', email: 'kiran@rozgarlink.gov.in', phone: '9876543220', locale: 'en' },
    { id: '33333333-0000-0000-0000-000000000001', role: 'catalogue_manager', name: 'Deepa Joshi', email: 'deepa@rozgarlink.gov.in', phone: '9876543230', locale: 'en' },
    { id: '44444444-0000-0000-0000-000000000001', role: 'admin', name: 'Vikram Shinde', email: 'admin@rozgarlink.gov.in', phone: '9876543240', locale: 'en' },
    { id: '55555555-0000-0000-0000-000000000001', role: 'evaluator', name: 'Programme Evaluator', email: 'evaluator@rozgarlink.gov.in', phone: '9876543250', locale: 'en' }
];
exports.SEED_CANDIDATES = [
    // 1. Asha: 22, Pune, ITI Electrician
    {
        id: 'c1111111-0000-0000-0000-000000000001',
        userId: '11111111-0000-0000-0000-000000000001',
        name: 'Asha Sharma',
        state: 'Maharashtra',
        district: 'Pune',
        pincode: '411001',
        dob: '2005-01-15',
        preferences: {
            commuteKm: 15,
            minPay: 12000,
            shift: 'day',
            workType: ['full-time'],
            sector: ['electrical', 'manufacturing'],
            weights: { commute: 0.25, pay: 0.25, shift: 0.25, workType: 0.25 }
        },
        qualifications: [
            { id: 'q1', levelOrdinal: 4, fieldCode: 'Electrician', institution: 'Government ITI Pune', year: 2023, verified: true }
        ],
        certifications: [
            { id: 'crt1', code: 'ELEC_SAFETY', name: 'Electrical Safety Certificate', issuer: 'MSBTE', validTill: '2028-12-31', verified: true }
        ],
        experience: [{ domainCode: 'electrical', months: 6 }],
        skills: [
            { skillId: 'SK-ELEC-WIRING', proficiency: 4, source: 'manual', confirmed: true },
            { skillId: 'SK-PANEL-FIT', proficiency: 3, source: 'manual', confirmed: true }
        ]
    },
    // 2. Rahul: 27, Nagpur, 12th pass
    {
        id: 'c1111111-0000-0000-0000-000000000002',
        userId: '11111111-0000-0000-0000-000000000002',
        name: 'Rahul Patil',
        state: 'Maharashtra',
        district: 'Nagpur',
        pincode: '440001',
        dob: '2000-04-10',
        preferences: {
            commuteKm: 20,
            minPay: 15000,
            shift: 'day',
            workType: ['full-time'],
            sector: ['accounting', 'finance', 'it'],
            weights: { commute: 0.25, pay: 0.25, shift: 0.25, workType: 0.25 }
        },
        qualifications: [
            { id: 'q2', levelOrdinal: 3, fieldCode: 'Commerce', institution: 'Nagpur Board High School', year: 2018, verified: true }
        ],
        certifications: [],
        experience: [{ domainCode: 'accounting', months: 14 }],
        skills: [
            { skillId: 'SK-ACCOUNTING-SW', proficiency: 4, source: 'manual', confirmed: true },
            { skillId: 'SK-TAX-FILING', proficiency: 3, source: 'manual', confirmed: true },
            { skillId: 'SK-SPREADSHEET', proficiency: 4, source: 'manual', confirmed: true }
        ]
    },
    // 3. Meena: 34, Kolhapur, tailoring skills, short commute preference
    {
        id: 'c1111111-0000-0000-0000-000000000003',
        userId: '11111111-0000-0000-0000-000000000003',
        name: 'Meena Kadam',
        state: 'Maharashtra',
        district: 'Kolhapur',
        pincode: '416001',
        dob: '1992-08-20',
        preferences: {
            commuteKm: 8,
            minPay: 10000,
            shift: 'day',
            workType: ['full-time', 'part-time'],
            sector: ['textile', 'garments'],
            weights: { commute: 0.5, pay: 0.2, shift: 0.15, workType: 0.15 }
        },
        qualifications: [
            { id: 'q3', levelOrdinal: 2, fieldCode: 'General', institution: 'Kolhapur ZP School', year: 2008, verified: true }
        ],
        certifications: [
            { id: 'crt2', code: 'TAILOR_CERT', name: 'Garment Construction Certificate', issuer: 'Mahila Vikas', validTill: '2029-01-01', verified: true }
        ],
        experience: [{ domainCode: 'tailoring', months: 36 }],
        skills: [
            { skillId: 'SK-TAILORING', proficiency: 5, source: 'manual', confirmed: true },
            { skillId: 'SK-SEWING-MACHINE', proficiency: 5, source: 'manual', confirmed: true }
        ]
    },
    // 4. Dinesh: Missing data edge case
    {
        id: 'c1111111-0000-0000-0000-000000000004',
        userId: '11111111-0000-0000-0000-000000000004',
        name: 'Dinesh Mane',
        state: 'Maharashtra',
        district: '',
        pincode: '',
        dob: '',
        preferences: {
            commuteKm: 15,
            minPay: 10000,
            shift: 'flexible',
            workType: ['full-time'],
            sector: [],
            weights: { commute: 0.25, pay: 0.25, shift: 0.25, workType: 0.25 }
        },
        qualifications: [],
        certifications: [],
        experience: [],
        skills: []
    },
    // 5. Suresh: Age edge case (Born 1990 -> 36 years old in 2026/2027)
    {
        id: 'c1111111-0000-0000-0000-000000000005',
        userId: '11111111-0000-0000-0000-000000000005',
        name: 'Suresh Deshmukh',
        state: 'Maharashtra',
        district: 'Pune',
        pincode: '411002',
        dob: '1990-03-12',
        preferences: {
            commuteKm: 25,
            minPay: 20000,
            shift: 'day',
            workType: ['full-time'],
            sector: ['electrical'],
            weights: { commute: 0.25, pay: 0.25, shift: 0.25, workType: 0.25 }
        },
        qualifications: [
            { id: 'q5', levelOrdinal: 5, fieldCode: 'Electrical', institution: 'Government Polytechnic', year: 2012, verified: true }
        ],
        certifications: [
            { id: 'crt5', code: 'FIRE_SAFETY', name: 'Fire Safety Certificate', issuer: 'National Fire Academy', validTill: '2029-01-01', verified: true }
        ],
        experience: [{ domainCode: 'electrical', months: 60 }],
        skills: [
            { skillId: 'SK-ELEC-WIRING', proficiency: 5, source: 'manual', confirmed: true },
            { skillId: 'SK-PANEL-FIT', proficiency: 5, source: 'manual', confirmed: true }
        ]
    },
    // 6. Pooja: Unverified qualification
    {
        id: 'c1111111-0000-0000-0000-000000000006',
        userId: '11111111-0000-0000-0000-000000000006',
        name: 'Pooja Jadhav',
        state: 'Maharashtra',
        district: 'Nashik',
        pincode: '422001',
        dob: '2002-11-05',
        preferences: {
            commuteKm: 15,
            minPay: 12000,
            shift: 'day',
            workType: ['full-time'],
            sector: ['manufacturing'],
            weights: { commute: 0.25, pay: 0.25, shift: 0.25, workType: 0.25 }
        },
        qualifications: [
            { id: 'q6', levelOrdinal: 4, fieldCode: 'Electrician', institution: 'Private ITI Nashik', year: 2022, verified: false }
        ],
        certifications: [],
        experience: [{ domainCode: 'electrical', months: 4 }],
        skills: [
            { skillId: 'SK-ELEC-WIRING', proficiency: 3, source: 'manual', confirmed: true }
        ]
    }
];
exports.SEED_SKILLS = [
    { id: 'SK-ELEC-WIRING', canonicalName: 'Electrical Wiring', category: 'Electrical' },
    { id: 'SK-PANEL-FIT', canonicalName: 'Panel Fitting', category: 'Electrical' },
    { id: 'SK-FAULT-FIND', canonicalName: 'Fault Finding & Repair', category: 'Electrical' },
    { id: 'SK-SAFETY-PROC', canonicalName: 'Safety Procedures', category: 'Safety' },
    { id: 'SK-SPREADSHEET', canonicalName: 'Spreadsheet (Excel)', category: 'Office' },
    { id: 'SK-ACCOUNTING-SW', canonicalName: 'Accounting Software', category: 'Finance' },
    { id: 'SK-TAX-FILING', canonicalName: 'Tax Filing (GST)', category: 'Finance' },
    { id: 'SK-TAILORING', canonicalName: 'Tailoring & Stitching', category: 'Textiles' },
    { id: 'SK-SEWING-MACHINE', canonicalName: 'Sewing Machine Operation', category: 'Textiles' },
    { id: 'SK-CNC-BASICS', canonicalName: 'CNC Basics', category: 'Manufacturing' },
    { id: 'SK-CNC-PROG', canonicalName: 'CNC Programming', category: 'Manufacturing' },
    { id: 'SK-CUST-SERVICE', canonicalName: 'Customer Service', category: 'Services' },
    { id: 'SK-DATA-ENTRY', canonicalName: 'Data Entry', category: 'Office' },
    { id: 'SK-FIRST-AID', canonicalName: 'First Aid', category: 'Healthcare' },
    { id: 'SK-FIRE-SAFETY', canonicalName: 'Fire Safety Handling', category: 'Safety' },
    { id: 'SK-QUALITY-INSP', canonicalName: 'Quality Inspection', category: 'Manufacturing' },
    { id: 'SK-AUTO-REPAIR', canonicalName: 'Automotive Repair', category: 'Automotive' },
    { id: 'SK-WELDING-MIG', canonicalName: 'Welding (MIG/TIG)', category: 'Manufacturing' },
    { id: 'SK-PLUMBING', canonicalName: 'Plumbing & Pipefitting', category: 'Construction' },
    { id: 'SK-COMP-HARDWARE', canonicalName: 'Computer Hardware', category: 'IT' },
    { id: 'SK-NET-MAINT', canonicalName: 'Network Maintenance', category: 'IT' },
    { id: 'SK-DIGITAL-MKT', canonicalName: 'Digital Marketing', category: 'Marketing' },
    { id: 'SK-RETAIL-SALES', canonicalName: 'Retail Sales', category: 'Retail' },
    { id: 'SK-HEAVY-DRIVE', canonicalName: 'Heavy Vehicle Driving', category: 'Logistics' },
    { id: 'SK-LIGHT-DRIVE', canonicalName: 'Light Motor Driving', category: 'Logistics' },
    { id: 'SK-SOLAR-PV', canonicalName: 'Solar PV Installation', category: 'Renewables' },
    { id: 'SK-ELEC-MAINT', canonicalName: 'Electrician Maintenance', category: 'Electrical' },
    { id: 'SK-BASIC-ENG', canonicalName: 'Workplace English', category: 'Soft Skills' },
    { id: 'SK-INVENTORY-MGMT', canonicalName: 'Inventory Management', category: 'Logistics' },
    { id: 'SK-STOREKEEPING', canonicalName: 'Storekeeping', category: 'Logistics' },
    { id: 'SK-BILLING-INV', canonicalName: 'Billing & Invoicing', category: 'Finance' },
    { id: 'SK-MED-LAB-TECH', canonicalName: 'Medical Lab Technology', category: 'Healthcare' },
    { id: 'SK-PATIENT-CARE', canonicalName: 'Patient Care & Nursing Support', category: 'Healthcare' },
    { id: 'SK-MACHINE-MAINT', canonicalName: 'Industrial Machine Maintenance', category: 'Manufacturing' },
    { id: 'SK-PLC-PROG', canonicalName: 'PLC Programming', category: 'Automation' },
    { id: 'SK-GRAPHIC-DESIGN', canonicalName: 'Graphic Design', category: 'Media' },
    { id: 'SK-WEB-DEV', canonicalName: 'Web Development Basics', category: 'IT' },
    { id: 'SK-FOOD-SAFETY', canonicalName: 'Food Safety & Hygiene', category: 'Hospitality' },
    { id: 'SK-HOSPITALITY', canonicalName: 'Hospitality & Front Desk', category: 'Hospitality' },
    { id: 'SK-BANKING-OPS', canonicalName: 'Banking Operations', category: 'Finance' }
];
exports.SEED_ALIASES = [
    // Spreadsheets
    { skillId: 'SK-SPREADSHEET', phraseNorm: 'ms excel' },
    { skillId: 'SK-SPREADSHEET', phraseNorm: 'advanced excel' },
    { skillId: 'SK-SPREADSHEET', phraseNorm: 'excel' },
    { skillId: 'SK-SPREADSHEET', phraseNorm: 'spreadsheets' },
    { skillId: 'SK-SPREADSHEET', phraseNorm: 'google sheets' },
    { skillId: 'SK-SPREADSHEET', phraseNorm: 'microsoft excel' },
    { skillId: 'SK-SPREADSHEET', phraseNorm: 'excel formulas' },
    { skillId: 'SK-SPREADSHEET', phraseNorm: 'vlookup' },
    { skillId: 'SK-SPREADSHEET', phraseNorm: 'pivot tables' },
    // Accounting & Tax
    { skillId: 'SK-ACCOUNTING-SW', phraseNorm: 'tally' },
    { skillId: 'SK-ACCOUNTING-SW', phraseNorm: 'tally prime' },
    { skillId: 'SK-ACCOUNTING-SW', phraseNorm: 'tally erp' },
    { skillId: 'SK-ACCOUNTING-SW', phraseNorm: 'tally erp 9' },
    { skillId: 'SK-ACCOUNTING-SW', phraseNorm: 'bookkeeping' },
    { skillId: 'SK-ACCOUNTING-SW', phraseNorm: 'khata' },
    { skillId: 'SK-ACCOUNTING-SW', phraseNorm: 'hisaab' },
    { skillId: 'SK-ACCOUNTING-SW', phraseNorm: 'quickbooks' },
    { skillId: 'SK-ACCOUNTING-SW', phraseNorm: 'busy accounting' },
    { skillId: 'SK-TAX-FILING', phraseNorm: 'gst' },
    { skillId: 'SK-TAX-FILING', phraseNorm: 'gst filing' },
    { skillId: 'SK-TAX-FILING', phraseNorm: 'gst returns' },
    { skillId: 'SK-TAX-FILING', phraseNorm: 'gstr 1' },
    { skillId: 'SK-TAX-FILING', phraseNorm: 'gstr 3b' },
    { skillId: 'SK-TAX-FILING', phraseNorm: 'income tax' },
    { skillId: 'SK-TAX-FILING', phraseNorm: 'tds filing' },
    { skillId: 'SK-TAX-FILING', phraseNorm: 'e-way bill' },
    // Electrical wiring
    { skillId: 'SK-ELEC-WIRING', phraseNorm: 'wiring' },
    { skillId: 'SK-ELEC-WIRING', phraseNorm: 'bijli wiring' },
    { skillId: 'SK-ELEC-WIRING', phraseNorm: 'house wiring' },
    { skillId: 'SK-ELEC-WIRING', phraseNorm: 'domestic wiring' },
    { skillId: 'SK-ELEC-WIRING', phraseNorm: 'industrial wiring' },
    { skillId: 'SK-ELEC-WIRING', phraseNorm: 'mcb installation' },
    { skillId: 'SK-ELEC-WIRING', phraseNorm: 'wireman' },
    { skillId: 'SK-ELEC-WIRING', phraseNorm: 'taar jodni' },
    { skillId: 'SK-ELEC-WIRING', phraseNorm: 'switchboard fitting' },
    { skillId: 'SK-ELEC-WIRING', phraseNorm: 'conduit piping' },
    { skillId: 'SK-ELEC-WIRING', phraseNorm: 'fixing home power points' },
    // Panel Fitting
    { skillId: 'SK-PANEL-FIT', phraseNorm: 'panel fitting' },
    { skillId: 'SK-PANEL-FIT', phraseNorm: 'control panel assembly' },
    { skillId: 'SK-PANEL-FIT', phraseNorm: 'electric panel' },
    { skillId: 'SK-PANEL-FIT', phraseNorm: 'switchgear assembly' },
    { skillId: 'SK-PANEL-FIT', phraseNorm: 'panel wiring' },
    { skillId: 'SK-PANEL-FIT', phraseNorm: 'busbar installation' },
    // Fault Finding
    { skillId: 'SK-FAULT-FIND', phraseNorm: 'fault finding' },
    { skillId: 'SK-FAULT-FIND', phraseNorm: 'troubleshooting' },
    { skillId: 'SK-FAULT-FIND', phraseNorm: 'multimeter testing' },
    { skillId: 'SK-FAULT-FIND', phraseNorm: 'circuit testing' },
    { skillId: 'SK-FAULT-FIND', phraseNorm: 'short circuit repair' },
    // Tailoring
    { skillId: 'SK-TAILORING', phraseNorm: 'tailoring' },
    { skillId: 'SK-TAILORING', phraseNorm: 'stitching' },
    { skillId: 'SK-TAILORING', phraseNorm: 'silai' },
    { skillId: 'SK-TAILORING', phraseNorm: 'shivan' },
    { skillId: 'SK-TAILORING', phraseNorm: 'cloth cutting' },
    { skillId: 'SK-TAILORING', phraseNorm: 'garment making' },
    { skillId: 'SK-TAILORING', phraseNorm: 'pattern cutting' },
    { skillId: 'SK-TAILORING', phraseNorm: 'blouse stitching' },
    { skillId: 'SK-SEWING-MACHINE', phraseNorm: 'sewing' },
    { skillId: 'SK-SEWING-MACHINE', phraseNorm: 'sewing machine' },
    { skillId: 'SK-SEWING-MACHINE', phraseNorm: 'silai machine' },
    { skillId: 'SK-SEWING-MACHINE', phraseNorm: 'motor sewing machine' },
    { skillId: 'SK-SEWING-MACHINE', phraseNorm: 'overlock machine' },
    // CNC
    { skillId: 'SK-CNC-BASICS', phraseNorm: 'cnc' },
    { skillId: 'SK-CNC-BASICS', phraseNorm: 'cnc machine operator' },
    { skillId: 'SK-CNC-BASICS', phraseNorm: 'vmc machine' },
    { skillId: 'SK-CNC-BASICS', phraseNorm: 'lathe machine' },
    { skillId: 'SK-CNC-PROG', phraseNorm: 'cnc programming' },
    { skillId: 'SK-CNC-PROG', phraseNorm: 'g code m code' },
    // Customer Service
    { skillId: 'SK-CUST-SERVICE', phraseNorm: 'customer support' },
    { skillId: 'SK-CUST-SERVICE', phraseNorm: 'call center' },
    { skillId: 'SK-CUST-SERVICE', phraseNorm: 'client handling' },
    { skillId: 'SK-CUST-SERVICE', phraseNorm: 'grahak seva' },
    { skillId: 'SK-CUST-SERVICE', phraseNorm: 'telecaller' },
    // Data Entry
    { skillId: 'SK-DATA-ENTRY', phraseNorm: 'data entry' },
    { skillId: 'SK-DATA-ENTRY', phraseNorm: 'typing' },
    { skillId: 'SK-DATA-ENTRY', phraseNorm: 'computer typing' },
    { skillId: 'SK-DATA-ENTRY', phraseNorm: 'data operator' },
    // Welding
    { skillId: 'SK-WELDING-MIG', phraseNorm: 'welding' },
    { skillId: 'SK-WELDING-MIG', phraseNorm: 'mig welding' },
    { skillId: 'SK-WELDING-MIG', phraseNorm: 'tig welding' },
    { skillId: 'SK-WELDING-MIG', phraseNorm: 'arc welding' },
    { skillId: 'SK-WELDING-MIG', phraseNorm: 'gas welding' },
    // Solar PV
    { skillId: 'SK-SOLAR-PV', phraseNorm: 'solar installation' },
    { skillId: 'SK-SOLAR-PV', phraseNorm: 'solar panels' },
    { skillId: 'SK-SOLAR-PV', phraseNorm: 'rooftop solar' },
    { skillId: 'SK-SOLAR-PV', phraseNorm: 'suryaghar' },
    // Driving
    { skillId: 'SK-LIGHT-DRIVE', phraseNorm: 'car driving' },
    { skillId: 'SK-LIGHT-DRIVE', phraseNorm: 'lmv driving' },
    { skillId: 'SK-LIGHT-DRIVE', phraseNorm: 'driver' },
    { skillId: 'SK-HEAVY-DRIVE', phraseNorm: 'truck driving' },
    { skillId: 'SK-HEAVY-DRIVE', phraseNorm: 'bus driving' },
    { skillId: 'SK-HEAVY-DRIVE', phraseNorm: 'hmv license' },
    // Safety
    { skillId: 'SK-SAFETY-PROC', phraseNorm: 'industrial safety' },
    { skillId: 'SK-SAFETY-PROC', phraseNorm: 'ppe usage' },
    { skillId: 'SK-FIRE-SAFETY', phraseNorm: 'fire extinguisher' },
    { skillId: 'SK-FIRE-SAFETY', phraseNorm: 'fire fighting' },
    // Inventory
    { skillId: 'SK-INVENTORY-MGMT', phraseNorm: 'stock management' },
    { skillId: 'SK-STOREKEEPING', phraseNorm: 'godown keeper' },
    { skillId: 'SK-STOREKEEPING', phraseNorm: 'warehouse store' },
    { skillId: 'SK-BILLING-INV', phraseNorm: 'invoice generation' },
    { skillId: 'SK-BILLING-INV', phraseNorm: 'cashier' },
    { skillId: 'SK-BASIC-ENG', phraseNorm: 'spoken english' },
    { skillId: 'SK-BASIC-ENG', phraseNorm: 'communication skills' }
];
exports.SEED_COURSES = [
    {
        id: 'COURSE-SAFETY',
        title: 'Basics of Industrial Safety & PPE',
        provider: 'National Safety Council India',
        durationHours: 10,
        level: 'beginner',
        mode: 'online',
        language: 'en',
        costInr: 0,
        url: 'https://skillindia.gov.in/courses/safety-basics',
        skillsTaught: [{ skillId: 'SK-SAFETY-PROC', levelReached: 2 }],
        prerequisites: []
    },
    {
        id: 'COURSE-PANEL-WIRING',
        title: 'Control Panel Wiring & Assembly',
        provider: 'Government Polytechnic Pune',
        durationHours: 40,
        level: 'intermediate',
        mode: 'offline',
        language: 'en',
        costInr: 500,
        url: 'https://msbte.org.in/courses/panel-wiring',
        skillsTaught: [
            { skillId: 'SK-PANEL-FIT', levelReached: 3 },
            { skillId: 'SK-FAULT-FIND', levelReached: 3 }
        ],
        prerequisites: ['COURSE-SAFETY']
    },
    {
        id: 'COURSE-EXCEL-WORK',
        title: 'Excel for Workplace & Data Analytics',
        provider: 'Maharashtra State Skill Development Society',
        durationHours: 20,
        level: 'beginner',
        mode: 'online',
        language: 'en',
        costInr: 0,
        url: 'https://mssds.gov.in/courses/excel-workplace',
        skillsTaught: [
            { skillId: 'SK-SPREADSHEET', levelReached: 3 },
            { skillId: 'SK-DATA-ENTRY', levelReached: 3 }
        ],
        prerequisites: []
    },
    {
        id: 'COURSE-TALLY-GST',
        title: 'Tally Prime with Practical GST Filing',
        provider: 'ICA Edu Skills',
        durationHours: 35,
        level: 'intermediate',
        mode: 'hybrid',
        language: 'en',
        costInr: 800,
        url: 'https://icaeduskills.com/tally-gst',
        skillsTaught: [
            { skillId: 'SK-ACCOUNTING-SW', levelReached: 4 },
            { skillId: 'SK-TAX-FILING', levelReached: 4 }
        ],
        prerequisites: ['COURSE-EXCEL-WORK']
    },
    {
        id: 'COURSE-DIPLOMA-BRIDGE',
        title: 'Diploma in Electrical Engineering Bridging Module',
        provider: 'Directorate of Technical Education (DTE)',
        durationHours: 120,
        level: 'advanced',
        mode: 'offline',
        language: 'en',
        costInr: 2500,
        qualificationAwardedOrdinal: 5, // AWARDS DIPLOMA (Ordinal 5)
        url: 'https://dte.maharashtra.gov.in/diploma-bridge',
        skillsTaught: [
            { skillId: 'SK-ELEC-WIRING', levelReached: 4 },
            { skillId: 'SK-PANEL-FIT', levelReached: 4 },
            { skillId: 'SK-ELEC-MAINT', levelReached: 4 }
        ],
        prerequisites: ['COURSE-SAFETY']
    },
    {
        id: 'COURSE-TAILORING-PRO',
        title: 'Commercial Garment Construction & Pattern Making',
        provider: 'Usha Sewing School',
        durationHours: 30,
        level: 'intermediate',
        mode: 'offline',
        language: 'mr',
        costInr: 400,
        url: 'https://ushasewing.com/garment-construction',
        skillsTaught: [
            { skillId: 'SK-TAILORING', levelReached: 4 },
            { skillId: 'SK-SEWING-MACHINE', levelReached: 4 }
        ],
        prerequisites: []
    },
    {
        id: 'COURSE-SOLAR-PV',
        title: 'Suryamitra Solar PV Rooftop Technician',
        provider: 'National Institute of Solar Energy (NISE)',
        durationHours: 60,
        level: 'intermediate',
        mode: 'offline',
        language: 'en',
        costInr: 0,
        url: 'https://nise.res.in/suryamitra',
        skillsTaught: [
            { skillId: 'SK-SOLAR-PV', levelReached: 4 },
            { skillId: 'SK-ELEC-WIRING', levelReached: 3 }
        ],
        prerequisites: ['COURSE-SAFETY']
    },
    {
        id: 'COURSE-CNC-OPERATOR',
        title: 'CNC Lathe & Milling Machine Operator',
        provider: 'Indo-German Tool Room (IGTR)',
        durationHours: 50,
        level: 'intermediate',
        mode: 'offline',
        language: 'en',
        costInr: 1200,
        url: 'https://igtr-aurangabad.org/cnc-operator',
        skillsTaught: [
            { skillId: 'SK-CNC-BASICS', levelReached: 3 },
            { skillId: 'SK-QUALITY-INSP', levelReached: 3 }
        ],
        prerequisites: ['COURSE-SAFETY']
    },
    {
        id: 'COURSE-SPOKEN-ENG',
        title: 'Workplace English & Professional Communication',
        provider: 'British Council & NSDC',
        durationHours: 25,
        level: 'beginner',
        mode: 'online',
        language: 'en',
        costInr: 0,
        url: 'https://nsdcindia.org/spoken-english',
        skillsTaught: [
            { skillId: 'SK-BASIC-ENG', levelReached: 3 },
            { skillId: 'SK-CUST-SERVICE', levelReached: 3 }
        ],
        prerequisites: []
    },
    {
        id: 'COURSE-FIRE-SAFETY-CERT',
        title: 'Certified Fire Safety Officer Training',
        provider: 'State Disaster Management Authority',
        durationHours: 45,
        level: 'intermediate',
        mode: 'offline',
        language: 'en',
        costInr: 1000,
        url: 'https://mahasdma.gov.in/fire-training',
        skillsTaught: [{ skillId: 'SK-FIRE-SAFETY', levelReached: 4 }],
        prerequisites: ['COURSE-SAFETY']
    }
];
exports.SEED_OPPORTUNITIES = [
    // 1. OP-01: Electrician Apprentice - Pune
    {
        id: 'OP-101',
        title: 'Electrician Apprentice',
        orgName: 'Maharashtra State Electricity Distribution (MSEDCL)',
        workDescription: 'Installation and maintenance of distribution lines and transformer panel equipment.',
        state: 'Maharashtra',
        district: 'Pune',
        lat: 18.5204,
        lng: 73.8567,
        status: 'open',
        closesOn: '2027-06-30',
        referenceDate: '2027-01-01',
        preferenceAttrs: {
            pay: { min: 14000, max: 18000 },
            shift: 'day',
            workType: 'full-time',
            sector: 'electrical'
        },
        rules: [
            {
                id: 'r-101-1',
                type: 'RESIDENCE_STATE',
                operator: 'in',
                value: ['Maharashtra'],
                label: 'Open to residents of Maharashtra',
                requiresVerification: false
            },
            {
                id: 'r-101-2',
                type: 'QUAL_MIN_LEVEL',
                operator: 'gte',
                value: 4, // ITI
                label: 'Requires at least an ITI qualification',
                requiresVerification: false
            },
            {
                id: 'r-101-3',
                type: 'AGE_RANGE',
                operator: 'between',
                value: { min: 18, max: 35 },
                label: 'Age between 18 and 35 as on 1 Jan 2027',
                requiresVerification: false,
                referenceDate: '2027-01-01'
            }
        ],
        skills: [
            { skillId: 'SK-ELEC-WIRING', importance: 'required', minProficiency: 3 },
            { skillId: 'SK-PANEL-FIT', importance: 'required', minProficiency: 2 },
            { skillId: 'SK-SAFETY-PROC', importance: 'preferred', minProficiency: 1 }
        ]
    },
    // 2. OP-102: Wiring Technician - Pune & Nashik Restricted (Scenario A)
    {
        id: 'OP-102',
        title: 'Wiring Technician',
        orgName: 'Siemens Industrial Automation',
        workDescription: 'Wiring of control panels and relay testing for industrial plant automation.',
        state: 'Maharashtra',
        district: 'Pune',
        lat: 18.5304,
        lng: 73.8667,
        status: 'open',
        closesOn: '2027-05-15',
        referenceDate: '2027-01-01',
        preferenceAttrs: {
            pay: { min: 16000, max: 20000 },
            shift: 'day',
            workType: 'full-time',
            sector: 'electrical'
        },
        rules: [
            {
                id: 'r-102-1',
                type: 'RESIDENCE_DISTRICT',
                operator: 'in',
                value: ['Pune', 'Nashik'],
                label: 'Open to residents of Pune or Nashik',
                requiresVerification: false
            },
            {
                id: 'r-102-2',
                type: 'QUAL_MIN_LEVEL',
                operator: 'gte',
                value: 4, // ITI
                label: 'Requires at least ITI',
                requiresVerification: false
            }
        ],
        skills: [
            { skillId: 'SK-ELEC-WIRING', importance: 'required', minProficiency: 3 },
            { skillId: 'SK-FAULT-FIND', importance: 'preferred', minProficiency: 2 }
        ]
    },
    // 3. OP-103: Senior Electrical Supervisor - Requires Diploma (Scenario B)
    {
        id: 'OP-103',
        title: 'Senior Electrical Supervisor',
        orgName: 'Tata Motors Manufacturing',
        workDescription: 'Supervising assembly floor power distribution systems and high voltage panel lines.',
        state: 'Maharashtra',
        district: 'Pune',
        lat: 18.6275,
        lng: 73.8131,
        status: 'open',
        closesOn: '2027-08-01',
        referenceDate: '2027-01-01',
        preferenceAttrs: {
            pay: { min: 28000, max: 35000 },
            shift: 'day',
            workType: 'full-time',
            sector: 'automotive'
        },
        rules: [
            {
                id: 'r-103-1',
                type: 'QUAL_MIN_LEVEL',
                operator: 'gte',
                value: 5, // Diploma
                label: 'Requires at least a Diploma',
                requiresVerification: false
            },
            {
                id: 'r-103-2',
                type: 'RESIDENCE_STATE',
                operator: 'in',
                value: ['Maharashtra'],
                label: 'Resident of Maharashtra',
                requiresVerification: false
            }
        ],
        skills: [
            { skillId: 'SK-ELEC-WIRING', importance: 'required', minProficiency: 4 },
            { skillId: 'SK-PANEL-FIT', importance: 'required', minProficiency: 3 },
            { skillId: 'SK-FAULT-FIND', importance: 'preferred', minProficiency: 2 }
        ]
    },
    // 4. OP-104: Junior Accounts Assistant - Nagpur (Scenario C)
    {
        id: 'OP-104',
        title: 'Junior Accounts Assistant',
        orgName: 'Nagpur Municipal Corporation (NMC)',
        workDescription: 'Managing daily accounting vouchers, reconciliation, and GST invoice filings.',
        state: 'Maharashtra',
        district: 'Nagpur',
        lat: 21.1458,
        lng: 79.0882,
        status: 'open',
        closesOn: '2027-07-20',
        referenceDate: '2027-01-01',
        preferenceAttrs: {
            pay: { min: 16000, max: 20000 },
            shift: 'day',
            workType: 'full-time',
            sector: 'finance'
        },
        rules: [
            {
                id: 'r-104-1',
                type: 'QUAL_MIN_LEVEL',
                operator: 'gte',
                value: 3, // 12th pass
                label: 'Requires at least 12th pass',
                requiresVerification: false
            },
            {
                id: 'r-104-2',
                type: 'RESIDENCE_STATE',
                operator: 'in',
                value: ['Maharashtra'],
                label: 'Open to residents of Maharashtra',
                requiresVerification: false
            }
        ],
        skills: [
            { skillId: 'SK-ACCOUNTING-SW', importance: 'required', minProficiency: 3 },
            { skillId: 'SK-TAX-FILING', importance: 'required', minProficiency: 2 },
            { skillId: 'SK-SPREADSHEET', importance: 'preferred', minProficiency: 2 }
        ]
    },
    // 5. OP-105: Strict Age 18-30 Role - Demonstrates Age Gate (Scenario E)
    {
        id: 'OP-105',
        title: 'Field Electrical Trainee (Youth Scheme)',
        orgName: 'Pimpri Chinchwad Smart City',
        workDescription: 'Field installation of smart street lighting systems and solar controllers.',
        state: 'Maharashtra',
        district: 'Pune',
        lat: 18.6298,
        lng: 73.7997,
        status: 'open',
        closesOn: '2027-04-30',
        referenceDate: '2027-01-01',
        preferenceAttrs: {
            pay: { min: 15000 },
            shift: 'day',
            workType: 'full-time',
            sector: 'electrical'
        },
        rules: [
            {
                id: 'r-105-1',
                type: 'AGE_RANGE',
                operator: 'between',
                value: { min: 18, max: 30 },
                label: 'Age limit 18 to 30 years as on 1 Jan 2027',
                requiresVerification: false,
                referenceDate: '2027-01-01'
            },
            {
                id: 'r-105-2',
                type: 'QUAL_MIN_LEVEL',
                operator: 'gte',
                value: 4, // ITI
                label: 'Requires ITI',
                requiresVerification: false
            }
        ],
        skills: [
            { skillId: 'SK-ELEC-WIRING', importance: 'required', minProficiency: 3 },
            { skillId: 'SK-PANEL-FIT', importance: 'required', minProficiency: 2 }
        ]
    },
    // 6. OP-106: Garment Stitching Associate - Kolhapur
    {
        id: 'OP-106',
        title: 'Garment Stitching Associate',
        orgName: 'Kolhapur Textile Cluster',
        workDescription: 'Operating industrial stitching machines for export apparel production.',
        state: 'Maharashtra',
        district: 'Kolhapur',
        lat: 16.705,
        lng: 74.2433,
        status: 'open',
        closesOn: '2027-09-15',
        referenceDate: '2027-01-01',
        preferenceAttrs: {
            pay: { min: 12500 },
            shift: 'day',
            workType: 'full-time',
            sector: 'textiles'
        },
        rules: [
            {
                id: 'r-106-1',
                type: 'QUAL_MIN_LEVEL',
                operator: 'gte',
                value: 2, // 10th pass
                label: 'Requires at least 10th pass',
                requiresVerification: false
            },
            {
                id: 'r-106-2',
                type: 'RESIDENCE_STATE',
                operator: 'in',
                value: ['Maharashtra'],
                label: 'Resident of Maharashtra',
                requiresVerification: false
            }
        ],
        skills: [
            { skillId: 'SK-TAILORING', importance: 'required', minProficiency: 3 },
            { skillId: 'SK-SEWING-MACHINE', importance: 'required', minProficiency: 3 }
        ]
    },
    // 7. OP-107: Driving Licence Mandatory - Missing Data (Scenario G)
    {
        id: 'OP-107',
        title: 'Emergency Utility Response Driver',
        orgName: 'Pune City Municipal Corporation',
        workDescription: 'Driving municipal electrical maintenance utility vans across Pune division.',
        state: 'Maharashtra',
        district: 'Pune',
        lat: 18.5204,
        lng: 73.8567,
        status: 'open',
        closesOn: '2027-08-30',
        referenceDate: '2027-01-01',
        preferenceAttrs: {
            pay: { min: 17000 },
            shift: 'rotational',
            workType: 'full-time',
            sector: 'logistics'
        },
        rules: [
            {
                id: 'r-107-1',
                type: 'CERT_REQUIRED',
                operator: 'has',
                value: { code: 'DRIVING_LICENCE', name: 'Valid Driving Licence (LMV)' },
                label: 'Requires valid driving licence',
                requiresVerification: false
            },
            {
                id: 'r-107-2',
                type: 'RESIDENCE_STATE',
                operator: 'in',
                value: ['Maharashtra'],
                label: 'Open to residents of Maharashtra',
                requiresVerification: false
            }
        ],
        skills: [
            { skillId: 'SK-LIGHT-DRIVE', importance: 'required', minProficiency: 3 }
        ]
    },
    // 8. OP-108: Panel Specialist - Requires 2 Gaps (Scenario F)
    {
        id: 'OP-108',
        title: 'Industrial Automation Panel Specialist',
        orgName: 'ABB India',
        workDescription: 'Assembly of PLC controlled switchboards and fault analysis for substations.',
        state: 'Maharashtra',
        district: 'Pune',
        lat: 18.5104,
        lng: 73.8467,
        status: 'open',
        closesOn: '2027-10-01',
        referenceDate: '2027-01-01',
        preferenceAttrs: {
            pay: { min: 22000 },
            shift: 'day',
            workType: 'full-time',
            sector: 'electrical'
        },
        rules: [
            {
                id: 'r-108-1',
                type: 'QUAL_MIN_LEVEL',
                operator: 'gte',
                value: 4, // ITI
                label: 'Requires ITI',
                requiresVerification: false
            }
        ],
        skills: [
            { skillId: 'SK-PANEL-FIT', importance: 'required', minProficiency: 3 },
            { skillId: 'SK-FAULT-FIND', importance: 'required', minProficiency: 3 }
        ]
    },
    // 9. OP-109: Verified Qualification Enforced
    {
        id: 'OP-109',
        title: 'Certified Defence Ordnance Electrician',
        orgName: 'Defence Research & Development Organisation (DRDO)',
        workDescription: 'Precision electrical assembly in high security testing facility.',
        state: 'Maharashtra',
        district: 'Nashik',
        lat: 19.9975,
        lng: 73.7898,
        status: 'open',
        closesOn: '2027-11-30',
        referenceDate: '2027-01-01',
        preferenceAttrs: {
            pay: { min: 25000 },
            shift: 'day',
            workType: 'full-time',
            sector: 'manufacturing'
        },
        rules: [
            {
                id: 'r-109-1',
                type: 'QUAL_MIN_LEVEL',
                operator: 'gte',
                value: 4, // ITI
                label: 'Requires verified ITI certificate',
                requiresVerification: true // Verified flag checked!
            }
        ],
        skills: [
            { skillId: 'SK-ELEC-WIRING', importance: 'required', minProficiency: 3 }
        ]
    },
    // 10. OP-110: Solar Rooftop Installer - Satara
    {
        id: 'OP-110',
        title: 'Solar Rooftop Installer',
        orgName: 'Mahagenco Green Energy',
        workDescription: 'Rooftop mounting and electrical inverter wiring for commercial installations.',
        state: 'Maharashtra',
        district: 'Satara',
        lat: 17.6805,
        lng: 74.0183,
        status: 'open',
        closesOn: '2027-07-15',
        referenceDate: '2027-01-01',
        preferenceAttrs: {
            pay: { min: 15000 },
            shift: 'day',
            workType: 'full-time',
            sector: 'renewables'
        },
        rules: [
            {
                id: 'r-110-1',
                type: 'QUAL_MIN_LEVEL',
                operator: 'gte',
                value: 4, // ITI
                label: 'Requires ITI',
                requiresVerification: false
            }
        ],
        skills: [
            { skillId: 'SK-SOLAR-PV', importance: 'required', minProficiency: 3 },
            { skillId: 'SK-ELEC-WIRING', importance: 'required', minProficiency: 3 }
        ]
    }
];
