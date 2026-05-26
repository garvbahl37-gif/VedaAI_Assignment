import { cn } from '@/lib/cn';
import type { Difficulty } from '@vedaai/shared';

const CONFIG: Record<Difficulty, { label: string; cls: string }> = {
  easy: { label: 'Easy', cls: 'bg-difficulty-easyBg text-difficulty-easyText' },
  moderate: { label: 'Moderate', cls: 'bg-difficulty-modBg text-difficulty-modText' },
  hard: { label: 'Hard', cls: 'bg-difficulty-hardBg text-difficulty-hardText' },
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const cfg = CONFIG[difficulty];
  return (
    <span
      className={cn(
        'inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full',
        cfg.cls,
      )}
    >
      {cfg.label}
    </span>
  );
}
