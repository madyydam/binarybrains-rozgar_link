import { TranslationKey } from './en.js';

export const hi: Record<TranslationKey, string> = {
  eligible_headline: 'रैंक #{rank} (स्कोर {score}/100)',
  reason_skills_all: 'सभी {n} आवश्यक कौशल मौजूद हैं',
  reason_skills_partial: '{n_required} में से {n_exact} आवश्यक कौशल मौजूद हैं',
  reason_related_skill: 'संबंधित कौशल शामिल हैं जिन्हें आंशिक क्रेडिट मिला है',
  reason_commute_within: '{dist} किमी का सफर आपकी {pref} किमी की प्राथमिकता में है',
  reason_commute_close: 'दूरी लगभग {dist} किमी है',
  reason_pay_meets: 'वेतन आपके ₹{target} के लक्ष्य को पूरा करता है',
  reason_pay_below: 'वेतन ₹{pay} है, जो आपकी ₹{target} की प्राथमिकता से कम है',
  reason_shift_match: 'आपकी पसंदीदा {shift} शिफ्ट से मेल खाता है',
  reason_shift_diff: '{shift} शिफ्ट आपकी प्राथमिकता से भिन्न है',
  fail_qual: 'कम से कम {required} की आवश्यकता है। आपकी प्रोफ़ाइल: {current}।',
  fail_qual_field: '{required} की आवश्यकता है। आपकी प्रोफ़ाइल: {current}।',
  fail_residence_state: 'केवल {required} के निवासियों के लिए उपलब्ध। आपकी प्रोफ़ाइल: राज्य {current}।',
  fail_residence_district: 'केवल {required} के निवासियों के लिए उपलब्ध। आपकी प्रोफ़ाइल: जिला {current}।',
  fail_age: 'आयु सीमा {required} है। आपकी प्रोफ़ाइल: {current}।',
  fail_cert: 'वैध {required} आवश्यक है। आपकी प्रोफ़ाइल: {current}।',
  fail_exp: '{required} आवश्यक है। आपकी प्रोफ़ाइल: {current}।',
  fail_attr: '{required} आवश्यक है। आपकी प्रोफ़ाइल: {current}।',
  hint_not_changeable: 'इसे सीखने से नहीं बदला जा सकता; यदि स्थान पुराना है तो अपडेट करें।',
  hint_changeable_qual: 'एक उच्च योग्यता मार्ग आपको भविष्य में इस भूमिका के योग्य बना सकता है।',
  hint_changeable_cert: 'प्रमाणित प्रशिक्षण पाठ्यक्रम पूरा करने से आप योग्य बन जाएंगे।',
  needs_info_message: 'हम अभी इसकी जांच नहीं कर सकते: {missing} की आवश्यकता है। अपनी जानकारी जोड़ें।',
  disclaimer: 'पात्रता अवसर द्वारा बताई गई शर्तों पर निर्भर करती है। आवेदन करने से पहले जारीकर्ता कार्यालय से पुष्टि करें।'
};
