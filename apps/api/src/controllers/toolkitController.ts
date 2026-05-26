import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { generateQuickQuiz } from '../services/quickQuizService';
import type { QuickQuizResponse } from '@vedaai/shared';

export const quickQuizSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(200),
  className: z.string().min(1, 'Class level is required').max(60),
  numberOfQuestions: z.number().int().min(1).max(15),
  difficulty: z.enum(['easy', 'moderate', 'hard', 'mixed']).optional(),
});

export async function quickQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as z.infer<typeof quickQuizSchema>;
    const questions = await generateQuickQuiz({
      topic: body.topic,
      className: body.className,
      numberOfQuestions: body.numberOfQuestions,
      difficulty: body.difficulty ?? 'mixed',
    });

    const payload: QuickQuizResponse = {
      topic: body.topic,
      className: body.className,
      questions,
    };
    res.json(payload);
  } catch (err) {
    next(err);
  }
}
