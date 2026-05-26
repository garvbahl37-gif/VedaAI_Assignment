'use client';

import { Mic } from 'lucide-react';

interface AdditionalInfoTextareaProps {
  value: string;
  onChange: (v: string) => void;
}

export function AdditionalInfoTextarea({
  value,
  onChange,
}: AdditionalInfoTextareaProps) {
  return (
    <div className="space-y-2">
      <label className="text-[14px] text-ink">
        <span className="font-bold">Additional Information</span>{' '}
        <span className="text-ink-muted font-normal">(For better output)</span>
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="e.g Generate a question paper for 3 hour exam duration..."
          className="w-full rounded-2xl bg-white border-[1.5px] border-dashed border-line px-5 py-4 pr-14 text-[13.5px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand resize-none"
        />
        <button
          type="button"
          className="absolute bottom-3.5 right-3.5 h-8 w-8 rounded-full hover:bg-surface-subtle text-ink-muted flex items-center justify-center"
          aria-label="Voice input (coming soon)"
        >
          <Mic size={16} strokeWidth={1.7} />
        </button>
      </div>
    </div>
  );
}
