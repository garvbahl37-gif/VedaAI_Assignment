'use client';

import { useState } from 'react';
import { ChevronDown, ArrowLeft, LayoutGrid, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/stores/profileStore';
import { NotificationsButton } from '@/components/layout/NotificationsButton';
import { ProfileEditDialog } from '@/components/layout/ProfileEditDialog';
import { Avatar } from '@/components/ui/Avatar';

interface TopHeaderProps {
  title?: string;
  variant?: 'default' | 'create';
  /**
   * @deprecated Kept for compatibility — the back button is now always
   * functional: tries `router.back()` first, falls back to `/home` when
   * there's no in-app history (e.g. on a direct page load).
   */
  showBack?: boolean;
}

export function TopHeader({
  title = 'Assignment',
  variant = 'default',
}: TopHeaderProps) {
  const router = useRouter();
  const teacherName = useProfileStore((s) => s.teacherName) || 'John Doe';
  const photoUrl = useProfileStore((s) => s.photoUrl) || '';
  const [editOpen, setEditOpen] = useState(false);

  const handleBack = () => {
    // If there's in-app history, go back; otherwise land on /home so the
    // button never feels like a no-op on a direct page load.
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/home');
    }
  };

  return (
    <div className="sticky top-0 z-20 px-4 lg:px-6 pt-4 lg:pt-5 pb-3 bg-surface-page lg:rounded-t-2xl">
      <div className="flex items-center gap-3 bg-white rounded-full border border-line h-14 px-3 lg:px-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={handleBack}
          className="h-10 w-10 rounded-full bg-white border border-line flex items-center justify-center text-ink-muted shrink-0 hover:bg-surface-subtle active:bg-line transition-colors"
          aria-label="Go back"
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
        <div className="hidden lg:block">
          <NotificationsButton variant="desktop" />
        </div>

        {/* Teacher pill (desktop only) — clickable, opens profile edit dialog */}
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="hidden lg:flex items-center gap-2 h-10 pl-1 pr-2 rounded-full hover:bg-surface-subtle active:bg-line transition-colors"
          aria-label="Edit your profile"
        >
          <Avatar name={teacherName} photoUrl={photoUrl} size={32} />
          <span className="text-[13px] font-medium text-ink whitespace-nowrap">
            {teacherName}
          </span>
          <ChevronDown size={14} className="text-ink-muted shrink-0" />
        </button>
      </div>

      <ProfileEditDialog open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
}
