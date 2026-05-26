import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../src/app';
import { connectMongo } from '../src/config/mongodb';

// Vercel function handler — wraps the Express app for serverless execution.
// The Mongo connection is cached on globalThis (see ../src/config/mongodb.ts)
// so it's re-used across warm invocations.

const app = createApp();
let ready: Promise<unknown> | null = null;

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (!ready) ready = connectMongo();
  await ready;
  // Express's app is callable as (req, res) — types differ slightly from
  // Vercel's IncomingMessage/ServerResponse but they're structurally compatible.
  return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}
