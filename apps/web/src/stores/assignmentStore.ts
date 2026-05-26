'use client';

import { create } from 'zustand';
import type { Assignment } from '@vedaai/shared';

interface AssignmentStore {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  isLoading: boolean;
  error: string | null;
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  removeAssignment: (id: string) => void;
  setCurrentAssignment: (assignment: Assignment | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  currentAssignment: null,
  isLoading: false,
  error: null,
  setAssignments: (assignments) => set({ assignments }),
  addAssignment: (assignment) =>
    set((s) => ({ assignments: [assignment, ...s.assignments] })),
  removeAssignment: (id) =>
    set((s) => ({ assignments: s.assignments.filter((a) => a._id !== id) })),
  setCurrentAssignment: (currentAssignment) => set({ currentAssignment }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
