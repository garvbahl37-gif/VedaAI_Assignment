import express, { type Express } from 'express';
import cors from 'cors';
import { env } from './config/env';
import assignmentsRouter from './routes/assignments';
import generationRouter from './routes/generation';
import toolkitRouter from './routes/toolkit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'vedaai-api', env: env.NODE_ENV });
  });

  app.use('/api/assignments', assignmentsRouter);
  app.use('/api/jobs', generationRouter);
  app.use('/api/toolkit', toolkitRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
