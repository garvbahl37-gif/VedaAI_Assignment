'use client';

import { create } from 'zustand';
import type { QuestionTypeRow } from '@vedaai/shared';

export interface CreateFormData {
  title: string;
  file: File | null;
  fileName: string;
  referenceText: string;
  referenceStatus: 'idle' | 'extracting' | 'ready' | 'unsupported' | 'error';
  referencePages?: number;
  referenceTruncated?: boolean;
  dueDate: string; // DD-MM-YYYY
  questionTypes: QuestionTypeRow[];
  additionalInstructions: string;
}

interface CreateAssignmentStore {
  step: number;
  formData: CreateFormData;
  setStep: (step: number) => void;
  updateFormData: (data: Partial<CreateFormData>) => void;
  addQuestionType: () => void;
  removeQuestionType: (index: number) => void;
  updateQuestionType: (index: number, data: Partial<QuestionTypeRow>) => void;
  reset: () => void;
}

const initialData: CreateFormData = {
  title: '',
  file: null,
  fileName: '',
  referenceText: '',
  referenceStatus: 'idle',
  referencePages: undefined,
  referenceTruncated: false,
  dueDate: '',
  questionTypes: [
    { type: 'Multiple Choice Questions', numberOfQuestions: 5, marks: 2 },
    { type: 'Short Questions', numberOfQuestions: 5, marks: 5 },
    { type: 'Diagram/Graph-Based Questions', numberOfQuestions: 5, marks: 4 },
    { type: 'Numerical Problems', numberOfQuestions: 10, marks: 3 },
  ],
  additionalInstructions: '',
};

export const useCreateAssignmentStore = create<CreateAssignmentStore>((set) => ({
  step: 1,
  formData: initialData,
  setStep: (step) => set({ step }),
  updateFormData: (data) =>
    set((s) => ({ formData: { ...s.formData, ...data } })),
  addQuestionType: () =>
    set((s) => ({
      formData: {
        ...s.formData,
        questionTypes: [
          ...s.formData.questionTypes,
          { type: 'Short Questions', numberOfQuestions: 5, marks: 2 },
        ],
      },
    })),
  removeQuestionType: (index) =>
    set((s) => ({
      formData: {
        ...s.formData,
        questionTypes: s.formData.questionTypes.filter((_, i) => i !== index),
      },
    })),
  updateQuestionType: (index, data) =>
    set((s) => ({
      formData: {
        ...s.formData,
        questionTypes: s.formData.questionTypes.map((qt, i) =>
          i === index ? { ...qt, ...data } : qt,
        ),
      },
    })),
  reset: () => set({ step: 1, formData: initialData }),
}));
