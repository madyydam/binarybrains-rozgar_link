export interface SkillDefinition {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  relatedSkillIds: { id: string; similarity: number }[];
}

export const CANONICAL_SKILLS: SkillDefinition[] = [
  // 1-8 Electrical & Renewable Energy
  {
    id: 'solar-pv-install',
    name: 'Solar PV Installation',
    category: 'Renewable Energy',
    aliases: ['solar panel fitting', 'solar pv installation', 'solar rooftop installation', 'solar installer', 'solar technician', 'solar panel setup', 'solar plant assembly'],
    relatedSkillIds: [{ id: 'basic-electrical', similarity: 0.80 }, { id: 'safety-compliance', similarity: 0.75 }]
  },
  {
    id: 'basic-electrical',
    name: 'Basic Electrical Maintenance',
    category: 'Electrical',
    aliases: ['electrician', 'electrical maintenance', 'house wiring', 'wiring and switchboard', 'electrical repair', 'electric fitting', 'bijli kam'],
    relatedSkillIds: [{ id: 'panel-wiring', similarity: 0.82 }, { id: 'fault-finding', similarity: 0.78 }]
  },
  {
    id: 'panel-wiring',
    name: 'Control Panel Wiring',
    category: 'Electrical',
    aliases: ['panel wiring', 'switchgear wiring', 'control panel assembly', 'industrial panel wiring', 'plc panel wiring'],
    relatedSkillIds: [{ id: 'basic-electrical', similarity: 0.82 }, { id: 'fault-finding', similarity: 0.80 }]
  },
  {
    id: 'fault-finding',
    name: 'Electrical Fault Diagnosis',
    category: 'Electrical',
    aliases: ['fault finding', 'troubleshooting electrical', 'circuit testing', 'fault detection', 'multimeter testing'],
    relatedSkillIds: [{ id: 'basic-electrical', similarity: 0.78 }, { id: 'panel-wiring', similarity: 0.80 }]
  },
  {
    id: 'safety-compliance',
    name: 'Industrial Safety Compliance',
    category: 'Safety',
    aliases: ['safety compliance', 'industrial safety', 'fire safety', 'ppe usage', 'workplace hazard safety', 'osha compliance'],
    relatedSkillIds: [{ id: 'solar-pv-install', similarity: 0.75 }, { id: 'first-aid', similarity: 0.72 }]
  },
  {
    id: 'first-aid',
    name: 'First Aid & Emergency Response',
    category: 'Safety',
    aliases: ['first aid', 'emergency response', 'cpr', 'workplace first aid', 'medical response basics'],
    relatedSkillIds: [{ id: 'safety-compliance', similarity: 0.72 }]
  },
  {
    id: 'hvac-maintenance',
    name: 'HVAC & Air Conditioning Repair',
    category: 'Mechanical',
    aliases: ['ac repair', 'hvac maintenance', 'air conditioner servicing', 'chiller plant maintenance', 'refrigeration technician'],
    relatedSkillIds: [{ id: 'basic-electrical', similarity: 0.74 }]
  },
  {
    id: 'welding-fabrication',
    name: 'Arc & Gas Welding',
    category: 'Mechanical',
    aliases: ['welding', 'arc welding', 'mig welding', 'gas welding', 'metal fabrication', 'welder helper'],
    relatedSkillIds: [{ id: 'safety-compliance', similarity: 0.70 }]
  },

  // 9-16 IT, Data & Digital Office
  {
    id: 'ms-excel',
    name: 'Microsoft Excel & Spreadsheets',
    category: 'Information Technology',
    aliases: ['ms excel', 'spreadsheets', 'advanced excel', 'excel sheet', 'google sheets', 'vlookup', 'pivot tables', 'data entry in excel'],
    relatedSkillIds: [{ id: 'data-entry', similarity: 0.82 }, { id: 'basic-computer', similarity: 0.78 }]
  },
  {
    id: 'data-entry',
    name: 'Data Entry & Typing',
    category: 'Information Technology',
    aliases: ['data entry', 'typing speed', 'data operator', 'computer data entry', 'english typing', 'marathi typing', 'hindi typing', 'back office entry'],
    relatedSkillIds: [{ id: 'ms-excel', similarity: 0.82 }, { id: 'basic-computer', similarity: 0.85 }]
  },
  {
    id: 'basic-computer',
    name: 'Basic Computer Operations',
    category: 'Information Technology',
    aliases: ['basic computer', 'mscit', 'computer literacy', 'ms office', 'internet browsing and email', 'windows operation', 'computer basics'],
    relatedSkillIds: [{ id: 'data-entry', similarity: 0.85 }, { id: 'ms-excel', similarity: 0.78 }]
  },
  {
    id: 'tally-accounting',
    name: 'Tally Prime & Accounting Basics',
    category: 'Finance & Accounting',
    aliases: ['tally', 'tally prime', 'tally erp 9', 'gst entry', 'accounting assistant', 'bookkeeping', 'vouchering'],
    relatedSkillIds: [{ id: 'ms-excel', similarity: 0.76 }]
  },
  {
    id: 'web-development',
    name: 'Web Design & HTML/CSS',
    category: 'Information Technology',
    aliases: ['web development', 'html css', 'website design', 'frontend basics', 'wordpress design'],
    relatedSkillIds: [{ id: 'basic-computer', similarity: 0.72 }]
  },
  {
    id: 'graphic-design',
    name: 'Graphic Design & Photoshop',
    category: 'Creative & Media',
    aliases: ['photoshop', 'coreldraw', 'canva design', 'graphic designer', 'banner design', 'image editing'],
    relatedSkillIds: [{ id: 'basic-computer', similarity: 0.70 }]
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing & Social Media',
    category: 'Marketing',
    aliases: ['social media handling', 'digital marketing', 'meta ads', 'instagram marketing', 'google ads', 'seo basics'],
    relatedSkillIds: [{ id: 'basic-computer', similarity: 0.70 }]
  },
  {
    id: 'it-hardware-networking',
    name: 'Computer Hardware & Networking',
    category: 'Information Technology',
    aliases: ['computer hardware repair', 'lan setup', 'router configuration', 'desktop support', 'printer troubleshooting', 'hardware technician'],
    relatedSkillIds: [{ id: 'basic-computer', similarity: 0.75 }]
  },

  // 17-24 Healthcare, Nursing & Caregiving
  {
    id: 'general-duty-assistant',
    name: 'General Duty Assistant (GDA)',
    category: 'Healthcare',
    aliases: ['gda', 'nursing assistant', 'patient care assistant', 'hospital attendant', 'ward boy', 'ayah'],
    relatedSkillIds: [{ id: 'patient-vitals-monitoring', similarity: 0.84 }, { id: 'first-aid', similarity: 0.80 }]
  },
  {
    id: 'patient-vitals-monitoring',
    name: 'Patient Vitals Monitoring',
    category: 'Healthcare',
    aliases: ['bp checking', 'vitals recording', 'temperature pulse check', 'blood pressure reading', 'oxygen level monitoring'],
    relatedSkillIds: [{ id: 'general-duty-assistant', similarity: 0.84 }]
  },
  {
    id: 'phlebotomy',
    name: 'Phlebotomy & Sample Collection',
    category: 'Healthcare',
    aliases: ['blood sample collection', 'phlebotomist', 'lab technician helper', 'vacutainer handling'],
    relatedSkillIds: [{ id: 'patient-vitals-monitoring', similarity: 0.72 }]
  },
  {
    id: 'elderly-care',
    name: 'Elderly & Geriatric Care',
    category: 'Healthcare',
    aliases: ['elderly care', 'bedside care', 'senior citizen care', 'geriatric caregiver', 'home health aide'],
    relatedSkillIds: [{ id: 'general-duty-assistant', similarity: 0.82 }]
  },
  {
    id: 'pharmacy-assistance',
    name: 'Retail Pharmacy Assistance',
    category: 'Healthcare',
    aliases: ['chemist shop assistant', 'medicine dispensing helper', 'pharmacy assistant', 'drug inventory'],
    relatedSkillIds: [{ id: 'customer-service', similarity: 0.72 }]
  },

  // 25-32 Automotive & Logistics
  {
    id: 'two-wheeler-repair',
    name: 'Two-Wheeler Service & Repair',
    category: 'Automotive',
    aliases: ['bike mechanic', 'scooter repair', 'two wheeler engine servicing', 'oil change and brakes', 'motorcycle repair'],
    relatedSkillIds: [{ id: 'four-wheeler-repair', similarity: 0.76 }]
  },
  {
    id: 'four-wheeler-repair',
    name: 'Automobile Service & Maintenance',
    category: 'Automotive',
    aliases: ['car mechanic', 'auto mechanic', 'four wheeler servicing', 'diesel mechanic', 'motor vehicle mechanic'],
    relatedSkillIds: [{ id: 'two-wheeler-repair', similarity: 0.76 }]
  },
  {
    id: 'ev-maintenance',
    name: 'Electric Vehicle (EV) Servicing',
    category: 'Automotive',
    aliases: ['ev service', 'electric scooter repair', 'battery pack replacement', 'bms diagnosis', 'ev technician'],
    relatedSkillIds: [{ id: 'two-wheeler-repair', similarity: 0.78 }, { id: 'basic-electrical', similarity: 0.76 }]
  },
  {
    id: 'warehouse-packing',
    name: 'Warehouse Operations & Order Packing',
    category: 'Logistics',
    aliases: ['warehouse picker', 'packer', 'order fulfillment', 'dispatch boy', 'scanning and sorting', 'barcode scanner usage'],
    relatedSkillIds: [{ id: 'inventory-management', similarity: 0.80 }]
  },
  {
    id: 'inventory-management',
    name: 'Stock Management & Inventory',
    category: 'Logistics',
    aliases: ['stock count', 'inventory keeper', 'storekeeper', 'warehouse stock management', 'godown incharge assistant'],
    relatedSkillIds: [{ id: 'warehouse-packing', similarity: 0.80 }, { id: 'ms-excel', similarity: 0.72 }]
  },
  {
    id: 'commercial-driving',
    name: 'Commercial Vehicle Driving',
    category: 'Logistics',
    aliases: ['lmv driving', 'hmv driving', 'delivery driver', 'van driver', 'cab driver', 'four wheeler driving with license'],
    relatedSkillIds: []
  },

  // 33-40 Hospitality, Retail, Construction & Services
  {
    id: 'customer-service',
    name: 'Customer Support & Front Desk',
    category: 'Services',
    aliases: ['customer service', 'receptionist', 'front office executive', 'client handling', 'call center support', 'telecalling'],
    relatedSkillIds: [{ id: 'retail-sales', similarity: 0.82 }]
  },
  {
    id: 'retail-sales',
    name: 'Retail Store Sales & Merchandising',
    category: 'Retail',
    aliases: ['store sales associate', 'counter sales', 'shop assistant', 'supermarket cashier', 'pos billing'],
    relatedSkillIds: [{ id: 'customer-service', similarity: 0.82 }]
  },
  {
    id: 'food-production-culinary',
    name: 'Commercial Cooking & Food Prep',
    category: 'Hospitality',
    aliases: ['cook assistant', 'commis chef', 'food preparation', 'kitchen helper', 'baking basics', 'catering cooking'],
    relatedSkillIds: [{ id: 'fnb-steward', similarity: 0.72 }]
  },
  {
    id: 'fnb-steward',
    name: 'Food & Beverage Service',
    category: 'Hospitality',
    aliases: ['waiter', 'steward', 'table service', 'restaurant serving', 'banquet server'],
    relatedSkillIds: [{ id: 'customer-service', similarity: 0.75 }]
  },
  {
    id: 'security-guard',
    name: 'Security Guard & Access Control',
    category: 'Security',
    aliases: ['security guard', 'gatekeeper', 'visitor log maintenance', 'cctv monitoring', 'patrolling'],
    relatedSkillIds: [{ id: 'first-aid', similarity: 0.70 }]
  },
  {
    id: 'plumbing-sanitary',
    name: 'Plumbing & Pipe Fitting',
    category: 'Construction',
    aliases: ['plumber', 'pipe fitting', 'tap and sanitary repair', 'pvc pipe jointing', 'water pump installation'],
    relatedSkillIds: []
  },
  {
    id: 'masonry-construction',
    name: 'Masonry & Concrete Works',
    category: 'Construction',
    aliases: ['mason', 'brick laying', 'plastering', 'concrete mixing', 'civil work helper'],
    relatedSkillIds: []
  },
  {
    id: 'sewing-apparel-stitching',
    name: 'Industrial Sewing & Tailoring',
    category: 'Apparel',
    aliases: ['tailor', 'garment stitching', 'industrial sewing machine operator', 'apparel cutting and stitching'],
    relatedSkillIds: []
  }
];
