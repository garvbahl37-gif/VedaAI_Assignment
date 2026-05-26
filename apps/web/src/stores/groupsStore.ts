'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const GROUP_COLORS = [
  'emerald',
  'amber',
  'blue',
  'purple',
  'pink',
  'rose',
  'indigo',
  'teal',
] as const;
export type GroupColor = (typeof GROUP_COLORS)[number];

export interface Group {
  id: string;
  name: string;
  classLevel: string;
  subject: string;
  studentCount: number;
  description?: string;
  color: GroupColor;
  createdAt: number;
}

interface GroupsStore {
  groups: Group[];
  add: (g: Omit<Group, 'id' | 'createdAt'>) => Group;
  update: (id: string, patch: Partial<Omit<Group, 'id' | 'createdAt'>>) => void;
  remove: (id: string) => void;
}

export const useGroupsStore = create<GroupsStore>()(
  persist(
    (set) => ({
      groups: [],
      add: (g) => {
        const created: Group = {
          ...g,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: Date.now(),
        };
        set((state) => ({ groups: [created, ...state.groups] }));
        return created;
      },
      update: (id, patch) =>
        set((state) => ({
          groups: state.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),
      remove: (id) =>
        set((state) => ({ groups: state.groups.filter((g) => g.id !== id) })),
    }),
    {
      name: 'vedaai:groups',
      version: 1,
    },
  ),
);

export const COLOR_CLASSES: Record<GroupColor, { bg: string; text: string; ring: string; strip: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', strip: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', strip: 'bg-amber-500' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200', strip: 'bg-blue-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-200', strip: 'bg-purple-500' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-700', ring: 'ring-pink-200', strip: 'bg-pink-500' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200', strip: 'bg-rose-500' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-200', strip: 'bg-indigo-500' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-200', strip: 'bg-teal-500' },
};
