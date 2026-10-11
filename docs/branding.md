# FutoraOne / RozgarLink - Branding Guide

Version 1.0 | Futora Group | Derived from the FutoraOne app UI (Home, Match, Learn, Profile)

RozgarLink is delivered as a **FutoraOne product**. It inherits the FutoraOne look, tone and components so the app, the console and every document feel like one family.

---

## 1. Brand essence

| Item | Definition |
|---|---|
| Parent brand | FutoraOne (by Futora Group, Pune, India) |
| Product | RozgarLink - Skills-to-Opportunity Matching Engine |
| Tagline (brand) | **Build . Learn . Grow** |
| Product line | "Find what you can take. Learn what you need." |
| Personality | Clear, friendly, modern, trustworthy, practical |
| Promise | Every candidate sees opportunities they can actually take, with honest reasons and a path forward |

### Wordmark
- "FutoraOne" in bold dark navy, with the winged mark to its left.
- Product wordmark: **Rozgar** in ink + **Link** in brand blue (as on the PRD cover).
- Keep clear space equal to the height of the "F" on all sides. Minimum logo height 20 px on screen.

### Logo mark
A stylised bird/paper-plane built from two overlapping wing shapes: a blue wing (`#2F5BFF`) and an indigo wing (`#5B4BEA`). Use on white or the canvas colour only; on dark backgrounds use the all-white version.

---

## 2. Colour system

Sampled from the FutoraOne screens.

| Token | Hex | Use |
|---|---|---|
| `--brand-blue` | `#2F5BFF` | Primary buttons (Connect/Interested), active tab, active pills, links, table headers |
| `--brand-blue-dark` | `#1E3FCC` | Pressed state, strong emphasis |
| `--brand-indigo` | `#5B4BEA` | Gradient partner to blue, AI button, logo second wing |
| `--brand-violet` | `#7C5CFF` | AI accents, "Trending" style badges, highlight boxes |
| `--ink` | `#0F1B3D` | Headings, wordmark, primary text |
| `--text` | `#1B2438` | Body text |
| `--slate` | `#64748B` | Secondary text, captions, placeholder |
| `--canvas` | `#F6F8FC` | App/page background |
| `--card` | `#FFFFFF` | Cards, sheets |
| `--tint` | `#EAF0FF` | Light blue chips, hero panel, info boxes |
| `--tint-2` | `#F3F6FF` | Zebra rows, code blocks |
| `--line` | `#E2E8F3` | Card borders, dividers |

### Status colours (RozgarLink specific)

| Token | Hex | Meaning | Always pair with |
|---|---|---|---|
| `--ok` | `#12AE85` | Eligible / PASS / Online dot | check icon + word "Eligible" |
| `--warn` | `#F59E0B` | Need more information / UNKNOWN | clock icon + word "Need info" |
| `--fail` | `#E5484D` | Not eligible / FAIL | cross icon + exact failed rule |
| `--streak` | `#FEC723` | Learning streak flame, highlights | flame icon |

Colour is never the only signal. Every status has an icon and text.

### Gradients
- Hero / primary: `linear-gradient(135deg, #2F5BFF 0%, #5B4BEA 100%)`
- AI button: `linear-gradient(135deg, #5B4BEA 0%, #7C5CFF 100%)`
- Hero background wash: `linear-gradient(180deg, #EAF0FF 0%, #FFFFFF 100%)`

---

## 3. Typography

| Role | Font | Weight | Size (mobile) |
|---|---|---|---|
| Display / hero | Inter (fallback: system-ui, Helvetica) | 700 | 28 / 34 |
| Screen title ("Match", "Learn") | Inter | 700 | 24 / 30 |
| Card title | Inter | 600 | 16 / 22 |
| Body | Inter | 400 | 14 / 20 |
| Caption, chips, nav labels | Inter | 500 | 12 / 16 |
| Numbers (stats, scores) | Inter, tabular figures | 700 | 20-28 |

