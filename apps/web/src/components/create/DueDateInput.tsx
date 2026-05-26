'use client';

import { CalendarPlus } from 'lucide-react';

interface DueDateInputProps {
  value: string;
  onChange: (v: string) => void;
}

export function DueDateInput({ value, onChange }: DueDateInputProps) {
  const iso = displayToIso(value);

  return (
    <div className="space-y-2">
      <label className="text-[14px] font-bold text-ink">Due Date</label>
      <div className="relative">
        <input
          type="date"
          value={iso}
          onChange={(e) => onChange(isoToDisplay(e.target.value))}
          className="w-full h-12 rounded-full bg-white border border-line px-5 pr-12 text-[13.5px] text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          placeholder="DD-MM-YYYY"
        />
        <CalendarPlus
          size={16}
          strokeWidth={1.7}
          className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted"
        />
      </div>
    </div>
  );
}

function isoToDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${d}-${m}-${y}`;
}

function displayToIso(display: string): string {
  if (!display) return '';
  const m = display.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}
