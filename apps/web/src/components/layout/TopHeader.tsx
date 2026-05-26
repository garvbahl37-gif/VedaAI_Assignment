'use client';

import { useState } from 'react';
import { Bell, ChevronDown, ArrowLeft, LayoutGrid, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/stores/profileStore';
import { useNotificationsStore, unreadCount } from '@/stores/notificationsStore';
import { NotificationsPopover } from '@/components/layout/NotificationsPopover';

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
  const teacherName = useProfileStore((s) => s.teacherName) || 'John Doe';
  const items = useNotificationsStore((s) => s.items);
  const unread = unreadCount(items);
  const [notifOpen, setNotifOpen] = useState(false);

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

        <div className="flex items-center justify-center lg:justify-start gap-2 min-w-0 flex-1 text-ink-muted">
          {variant === 'create' ? (
            <Sparkles size={16} strokeWidth={1.7} className="hidden lg:inline-block" />
          ) : (
            <LayoutGrid size={16} strokeWidth={1.7} className="hidden lg:inline-block" />
          )}
          <span className="text-[14px] font-medium lg:font-normal text-ink lg:text-ink-muted truncate">
            {title}
          </span>
        </div>

        {/* Spacer that mirrors the back button width on mobile, so the centered
            title visually aligns with the viewport center, not the back arrow. */}
        <div className="lg:hidden h-10 w-10 shrink-0" aria-hidden="true" />

        {/* Bell + popover (desktop only — MobileHeader has its own) */}
        <div className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative h-10 w-10 rounded-full hover:bg-surface-subtle flex items-center justify-center text-ink-muted"
            aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
          >
            <Bell size={18} strokeWidth={1.7} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          <NotificationsPopover open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        {/* Teacher pill (desktop only) */}
        <div className="hidden lg:flex items-center gap-2 h-10 pl-1 pr-2 rounded-full hover:bg-surface-subtle cursor-pointer">
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
            {teacherName}
          </span>
          <ChevronDown size={14} className="text-ink-muted shrink-0" />
        </div>
      </div>
    </div>
  );
}
