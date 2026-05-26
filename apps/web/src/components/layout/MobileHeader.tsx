'use client';

import { useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { Menu } from 'lucide-react';
import { useProfileStore } from '@/stores/profileStore';
import { NotificationsButton } from '@/components/layout/NotificationsButton';
import { ProfileEditDialog } from '@/components/layout/ProfileEditDialog';
import { MobileMenuDrawer } from '@/components/layout/MobileMenuDrawer';
import { Avatar } from '@/components/ui/Avatar';

export function MobileHeader() {
  const teacherName = useProfileStore((s) => s.teacherName) || 'John Doe';
  const photoUrl = useProfileStore((s) => s.photoUrl) || '';
  const [editOpen, setEditOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="lg:hidden sticky top-0 z-20 bg-surface-page px-3 pt-3 pb-2">
        <div className="bg-white rounded-xl shadow-sm border border-line h-14 px-3 flex items-center justify-between">
          <Logo size={28} variant="black" />
          <div className="flex items-center gap-2">
            <NotificationsButton variant="mobile" />

            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-95 transition-transform"
              aria-label="Edit your profile"
            >
              <Avatar name={teacherName} photoUrl={photoUrl} size={32} />
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="h-9 w-9 rounded-full hover:bg-surface-subtle active:bg-line flex items-center justify-center text-ink transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onEditProfile={() => setEditOpen(true)}
      />
      <ProfileEditDialog open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
}
