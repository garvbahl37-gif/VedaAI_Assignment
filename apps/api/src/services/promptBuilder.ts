import type { IAssignment } from '../models/Assignment';

const MAX_REFERENCE_CHARS = 12000;

function buildReferenceBlock(referenceText?: string, fileName?: string): string {
  if (!referenceText) return '';
  const text = referenceText.trim();
  if (text.length === 0) return '';

  let body = text;
  let truncated = false;
  if (body.length > MAX_REFERENCE_CHARS) {
    body = body.slice(0, MAX_REFERENCE_CHARS);
    truncated = true;
  }

  const source = fileName ? ` (extracted from "${fileName}")` : '';
  const note = truncated
    ? '\n[...content truncated — first ' + MAX_REFERENCE_CHARS + ' characters shown...]'
    : '';

  return `
REFERENCE MATERIAL${source}
The teacher uploaded a reference document. Base your questions on this content where relevant — paraphrase and reframe rather than copying verbatim. If the reference is irrelevant to the title or class level, ignore it.

---BEGIN REFERENCE---
${body}${note}
---END REFERENCE---`;
}

export function buildPrompt(assignment: IAssignment): string {
  const questionBreakdown = assignment.questionTypes
    .map((qt) => `- ${qt.numberOfQuestions} × "${qt.type}" (${qt.marks} marks each)`)
    .join('\n');

  const totalQuestions = assignment.questionTypes.reduce(
    (sum, qt) => sum + qt.numberOfQuestions,
    0,
  );
  const totalMarks = assignment.questionTypes.reduce(
    (sum, qt) => sum + qt.numberOfQuestions * qt.marks,
    0,
  );

  const dueDate = new Date(assignment.dueDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const schoolLine = [assignment.schoolName, assignment.city]
    .filter((v) => v && v.trim().length > 0)
    .join(', ');
  const schoolDirective = schoolLine
    ? `Use this exact schoolName in the output: "${schoolLine}".`
    : `Infer schoolName ("Delhi Public School, Sector-6, Bokaro" is the default).`;

  const referenceBlock = buildReferenceBlock(assignment.referenceText, assignment.fileName);

  return `You are an expert exam paper generator for Indian schools (CBSE/ICSE standard).

Generate a complete, structured question paper with the following specifications.

ASSIGNMENT
- Title: ${assignment.title}
- Due Date: ${dueDate}
- Total Questions: ${totalQuestions}
- Total Marks: ${totalMarks}

QUESTION BREAKDOWN
${questionBreakdown}

ADDITIONAL INSTRUCTIONS FROM TEACHER
${assignment.additionalInstructions?.trim() || 'Standard exam format. Infer subject and class level from the title.'}
${referenceBlock}

REQUIREMENTS
1. Group questions into labeled Sections (Section A, B, C, …) — one section per question type, in the order given.
2. Each section MUST have: a label, a title (e.g. "Short Answer Questions"), a one-line instruction (e.g. "Attempt all questions"), and a numbered list of questions starting from 1 within the section.
3. Every question MUST include: number, text, difficulty ("easy" | "moderate" | "hard"), marks, and a complete answer.
4. For Multiple Choice Questions, include a 4-option string array under "options".
5. Difficulty distribution per section: ~40% easy, ~40% moderate, ~20% hard.
6. Questions must be factual, curriculum-appropriate, and unambiguous.
7. ${schoolDirective} Infer subject and className from the assignment title.
8. timeAllowed must be a human string (e.g. "45 minutes", "2 hours").
9. maximumMarks must equal the sum of all question marks.
10. Provide 3–5 short generalInstructions strings.

OUTPUT FORMAT — STRICT
Respond with ONLY a valid JSON object. No markdown fences, no prose, no backticks, no preface.

JSON SCHEMA
{
  "schoolName": "string",
  "subject": "string",
  "className": "string",
  "timeAllowed": "string",
  "maximumMarks": number,
  "generalInstructions": ["string", ...],
  "sections": [
    {
      "label": "Section A",
      "title": "Short Answer Questions",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "number": 1,
          "text": "full question text",
          "difficulty": "easy" | "moderate" | "hard",
          "marks": number,
          "answer": "complete answer",
          "options": ["A) ...", "B) ...", "C) ...", "D) ..."]  // ONLY for MCQs
        }
      ]
    }
  ]
}`;
}
