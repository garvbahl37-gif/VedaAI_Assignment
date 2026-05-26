'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useNotificationsStore, unreadCount } from '@/stores/notificationsStore';
import { NotificationsPopover } from '@/components/layout/NotificationsPopover';

interface NotificationsButtonProps {
  variant?: 'desktop' | 'mobile';
}

/**
 * Self-contained bell + popover that fixes the second-click bug:
 *  - Old layout: the popover panel held the click-outside ref. Clicking the
 *    bell counted as "outside", so close ran on the same gesture that the
 *    button's onClick was about to use to re-open. They cancelled out.
 *  - New layout: a single containerRef wraps both the button and the popover.
 *    The bell is therefore "inside" the click-outside boundary, and the
 *    button's onClick toggles cleanly.
 */
export function NotificationsButton({ variant = 'desktop' }: NotificationsButtonProps) {
  const items = useNotificationsStore((s) => s.items);
  const unread = unreadCount(items);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      // Clicks on the bell button (containerRef) and inside the portaled
      // popover panel both count as "inside". Backdrop clicks have their own
      // onClose handler on the backdrop element, so they don't need to be
      // listed here.
      if (containerRef.current?.contains(target)) return;
      if (target.closest('[data-notif-popover="panel"]')) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isMobile = variant === 'mobile';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative rounded-full hover:bg-surface-subtle active:bg-surface-subtle flex items-center justify-center transition-colors',
          isMobile ? 'h-9 w-9 text-ink' : 'h-10 w-10 text-ink-muted',
        )}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        aria-expanded={open}
      >
        <Bell size={18} strokeWidth={isMobile ? 1.8 : 1.7} />
        {unread > 0 && (
          <span
            className={cn(
              'absolute rounded-full bg-red-500 text-white font-bold flex items-center justify-center ring-2 ring-white',
              isMobile
                ? '-top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 text-[9.5px]'
                : '-top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px]',
            )}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      <NotificationsPopover open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
