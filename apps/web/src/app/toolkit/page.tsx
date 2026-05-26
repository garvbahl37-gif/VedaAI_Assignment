'use client';

import { useState } from 'react';
import { Sparkles, RotateCcw, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { TopHeader } from '@/components/layout/TopHeader';
import { useProfileStore } from '@/stores/profileStore';
import { api } from '@/lib/api';
import type { Difficulty, QuickQuizQuestion } from '@vedaai/shared';

type DifficultyChoice = Difficulty | 'mixed';

const DIFFICULTIES: { value: DifficultyChoice; label: string }[] = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'hard', label: 'Hard' },
];

export default function ToolkitPage() {
  const defaultClass = useProfileStore((s) => s.defaultClass);
  const defaultSubject = useProfileStore((s) => s.defaultSubject);

  const [topic, setTopic] = useState(defaultSubject || '');
  const [className, setClassName] = useState(defaultClass || 'Class 6');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<DifficultyChoice>('mixed');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuickQuizQuestion[] | null>(null);

  const handleGenerate = async () => {
    setError(null);
    if (!topic.trim()) {
      setError('Topic is required.');
      return;
    }
    if (!className.trim()) {
      setError('Class level is required.');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await api.quickQuiz({
        topic: topic.trim(),
        className: className.trim(),
        numberOfQuestions: count,
        difficulty,
      });
      setResult(res.questions);
    } catch (err) {
      setError((err as Error).message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <>
      <TopHeader title="AI Teacher's Toolkit" />
      <div className="px-4 lg:px-8 py-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-2.5">
          <span className="mt-2 h-2.5 w-2.5 rounded-full bg-brand inline-block shrink-0" />
          <div>
            <h1 className="text-[22px] font-bold text-ink leading-tight">
              AI Teacher&apos;s Toolkit
            </h1>
            <p className="mt-0.5 text-[13.5px] text-ink-muted">
              Quick AI utilities for everyday teaching tasks.
            </p>
          </div>
        </div>

        {/* Quick Quiz card */}
        <div className="bg-white border border-line rounded-3xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-6 lg:p-7 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-[11px] font-semibold uppercase tracking-wide">
                <Sparkles size={11} />
                Quick Quiz
              </div>
              <h2 className="mt-2.5 text-[17px] font-bold text-ink">
                Instant MCQ Generator
              </h2>
              <p className="mt-1 text-[13px] text-ink-muted">
                Get 1-15 multiple-choice questions on any topic in seconds —
                no full assignment needed.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_140px] gap-3">
            <label className="block space-y-1.5 md:col-span-1">
              <span className="text-[12.5px] font-medium text-ink-muted">Topic</span>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, World War II, Quadratic Equations"
                className="w-full h-11 rounded-xl bg-surface-page border border-transparent px-4 text-[13.5px] text-ink placeholder:text-ink-muted focus:outline-none focus:bg-white focus:border-line"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[12.5px] font-medium text-ink-muted">Class</span>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Class 6"
                className="w-full h-11 rounded-xl bg-surface-page border border-transparent px-4 text-[13.5px] text-ink placeholder:text-ink-muted focus:outline-none focus:bg-white focus:border-line"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[12.5px] font-medium text-ink-muted">Questions</span>
              <input
                type="number"
                min={1}
                max={15}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(15, Number(e.target.value) || 1)))}
                className="w-full h-11 rounded-xl bg-surface-page border border-transparent px-4 text-[13.5px] text-ink focus:outline-none focus:bg-white focus:border-line"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12.5px] font-medium text-ink-muted mr-1">Difficulty</span>
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDifficulty(d.value)}
                className={[
                  'h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-colors border',
                  difficulty === d.value
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-ink border-line hover:bg-surface-subtle',
                ].join(' ')}
              >
                {d.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-[12.5px] text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-ink text-[13.5px] font-medium text-white hover:bg-black disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Generate Quiz
                </>
              )}
            </button>
            {result && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-line bg-white text-[13.5px] font-medium text-ink hover:bg-surface-subtle"
              >
                <RotateCcw size={14} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {result && result.length > 0 && (
          <QuizResults questions={result} />
        )}
      </div>
    </>
  );
}

function QuizResults({ questions }: { questions: QuickQuizQuestion[] }) {
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <div className="bg-white border border-line rounded-3xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-6 lg:p-7 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-ink">
          Generated Quiz ({questions.length} {questions.length === 1 ? 'question' : 'questions'})
        </h3>
        <button
          type="button"
          onClick={() => setShowAnswers((s) => !s)}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-line bg-white text-[12.5px] font-medium text-ink hover:bg-surface-subtle"
        >
          {showAnswers ? <EyeOff size={13} /> : <Eye size={13} />}
          {showAnswers ? 'Hide Answers' : 'Show Answers'}
        </button>
      </div>

      <ol className="space-y-5">
        {questions.map((q, qi) => (
          <li key={qi} className="space-y-2">
            <div className="text-[14px] font-medium text-ink leading-snug">
              <span className="text-ink-muted mr-1.5">Q{qi + 1}.</span>
              {q.text}
            </div>
            <ul className="space-y-1.5 pl-4">
              {q.options.map((opt, oi) => {
                const isCorrect = oi === q.correctIndex;
                const reveal = showAnswers && isCorrect;
                return (
                  <li
                    key={oi}
                    className={[
                      'flex items-start gap-2 text-[13px] rounded-lg px-2.5 py-1.5',
                      reveal
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'text-ink',
                    ].join(' ')}
                  >
                    <span className="font-semibold w-4 shrink-0">
                      {String.fromCharCode(65 + oi)}.
                    </span>
                    <span className="flex-1">{opt}</span>
                    {reveal && (
                      <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                    )}
                  </li>
                );
              })}
            </ul>
            {showAnswers && q.explanation && (
              <div className="ml-4 mt-1 pl-3 border-l-2 border-emerald-300 text-[12.5px] text-ink-muted">
                <span className="font-semibold text-emerald-700">Why:</span> {q.explanation}
              </div>
            )}
          </li>
        ))}
      </ol>

      {!showAnswers && (
        <p className="text-[12px] text-ink-muted flex items-center gap-1.5">
          <XCircle size={12} />
          Answers hidden — click &quot;Show Answers&quot; to reveal correct options and explanations.
        </p>
      )}
    </div>
  );
}
