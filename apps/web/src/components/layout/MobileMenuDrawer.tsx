'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  LayoutGrid,
  Presentation,
  FileText,
  BookOpen,
  PieChart,
  Settings,
  Sparkles,
  Pencil,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { useAssignmentStore } from '@/stores/assignmentStore';
import { useLibraryStore } from '@/stores/libraryStore';
import { useProfileStore } from '@/stores/profileStore';
import { cn } from '@/lib/cn';

interface MobileMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  onEditProfile: () => void;
}

export function MobileMenuDrawer({ open, onClose, onEditProfile }: MobileMenuDrawerProps) {
  const pathname = usePathname();
  const assignmentsCount = useAssignmentStore((s) => s.assignments.length);
  const libraryCount = useLibraryStore((s) => s.quizzes.length);
  const schoolName = useProfileStore((s) => s.schoolName);
  const city = useProfileStore((s) => s.city);
  const teacherName = useProfileStore((s) => s.teacherName) || 'John Doe';
  const photoUrl = useProfileStore((s) => s.photoUrl) || '';

  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPortalRoot(typeof document !== 'undefined' ? document.body : null);
  }, []);

  // Trigger the slide-in transition one frame after the DOM is inserted, so
  // the off-screen → on-screen transform animates rather than snapping.
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
  }, [open]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !portalRoot) return null;

  interface NavItem {
    label: string;
    href: string;
    icon: typeof LayoutGrid;
    badge?: number;
  }

  const NAV_ITEMS: NavItem[] = [
    { label: 'Home', href: '/home', icon: LayoutGrid },
    { label: 'My Groups', href: '/groups', icon: Presentation },
    {
      label: 'Assignments',
      href: '/assignments',
      icon: FileText,
      badge: assignmentsCount > 0 ? assignmentsCount : undefined,
    },
    { label: "AI Teacher's Toolkit", href: '/toolkit', icon: BookOpen },
    {
      label: 'My Library',
      href: '/library',
      icon: PieChart,
      badge: libraryCount > 0 ? libraryCount : undefined,
    },
  ];

  const overlay = (
    <div className="fixed inset-0 z-[80] lg:hidden">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-ink/55 backdrop-blur-sm transition-opacity duration-200',
          mounted ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel — slides in from the right */}
      <aside
        className={cn(
          'absolute right-0 top-0 bottom-0 w-[86%] max-w-[320px]',
          'bg-white shadow-2xl flex flex-col',
          'transition-transform duration-250 ease-out',
          mounted ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-line">
          <Logo size={28} variant="black" />
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-surface-subtle active:bg-line flex items-center justify-center text-ink-muted transition-colors"
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        {/* Create CTA — same orange-ringed black pill as desktop sidebar */}
        <div className="px-5 pt-5 pb-2">
          <Link
            href="/assignments/create"
            onClick={onClose}
            className="flex items-center justify-center w-full h-11 rounded-full bg-ink active:bg-black transition gap-2 border-[1.5px] border-brand shadow-[0_0_0_3px_rgba(244,128,30,0.10)]"
          >
            <Sparkles size={15} strokeWidth={2.3} className="text-white" />
            <span className="text-[13.5px] font-medium text-white">
              Create Assignment
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-3 pb-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 h-11 rounded-lg text-[14px] transition-colors',
                  active
                    ? 'bg-surface-subtle text-ink font-semibold'
                    : 'text-ink-muted active:bg-surface-subtle active:text-ink',
                )}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.1 : 1.7}
                  className="shrink-0"
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge ? (
                  <span className="inline-flex items-center justify-center min-w-[24px] h-[20px] rounded-full bg-brand text-white text-[11px] font-semibold px-1.5">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}

          <div className="my-2 h-px bg-line" />

          <Link
            href="/settings"
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 h-11 rounded-lg text-[14px] transition-colors',
              pathname.startsWith('/settings')
                ? 'bg-surface-subtle text-ink font-semibold'
                : 'text-ink-muted active:bg-surface-subtle',
            )}
          >
            <Settings size={18} strokeWidth={1.7} />
            <span>Settings</span>
          </Link>
        </nav>

        {/* Profile footer — tap to edit (same dialog as desktop sidebar card) */}
        <button
          type="button"
          onClick={() => {
            onClose();
            // Defer slightly so the drawer's slide-out animation can start
            // before the dialog mounts on top — otherwise both animations
            // collide visually.
            setTimeout(onEditProfile, 200);
          }}
          className="group mx-3 mb-4 mt-2 rounded-xl bg-surface-subtle active:bg-line transition-colors px-2.5 py-3 flex items-center gap-3 text-left"
          aria-label="Edit your profile"
        >
          <Avatar name={teacherName} photoUrl={photoUrl} size={40} />
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-semibold text-ink truncate">
              {schoolName || 'My School'}
            </div>
            <div className="text-[11.5px] text-ink-muted truncate">
              {city || 'Tap to set city'} · {teacherName}
            </div>
          </div>
          <Pencil size={14} className="text-ink-muted shrink-0" strokeWidth={1.7} />
        </button>
      </aside>
    </div>
  );

  return createPortal(overlay, portalRoot);
}
