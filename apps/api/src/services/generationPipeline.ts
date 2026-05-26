import type { GenerationStage } from '@vedaai/shared';
import { Assignment } from '../models/Assignment';
import { GeneratedPaper } from '../models/GeneratedPaper';
import { buildPrompt } from './promptBuilder';
import { generatePaper } from './aiService';
import { cacheHelpers } from '../config/redis';

export interface PipelineProgress {
  stage: GenerationStage;
  progress: number;
  message?: string;
}

export type PipelineProgressHandler = (e: PipelineProgress) => void | Promise<void>;

export interface PipelineResult {
  paperId: string;
}

/**
 * Single source of truth for the 6-stage generation pipeline. Used by both:
 *   - the BullMQ worker (local dev): polls Redis, runs in background
 *   - the inline serverless path (Vercel): runs inside the same HTTP request
 *
 * Pass `onProgress` to receive stage updates (the worker forwards these to the
 * WS server; the inline path can no-op or persist them for client polling).
 */
export async function runGenerationPipeline(
  assignmentId: string,
  jobId: string,
  onProgress?: PipelineProgressHandler,
): Promise<PipelineResult> {
  const emit = async (e: PipelineProgress): Promise<void> => {
    if (onProgress) await onProgress(e);
  };

  // Stage 1: Fetching assignment.
  await emit({ stage: 'fetching', progress: 10, message: 'Analyzing your materials...' });
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);
  assignment.status = 'generating';
  assignment.jobId = jobId;
  await assignment.save();

  // Stage 2: Building prompt.
  await emit({ stage: 'building_prompt', progress: 25, message: 'Building generation prompt...' });
  const prompt = buildPrompt(assignment);

  // Stage 3: AI generation.
  await emit({ stage: 'generating', progress: 50, message: 'Generating questions with AI...' });
  const structured = await generatePaper(prompt);

  // Stage 4: Parsing & structuring (already done inside generatePaper).
  await emit({ stage: 'parsing', progress: 75, message: 'Structuring sections and answer key...' });

  // Stage 5: Persisting.
  await emit({ stage: 'persisting', progress: 90, message: 'Finalizing your paper...' });

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

  // Cache the paper for the GET endpoint.
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
  await emit({ stage: 'done', progress: 100, message: 'Paper ready' });

  return { paperId: paper._id.toString() };
}
