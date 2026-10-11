import { Response } from 'express';
import { MatchesUpdatedEvent } from '@rozgarlink/shared-types';

interface SseClient {
  candidateId: string;
  res: Response;
  lastEventId: number;
}

class SseGateway {
  private clients = new Map<string, Set<SseClient>>(); // candidateId -> Set<SseClient>
  private eventSeq = 1;

  constructor() {
    // Send periodic SSE heartbeat comment every 25 seconds
    setInterval(() => {
      this.sendHeartbeat();
    }, 25000);
  }

  addClient(candidateId: string, res: Response, lastEventId?: string) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // Initial connection comment
    res.write(`: connected at ${new Date().toISOString()}\n\n`);

    const client: SseClient = {
      candidateId,
      res,
      lastEventId: lastEventId ? parseInt(lastEventId, 10) || 0 : 0
    };

    let set = this.clients.get(candidateId);
    if (!set) {
      set = new Set();
      this.clients.set(candidateId, set);
    }
    set.add(client);

    res.on('close', () => {
      const clientSet = this.clients.get(candidateId);
      if (clientSet) {
        clientSet.delete(client);
        if (clientSet.size === 0) {
          this.clients.delete(candidateId);
        }
      }
    });
  }

  broadcastToCandidate(candidateId: string, event: MatchesUpdatedEvent) {
    const clientSet = this.clients.get(candidateId);
    if (!clientSet || clientSet.size === 0) return;

    const eventId = this.eventSeq++;
    const payload = `id: ${eventId}\nevent: message\ndata: ${JSON.stringify(event)}\n\n`;

    for (const client of clientSet) {
      try {
        client.res.write(payload);
      } catch (err) {
        clientSet.delete(client);
      }
    }
  }

  broadcastToAll(event: any) {
    const eventId = this.eventSeq++;
    const payload = `id: ${eventId}\nevent: message\ndata: ${JSON.stringify(event)}\n\n`;

    for (const clientSet of this.clients.values()) {
      for (const client of clientSet) {
        try {
          client.res.write(payload);
        } catch (err) {
          clientSet.delete(client);
        }
      }
    }
  }

  private sendHeartbeat() {
    for (const clientSet of this.clients.values()) {
      for (const client of clientSet) {
        try {
          client.res.write(`: heartbeat ${Date.now()}\n\n`);
        } catch (err) {
          clientSet.delete(client);
        }
      }
    }
  }
}

export const sseGateway = new SseGateway();
