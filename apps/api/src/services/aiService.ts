import { env } from '../config/env';
import type { Section } from '@vedaai/shared';

export interface GeneratedPaperData {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  generalInstructions: string[];
  sections: Section[];
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { message?: string };
}

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

async function callGemini(prompt: string): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    return JSON.stringify(buildMockPaper(prompt));
  }

  const url = `${GEMINI_BASE}/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.6,
      topP: 0.95,
      maxOutputTokens: 32768,
      responseMimeType: 'application/json',
    },
  };

  // gemini-2.5-* models use a "thinking budget" that eats into the output token
  // budget unless we explicitly disable it. Without this, the JSON often gets
  // truncated mid-array.
  if (env.GEMINI_MODEL.startsWith('gemini-2.5')) {
    (body.generationConfig as Record<string, unknown>).thinkingConfig = {
      thinkingBudget: 0,
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as GeminiResponse;
  if (data.error) throw new Error(`Gemini error: ${data.error.message}`);
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini response had no text content');
  return text;
}

export async function generatePaper(prompt: string): Promise<GeneratedPaperData> {
  const rawText = await callGemini(prompt);
  return parseResponse(rawText);
}

export function parseResponse(rawText: string): GeneratedPaperData {
  let clean = rawText.trim();
  clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  const first = clean.indexOf('{');
  if (first === -1) throw new Error('AI response contained no JSON object');

  // Try strict parse first.
  let parsed: unknown;
  try {
    const last = clean.lastIndexOf('}');
    const candidate = last !== -1 ? clean.slice(first, last + 1) : clean.slice(first);
    parsed = JSON.parse(candidate);
  } catch {
    // Repair: walk the string tracking bracket depth + string state, truncate to
    // the last complete top-level object that has a closed `sections` array.
    const repaired = repairTruncatedJson(clean.slice(first));
    if (!repaired) {
      throw new Error('AI response was truncated and could not be repaired');
    }
    try {
      parsed = JSON.parse(repaired);
    } catch (err) {
      throw new Error(`Failed to parse AI JSON: ${(err as Error).message}`);
    }
  }

  return validateStructure(parsed);
}

/**
 * Best-effort repair of a truncated JSON object. Walks bracket depth and string
 * state, then closes any open arrays/objects. If a string was left open, the
 * partial string is dropped (with the preceding key/value also dropped if it
 * leaves a trailing comma).
 */
function repairTruncatedJson(input: string): string | null {
  let inString = false;
  let escape = false;
  const stack: string[] = [];
  let lastSafe = -1;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (escape) { escape = false; continue; }
    if (inString) {
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{' || ch === '[') {
      stack.push(ch);
    } else if (ch === '}' || ch === ']') {
      stack.pop();
      if (stack.length === 0) {
        lastSafe = i;
      }
    }
  }

  // If we already have a balanced parse-point, use it.
  if (lastSafe !== -1 && stack.length === 0) {
    return input.slice(0, lastSafe + 1);
  }

  // Otherwise truncate at the last complete element boundary (last `}` followed
  // by zero or more `]`) inside the currently-open structures, then close the
  // remaining structures.
  let truncateAt = -1;
  let depth = 0;
  inString = false;
  escape = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (escape) { escape = false; continue; }
    if (inString) {
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{' || ch === '[') depth++;
    else if (ch === '}' || ch === ']') { depth--; if (depth >= 1) truncateAt = i; }
  }

  if (truncateAt === -1) return null;

  let body = input.slice(0, truncateAt + 1).replace(/,\s*$/, '');

  // Now close whatever is still open. Rebuild the closing string from the stack
  // we tracked before truncation, but recompute it for the truncated body.
  const closing: string[] = [];
  inString = false;
  escape = false;
  const stack2: string[] = [];
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (escape) { escape = false; continue; }
    if (inString) {
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{' || ch === '[') stack2.push(ch);
    else if (ch === '}' || ch === ']') stack2.pop();
  }
  for (let i = stack2.length - 1; i >= 0; i--) {
    closing.push(stack2[i] === '{' ? '}' : ']');
  }
  return body + closing.join('');
}

function validateStructure(input: unknown): GeneratedPaperData {
  if (!input || typeof input !== 'object') throw new Error('AI response is not an object');
  const p = input as Record<string, unknown>;

  const required = ['schoolName', 'subject', 'className', 'timeAllowed', 'maximumMarks', 'sections'];
  for (const key of required) {
    if (!(key in p)) throw new Error(`AI response missing field: ${key}`);
  }
  if (!Array.isArray(p.sections)) throw new Error('sections must be an array');
  if (p.sections.length === 0) throw new Error('sections cannot be empty');

  for (const section of p.sections as Array<Record<string, unknown>>) {
    if (!section.label || !section.title || !section.instruction) {
      throw new Error('section missing label/title/instruction');
    }
    if (!Array.isArray(section.questions) || section.questions.length === 0) {
      throw new Error(`section "${section.label}" has no questions`);
    }
    for (const q of section.questions as Array<Record<string, unknown>>) {
      if (typeof q.number !== 'number' || typeof q.text !== 'string') {
        throw new Error('question missing number/text');
      }
      if (q.difficulty !== 'easy' && q.difficulty !== 'moderate' && q.difficulty !== 'hard') {
        throw new Error(`invalid difficulty: ${String(q.difficulty)}`);
      }
      if (typeof q.marks !== 'number') throw new Error('question marks must be a number');
    }
  }

  return {
    schoolName: String(p.schoolName),
    subject: String(p.subject),
    className: String(p.className),
    timeAllowed: String(p.timeAllowed),
    maximumMarks: Number(p.maximumMarks),
    generalInstructions: Array.isArray(p.generalInstructions)
      ? (p.generalInstructions as unknown[]).map(String)
      : [],
    sections: p.sections as Section[],
  };
}

// ──────────────────────────────────────────────────────────
// Mock used when GEMINI_API_KEY is absent — keeps the
// pipeline runnable end-to-end for local dev.
// ──────────────────────────────────────────────────────────
function buildMockPaper(prompt: string): GeneratedPaperData {
  const titleMatch = prompt.match(/Title: (.+)/);
  const title = titleMatch ? titleMatch[1].trim() : 'General Quiz';

  const subjectGuess = inferSubject(title);
  const classGuess = title.match(/class\s*([0-9]+)(?:th|st|nd|rd)?/i);

  return {
    schoolName: 'Delhi Public School, Sector-4, Bokaro',
    subject: subjectGuess,
    className: classGuess ? `Class ${classGuess[1]}th` : 'Class 5th',
    timeAllowed: '45 minutes',
    maximumMarks: 20,
    generalInstructions: [
      'All questions are compulsory unless stated otherwise.',
      'Write neatly and legibly. Marks may be deducted for poor handwriting.',
      'Read each question carefully before answering.',
      'Total time allowed is 45 minutes.',
    ],
    sections: [
      {
        label: 'Section A',
        title: 'Short Answer Questions',
        instruction: 'Attempt all questions',
        questions: [
          { number: 1, text: `Define ${subjectGuess.toLowerCase()} in your own words.`, difficulty: 'easy', marks: 2, answer: 'A sample short answer.' },
          { number: 2, text: `List two important concepts from this topic.`, difficulty: 'easy', marks: 2, answer: 'Concept A and Concept B.' },
          { number: 3, text: `Briefly explain the most fundamental idea covered.`, difficulty: 'moderate', marks: 3, answer: 'A clear two-sentence explanation.' },
        ],
      },
      {
        label: 'Section B',
        title: 'Multiple Choice Questions',
        instruction: 'Choose the correct option',
        questions: [
          {
            number: 1,
            text: 'Which of the following is correct?',
            difficulty: 'easy',
            marks: 1,
            options: ['A) Option one', 'B) Option two', 'C) Option three', 'D) Option four'],
            answer: 'B) Option two',
          },
        ],
      },
    ],
  };
}

function inferSubject(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('electric') || t.includes('physics') || t.includes('chemistry') || t.includes('biology') || t.includes('science') || t.includes('solar')) return 'Science';
  if (t.includes('math') || t.includes('algebra') || t.includes('geometry')) return 'Mathematics';
  if (t.includes('english') || t.includes('grammar')) return 'English';
  if (t.includes('hindi')) return 'Hindi';
  if (t.includes('history') || t.includes('civic') || t.includes('geograph')) return 'Social Studies';
  return 'General Studies';
}
