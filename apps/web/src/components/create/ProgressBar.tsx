interface ProgressBarProps {
  step: number;
  total: number;
}

export function ProgressBar({ step, total }: ProgressBarProps) {
  const pct = Math.min(100, (step / total) * 100);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[12px] text-ink-muted mb-2">
        <span>
          Step {step} of {total}
        </span>
        <span>Assignment Details</span>
      </div>
      <div className="h-1 w-full bg-surface-subtle rounded-full overflow-hidden">
        <div
          className="h-full bg-ink rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
