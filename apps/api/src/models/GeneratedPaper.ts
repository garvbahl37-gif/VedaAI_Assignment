import { Schema, model, Document, Types } from 'mongoose';
import type { Difficulty } from '@vedaai/shared';

export interface IQuestion {
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  answer?: string;
  options?: string[];
}

export interface ISection {
  label: string;
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IGeneratedPaper extends Document {
  _id: Types.ObjectId;
  assignmentId: Types.ObjectId;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  generalInstructions: string[];
  sections: ISection[];
  rawPrompt?: string;
  generatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    number: { type: Number, required: true },
    text: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'moderate', 'hard'], required: true },
    marks: { type: Number, required: true, min: 0 },
    answer: { type: String },
    options: { type: [String], default: undefined },
  },
  { _id: false },
);

const SectionSchema = new Schema<ISection>(
  {
    label: { type: String, required: true },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true, default: [] },
  },
  { _id: false },
);

const GeneratedPaperSchema = new Schema<IGeneratedPaper>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    timeAllowed: { type: String, required: true },
    maximumMarks: { type: Number, required: true },
    generalInstructions: { type: [String], default: [] },
    sections: { type: [SectionSchema], required: true, default: [] },
    rawPrompt: { type: String },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

export const GeneratedPaper = model<IGeneratedPaper>('GeneratedPaper', GeneratedPaperSchema);
