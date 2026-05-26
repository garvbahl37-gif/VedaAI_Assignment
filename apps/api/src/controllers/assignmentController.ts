import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Assignment, IAssignment } from '../models/Assignment';
import { GeneratedPaper } from '../models/GeneratedPaper';
import { enqueueGeneration } from '../queues/generationQueue';
import { cacheHelpers } from '../config/redis';
import { runGenerationPipeline } from '../services/generationPipeline';
import { HttpError } from '../middleware/errorHandler';
import type { Assignment as AssignmentDTO, GeneratedPaper as GeneratedPaperDTO } from '@vedaai/shared';

// When running in a serverless environment we can't keep a background Worker
// alive across requests, so we run the same pipeline INLINE inside the HTTP
// request that created the assignment. The queue + worker code stays intact
// for local dev (npm run dev:api).
const IS_SERVERLESS = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

export const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypes: z
    .array(
      z.object({
        type: z.string().min(1),
        numberOfQuestions: z.number().int().min(1).max(100),
        marks: z.number().int().min(1).max(50),
      }),
    )
    .min(1, 'At least one question type is required'),
  additionalInstructions: z.string().optional(),
  fileName: z.string().optional(),
});

function toAssignmentDTO(doc: IAssignment): AssignmentDTO {
  return {
    _id: doc._id.toString(),
    title: doc.title,
    dueDate: doc.dueDate.toISOString(),
    questionTypes: doc.questionTypes.map((qt) => ({
      type: qt.type,
      numberOfQuestions: qt.numberOfQuestions,
      marks: qt.marks,
    })),
    additionalInstructions: doc.additionalInstructions,
    fileUrl: doc.fileUrl,
    fileName: doc.fileName,
    status: doc.status,
    generatedPaperId: doc.generatedPaperId?.toString(),
    jobId: doc.jobId,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function parseDueDate(input: string): Date {
  if (/^\d{4}-\d{2}-\d{2}/.test(input)) return new Date(input);
  const m = input.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00.000Z`);
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new HttpError(400, 'Invalid dueDate format');
  return d;
}

export async function listAssignments(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const docs = await Assignment.find().sort({ createdAt: -1 }).exec();
    res.json({ assignments: docs.map(toAssignmentDTO) });
  } catch (err) {
    next(err);
  }
}

export async function getAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = await Assignment.findById(req.params.id).exec();
    if (!doc) throw new HttpError(404, 'Assignment not found');
    res.json({ assignment: toAssignmentDTO(doc) });
  } catch (err) {
    next(err);
  }
}

export async function createAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as z.infer<typeof createAssignmentSchema>;
    const doc = await Assignment.create({
      title: body.title,
      dueDate: parseDueDate(body.dueDate),
      questionTypes: body.questionTypes,
      additionalInstructions: body.additionalInstructions,
      fileName: body.fileName,
      status: 'generating',
    });

    if (IS_SERVERLESS) {
      // Run the pipeline INLINE — no background Worker on serverless.
      const jobId = `inline:${doc._id.toString()}:${Date.now()}`;
      doc.jobId = jobId;
      await doc.save();

      try {
        const result = await runGenerationPipeline(doc._id.toString(), jobId);
        const updated = await Assignment.findById(doc._id).exec();
        res.status(201).json({
          assignment: updated ? toAssignmentDTO(updated) : toAssignmentDTO(doc),
          jobId,
          paperId: result.paperId,
        });
      } catch (err) {
        doc.status = 'failed';
        await doc.save();
        throw err;
      }
    } else {
      // Local dev / Render: enqueue and let the background Worker process it.
      const jobId = await enqueueGeneration(doc._id.toString());
      doc.jobId = jobId;
      await doc.save();
      res.status(201).json({ assignment: toAssignmentDTO(doc), jobId });
    }
  } catch (err) {
    next(err);
  }
}

export async function deleteAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = await Assignment.findById(req.params.id).exec();
    if (!doc) throw new HttpError(404, 'Assignment not found');
    await GeneratedPaper.deleteMany({ assignmentId: doc._id });
    await cacheHelpers.invalidatePaper(doc._id.toString());
    await doc.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getAssignmentPaper(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignmentId = req.params.id;

    const cached = await cacheHelpers.getPaper<GeneratedPaperDTO>(assignmentId);
    if (cached) {
      res.json({ paper: cached, cached: true });
      return;
    }

    const paper = await GeneratedPaper.findOne({ assignmentId }).exec();
    if (!paper) throw new HttpError(404, 'Paper not generated yet');

    const dto: GeneratedPaperDTO = {
      _id: paper._id.toString(),
      assignmentId: paper.assignmentId.toString(),
      schoolName: paper.schoolName,
      subject: paper.subject,
      className: paper.className,
      timeAllowed: paper.timeAllowed,
      maximumMarks: paper.maximumMarks,
      generalInstructions: paper.generalInstructions,
      sections: paper.sections,
      generatedAt: paper.generatedAt.toISOString(),
    };

    await cacheHelpers.setPaper(assignmentId, dto);
    res.json({ paper: dto, cached: false });
  } catch (err) {
    next(err);
  }
}

export async function regenerateAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = await Assignment.findById(req.params.id).exec();
    if (!doc) throw new HttpError(404, 'Assignment not found');

    await cacheHelpers.invalidatePaper(doc._id.toString());
    doc.status = 'generating';

    if (IS_SERVERLESS) {
      const jobId = `inline:${doc._id.toString()}:${Date.now()}`;
      doc.jobId = jobId;
      await doc.save();
      try {
        const result = await runGenerationPipeline(doc._id.toString(), jobId);
        const updated = await Assignment.findById(doc._id).exec();
        res.json({
          assignment: updated ? toAssignmentDTO(updated) : toAssignmentDTO(doc),
          jobId,
          paperId: result.paperId,
        });
      } catch (err) {
        doc.status = 'failed';
        await doc.save();
        throw err;
      }
    } else {
      const jobId = await enqueueGeneration(doc._id.toString());
      doc.jobId = jobId;
      await doc.save();
      res.json({ assignment: toAssignmentDTO(doc), jobId });
    }
  } catch (err) {
    next(err);
  }
}
