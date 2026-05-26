'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  Bell,
  FileText,
  Sparkles,
  Users,
  UserCircle,
  Info,
  Trash2,
  CheckCheck,
  BookOpen,
} from 'lucide-react';
import {
  useNotificationsStore,
  type Notification,
  type NotificationType,
} from '@/stores/notificationsStore';

interface NotificationsPopoverProps {
  open: boolean;
  onClose: () => void;
}

const ICON_BY_TYPE: Record<NotificationType, typeof Bell> = {
  assignment_created: FileText,
  paper_generated: Sparkles,
  quiz_created: BookOpen,
  quiz_saved: BookOpen,
  group_created: Users,
  profile_saved: UserCircle,
  info: Info,
};

const COLOR_BY_TYPE: Record<NotificationType, string> = {
  assignment_created: 'bg-blue-50 text-blue-600',
  paper_generated: 'bg-emerald-50 text-emerald-600',
  quiz_created: 'bg-brand-50 text-brand-600',
  quiz_saved: 'bg-purple-50 text-purple-600',
  group_created: 'bg-amber-50 text-amber-600',
  profile_saved: 'bg-pink-50 text-pink-600',
  info: 'bg-surface-subtle text-ink-muted',
};

export function NotificationsPopover({ open, onClose }: NotificationsPopoverProps) {
  const items = useNotificationsStore((s) => s.items);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const markRead = useNotificationsStore((s) => s.markRead);
  const clear = useNotificationsStore((s) => s.clear);

  // Portal target — set once on mount so SSR doesn't try to reach document.body.
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalRoot(typeof document !== 'undefined' ? document.body : null);
  }, []);

  if (!open || !portalRoot) return null;

  const overlay = (
    <>
      {/* Backdrop — mobile only. Sits above all page content. */}
      <div
        data-notif-popover="backdrop"
        className="fixed inset-0 z-[60] bg-black/30 sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Popover — fixed on mobile (centered under the header), absolute and
          bell-anchored on desktop. data-notif-popover lets the parent button's
          click-outside check treat clicks here as "inside". */}
      <div
        data-notif-popover="panel"
        className="
          fixed left-4 right-4 top-[4.75rem]
          sm:left-auto sm:right-6 sm:top-[5rem]
          sm:w-[360px] sm:max-w-[90vw]
          z-[70] bg-white border border-line rounded-2xl shadow-2xl overflow-hidden
        "
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <h3 className="text-[14px] font-semibold text-ink">Notifications</h3>
          {items.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11.5px] text-ink-muted hover:bg-surface-subtle hover:text-ink"
                title="Mark all as read"
              >
                <CheckCheck size={12} />
                Mark all read
              </button>
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11.5px] text-ink-muted hover:bg-red-50 hover:text-red-600"
                title="Clear all"
              >
                <Trash2 size={12} />
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="h-12 w-12 rounded-full bg-surface-subtle flex items-center justify-center mb-3">
                <Bell size={20} className="text-ink-muted" strokeWidth={1.6} />
              </div>
              <p className="text-[13px] font-medium text-ink">No notifications yet</p>
              <p className="mt-1 text-[12px] text-ink-muted text-center max-w-[240px]">
                Activity from your assignments, quizzes, and groups will show up here.
              </p>
            </div>
          ) : (
            <ul>
              {items.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onClick={() => {
                    markRead(n.id);
                    if (n.link) onClose();
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(overlay, portalRoot);
}

function NotificationRow({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick: () => void;
}) {
  const Icon = ICON_BY_TYPE[notification.type] ?? Info;
  const colorClass = COLOR_BY_TYPE[notification.type] ?? COLOR_BY_TYPE.info;

  const body = (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-surface-page active:bg-surface-subtle transition-colors cursor-pointer">
      <div
        className={`h-9 w-9 rounded-full shrink-0 flex items-center justify-center ${colorClass}`}
      >
        <Icon size={15} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-[13px] leading-tight ${
              notification.read ? 'text-ink' : 'font-semibold text-ink'
            }`}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
          )}
        </div>
        {notification.description && (
          <p className="mt-0.5 text-[12px] text-ink-muted leading-snug truncate">
            {notification.description}
          </p>
        )}
        <p className="mt-1 text-[11px] text-ink-muted">
          {timeAgo(notification.timestamp)}
        </p>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <li>
        <Link href={notification.link} onClick={onClick}>
          {body}
        </Link>
      </li>
    );
  }

  return (
    <li onClick={onClick}>
      {body}
    </li>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}
