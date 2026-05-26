import type { Request, Response, NextFunction } from 'express';
import { generationQueue } from '../queues/generationQueue';
import type { JobStatusResponse } from '@vedaai/shared';

export async function getJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jobId = req.params.jobId;
    const job = await generationQueue.getJob(jobId);
    if (!job) {
      const body: JobStatusResponse = {
        jobId,
        status: 'unknown',
        progress: 0,
      };
      res.status(404).json(body);
      return;
    }

    const state = await job.getState();
    const progress = typeof job.progress === 'number' ? job.progress : 0;

    const body: JobStatusResponse = {
      jobId,
      status: state as JobStatusResponse['status'],
      progress,
    };
    res.json(body);
  } catch (err) {
    next(err);
  }
}
