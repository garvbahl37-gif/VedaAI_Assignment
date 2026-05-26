import { Schema, model, Document, Types } from 'mongoose';
import type { AssignmentStatus } from '@vedaai/shared';

export interface IQuestionTypeRow {
  type: string;
  numberOfQuestions: number;
  marks: number;
}

export interface IAssignment extends Document {
  _id: Types.ObjectId;
  title: string;
  dueDate: Date;
  questionTypes: IQuestionTypeRow[];
  additionalInstructions?: string;
  fileUrl?: string;
  fileName?: string;
  referenceText?: string;
  schoolName?: string;
  city?: string;
  status: AssignmentStatus;
  generatedPaperId?: Types.ObjectId;
  jobId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeRowSchema = new Schema<IQuestionTypeRow>(
  {
    type: { type: String, required: true },
    numberOfQuestions: { type: Number, required: true, min: 1, max: 100 },
    marks: { type: Number, required: true, min: 1, max: 50 },
  },
  { _id: false },
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [QuestionTypeRowSchema], required: true, default: [] },
    additionalInstructions: { type: String, default: '' },
    fileUrl: { type: String },
    fileName: { type: String },
    referenceText: { type: String },
    schoolName: { type: String },
    city: { type: String },
    status: {
      type: String,
      enum: ['draft', 'generating', 'completed', 'failed'],
      default: 'draft',
      index: true,
    },
    generatedPaperId: { type: Schema.Types.ObjectId, ref: 'GeneratedPaper' },
    jobId: { type: String, index: true },
  },
  { timestamps: true },
);

AssignmentSchema.index({ createdAt: -1 });

export const Assignment = model<IAssignment>('Assignment', AssignmentSchema);
