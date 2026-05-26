import type { WSMessage } from '@vedaai/shared';

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:4000';

export class AssignmentWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private maxRetries = 5;
  private retryCount = 0;
  private manualClose = false;
  private jobId: string | null = null;
  private onMessage: ((msg: WSMessage) => void) | null = null;
  private onConnectionChange: ((connected: boolean) => void) | null = null;

  connect(
    jobId: string,
    onMessage: (msg: WSMessage) => void,
    onConnectionChange?: (connected: boolean) => void,
  ): void {
    this.jobId = jobId;
    this.onMessage = onMessage;
    this.onConnectionChange = onConnectionChange ?? null;
    this.manualClose = false;
    this.openSocket();
  }

  private openSocket(): void {
    if (!this.jobId) return;
    const url = `${WS_BASE}/ws/jobs/${this.jobId}`;
    try {
      this.ws = new WebSocket(url);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ws] failed to open:', err);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.retryCount = 0;
      this.onConnectionChange?.(true);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSMessage;
        this.onMessage?.(data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[ws] bad payload:', err);
      }
    };

    this.ws.onclose = () => {
      this.onConnectionChange?.(false);
      if (!this.manualClose) this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      // The close handler will run after this and trigger reconnection.
    };
  }

  private scheduleReconnect(): void {
    if (this.retryCount >= this.maxRetries) return;
    this.retryCount++;
    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30_000);
    this.reconnectTimeout = setTimeout(() => this.openSocket(), delay);
  }

  disconnect(): void {
    this.manualClose = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    try { this.ws?.close(); } catch { /* noop */ }
    this.ws = null;
  }
}
