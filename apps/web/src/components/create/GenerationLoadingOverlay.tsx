'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { LogoMark } from '@/components/brand/Logo';

interface GenerationLoadingOverlayProps {
  open: boolean;
}

const STAGES: { label: string; description: string; durationMs: number }[] = [
  {
    label: 'Analyzing your requirements',
    description: 'Reviewing question types, marks, and reference material',
    durationMs: 3500,
  },
  {
    label: 'Composing the question paper',
    description: 'Drafting curriculum-aligned questions across each section',
    durationMs: 15000,
  },
  {
    label: 'Balancing difficulty and total marks',
    description: 'Checking the section structure and answer key',
    durationMs: 4000,
  },
  {
    label: 'Finalising your paper',
    description: 'Almost ready — preparing the output page',
    durationMs: 3000,
  },
];

/**
 * Full-screen modal shown the moment the teacher clicks "Next" on the create
 * form. The actual generation call is in-flight in the background; this
 * overlay gives immediate visual feedback so the page doesn't feel stuck
 * during the ~20-30s serverless inline generation.
 *
 * Stages advance on a timer instead of waiting on WebSocket events because
 * the WS server isn't reachable on Vercel serverless — the response arrives
 * via the resolved POST instead. The last stage stays animated until the
 * parent unmounts the overlay (which happens on navigation to the output
 * page), so the bar never gets stuck at 100%.
 */
export function GenerationLoadingOverlay({ open }: GenerationLoadingOverlayProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [stageStartTime, setStageStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Reset and start advancing stages when the overlay opens.
  useEffect(() => {
    if (!open) {
      setActiveIndex(0);
      setStageStartTime(0);
      setElapsed(0);
      return;
    }
    setActiveIndex(0);
    setStageStartTime(Date.now());
  }, [open]);

  // Advance to the next stage when the current one's duration is up.
  useEffect(() => {
    if (!open) return;
    if (activeIndex >= STAGES.length - 1) return;
    const t = setTimeout(() => {
      setActiveIndex((i) => Math.min(i + 1, STAGES.length - 1));
      setStageStartTime(Date.now());
    }, STAGES[activeIndex].durationMs);
    return () => clearTimeout(t);
  }, [open, activeIndex]);

  // Track elapsed time inside the current stage for the progress bar fill.
  useEffect(() => {
    if (!open) return;
    const start = Date.now();
    setStageStartTime(start);
    const i = setInterval(() => setElapsed(Date.now() - start), 100);
    return () => clearInterval(i);
  }, [open, activeIndex]);

  if (!open) return null;

  const stage = STAGES[activeIndex];
  const stageFraction = Math.min(elapsed / stage.durationMs, 1);
  const baseProgress = (activeIndex / STAGES.length) * 100;
  const stageProgress = (stageFraction / STAGES.length) * 100;
  const totalProgress = Math.min(99, Math.round(baseProgress + stageProgress));

  // stage start time used to reset elapsed on each stage change
  void stageStartTime;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/85 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Brand header */}
        <div className="bg-gradient-to-br from-brand-50 via-white to-amber-50 px-7 pt-7 pb-6 text-center">
          <div className="inline-flex items-center justify-center">
            <LogoMark size={56} />
          </div>
          <h2 className="mt-4 text-[18px] font-bold text-ink inline-flex items-center gap-1.5">
            <Sparkles size={15} className="text-brand" strokeWidth={2.2} />
            Generating your question paper
          </h2>
          <p className="mt-1.5 text-[12.5px] text-ink-muted leading-snug">
            This usually takes 15-30 seconds. Hang tight — Veda is composing a
            curriculum-aligned paper just for you.
          </p>
        </div>

        {/* Progress bar */}
        <div className="px-7 pt-6">
          <div className="h-2 w-full bg-surface-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand to-brand-600 transition-all duration-200 ease-out"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-ink-muted">{totalProgress}% complete</span>
            <span className="text-ink-muted inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Stage list */}
        <ul className="px-7 pt-5 pb-7 space-y-3">
          {STAGES.map((s, i) => {
            const isDone = i < activeIndex;
            const isActive = i === activeIndex;

            return (
              <li
                key={s.label}
                className={[
                  'flex items-start gap-3 transition-opacity',
                  isDone || isActive ? 'opacity-100' : 'opacity-40',
                ].join(' ')}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2
                      size={18}
                      className="text-emerald-500"
                      strokeWidth={2}
                    />
                  ) : isActive ? (
                    <Loader2
                      size={18}
                      className="text-brand animate-spin"
                      strokeWidth={2.2}
                    />
                  ) : (
                    <div className="h-[18px] w-[18px] rounded-full border-2 border-line" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={[
                      'text-[13px] leading-tight',
                      isActive
                        ? 'font-semibold text-ink'
                        : isDone
                          ? 'text-ink'
                          : 'text-ink-muted',
                    ].join(' ')}
                  >
                    {s.label}
                  </p>
                  {isActive && (
                    <p className="mt-0.5 text-[11.5px] text-ink-muted leading-snug">
                      {s.description}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