- Hindi/Marathi: Noto Sans Devanagari at the same sizes (add 2 px line height).
- Highlight one key word in a headline with brand blue, e.g. "Your **Tech** Journey" or "Roz gar**Link**".
- Sentence case for UI text. Title case only for product names.

---

## 4. Layout, shape and spacing

| Element | Spec |
|---|---|
| Grid | 4 px base unit; screen padding 16-20 px |
| Card | White, 1 px `--line` border, radius 16 px, soft shadow `0 4px 16px rgba(15,27,61,0.06)` |
| Pill / chip | Height 32 px, radius 999 px; inactive `--tint-2` + slate text; active `--brand-blue` + white text |
| Primary button | Height 40 px, radius 999 px, fill `--brand-blue`, white 600 text |
| Secondary button | Outline `--line`, ink text, radius 999 px |
| Tags (skills) | Radius 10 px, 1 px border, 12 px text (React, Node.js style) |
| Progress bar | 6 px high, radius 3 px, fill `--brand-blue`, track `--tint` |
| Progress ring | 4 px stroke, `--brand-blue`, centre shows percentage |
| Avatar | Circle, 48 px in lists, 72 px on profile, green online dot bottom-right |
| Verified tick | Small blue circle with white check beside names |
| Floating AI button | 56 px circle, indigo-violet gradient, white "AI" with sparkle, bottom-right above tab bar |
| Bottom navigation | 4 tabs: Home, Match, Learn, Profile; active tab blue icon + label, inactive slate |

---

## 5. Iconography and imagery

- Line icons, 1.75 px stroke, rounded caps (Lucide set recommended).
- Home = house, Match = two people, Learn = open book, Profile = person; quick tiles use a filled-tint square (`--tint`) with a blue icon.
- Course/path thumbnails: rounded 12 px squares with blue-indigo gradients and a single white glyph (code, AI, shield, phone).
- Avoid stock photos of handshakes; prefer real avatars, simple illustrations and the paper-plane motif.

---

## 6. Component patterns (from the FutoraOne screens)

| Pattern | FutoraOne | RozgarLink adaptation |
|---|---|---|
| Home hero | "Build . Learn . Grow" + "Your Tech Journey Starts Here", search bar | "Your Career Path Starts Here" with search for opportunities, skills, courses |
| Quick tiles | Learn, Match, Explore, Community | Match, Learn, Explore, Profile |
| Recommended list | Course cards with Popular/Trending badge | Top eligible matches with score and "Why this rank" |
| Top Matches | Avatar strip | Newly eligible strip |
| Match cards | Person, role, location, skill tags, Connect | Opportunity, org, location, skill tags, **Interested** |
| Filter pills | All, Developers, Founders, Freelancers | All, Eligible, Need info, Not eligible |
| Learn cards | Course path, tech tags, progress bar, "3/12 modules" | Gap pathway steps, skills gained, progress |
| Profile stats | Courses completed, Connections, Projects | Courses completed, Skills confirmed, Interested |
| Progress ring + streak | 60% + 7-day flame | Profile strength + learning streak |
| Menu rows | My Courses, Saved, Settings, Help | Same |
| AI button | Floating assistant | Explains results, extracts skills; never decides eligibility |

### RozgarLink-only components
- **Eligibility chip row**: PASS / FAIL / UNKNOWN per rule with icon, rule label, and candidate value.
- **Failed-rule strip**: a red-tinted bar at the top of a Not-eligible card, e.g. "Requires residence in Maharashtra. Your location: Gujarat."
- **Score ring** on eligible cards only; never on Not-eligible cards.
- **Change banner**: "2 newly eligible, 1 no longer eligible, 3 re-ranked" with Undo.
- **AI-assisted label**: small violet pill "AI-assisted" next to AI-matched skills.

---

## 7. Voice and tone

| Principle | Do | Do not |
|---|---|---|
| Plain and specific | "Requires at least a Diploma. You have: 12th pass." | "Does not meet criteria." |
| Encouraging, never blaming | "Add your qualification to unlock 4 more opportunities." | "Your profile is incomplete." |
| Honest about limits | "No course in our catalogue yet." | Invent a course |
| Short | Under 20 words per sentence, Grade 8 reading level | Policy jargon, "embedding", "threshold" |
| Neutral on people | Describe conditions | Judge the candidate |

