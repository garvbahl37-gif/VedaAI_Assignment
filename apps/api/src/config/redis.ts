import IORedis, { Redis } from 'ioredis';
import { createClient, RedisClientType } from 'redis';
import { env } from './env';

// ──────────────────────────────────────────────────────────
// BullMQ requires ioredis with maxRetriesPerRequest: null.
// ──────────────────────────────────────────────────────────
export const redisConnection: Redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('[redis-bull] error', err.message);
});

// ──────────────────────────────────────────────────────────
// Separate client for general caching (paper cache, job status).
// ──────────────────────────────────────────────────────────
export const redisClient: RedisClientType = createClient({ url: env.REDIS_URL });

redisClient.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('[redis-cache] error', err.message);
});

export async function connectRedis(): Promise<void> {
  if (!redisClient.isOpen) await redisClient.connect();
  // eslint-disable-next-line no-console
  console.log(`[redis] connected → ${env.REDIS_URL}`);
}

// ──────────────────────────────────────────────────────────
// Cache helpers.
// ──────────────────────────────────────────────────────────
const PAPER_TTL_SECONDS = 60 * 60 * 24; // 24h
const JOB_TTL_SECONDS = 60 * 60;        // 1h

export const cacheHelpers = {
  async getPaper<T>(assignmentId: string): Promise<T | null> {
    const raw = await redisClient.get(`paper:${assignmentId}`);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  async setPaper(assignmentId: string, data: unknown): Promise<void> {
    await redisClient.setEx(`paper:${assignmentId}`, PAPER_TTL_SECONDS, JSON.stringify(data));
  },
  async invalidatePaper(assignmentId: string): Promise<void> {
    await redisClient.del(`paper:${assignmentId}`);
  },
  async getJobStatus(jobId: string): Promise<string | null> {
    return redisClient.get(`job:status:${jobId}`);
  },
  async setJobStatus(jobId: string, status: string): Promise<void> {
    await redisClient.setEx(`job:status:${jobId}`, JOB_TTL_SECONDS, status);
  },
};
