import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectMongo, disconnectMongo } from './config/mongodb';
import { connectRedis, redisConnection, redisClient } from './config/redis';
import { wsManager } from './websocket/wsManager';
import { startGenerationWorker } from './workers/generationWorker';

async function main(): Promise<void> {
  await connectMongo();
  await connectRedis();

  const app = createApp();
  const server = http.createServer(app);

  wsManager.init(server);
  const worker = startGenerationWorker();

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    // eslint-disable-next-line no-console
    console.log(`\n[api] received ${signal}, shutting down...`);
    server.close();
    wsManager.shutdown();
    await worker.close();
    await redisConnection.quit().catch(() => undefined);
    await redisClient.quit().catch(() => undefined);
    await disconnectMongo();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[api] fatal startup error:', err);
  process.exit(1);
});
