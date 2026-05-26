'use client';

import { Filter, Search } from 'lucide-react';

interface FilterBarProps {
  query: string;
  onQueryChange: (q: string) => void;
}

export function FilterBar({ query, onQueryChange }: FilterBarProps) {
  return (
    <div className="bg-white border border-line rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] h-14 px-3 sm:px-5 flex items-center gap-2 sm:gap-3">
      <button
        type="button"
        className="flex items-center gap-1.5 sm:gap-2 text-[13px] text-ink-muted hover:text-ink active:text-ink shrink-0"
      >
        <Filter size={15} strokeWidth={1.8} />
        <span>Filter By</span>
      </button>

      {/*
        Mobile: search input flex-fills the remaining row width — no
        max-width cap, no shrink-0, so it never spills off-screen on a
        narrow viewport.
        Desktop (sm+): pinned to the right edge at 360px via ml-auto, so
        the bar reads "Filter By … [spacer] … [Search]" like the Figma.
      */}
      <div className="relative flex-1 sm:flex-none sm:w-[360px] sm:ml-auto min-w-0">
        <Search
          size={15}
          strokeWidth={1.8}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search Assignment"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded-full bg-white border border-line text-[13px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand"
        />
      </div>
    </div>
  );
}
