'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType =
  | 'assignment_created'
  | 'paper_generated'
  | 'quiz_created'
  | 'quiz_saved'
  | 'group_created'
  | 'profile_saved'
  | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  timestamp: number;
  read: boolean;
  link?: string;
}

interface NotificationsStore {
  items: Notification[];
  add: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
}

const MAX_ITEMS = 30;

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set) => ({
      items: [],
      add: (n) =>
        set((state) => ({
          items: [
            {
              ...n,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              timestamp: Date.now(),
              read: false,
            },
            ...state.items,
          ].slice(0, MAX_ITEMS),
        })),
      markRead: (id) =>
        set((state) => ({
          items: state.items.map((it) => (it.id === id ? { ...it, read: true } : it)),
        })),
      markAllRead: () =>
        set((state) => ({
          items: state.items.map((it) => ({ ...it, read: true })),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'vedaai:notifications',
      version: 1,
    },
  ),
);

export function unreadCount(items: Notification[]): number {
  return items.reduce((n, it) => n + (it.read ? 0 : 1), 0);
}
