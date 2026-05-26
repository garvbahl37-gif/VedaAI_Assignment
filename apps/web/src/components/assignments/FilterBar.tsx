'use client';

import { Filter, Search } from 'lucide-react';

interface FilterBarProps {
  query: string;
  onQueryChange: (q: string) => void;
}

export function FilterBar({ query, onQueryChange }: FilterBarProps) {
  return (
    <div className="bg-white border border-line rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] h-14 px-4 lg:px-5 flex items-center gap-4">
      <button
        type="button"
        className="flex items-center gap-2 text-[13px] text-ink-muted hover:text-ink shrink-0"
      >
        <Filter size={15} strokeWidth={1.8} />
        Filter By
      </button>

      <div className="h-6 w-px bg-line shrink-0 mx-1" />

      <div className="relative flex-1">
        <Search
          size={15}
          strokeWidth={1.8}
          className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="text"
          placeholder="Search Assignment"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full pl-7 bg-transparent text-[13px] text-ink placeholder:text-ink-muted focus:outline-none"
        />
      </div>
    </div>
  );
}
