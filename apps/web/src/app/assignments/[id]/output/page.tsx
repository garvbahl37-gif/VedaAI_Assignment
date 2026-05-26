'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { RefreshCcw, Sparkles } from 'lucide-react';
import { TopHeader } from '@/components/layout/TopHeader';
import { QuestionPaper } from '@/components/paper/QuestionPaper';
import { GenerationProgress } from '@/components/paper/GenerationProgress';
import { DownloadPdfButton } from '@/components/paper/DownloadPdfButton';
import { useGenerationStore } from '@/stores/generationStore';
import { useProfileStore } from '@/stores/profileStore';
import { api } from '@/lib/api';
import { AssignmentWebSocket } from '@/lib/websocket';

export default function AssignmentOutputPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const assignmentId = params.id;
  const initialJobId = search.get('jobId');

  const {
    jobId,
    status,
    stage,
    progress,
    message,
    wsConnected,
    error,
    generatedPaper,
    setJobId,
    setStatus,
    setStage,
    setProgress,
    setMessage,
    setWsConnected,
    setError,
    setGeneratedPaper,
  } = useGenerationStore();

  const wsRef = useRef<AssignmentWebSocket | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const teacherName = useProfileStore((s) => s.teacherName) || '';
  const firstName = teacherName.trim().split(/\s+/)[0] || '';

  // ─── Initial load: if assignment is already completed, fetch its paper; otherwise connect WS ───
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const { assignment } = await api.getAssignment(assignmentId);
        if (cancelled) return;

        // Effective jobId — prefer URL param, fall back to assignment.jobId.
        const effectiveJobId = initialJobId ?? assignment.jobId ?? null;

        if (assignment.status === 'completed') {
          const res = await api.getPaper(assignmentId);
          if (!cancelled) {
            setGeneratedPaper(res.paper);
            setStatus('completed');
            setProgress(100);
          }
          return;
        }

        if (assignment.status === 'failed') {
          setStatus('failed');
          setError('Generation failed. Try regenerating.');
          return;
        }

        // Generating — connect WS
        if (effectiveJobId) {
          setJobId(effectiveJobId);
          setStatus('processing');
          connectWebSocket(effectiveJobId);
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
      wsRef.current?.disconnect();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  function connectWebSocket(targetJobId: string) {
    wsRef.current?.disconnect();
    const ws = new AssignmentWebSocket();
    ws.connect(
      targetJobId,
      async (msg) => {
        if (msg.type === 'connected') {
          setStatus('processing');
        } else if (msg.type === 'progress') {
          setStage(msg.stage);
          setProgress(msg.progress);
          if (msg.message) setMessage(msg.message);
        } else if (msg.type === 'completed') {
          setProgress(100);
          setStatus('completed');
          try {
            const res = await api.getPaper(assignmentId);
            setGeneratedPaper(res.paper);
          } catch (err) {
            setError((err as Error).message);
          }
          wsRef.current?.disconnect();
        } else if (msg.type === 'failed') {
          setStatus('failed');
          setError(msg.error);
          wsRef.current?.disconnect();
        }
      },
      setWsConnected,
    );
    wsRef.current = ws;
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      setGeneratedPaper(null);
      setError(null);
      setProgress(0);
      setMessage('');
      const res = await api.regenerate(assignmentId);
      setStatus('processing');
      setJobId(res.jobId);
      connectWebSocket(res.jobId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRegenerating(false);
    }
  }

  const isGenerating =
    !generatedPaper && (status === 'queued' || status === 'processing' || status === 'idle');

  return (
    <>
      <TopHeader title="Create New" variant="create" showBack />

      <div className="px-4 lg:px-8 py-6">
        {/* Dark AI banner */}
        <div className="max-w-[900px] mx-auto mb-5">
          <div className="rounded-3xl bg-[#2C2C2C] p-6 lg:p-7">
            <p className="text-white text-[15px] font-semibold leading-relaxed">
              {generatedPaper ? (
                <>
                  Certainly{firstName ? `, ${firstName}` : ''}! Here is your customised
                  question paper for your {generatedPaper.className}{' '}
                  {generatedPaper.subject} classes, covering{' '}
                  {countQuestions(generatedPaper)} questions across{' '}
                  {generatedPaper.sections.length} sections, totalling{' '}
                  {generatedPaper.maximumMarks} marks:
                </>
              ) : (
                <>Veda is assembling your question paper right now…</>
              )}
            </p>

            {generatedPaper && (
              <div className="mt-5 flex items-center gap-2">
                <DownloadPdfButton paper={generatedPaper} />
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="inline-flex items-center justify-center h-9 px-4 rounded-full border border-white/20 bg-transparent text-[13px] font-medium text-white hover:bg-white/10 gap-1.5 disabled:opacity-50"
                  disabled={regenerating}
                >
                  <RefreshCcw
                    size={14}
                    className={regenerating ? 'animate-spin' : ''}
                  />
                  {regenerating ? 'Regenerating…' : 'Regenerate'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        {isGenerating ? (
          <GenerationProgress
            progress={progress}
            stage={stage}
            message={message}
            wsConnected={wsConnected}
            error={error}
          />
        ) : status === 'failed' ? (
          <div className="max-w-xl mx-auto rounded-md border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="text-[15px] font-semibold text-red-700">Generation failed</h2>
            <p className="mt-1 text-[13px] text-red-700">
              {error ?? 'Something went wrong while generating your paper.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleRegenerate}
                className="btn-primary h-9 px-3 text-[13px]"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => router.push('/assignments')}
                className="btn-secondary h-9 px-3 text-[13px]"
              >
                Back to Assignments
              </button>
            </div>
          </div>
        ) : generatedPaper ? (
          <QuestionPaper paper={generatedPaper} />
        ) : null}
      </div>
    </>
  );
}

function countQuestions(paper: { sections: { questions: unknown[] }[] }): number {
  return paper.sections.reduce((sum, s) => sum + s.questions.length, 0);
}
