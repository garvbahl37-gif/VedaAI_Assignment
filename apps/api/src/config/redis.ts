import IORedis, { Redis } from 'ioredis';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;
import { env } from './env';

// Cache Redis connections on globalThis so they survive across warm serverless
// invocations.
interface RedisCache {
  bull: Redis | null;
  client: RedisClient | null;
  clientReady: Promise<void> | null;
}

const g = globalThis as unknown as { __redis?: RedisCache };
const cached: RedisCache =
  g.__redis ?? (g.__redis = { bull: null, client: null, clientReady: null });

function buildBull(): Redis {
  const conn = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  });
  conn.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[redis-bull] error', err.message);
  });
  return conn;
}

function buildClient(): RedisClient {
  const c = createClient({ url: env.REDIS_URL });
  c.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[redis-cache] error', err.message);
  });
  return c;
}

// Proxy-style getters: lazily initialise on first use, cache on globalThis.
export const redisConnection: Redis = (() => {
  if (!cached.bull) cached.bull = buildBull();
  return cached.bull;
})();

export const redisClient: RedisClient = (() => {
  if (!cached.client) cached.client = buildClient();
  return cached.client;
})();

export async function connectRedis(): Promise<void> {
  if (cached.clientReady) return cached.clientReady;
  cached.clientReady = (async () => {
    if (!redisClient.isOpen) await redisClient.connect();
    // eslint-disable-next-line no-console
    console.log(`[redis] connected`);
  })();
  return cached.clientReady;
}

// ──────────────────────────────────────────────────────────
// Cache helpers — automatically connect on first use so the
// inline serverless path doesn't need to call connectRedis.
// ──────────────────────────────────────────────────────────
const PAPER_TTL_SECONDS = 60 * 60 * 24; // 24h
const JOB_TTL_SECONDS = 60 * 60;        // 1h
const LIST_TTL_SECONDS = 60 * 5;        // 5 min — long enough to absorb a UI session, short enough to never feel stale

async function ensureClient(): Promise<RedisClient | null> {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    return redisClient;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[redis-cache] unavailable, skipping cache op:', (err as Error).message);
    return null;
  }
}

export const cacheHelpers = {
  async getPaper<T>(assignmentId: string): Promise<T | null> {
    const c = await ensureClient();
    if (!c) return null;
    const raw = await c.get(`paper:${assignmentId}`);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  async setPaper(assignmentId: string, data: unknown): Promise<void> {
    const c = await ensureClient();
    if (!c) return;
    await c.setEx(`paper:${assignmentId}`, PAPER_TTL_SECONDS, JSON.stringify(data));
  },
  async invalidatePaper(assignmentId: string): Promise<void> {
    const c = await ensureClient();
    if (!c) return;
    await c.del(`paper:${assignmentId}`);
  },
  async getJobStatus(jobId: string): Promise<string | null> {
    const c = await ensureClient();
    if (!c) return null;
    return c.get(`job:status:${jobId}`);
  },
  async setJobStatus(jobId: string, status: string): Promise<void> {
    const c = await ensureClient();
    if (!c) return;
    await c.setEx(`job:status:${jobId}`, JOB_TTL_SECONDS, status);
  },

  // Assignment list cache — short TTL plus explicit invalidation on
  // create/delete/regenerate so the page reflects mutations immediately.
  async getAssignmentList<T>(): Promise<T | null> {
    const c = await ensureClient();
    if (!c) return null;
    const raw = await c.get('assignments:list');
    return raw ? (JSON.parse(raw) as T) : null;
  },
  async setAssignmentList(data: unknown): Promise<void> {
    const c = await ensureClient();
    if (!c) return;
    await c.setEx('assignments:list', LIST_TTL_SECONDS, JSON.stringify(data));
  },
  async invalidateAssignmentList(): Promise<void> {
    const c = await ensureClient();
    if (!c) return;
    await c.del('assignments:list');
  },
};
