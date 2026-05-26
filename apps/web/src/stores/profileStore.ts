'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SchoolProfile } from '@vedaai/shared';

interface ProfileStore extends SchoolProfile {
  setProfile: (patch: Partial<SchoolProfile>) => void;
  reset: () => void;
}

const DEFAULT_PROFILE: SchoolProfile = {
  schoolName: 'Delhi Public School',
  city: 'Bokaro Steel City',
  principalName: '',
  teacherName: 'John Doe',
  defaultClass: '',
  defaultSubject: '',
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PROFILE,
      setProfile: (patch) => set((state) => ({ ...state, ...patch })),
      reset: () => set({ ...DEFAULT_PROFILE }),
    }),
    {
      name: 'vedaai:profile',
      version: 1,
    },
  ),
);
