import { env } from '../config/env';
import type { Difficulty, QuickQuizQuestion } from '@vedaai/shared';

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { message?: string };
}

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface QuickQuizParams {
  topic: string;
  className: string;
  numberOfQuestions: number;
  difficulty: Difficulty | 'mixed';
}

export async function generateQuickQuiz(params: QuickQuizParams): Promise<QuickQuizQuestion[]> {
  const prompt = buildQuickQuizPrompt(params);

  if (!env.GEMINI_API_KEY) {
    return buildMockQuiz(params);
  }

  const url = `${GEMINI_BASE}/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  };
  if (env.GEMINI_MODEL.startsWith('gemini-2.5')) {
    (body.generationConfig as Record<string, unknown>).thinkingConfig = { thinkingBudget: 0 };
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

  return parseQuickQuizResponse(text, params.numberOfQuestions);
}

function buildQuickQuizPrompt({ topic, className, numberOfQuestions, difficulty }: QuickQuizParams): string {
  const diffLine =
    difficulty === 'mixed'
      ? 'Mix the difficulty across the questions: ~40% easy, ~40% moderate, ~20% hard.'
      : `Target difficulty for all questions: ${difficulty}.`;

  return `You are an expert teacher creating a quick multiple-choice quiz for Indian school students (CBSE/ICSE).

Generate exactly ${numberOfQuestions} multiple-choice questions on this topic:
- Topic: ${topic}
- Class level: ${className}
- ${diffLine}

Each question MUST include:
- A clear, factual, curriculum-appropriate question
- Exactly 4 options (no labels — just the option text, the frontend adds A/B/C/D)
- The 0-indexed position of the correct option
- A one-line explanation of WHY the correct answer is correct

OUTPUT FORMAT — STRICT
Respond with ONLY a valid JSON object. No markdown fences, no prose, no backticks.

JSON SCHEMA
{
  "questions": [
    {
      "text": "string — the question",
      "options": ["option 1 text", "option 2 text", "option 3 text", "option 4 text"],
      "correctIndex": 0,
      "explanation": "one-line reason"
    }
  ]
}`;
}

function parseQuickQuizResponse(rawText: string, expectedCount: number): QuickQuizQuestion[] {
  let clean = rawText.trim();
  clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  const first = clean.indexOf('{');
  if (first === -1) throw new Error('AI response contained no JSON object');
  const last = clean.lastIndexOf('}');
  const candidate = last !== -1 ? clean.slice(first, last + 1) : clean.slice(first);

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch (err) {
    throw new Error(`Failed to parse quick quiz JSON: ${(err as Error).message}`);
  }

  if (!parsed || typeof parsed !== 'object') throw new Error('AI response is not an object');
  const obj = parsed as Record<string, unknown>;
  if (!Array.isArray(obj.questions)) throw new Error('Response missing questions array');

  const questions: QuickQuizQuestion[] = [];
  for (const raw of obj.questions as Array<Record<string, unknown>>) {
    if (typeof raw.text !== 'string') continue;
    if (!Array.isArray(raw.options) || raw.options.length !== 4) continue;
    const options = (raw.options as unknown[]).map((o) => String(o));
    const correctIndex = Number(raw.correctIndex);
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) continue;
    questions.push({
      text: raw.text,
      options,
      correctIndex,
      explanation: typeof raw.explanation === 'string' ? raw.explanation : undefined,
    });
  }

  if (questions.length === 0) {
    throw new Error('AI response had no valid questions');
  }

  return questions.slice(0, expectedCount);
}

function buildMockQuiz({ topic, className, numberOfQuestions }: QuickQuizParams): QuickQuizQuestion[] {
  const sample: QuickQuizQuestion[] = [
    {
      text: `Which of the following best describes ${topic}?`,
      options: ['A foundational concept', 'An obscure detail', 'An unrelated topic', 'None of the above'],
      correctIndex: 0,
      explanation: `${topic} is typically introduced as a foundational concept in ${className}.`,
    },
    {
      text: `In ${className}, ${topic} is usually studied in which subject?`,
      options: ['Science', 'Mathematics', 'Social Studies', 'Depends on the topic'],
      correctIndex: 3,
      explanation: 'Subject placement depends on the specific topic.',
    },
  ];
  return Array.from({ length: numberOfQuestions }, (_, i) => sample[i % sample.length]);
}
