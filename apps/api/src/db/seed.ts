import { store } from './store.js';

console.log('[SEED] Running database seed...');
store.seed();
console.log(`[SEED] Seeded:
  - ${store.users.size} Users
  - ${store.candidates.size} Candidates
  - ${store.skills.size} Skills
  - ${store.aliases.length} Aliases
  - ${store.opportunities.size} Opportunities
  - ${store.learningResources.size} Courses
`);
console.log('[SEED] Database seeding complete!');
