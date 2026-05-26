'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Trash2, Eye, Calendar, GraduationCap, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { TopHeader } from '@/components/layout/TopHeader';
import { useLibraryStore, type SavedQuiz } from '@/stores/libraryStore';

export default function LibraryPage() {
  const quizzes = useLibraryStore((s) => s.quizzes);
  const remove = useLibraryStore((s) => s.remove);
  const [openQuiz, setOpenQuiz] = useState<SavedQuiz | null>(null);

  return (
    <>
      <TopHeader title="My Library" />
      <div className="px-4 lg:px-8 py-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="mt-2 h-2.5 w-2.5 rounded-full bg-purple-500 inline-block shrink-0" />
            <div>
              <h1 className="text-[22px] font-bold text-ink leading-tight">My Library</h1>
              <p className="mt-0.5 text-[13.5px] text-ink-muted">
                Your saved quick quizzes — reusable across classes.
              </p>
            </div>
          </div>
          <Link
            href="/toolkit"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-ink text-[13px] font-medium text-white hover:bg-black"
          >
            <Sparkles size={14} />
            New Quiz
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((q) => (
              <QuizCard
                key={q.id}
                quiz={q}
                onOpen={() => setOpenQuiz(q)}
                onDelete={() => {
                  if (confirm(`Delete saved quiz "${q.topic}"?`)) remove(q.id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {openQuiz && (
        <QuizViewerDialog quiz={openQuiz} onClose={() => setOpenQuiz(null)} />
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-line rounded-3xl p-12 flex flex-col items-center justify-center text-center">
      <div className="h-14 w-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
        <BookOpen size={22} strokeWidth={1.6} />
      </div>
      <h2 className="text-[15.5px] font-bold text-ink">No saved quizzes yet</h2>
      <p className="mt-1.5 text-[13px] text-ink-muted max-w-sm">
        Generate a quiz in the AI Teacher&apos;s Toolkit and click{' '}
        <span className="font-medium text-ink">Save to Library</span> to keep it here for later.
      </p>
      <Link
        href="/toolkit"
        className="mt-5 inline-flex items-center gap-2 h-10 px-5 rounded-full bg-ink text-[13px] font-medium text-white hover:bg-black"
      >
        <Sparkles size={14} />
        Open Toolkit
      </Link>
    </div>
  );
}

function QuizCard({
  quiz,
  onOpen,
  onDelete,
}: {
  quiz: SavedQuiz;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white border border-line rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <BookOpen size={16} strokeWidth={1.8} />
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600 text-ink-muted flex items-center justify-center"
          aria-label="Delete quiz"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <h3 className="mt-3 text-[14.5px] font-bold text-ink line-clamp-2">
        {quiz.topic}
      </h3>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Chip icon={<GraduationCap size={11} />}>{quiz.className}</Chip>
        <Chip>
          {quiz.questions.length} {quiz.questions.length === 1 ? 'Question' : 'Questions'}
        </Chip>
        <Chip variant="muted">
          {quiz.difficulty === 'mixed'
            ? 'Mixed'
            : quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
        </Chip>
      </div>

      <div className="mt-auto pt-4 flex items-center justify-between text-[11.5px] text-ink-muted">
        <span className="inline-flex items-center gap-1">
          <Calendar size={11} />
          {new Date(quiz.savedAt).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
          })}
        </span>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-surface-page text-ink hover:bg-surface-subtle font-medium"
        >
          <Eye size={12} />
          View
        </button>
      </div>
    </div>
  );
}

function Chip({
  children,
  variant = 'default',
  icon,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'muted';
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 h-5 px-2 rounded-full text-[10.5px] font-medium',
        variant === 'muted'
          ? 'bg-surface-page text-ink-muted'
          : 'bg-purple-50 text-purple-700',
      ].join(' ')}
    >
      {icon}
      {children}
    </span>
  );
}

function QuizViewerDialog({ quiz, onClose }: { quiz: SavedQuiz; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div>
            <h2 className="text-[16px] font-bold text-ink">{quiz.topic}</h2>
            <p className="text-[12px] text-ink-muted mt-0.5">
              {quiz.className} · {quiz.questions.length} questions · Saved{' '}
              {new Date(quiz.savedAt).toLocaleDateString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-surface-subtle text-ink-muted flex items-center justify-center"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {quiz.questions.map((q, qi) => (
            <div key={qi} className="space-y-2">
              <div className="text-[14px] font-medium text-ink leading-snug">
                <span className="text-ink-muted mr-1.5">Q{qi + 1}.</span>
                {q.text}
              </div>
              <ul className="space-y-1.5 pl-4">
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.correctIndex;
                  return (
                    <li
                      key={oi}
                      className={[
                        'flex items-start gap-2 text-[13px] rounded-lg px-2.5 py-1.5',
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'text-ink',
                      ].join(' ')}
                    >
                      <span className="font-semibold w-4 shrink-0">
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isCorrect && (
                        <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                      )}
                    </li>
                  );
                })}
              </ul>
              {q.explanation && (
                <div className="ml-4 mt-1 pl-3 border-l-2 border-emerald-300 text-[12.5px] text-ink-muted">
                  <span className="font-semibold text-emerald-700">Why:</span> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
