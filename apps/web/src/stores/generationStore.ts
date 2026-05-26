'use client';

import { create } from 'zustand';
import type { GeneratedPaper, GenerationStage } from '@vedaai/shared';

export type GenerationStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed';

interface GenerationStore {
  jobId: string | null;
  assignmentId: string | null;
  status: GenerationStatus;
  stage: GenerationStage | null;
  progress: number;
  message: string;
  generatedPaper: GeneratedPaper | null;
  wsConnected: boolean;
  error: string | null;
  setJobId: (jobId: string | null) => void;
  setAssignmentId: (id: string | null) => void;
  setStatus: (status: GenerationStatus) => void;
  setStage: (stage: GenerationStage) => void;
  setProgress: (progress: number) => void;
  setMessage: (message: string) => void;
  setGeneratedPaper: (paper: GeneratedPaper | null) => void;
  setWsConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initial = {
  jobId: null,
  assignmentId: null,
  status: 'idle' as GenerationStatus,
  stage: null,
  progress: 0,
  message: '',
  generatedPaper: null,
  wsConnected: false,
  error: null,
};

export const useGenerationStore = create<GenerationStore>((set) => ({
  ...initial,
  setJobId: (jobId) => set({ jobId }),
  setAssignmentId: (assignmentId) => set({ assignmentId }),
  setStatus: (status) => set({ status }),
  setStage: (stage) => set({ stage }),
  setProgress: (progress) => set({ progress }),
  setMessage: (message) => set({ message }),
  setGeneratedPaper: (generatedPaper) => set({ generatedPaper }),
  setWsConnected: (wsConnected) => set({ wsConnected }),
  setError: (error) => set({ error }),
  reset: () => set(initial),
}));
