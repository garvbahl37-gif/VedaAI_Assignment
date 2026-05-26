'use client';

import { Logo } from '@/components/brand/Logo';
import { Menu } from 'lucide-react';
import { NotificationsButton } from '@/components/layout/NotificationsButton';

export function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-20 bg-surface-page px-3 pt-3 pb-2">
      <div className="bg-white rounded-xl shadow-sm border border-line h-14 px-3 flex items-center justify-between">
        <Logo size={28} variant="black" />
        <div className="flex items-center gap-2">
          <NotificationsButton variant="mobile" />

          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-200 via-orange-300 to-rose-300 flex items-center justify-center text-white text-[10px] font-semibold overflow-hidden ring-2 ring-white">
            <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
              <circle cx="16" cy="13" r="6" fill="#5C3A21" />
              <circle cx="16" cy="14" r="4.5" fill="#F2D7B5" />
              <ellipse cx="13.5" cy="13.5" rx="0.7" ry="0.9" fill="#3B2415" />
              <ellipse cx="18.5" cy="13.5" rx="0.7" ry="0.9" fill="#3B2415" />
              <path d="M8 30 Q16 21 24 30 Z" fill="#E6A86A" />
            </svg>
          </div>
          <button
            type="button"
            className="h-9 w-9 rounded-full hover:bg-surface-subtle active:bg-line flex items-center justify-center text-ink transition-colors"
            aria-label="Menu"
          >
            <Menu size={20} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
  );
}
