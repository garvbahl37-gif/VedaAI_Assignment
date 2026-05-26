'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Difficulty, QuickQuizQuestion } from '@vedaai/shared';

export interface SavedQuiz {
  id: string;
  topic: string;
  className: string;
  difficulty: Difficulty | 'mixed';
  questions: QuickQuizQuestion[];
  savedAt: number;
}

interface LibraryStore {
  quizzes: SavedQuiz[];
  save: (q: Omit<SavedQuiz, 'id' | 'savedAt'>) => SavedQuiz;
  remove: (id: string) => void;
  clear: () => void;
}

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set) => ({
      quizzes: [],
      save: (q) => {
        const saved: SavedQuiz = {
          ...q,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          savedAt: Date.now(),
        };
        set((state) => ({ quizzes: [saved, ...state.quizzes] }));
        return saved;
      },
      remove: (id) =>
        set((state) => ({ quizzes: state.quizzes.filter((q) => q.id !== id) })),
      clear: () => set({ quizzes: [] }),
    }),
    {
      name: 'vedaai:library',
      version: 1,
    },
  ),
);
