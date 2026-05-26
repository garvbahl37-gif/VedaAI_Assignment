import { Worker } from 'bullmq';
import { redisConnection, cacheHelpers } from '../config/redis';
import { GENERATION_QUEUE, type GenerationJobData } from '../queues/generationQueue';
import { Assignment } from '../models/Assignment';
import { GeneratedPaper } from '../models/GeneratedPaper';
import { buildPrompt } from '../services/promptBuilder';
import { generatePaper } from '../services/aiService';
import { wsManager } from '../websocket/wsManager';
import type { WSMessage, GenerationStage } from '@vedaai/shared';

function progressMessage(stage: GenerationStage, progress: number, message?: string): WSMessage {
  return { type: 'progress', stage, progress, message };
}

export function startGenerationWorker(): Worker<GenerationJobData> {
  const worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE,
    async (job) => {
      const { assignmentId } = job.data;
      const jobId = job.id as string;

      // Stage 1: Fetching assignment.
      await job.updateProgress(10);
      wsManager.sendToJob(jobId, progressMessage('fetching', 10, 'Analyzing your materials...'));
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);
      assignment.status = 'generating';
      await assignment.save();

      // Stage 2: Building prompt.
      await job.updateProgress(25);
      wsManager.sendToJob(jobId, progressMessage('building_prompt', 25, 'Building generation prompt...'));
      const prompt = buildPrompt(assignment);

      // Stage 3: AI generation.
      await job.updateProgress(50);
      wsManager.sendToJob(jobId, progressMessage('generating', 50, 'Generating questions with AI...'));
      const structured = await generatePaper(prompt);

      // Stage 4: Parsing & structuring (already done inside generatePaper, but emit as a stage).
      await job.updateProgress(75);
      wsManager.sendToJob(jobId, progressMessage('parsing', 75, 'Structuring sections and answer key...'));

      // Stage 5: Persisting.
      await job.updateProgress(90);
      wsManager.sendToJob(jobId, progressMessage('persisting', 90, 'Finalizing paper...'));

      // Replace any existing paper for this assignment.
      await GeneratedPaper.deleteMany({ assignmentId: assignment._id });
      const paper = await GeneratedPaper.create({
        assignmentId: assignment._id,
        schoolName: structured.schoolName,
        subject: structured.subject,
        className: structured.className,
        timeAllowed: structured.timeAllowed,
        maximumMarks: structured.maximumMarks,
        generalInstructions: structured.generalInstructions,
        sections: structured.sections,
        rawPrompt: prompt,
      });

      assignment.status = 'completed';
      assignment.generatedPaperId = paper._id;
      await assignment.save();

      // Cache + invalidate any previous cache.
      await cacheHelpers.invalidatePaper(assignmentId);
      await cacheHelpers.setPaper(assignmentId, {
        _id: paper._id.toString(),
        assignmentId: assignment._id.toString(),
        schoolName: paper.schoolName,
        subject: paper.subject,
        className: paper.className,
        timeAllowed: paper.timeAllowed,
        maximumMarks: paper.maximumMarks,
        generalInstructions: paper.generalInstructions,
        sections: paper.sections,
        generatedAt: paper.generatedAt.toISOString(),
      });

      // Stage 6: Done.
      await job.updateProgress(100);
      wsManager.sendToJob(jobId, { type: 'completed', progress: 100, paperId: paper._id.toString() });

      return { paperId: paper._id.toString() };
    },
    { connection: redisConnection, concurrency: 5 },
  );

  worker.on('failed', async (job, err) => {
    if (!job) return;
    const jobId = job.id as string;
    // eslint-disable-next-line no-console
    console.error(`[worker] job ${jobId} failed:`, err.message);
    try {
      await Assignment.findByIdAndUpdate(job.data.assignmentId, { status: 'failed' });
    } catch { /* swallow */ }
    wsManager.sendToJob(jobId, { type: 'failed', error: err.message });
  });

  worker.on('completed', (job) => {
    // eslint-disable-next-line no-console
    console.log(`[worker] job ${job.id} completed`);
  });

  // eslint-disable-next-line no-console
  console.log('[worker] generation worker started');
  return worker;
}
