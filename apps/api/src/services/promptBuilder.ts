import type { IAssignment } from '../models/Assignment';

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

REQUIREMENTS
1. Group questions into labeled Sections (Section A, B, C, …) — one section per question type, in the order given.
2. Each section MUST have: a label, a title (e.g. "Short Answer Questions"), a one-line instruction (e.g. "Attempt all questions"), and a numbered list of questions starting from 1 within the section.
3. Every question MUST include: number, text, difficulty ("easy" | "moderate" | "hard"), marks, and a complete answer.
4. For Multiple Choice Questions, include a 4-option string array under "options".
5. Difficulty distribution per section: ~40% easy, ~40% moderate, ~20% hard.
6. Questions must be factual, curriculum-appropriate, and unambiguous.
7. Infer schoolName ("Delhi Public School, Sector-6, Bokaro" is the default), subject, and className from the assignment title.
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
