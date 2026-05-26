'use client';

import { Plus, X, ChevronDown } from 'lucide-react';
import { QUESTION_TYPES, type QuestionTypeRow } from '@vedaai/shared';
import { NumberStepper } from './NumberStepper';

interface QuestionTypeTableProps {
  rows: QuestionTypeRow[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, data: Partial<QuestionTypeRow>) => void;
}

export function QuestionTypeTable({
  rows,
  onAdd,
  onRemove,
  onChange,
}: QuestionTypeTableProps) {
  const totalQuestions = rows.reduce((s, r) => s + r.numberOfQuestions, 0);
  const totalMarks = rows.reduce((s, r) => s + r.numberOfQuestions * r.marks, 0);

  return (
    <div className="space-y-3">
      {/* Desktop header row */}
      <div className="hidden md:grid grid-cols-[1fr_28px_140px_140px] gap-3 items-center text-[13px]">
        <span className="font-bold text-ink underline underline-offset-4 decoration-1">
          Question Type
        </span>
        <span />
        <span className="text-center font-medium text-ink-muted">
          No. of Questions
        </span>
        <span className="text-center font-medium text-ink-muted">Marks</span>
      </div>

      {/* Desktop rows */}
      <div className="hidden md:block space-y-3">
        {rows.map((row, idx) => (
          <div
            key={`d-${idx}`}
            className="grid grid-cols-[1fr_28px_140px_140px] gap-3 items-center"
          >
            <div className="relative">
              <select
                value={row.type}
                onChange={(e) => onChange(idx, { type: e.target.value })}
                className="w-full h-11 rounded-full bg-white border border-line px-5 pr-10 appearance-none text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                {QUESTION_TYPES.map((qt) => (
                  <option key={qt} value={qt}>
                    {qt}
                  </option>
                ))}
                {!QUESTION_TYPES.includes(row.type as (typeof QUESTION_TYPES)[number]) && (
                  <option value={row.type}>{row.type}</option>
                )}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted"
              />
            </div>

            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="h-7 w-7 mx-auto rounded-full hover:bg-surface-subtle flex items-center justify-center text-ink-muted disabled:opacity-30"
              aria-label="Remove row"
              disabled={rows.length <= 1}
            >
              <X size={16} strokeWidth={1.8} />
            </button>

            <NumberStepper
              value={row.numberOfQuestions}
              onChange={(v) => onChange(idx, { numberOfQuestions: v })}
              min={1}
              max={100}
              ariaLabel="Number of questions"
            />

            <NumberStepper
              value={row.marks}
              onChange={(v) => onChange(idx, { marks: v })}
              min={1}
              max={50}
              ariaLabel="Marks"
            />
          </div>
        ))}
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden space-y-3">
        {rows.map((row, idx) => (
          <div
            key={`m-${idx}`}
            className="bg-surface-subtle rounded-2xl p-3 space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={row.type}
                  onChange={(e) => onChange(idx, { type: e.target.value })}
                  className="w-full h-11 rounded-full bg-white border border-line px-4 pr-9 appearance-none text-[13px]"
                >
                  {QUESTION_TYPES.map((qt) => (
                    <option key={qt} value={qt}>
                      {qt}
                    </option>
                  ))}
                  {!QUESTION_TYPES.includes(row.type as (typeof QUESTION_TYPES)[number]) && (
                    <option value={row.type}>{row.type}</option>
                  )}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted"
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="h-9 w-9 rounded-full hover:bg-white flex items-center justify-center text-ink-muted disabled:opacity-30"
                aria-label="Remove row"
                disabled={rows.length <= 1}
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] text-ink-muted mb-1.5">
                  No. of Questions
                </div>
                <NumberStepper
                  value={row.numberOfQuestions}
                  onChange={(v) => onChange(idx, { numberOfQuestions: v })}
                  min={1}
                  max={100}
                  ariaLabel="Number of questions"
                />
              </div>
              <div>
                <div className="text-[11px] text-ink-muted mb-1.5">Marks</div>
                <NumberStepper
                  value={row.marks}
                  onChange={(v) => onChange(idx, { marks: v })}
                  min={1}
                  max={50}
                  ariaLabel="Marks"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start justify-between pt-2 gap-2 flex-wrap">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2.5 text-[13.5px] font-semibold text-ink hover:text-brand transition"
        >
          <span className="h-7 w-7 rounded-full bg-ink text-white flex items-center justify-center">
            <Plus size={13} strokeWidth={2.6} />
          </span>
          Add Question Type
        </button>

        <div className="text-right text-[13px] text-ink-muted space-y-0.5">
          <div>
            Total Questions :{' '}
            <span className="font-semibold text-ink">{totalQuestions}</span>
          </div>
          <div>
            Total Marks :{' '}
            <span className="font-semibold text-ink">{totalMarks}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
