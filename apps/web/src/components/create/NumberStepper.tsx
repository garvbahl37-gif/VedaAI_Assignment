'use client';

import { Minus, Plus } from 'lucide-react';

interface NumberStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
}

export function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 100,
  ariaLabel = 'Counter',
}: NumberStepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div
      className="inline-flex items-center bg-white border border-line rounded-full h-11 px-2 w-full justify-between gap-1"
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className="h-7 w-7 rounded-full text-ink-muted hover:bg-surface-subtle disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
        aria-label={`Decrease ${ariaLabel}`}
      >
        <Minus size={13} strokeWidth={2.2} />
      </button>
      <span className="text-[14px] font-medium text-ink min-w-[20px] text-center">
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className="h-7 w-7 rounded-full text-ink-muted hover:bg-surface-subtle disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
        aria-label={`Increase ${ariaLabel}`}
      >
        <Plus size={13} strokeWidth={2.2} />
      </button>
    </div>
  );
}
