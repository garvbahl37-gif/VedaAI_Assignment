'use client';

import type { Difficulty, GeneratedPaper } from '@vedaai/shared';

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Challenging',
};

const DIFFICULTY_CLS: Record<Difficulty, string> = {
  easy: 'text-emerald-700',
  moderate: 'text-amber-700',
  hard: 'text-red-700',
};

function DifficultyTag({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`font-semibold ${DIFFICULTY_CLS[difficulty]}`}>
      [{DIFFICULTY_LABEL[difficulty]}]
    </span>
  );
}

interface QuestionPaperProps {
  paper: GeneratedPaper;
}

export function QuestionPaper({ paper }: QuestionPaperProps) {
  return (
    <article className="bg-white rounded-3xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] max-w-[900px] mx-auto p-8 lg:p-14 print:shadow-none">
      {/* School header */}
      <header className="text-center space-y-1.5">
        <h1 className="text-[24px] font-bold text-ink">{paper.schoolName}</h1>
        <div className="text-[16px] font-semibold text-ink">
          Subject: {paper.subject}
        </div>
        <div className="text-[16px] font-semibold text-ink">
          Class: {paper.className}
        </div>
      </header>

      {/* Time + marks */}
      <div className="mt-8 flex items-center justify-between text-[14px] font-semibold text-ink">
        <span>Time Allowed: {paper.timeAllowed}</span>
        <span>Maximum Marks: {paper.maximumMarks}</span>
      </div>

      {/* General instruction */}
      <p className="mt-5 text-[14px] font-semibold text-ink">
        {paper.generalInstructions?.[0] ??
          'All questions are compulsory unless stated otherwise.'}
      </p>

      {/* Student info */}
      <div className="mt-5 space-y-2 text-[14px] text-ink font-semibold">
        <div>Name: ______________________</div>
        <div>Roll Number: ___________________</div>
        <div>
          Class: {paper.className} Section: _____________
        </div>
      </div>

      {/* Sections */}
      <div className="mt-8 space-y-10">
        {paper.sections.map((section) => (
          <section key={section.label}>
            <h2 className="text-center text-[18px] font-bold text-ink">
              {section.label}
            </h2>

            <div className="mt-6">
              <div className="text-[14px] font-bold text-ink">
                {section.title}
              </div>
              <div className="text-[13px] italic text-ink mt-0.5">
                {section.instruction}
              </div>

              <ol className="mt-4 space-y-3 list-decimal pl-6">
                {section.questions.map((q) => (
                  <li
                    key={`${section.label}-${q.number}`}
                    className="text-[13.5px] text-ink leading-relaxed pl-1"
                  >
                    <DifficultyTag difficulty={q.difficulty} />{' '}
                    {q.text}{' '}
                    <span className="whitespace-nowrap text-ink-muted">
                      [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                    </span>
                    {q.options && q.options.length > 0 && (
                      <ul className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5 text-[12.5px] text-ink-muted">
                        {q.options.map((opt, i) => (
                          <li key={i}>{opt}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 text-[14px] font-bold text-ink">End of Question Paper</p>

      {/* Answer Key */}
      <div className="mt-10">
        <h2 className="text-[16px] font-bold text-ink">Answer Key:</h2>
        <ol className="mt-3 space-y-2 list-decimal pl-6">
          {paper.sections.flatMap((section, sIdx) =>
            section.questions.map((q, qIdx) => (
              <li
                key={`ak-${sIdx}-${qIdx}`}
                className="text-[13px] text-ink leading-relaxed pl-1"
              >
                {q.answer ?? '—'}
              </li>
            )),
          )}
        </ol>
      </div>
    </article>
  );
}

