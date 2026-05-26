'use client';

import { Loader2 } from 'lucide-react';
import type { GenerationStage } from '@vedaai/shared';

interface GenerationProgressProps {
  progress: number;
  stage: GenerationStage | null;
  message: string;
  wsConnected: boolean;
  error: string | null;
}

const STAGE_LABEL: Record<GenerationStage, string> = {
  fetching: 'Analyzing your materials...',
  building_prompt: 'Building the AI prompt...',
  generating: 'Generating questions with AI...',
  parsing: 'Structuring sections and answer key...',
  persisting: 'Finalizing your paper...',
  done: 'Done!',
};

export function GenerationProgress({
  progress,
  stage,
  message,
  wsConnected,
  error,
}: GenerationProgressProps) {
  const label = message || (stage ? STAGE_LABEL[stage] : 'Queuing your assignment...');

  return (
    <div className="bg-white border border-line rounded-card p-6 lg:p-8 max-w-xl mx-auto text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-brand-50 flex items-center justify-center">
        <Loader2 size={22} className="text-brand animate-spin" />
      </div>

      <h2 className="mt-4 text-[16px] font-semibold text-ink">
        Generating your question paper
      </h2>
      <p className="mt-1 text-[13px] text-ink-muted">{label}</p>

      <div className="mt-6 h-2 w-full bg-surface-subtle rounded-full overflow-hidden">
        <div
          className="h-full bg-brand transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-ink-muted">
        <span>{progress}% complete</span>
        <span className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${wsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}
          />
          {wsConnected ? 'Live updates active' : 'Reconnecting…'}
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-[12px] text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