Standard notice on result screens: *"Eligibility follows the criteria stated by the opportunity. Confirm with the issuing office before applying."*

---

## 8. Document and PDF style

Used for PRD, TRD, proposals and reports.

- Page: A4, canvas background `#F6F8FC`, content in white rounded cards.
- Header: logo mark + "FutoraOne" wordmark left; document name right; 0.6 pt `--line` rule.
- Footer: "Futora Group | Confidential | vX.Y" left; blue-tint pill "Page n of N" right.
- Section heading: blue rounded square with the section number + ink H1.
- Sub-heading: brand blue, bold.
- Tables: blue header row, white rows with `--tint-2` zebra, rounded outer corners, 0.4 pt `--line` grid.
- Callout boxes: `--tint` (info) or `#F1EDFF` (key rule), radius 8, no border.
- Cover: hero card with "Build . Learn . Grow", two-tone product name, paper-plane graphic, pill chips for key themes.

---

## 9. Accessibility

- Text contrast at least 4.5:1 (ink on white is 15:1; white on `#2F5BFF` is 4.9:1).
- Do not place slate text on `--tint` below 14 px.
- Tap targets at least 44 x 44 px; visible focus ring `2px solid #2F5BFF` with 2 px offset.
- Support dynamic type to 200% and reduced-motion (disable score-ring and card-move animations, keep the banner).

---

## 10. Design tokens (copy-paste)

### CSS variables
```css
:root{
  --brand-blue:#2F5BFF; --brand-blue-dark:#1E3FCC; --brand-indigo:#5B4BEA; --brand-violet:#7C5CFF;
  --ink:#0F1B3D; --text:#1B2438; --slate:#64748B;
  --canvas:#F6F8FC; --card:#FFFFFF; --tint:#EAF0FF; --tint-2:#F3F6FF; --line:#E2E8F3;
  --ok:#12AE85; --warn:#F59E0B; --fail:#E5484D; --streak:#FEC723;
  --radius-card:16px; --radius-pill:999px; --shadow-card:0 4px 16px rgba(15,27,61,.06);
  --font:'Inter',system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;
}
@media (prefers-color-scheme: dark){
  :root{ --canvas:#0B1224; --card:#121B33; --ink:#EAF0FF; --text:#D6DEF0; --slate:#94A3B8; --tint:#18264A; --tint-2:#141F3B; --line:#22305A; }
}
```

### Tailwind (tailwind.config.ts)
```ts
export default {
  theme: { extend: {
    colors: {
      brand: { blue:'#2F5BFF', dark:'#1E3FCC', indigo:'#5B4BEA', violet:'#7C5CFF' },
      ink:'#0F1B3D', slate:'#64748B', canvas:'#F6F8FC', tint:'#EAF0FF', line:'#E2E8F3',
      ok:'#12AE85', warn:'#F59E0B', fail:'#E5484D', streak:'#FEC723'
    },
    borderRadius: { card:'16px' },
    boxShadow: { card:'0 4px 16px rgba(15,27,61,.06)' },
    fontFamily: { sans:['Inter','system-ui','sans-serif'] }
  } }
}
```

---

## 11. Do and do not

| Do | Do not |
|---|---|
| Use white cards on the soft canvas | Use dark heavy backgrounds in light mode |
| Use one primary blue action per screen | Mix several bright accent colours |
| Show status with icon + word + colour | Rely on red/green alone |
| Keep the AI button visible but unobtrusive | Let AI text imply a decision on eligibility |
| Name the exact failed rule | Show generic rejection text |
| Keep the paper-plane motif simple | Add stock imagery or busy patterns |

---

*Brand note: the colour values above were sampled from the supplied FutoraOne mockup. Replace them with the official brand file values if Futora Group has final design tokens.*
