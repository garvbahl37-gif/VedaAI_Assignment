'use client';

import { Bell, ChevronDown, ArrowLeft, LayoutGrid, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TopHeaderProps {
  title?: string;
  variant?: 'default' | 'create';
  showBack?: boolean;
}

export function TopHeader({
  title = 'Assignment',
  variant = 'default',
  showBack = false,
}: TopHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-20 px-4 lg:px-6 pt-4 lg:pt-5 pb-3 bg-surface-page lg:rounded-t-2xl">
      <div className="flex items-center gap-3 bg-white rounded-full border border-line h-14 px-3 lg:px-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => (showBack ? router.back() : undefined)}
          className="h-10 w-10 rounded-full bg-white border border-line flex items-center justify-center text-ink-muted shrink-0 hover:bg-surface-subtle"
          aria-label="Back"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
        </button>

        <div className="flex items-center gap-2 min-w-0 flex-1 text-ink-muted">
          {variant === 'create' ? (
            <Sparkles size={16} strokeWidth={1.7} />
          ) : (
            <LayoutGrid size={16} strokeWidth={1.7} />
          )}
          <span className="text-[14px] truncate">{title}</span>
        </div>

        <button
          type="button"
          className="relative h-10 w-10 rounded-full hover:bg-surface-subtle flex items-center justify-center text-ink-muted"
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={1.7} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2 h-10 pl-1 pr-2 rounded-full hover:bg-surface-subtle cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-amber-100 overflow-hidden ring-1 ring-white">
            <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
              <rect width="40" height="40" fill="#F3DDC1" />
              <path d="M10 18 Q20 8 30 18 L30 21 L10 21 Z" fill="#D9D9D9" />
              <circle cx="20" cy="24" r="5.5" fill="#E8B58A" />
              <circle cx="18" cy="23.5" r="0.7" fill="#3B2415" />
              <circle cx="22" cy="23.5" r="0.7" fill="#3B2415" />
              <path d="M17.5 26 Q20 27.3 22.5 26" stroke="#5C3A21" strokeWidth="0.9" fill="none" strokeLinecap="round" />
              <path d="M10 36 Q20 28 30 36 L30 40 L10 40 Z" fill="#9CA3AF" />
            </svg>
          </div>
          <span className="text-[13px] font-medium text-ink whitespace-nowrap">
            John Doe
          </span>
          <ChevronDown size={14} className="text-ink-muted shrink-0" />
        </div>
      </div>
    </div>
  );
}
