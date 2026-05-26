import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'NotFound', message: 'Route not found' });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid request body',
      details: err.flatten(),
    });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.name || 'HttpError',
      message: err.message,
      details: err.details,
    });
    return;
  }
  const message = err instanceof Error ? err.message : 'Internal server error';
  // eslint-disable-next-line no-console
  console.error('[api] unhandled error:', err);
  res.status(500).json({ error: 'InternalError', message });
}
