'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Presentation,
  FileText,
  BookOpen,
  PieChart,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/cn';
import { useAssignmentStore } from '@/stores/assignmentStore';

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutGrid;
  badge?: number;
}

export function Sidebar() {
  const pathname = usePathname();
  const assignmentsCount = useAssignmentStore((s) => s.assignments.length);

  const TOP_NAV: NavItem[] = [
    { label: 'Home', href: '/home', icon: LayoutGrid },
    { label: 'My Groups', href: '/groups', icon: Presentation },
    {
      label: 'Assignments',
      href: '/assignments',
      icon: FileText,
      badge: assignmentsCount > 0 ? assignmentsCount : undefined,
    },
    { label: "AI Teacher's Toolkit", href: '/toolkit', icon: BookOpen },
    { label: 'My Library', href: '/library', icon: PieChart, badge: 32 },
  ];

  return (
    <aside className="hidden lg:flex shrink-0 sticky top-0 h-screen p-4">
      <div className="w-[268px] h-full flex flex-col bg-white border border-line rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        {/* Brand */}
        <div className="px-6 pt-6 pb-2">
          <Logo />
        </div>

        {/* Create CTA — black pill with orange ring + sparkle icon */}
        <div className="px-5 pt-6 pb-6">
          <Link
            href="/assignments/create"
            className="flex items-center justify-center w-full h-11 rounded-full bg-ink hover:bg-black transition gap-2 border-[1.5px] border-brand shadow-[0_0_0_3.5px_rgba(244,128,30,0.10)]"
          >
            <Sparkles size={15} strokeWidth={2.3} className="text-white" />
            <span className="text-[13.5px] font-medium text-white">
              Create Assignment
            </span>
          </Link>
        </div>

        {/* Top nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {TOP_NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 h-10 rounded-lg text-[13.5px] transition-colors',
                  active
                    ? 'bg-surface-subtle text-ink font-medium'
                    : 'text-ink-muted hover:bg-surface-subtle/60 hover:text-ink',
                )}
              >
                <Icon
                  size={17}
                  strokeWidth={active ? 2.1 : 1.6}
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
        </nav>

        {/* Settings */}
        <div className="px-3 pt-3 pb-2">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 px-3 h-10 rounded-lg text-[13.5px] transition-colors',
              pathname.startsWith('/settings')
                ? 'bg-surface-subtle text-ink font-medium'
                : 'text-ink-muted hover:bg-surface-subtle/60',
            )}
          >
            <Settings size={17} strokeWidth={1.6} />
            <span>Settings</span>
          </Link>
        </div>

        {/* Profile — soft gray rounded block, no border */}
        <div className="mx-3 mb-4 rounded-xl bg-surface-subtle p-2.5 flex items-center gap-3">
          <ProfileAvatar />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-ink truncate">
              Delhi Public School
            </div>
            <div className="text-[11.5px] text-ink-muted truncate">
              Bokaro Steel City
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ProfileAvatar() {
  return (
    <div className="h-10 w-10 rounded-full shrink-0 overflow-hidden bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 ring-2 ring-white">
      <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
        <rect width="40" height="40" fill="#F3DDC1" />
        {/* hard hat */}
        <path d="M10 18 Q20 8 30 18 L30 21 L10 21 Z" fill="#D9D9D9" />
        <rect x="9" y="20" width="22" height="2" fill="#C0C0C0" />
        {/* face */}
        <circle cx="20" cy="24" r="5.5" fill="#E8B58A" />
        <circle cx="18" cy="23.5" r="0.7" fill="#3B2415" />
        <circle cx="22" cy="23.5" r="0.7" fill="#3B2415" />
        {/* moustache */}
        <path d="M17.5 26 Q20 27.3 22.5 26" stroke="#5C3A21" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        {/* shirt */}
        <path d="M10 36 Q20 28 30 36 L30 40 L10 40 Z" fill="#9CA3AF" />
      </svg>
    </div>
  );
}
