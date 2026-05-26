import { WebSocketServer, WebSocket } from 'ws';
import type { Server as HttpServer, IncomingMessage } from 'http';
import type { WSMessage } from '@vedaai/shared';

const WS_PATH_PREFIX = '/ws/jobs/';

class WsManager {
  private clients: Map<string, Set<WebSocket>> = new Map();
  private wss: WebSocketServer | null = null;

  init(server: HttpServer): void {
    this.wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (req: IncomingMessage, socket, head) => {
      const url = req.url ?? '';
      if (!url.startsWith(WS_PATH_PREFIX)) {
        socket.destroy();
        return;
      }
      const jobId = url.slice(WS_PATH_PREFIX.length).split('?')[0];
      if (!jobId) {
        socket.destroy();
        return;
      }
      this.wss!.handleUpgrade(req, socket, head, (ws) => {
        this.handleConnection(ws, jobId);
      });
    });

    // eslint-disable-next-line no-console
    console.log(`[ws] listening on ${WS_PATH_PREFIX}:jobId`);
  }

  private handleConnection(ws: WebSocket, jobId: string): void {
    if (!this.clients.has(jobId)) this.clients.set(jobId, new Set());
    this.clients.get(jobId)!.add(ws);

    this.safeSend(ws, { type: 'connected', jobId });

    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
    }, 30_000);

    ws.on('close', () => {
      clearInterval(heartbeat);
      const set = this.clients.get(jobId);
      set?.delete(ws);
      if (set && set.size === 0) this.clients.delete(jobId);
    });

    ws.on('error', () => {
      try { ws.close(); } catch { /* noop */ }
    });
  }

  sendToJob(jobId: string, message: WSMessage): void {
    const clients = this.clients.get(jobId);
    if (!clients || clients.size === 0) return;
    const payload = JSON.stringify(message);
    clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        try { ws.send(payload); } catch { /* drop */ }
      }
    });
  }

  private safeSend(ws: WebSocket, message: WSMessage): void {
    if (ws.readyState !== WebSocket.OPEN) return;
    try { ws.send(JSON.stringify(message)); } catch { /* drop */ }
  }

  shutdown(): void {
    this.clients.forEach((set) => set.forEach((ws) => ws.close()));
    this.clients.clear();
    this.wss?.close();
  }
}

export const wsManager = new WsManager();
export const getWsManager = (): WsManager => wsManager;
