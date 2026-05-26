'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, BookOpen, Wrench, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

const TABS = [
  { label: 'Home', href: '/home', icon: Home },
  { label: 'Assignments', href: '/assignments', icon: ClipboardList },
  { label: 'Library', href: '/library', icon: BookOpen },
  { label: 'AI Toolkit', href: '/toolkit', icon: Wrench },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Floating + button — small, orange/white, just above the nav */}
      <Link
        href="/assignments/create"
        className="lg:hidden fixed bottom-24 right-4 z-30 h-11 w-11 rounded-full bg-brand shadow-lg flex items-center justify-center text-white hover:scale-105 active:scale-95 transition"
        aria-label="Create assignment"
      >
        <Plus size={20} strokeWidth={2.4} />
      </Link>

      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-20 bg-ink rounded-2xl shadow-xl h-16 grid grid-cols-4 pb-[env(safe-area-inset-bottom)] overflow-hidden">
        {TABS.map((t) => {
          const active =
            pathname === t.href || (t.href !== '/' && pathname.startsWith(t.href));
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="relative flex flex-col items-center justify-center gap-0.5 text-white/70 hover:text-white active:bg-white/5 transition-colors"
            >
              <span
                className={cn(
                  'flex items-center justify-center h-7 w-7 rounded-full transition',
                  active && 'bg-white/12',
                )}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.2 : 1.6}
                  className={cn(active ? 'text-white' : 'text-white/70')}
                />
              </span>
              <span
                className={cn(
                  'text-[10px] mt-0.5',
                  active ? 'text-white font-semibold' : 'text-white/60',
                )}
              >
                {t.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
