import { TranslationKey } from './en.js';

export const mr: Record<TranslationKey, string> = {
  eligible_headline: 'रँक #{rank} (गुण {score}/100)',
  reason_skills_all: 'सर्व {n} आवश्यक कौशल्ये उपलब्ध आहेत',
  reason_skills_partial: '{n_required} पैकी {n_exact} आवश्यक कौशल्ये उपलब्ध आहेत',
  reason_related_skill: 'संबंधित कौशल्ये समाविष्ट आहेत ज्यांना अंशतः क्रेडिट मिळाले आहे',
  reason_commute_within: '{dist} किमी प्रवास आपल्या {pref} किमी पसंतीमध्ये आहे',
  reason_commute_close: 'प्रवास अंतर अंदाजे {dist} किमी आहे',
  reason_pay_meets: 'वेतन आपल्या ₹{target} उद्दिष्टानुसार आहे',
  reason_pay_below: 'वेतन ₹{pay} आहे, जे आपल्या ₹{target} अपेक्षेपेक्षा कमी आहे',
  reason_shift_match: 'आपल्या पसंतीच्या {shift} शिफ्टशी जुळते',
  reason_shift_diff: '{shift} शिफ्ट आपल्या पसंतीपेक्षा वेगळी आहे',
  fail_qual: 'किमान {required} आवश्यक आहे. आपले प्रोफाईल: {current}.',
  fail_qual_field: '{required} आवश्यक आहे. आपले प्रोफाईल: {current}.',
  fail_residence_state: 'केवळ {required} येथील रहिवाशांसाठी उपलब्ध. आपले प्रोफाईल: राज्य {current}.',
  fail_residence_district: 'केवळ {required} येथील रहिवाशांसाठी उपलब्ध. आपले प्रोफाईल: जिल्हा {current}.',
  fail_age: 'वयोमर्यादा {required} आहे. आपले प्रोफाईल: {current}.',
  fail_cert: 'वैध {required} आवश्यक आहे. आपले प्रोफाईल: {current}.',
  fail_exp: '{required} आवश्यक आहे. आपले प्रोफाईल: {current}.',
  fail_attr: '{required} आवश्यक आहे. आपले प्रोफाईल: {current}.',
  hint_not_changeable: 'हे शिकून बदलता येत नाही; जुने असल्यास आपले स्थान अपडेट करा.',
  hint_changeable_qual: 'उच्च पात्रता मार्ग आपल्याला या पदासाठी पात्र बनवू शकतो.',
  hint_changeable_cert: 'प्रमाणित प्रशिक्षण पूर्ण केल्यास आपण पात्र ठरू शकता.',
  needs_info_message: 'आम्ही सध्या हे तपासू शकत नाही: {missing} आवश्यक आहे. तपशील जोडा.',
  disclaimer: 'पात्रता संधीने नमूद केलेल्या निकषांवर अवलंबून असते. अर्ज करण्यापूर्वी जारी करणाऱ्या कार्यालयाशी खात्री करा.'
};
