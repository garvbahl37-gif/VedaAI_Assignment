import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectMongo, disconnectMongo } from './config/mongodb';
import { connectRedis, redisConnection, redisClient } from './config/redis';
import { wsManager } from './websocket/wsManager';
import { startGenerationWorker } from './workers/generationWorker';

// Skip standalone Worker + WS server in serverless environments — the same
// pipeline runs inline inside each request (see controllers/assignmentController).
const IS_SERVERLESS = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

async function main(): Promise<void> {
  await connectMongo();
  await connectRedis();

  const app = createApp();
  const server = http.createServer(app);

  if (!IS_SERVERLESS) {
    wsManager.init(server);
    const worker = startGenerationWorker();

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

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[api] fatal startup error:', err);
  process.exit(1);
});
