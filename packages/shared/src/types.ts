// ──────────────────────────────────────────────────────────
// Shared domain types — used by both apps/api and apps/web.
// ──────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'moderate' | 'hard';

export type AssignmentStatus = 'draft' | 'generating' | 'completed' | 'failed';

export type GenerationStage =
  | 'fetching'
  | 'building_prompt'
  | 'generating'
  | 'parsing'
  | 'persisting'
  | 'done';

export const QUESTION_TYPES = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'True or False',
  'Fill in the Blanks',
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export interface QuestionTypeRow {
  type: QuestionType | string;
  numberOfQuestions: number;
  marks: number;
}

export interface SchoolProfile {
  schoolName: string;
  city: string;
  principalName?: string;
  teacherName?: string;
  defaultClass?: string;
  defaultSubject?: string;
}

export interface Assignment {
  _id: string;
  title: string;
  dueDate: string; // ISO date string
  questionTypes: QuestionTypeRow[];
  additionalInstructions?: string;
  fileUrl?: string;
  fileName?: string;
  schoolName?: string;
  city?: string;
  status: AssignmentStatus;
  generatedPaperId?: string;
  jobId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  answer?: string;
  options?: string[]; // for MCQs
}

export interface Section {
  label: string;       // "Section A"
  title: string;       // "Short Answer Questions"
  instruction: string; // "Attempt all questions"
  questions: Question[];
}

export interface GeneratedPaper {
  _id: string;
  assignmentId: string;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  generalInstructions?: string[];
  sections: Section[];
  generatedAt: string;
}

// ──────────────────────────────────────────────────────────
// WebSocket protocol — emitted by the API generation worker.
// ──────────────────────────────────────────────────────────

export type WSMessage =
  | { type: 'connected'; jobId: string }
  | { type: 'progress'; stage: GenerationStage; progress: number; message?: string }
  | { type: 'completed'; progress: 100; paperId: string }
  | { type: 'failed'; error: string };

// ──────────────────────────────────────────────────────────
// REST request/response payloads.
// ──────────────────────────────────────────────────────────

export interface CreateAssignmentRequest {
  title: string;
  dueDate: string;
  questionTypes: QuestionTypeRow[];
  additionalInstructions?: string;
  fileName?: string;
  schoolName?: string;
  city?: string;
}

export interface CreateAssignmentResponse {
  assignment: Assignment;
  jobId: string;
  /** Present when the API ran the generation inline (serverless mode). */
  paperId?: string;
}

export interface ListAssignmentsResponse {
  assignments: Assignment[];
}

export interface GetAssignmentResponse {
  assignment: Assignment;
}

export interface GetPaperResponse {
  paper: GeneratedPaper;
  cached: boolean;
}

export interface JobStatusResponse {
  jobId: string;
  status: 'queued' | 'active' | 'completed' | 'failed' | 'delayed' | 'waiting' | 'unknown';
  progress: number;
  stage?: GenerationStage;
}

// ──────────────────────────────────────────────────────────
// Toolkit: Quick Quiz generator (no Mongo persistence).
// ──────────────────────────────────────────────────────────

export interface QuickQuizRequest {
  topic: string;
  className: string;
  numberOfQuestions: number;
  difficulty?: Difficulty | 'mixed';
}

export interface QuickQuizQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface QuickQuizResponse {
  topic: string;
  className: string;
  questions: QuickQuizQuestion[];
}

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}
