export type SupportedLocale = 'en' | 'hi' | 'mr';

export interface TranslationStrings {
  eligibleTitle: string;
  notEligibleTitle: string;
  needsInfoTitle: string;
  strongSkillFit: string;
  partialSkillFit: string;
  closeCommute: string;
  farCommute: string;
  payMatch: string;
  shiftMatch: string;
  workTypeMatch: string;
  aiAssistedNotice: string;
  missingFieldNotice: string;
  failedRulePrefix: string;
  yourValue: string;
  requiredValue: string;
}

export const TRANSLATIONS: Record<SupportedLocale, TranslationStrings> = {
  en: {
    eligibleTitle: 'Eligible Match',
    notEligibleTitle: 'Not Eligible',
    needsInfoTitle: 'More Information Needed',
    strongSkillFit: 'Strong skill fit - matches {matched} of {total} required skills ({skills}).',
    partialSkillFit: 'Matches {matched} of {total} skills with related experience credit.',
    closeCommute: 'Convenient commute - approximately {km} km from {district}.',
    farCommute: 'Commute distance is {km} km (exceeds preferred radius of {prefKm} km).',
    payMatch: 'Offered pay ({pay}) meets your expected minimum ({minPay}).',
    shiftMatch: 'Matches preferred {shift} shift.',
    workTypeMatch: 'Matches preferred {workType} work type.',
    aiAssistedNotice: 'Skills highlighted with AI assistance: {skills}.',
    missingFieldNotice: 'Please provide your {field} to verify complete eligibility.',
    failedRulePrefix: 'Failed condition: {label}.',
    yourValue: 'Your profile: {value}',
    requiredValue: 'Required: {value}'
  },
  hi: {
    eligibleTitle: 'योग्य अवसर',
    notEligibleTitle: 'पात्र नहीं',
    needsInfoTitle: 'अधिक जानकारी आवश्यक',
    strongSkillFit: 'मजबूत कौशल मेल - आवश्यक {total} में से {matched} कौशल मेल खाते हैं ({skills})।',
    partialSkillFit: '{total} में से {matched} कौशल संबंधित अनुभव के साथ मेल खाते हैं।',
    closeCommute: 'सुलभ यात्रा दूरी - {district} से लगभग {km} किमी।',
    farCommute: 'यात्रा दूरी {km} किमी है (आपकी पसंदीदा {prefKm} किमी से अधिक)।',
    payMatch: 'प्रस्तावित वेतन ({pay}) आपकी न्यूनतम अपेक्षा ({minPay}) के अनुसार है।',
    shiftMatch: 'पसंदीदा {shift} शिफ्ट से मेल खाता है।',
    workTypeMatch: 'पसंदीदा {workType} कार्य प्रकार से मेल खाता है।',
    aiAssistedNotice: 'एआई सहायता से पहचाने गए कौशल: {skills}।',
    missingFieldNotice: 'पूर्ण पात्रता जांच के लिए कृपया अपना {field} दर्ज करें।',
    failedRulePrefix: 'शर्त पूरी नहीं हुई: {label}।',
    yourValue: 'आपकी प्रोफ़ाइल: {value}',
    requiredValue: 'आवश्यक: {value}'
  },
  mr: {
    eligibleTitle: 'पात्र संधी',
    notEligibleTitle: 'अपात्र',
    needsInfoTitle: 'अधिक माहिती आवश्यक',
    strongSkillFit: 'उत्कृष्ट कौशल्य जुळणी - आवश्यक {total} पैकी {matched} कौशल्ये जुळतात ({skills}).',
    partialSkillFit: '{total} पैकी {matched} कौशल्ये संबंधित अनुभवासह जुळतात.',
    closeCommute: 'सोयीस्कर प्रवास अंतर - {district} पासून सुमारे {km} किमी.',
    farCommute: 'प्रवास अंतर {km} किमी आहे (पसंतीच्या {prefKm} किमी पेक्षा जास्त).',
    payMatch: 'ऑफर केलेले वेतन ({pay}) तुमच्या किमान अपेक्षेनुसार ({minPay}) आहे.',
    shiftMatch: 'पसंतीच्या {shift} पाळीशी जुळते.',
    workTypeMatch: 'पसंतीच्या {workType} कामाच्या स्वरूपाशी जुळते.',
    aiAssistedNotice: 'एआय मदतीने शोधलेली कौशल्ये: {skills}.',
    missingFieldNotice: 'संपूर्ण पात्रता तपासण्यासाठी कृपया आपले {field} नोंदवा.',
    failedRulePrefix: 'अट पूर्ण झाली नाही: {label}.',
    yourValue: 'तुमची प्रोफाइल: {value}',
    requiredValue: 'आवश्यक: {value}'
  }
};
