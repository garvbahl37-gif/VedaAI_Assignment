import type {
  Assignment,
  CreateAssignmentRequest,
  CreateAssignmentResponse,
  GeneratedPaper,
  GetPaperResponse,
  JobStatusResponse,
  ListAssignmentsResponse,
  QuickQuizRequest,
  QuickQuizResponse,
} from '@vedaai/shared';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.message ?? body?.error ?? '';
    } catch { /* noop */ }
    throw new Error(detail || `${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  listAssignments: () => http<ListAssignmentsResponse>('/assignments'),
  getAssignment: (id: string) => http<{ assignment: Assignment }>(`/assignments/${id}`),
  createAssignment: (body: CreateAssignmentRequest) =>
    http<CreateAssignmentResponse>('/assignments', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  deleteAssignment: (id: string) => http<void>(`/assignments/${id}`, { method: 'DELETE' }),
  getPaper: (assignmentId: string) =>
    http<GetPaperResponse>(`/assignments/${assignmentId}/paper`),
  regenerate: (id: string) =>
    http<CreateAssignmentResponse>(`/assignments/${id}/regenerate`, { method: 'POST' }),
  getJobStatus: (jobId: string) => http<JobStatusResponse>(`/jobs/${jobId}/status`),
  quickQuiz: (body: QuickQuizRequest) =>
    http<QuickQuizResponse>('/toolkit/quick-quiz', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export type { Assignment, GeneratedPaper };
