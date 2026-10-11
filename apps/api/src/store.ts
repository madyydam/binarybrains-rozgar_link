import { Response } from 'express';
import {
  INITIAL_CANDIDATES,
  INITIAL_CATALOGUE,
  INITIAL_OPPORTUNITIES,
  StoredCandidate,
  StoredOpportunity
} from './seeds.js';
import { LearningResource } from '@rozgarlink/pathway';

// Deep clone helper
function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

class InMemoryStore {
  private candidates: Map<string, StoredCandidate> = new Map();
  private candidateSnapshots: Map<string, StoredCandidate[]> = new Map(); // for Undo!
  private opportunities: Map<string, StoredOpportunity> = new Map();
  private catalogue: Map<string, LearningResource> = new Map();
  private sseClients: Map<string, Set<Response>> = new Map(); // candidateId -> Set of express responses

  constructor() {
    this.reset();
  }

  public reset() {
    this.candidates.clear();
    this.candidateSnapshots.clear();
    this.opportunities.clear();
    this.catalogue.clear();

    for (const c of INITIAL_CANDIDATES) {
      this.candidates.set(c.id, clone(c));
      this.candidateSnapshots.set(c.id, []);
    }

    for (const opp of INITIAL_OPPORTUNITIES) {
      this.opportunities.set(opp.id, clone(opp));
    }

    for (const crs of INITIAL_CATALOGUE) {
      this.catalogue.set(crs.id, clone(crs));
    }
  }

  // Candidates
  public getCandidate(id: string): StoredCandidate | undefined {
    return this.candidates.get(id);
  }

  public getAllCandidates(): StoredCandidate[] {
    return Array.from(this.candidates.values());
  }

  public saveSnapshot(id: string) {
    const current = this.candidates.get(id);
    if (!current) return;
    const history = this.candidateSnapshots.get(id) || [];
    history.push(clone(current));
    // Keep last 10 snapshots
    if (history.length > 10) history.shift();
    this.candidateSnapshots.set(id, history);
  }

  public undoCandidate(id: string): StoredCandidate | null {
    const history = this.candidateSnapshots.get(id);
    if (!history || history.length === 0) return null;
    const previous = history.pop()!;
    this.candidates.set(id, previous);
    return previous;
  }

  public updateCandidate(id: string, patch: Partial<StoredCandidate>): StoredCandidate | null {
    const current = this.candidates.get(id);
    if (!current) return null;
    this.saveSnapshot(id);

    const updated = {
      ...current,
      ...patch,
      profileVersion: current.profileVersion + 1
    };
    this.candidates.set(id, updated);
    return updated;
  }

  // Opportunities
  public getOpportunity(id: string): StoredOpportunity | undefined {
    return this.opportunities.get(id);
  }

  public getAllOpportunities(): StoredOpportunity[] {
    return Array.from(this.opportunities.values());
  }

  public saveOpportunity(opp: StoredOpportunity): StoredOpportunity {
    this.opportunities.set(opp.id, opp);
    return opp;
  }

  // Catalogue
  public getAllCatalogue(): LearningResource[] {
    return Array.from(this.catalogue.values());
  }

  // SSE Clients
  public addSseClient(candidateId: string, res: Response) {
    if (!this.sseClients.has(candidateId)) {
      this.sseClients.set(candidateId, new Set());
    }
    this.sseClients.get(candidateId)!.add(res);

    res.on('close', () => {
      this.sseClients.get(candidateId)?.delete(res);
    });
  }

  public broadcastToCandidate(candidateId: string, eventData: unknown) {
    const clients = this.sseClients.get(candidateId);
    if (!clients || clients.size === 0) return;

    const payload = `data: ${JSON.stringify(eventData)}\n\n`;
    for (const client of clients) {
      try {
        client.write(payload);
      } catch {
        clients.delete(client);
      }
    }
  }
}

export const store = new InMemoryStore();
