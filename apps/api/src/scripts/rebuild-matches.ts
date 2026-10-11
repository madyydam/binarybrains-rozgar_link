import { store } from '../db/store.js';
import { matchOrchestrator } from '../services/match-orchestrator.js';

async function rebuildAllMatches() {
  console.log('[REBUILD] Recomputing all match results for all candidates...');
  const start = Date.now();

  const candidates = Array.from(store.candidates.values());
  for (const c of candidates) {
    const res = await matchOrchestrator.recompute(c.id);
    console.log(`  Candidate ${c.name} (${c.id}): ${res.eligible.length} eligible, ${res.notEligible.length} not eligible, ${res.needsInfo.length} needs info`);
  }

  const duration = Date.now() - start;
  console.log(`[REBUILD] Finished recomputing ${candidates.length} candidates in ${duration}ms!`);
}

rebuildAllMatches();
