export const en = {
  eligible_headline: 'Ranked #{rank} (Score {score}/100)',
  reason_skills_all: 'Has all {n} required skills',
  reason_skills_partial: 'Has {n_exact} of {n_required} required skills',
  reason_related_skill: 'Includes related experience with partial fit',
  reason_commute_within: 'Commute {dist} km is within your {pref} km preference',
  reason_commute_close: 'Commute is approximately {dist} km',
  reason_pay_meets: 'Pay meets or exceeds your target of ₹{target}',
  reason_pay_below: 'Pay is ₹{pay}, below your ₹{target} preference',
  reason_shift_match: 'Matches your preferred {shift} shift',
  reason_shift_diff: '{shift} shift differs from your preference',
  fail_qual: 'Requires at least a {required}. You have: {current}.',
  fail_qual_field: 'Requires {required}. You have: {current}.',
  fail_residence_state: 'Open to residents of {required} only. Your profile: state {current}.',
  fail_residence_district: 'Open to residents of {required} only. Your profile: district {current}.',
  fail_age: 'Age limit is {required}. Your profile: {current}.',
  fail_cert: 'Requires a valid {required}. Your profile: {current}.',
  fail_exp: 'Requires {required}. Your profile: {current}.',
  fail_attr: 'Requires {required}. Your profile: {current}.',
  hint_not_changeable: 'This cannot be changed by learning; update your location if it is out of date.',
  hint_changeable_qual: 'A higher qualification pathway can help you qualify for this role.',
  hint_changeable_cert: 'Earning this certification will fulfill the eligibility requirement.',
  needs_info_message: 'We cannot check this yet: requires {missing}. Add your details to check eligibility.',
  disclaimer: 'Eligibility follows the criteria stated by the opportunity. Confirm with the issuing office before applying.'
};

export type TranslationKey = keyof typeof en;
