'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TopHeader } from '@/components/layout/TopHeader';
import { FileUploadZone } from '@/components/create/FileUploadZone';
import { DueDateInput } from '@/components/create/DueDateInput';
import { QuestionTypeTable } from '@/components/create/QuestionTypeTable';
import { AdditionalInfoTextarea } from '@/components/create/AdditionalInfoTextarea';
import { useCreateAssignmentStore } from '@/stores/createAssignmentStore';
import { useGenerationStore } from '@/stores/generationStore';
import { useProfileStore } from '@/stores/profileStore';
import { api } from '@/lib/api';

export default function CreateAssignmentPage() {
  const router = useRouter();
  const {
    formData,
    updateFormData,
    addQuestionType,
    removeQuestionType,
    updateQuestionType,
    reset,
  } = useCreateAssignmentStore();

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const setJobId = useGenerationStore((s) => s.setJobId);
  const setAssignmentId = useGenerationStore((s) => s.setAssignmentId);
  const setStatus = useGenerationStore((s) => s.setStatus);
  const resetGen = useGenerationStore((s) => s.reset);

  const schoolName = useProfileStore((s) => s.schoolName);
  const city = useProfileStore((s) => s.city);

  function validate(): string[] {
    const errs: string[] = [];
    if (!formData.title.trim()) errs.push('Title is required');
    if (!formData.dueDate) errs.push('Due date is required');
    if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.dueDate))
      errs.push('Due date must be DD-MM-YYYY');
    if (formData.questionTypes.length === 0)
      errs.push('Add at least one question type');
    formData.questionTypes.forEach((qt, i) => {
      if (!qt.type) errs.push(`Row ${i + 1}: question type is required`);
      if (qt.numberOfQuestions < 1) errs.push(`Row ${i + 1}: at least 1 question`);
      if (qt.marks < 1) errs.push(`Row ${i + 1}: marks must be at least 1`);
    });
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;

    setSubmitting(true);
    try {
      resetGen();
      const res = await api.createAssignment({
        title: formData.title.trim(),
        dueDate: formData.dueDate,
        questionTypes: formData.questionTypes,
        additionalInstructions: formData.additionalInstructions.trim() || undefined,
        fileName: formData.fileName || undefined,
        schoolName: schoolName?.trim() || undefined,
        city: city?.trim() || undefined,
      });

      setJobId(res.jobId);
      setAssignmentId(res.assignment._id);
      setStatus('queued');
      reset();
      router.push(`/assignments/${res.assignment._id}/output?jobId=${res.jobId}`);
    } catch (err) {
      setErrors([(err as Error).message]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <TopHeader title="Assignment" />

      <div className="px-4 lg:px-6 pb-32">
        {/* Title row */}
        <div className="flex items-start gap-2.5 mt-2 mb-5">
          <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block shrink-0" />
          <div>
            <h1 className="text-[22px] font-bold text-ink leading-tight">
              Create Assignment
            </h1>
            <p className="mt-0.5 text-[13.5px] text-ink-muted">
              Set up a new assignment for your students
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="grid grid-cols-2 gap-2 max-w-3xl mx-auto px-3 mb-5">
          <div className="h-1 rounded-full bg-ink" />
          <div className="h-1 rounded-full bg-line" />
        </div>

        {/* Container card */}
        <div className="max-w-3xl mx-auto bg-white border border-line rounded-3xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-6 lg:p-8 space-y-7">
          <div>
            <h2 className="text-[17px] font-bold text-ink">Assignment Details</h2>
            <p className="mt-1 text-[13px] text-ink-muted">
              Basic information about your assignment
            </p>
          </div>

          {/* Title — keep for backend, hidden as one-line input above upload */}
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder="Assignment title (e.g. Quiz on Electricity — Class 5)"
            className="w-full h-12 rounded-2xl bg-surface-page border border-transparent px-5 text-[13.5px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-line"
          />

          <FileUploadZone
            file={formData.file}
            onFile={(file) =>
              updateFormData({ file, fileName: file?.name ?? '' })
            }
          />

          <DueDateInput
            value={formData.dueDate}
            onChange={(dueDate) => updateFormData({ dueDate })}
          />

          <QuestionTypeTable
            rows={formData.questionTypes}
            onAdd={addQuestionType}
            onRemove={removeQuestionType}
            onChange={updateQuestionType}
          />

          <AdditionalInfoTextarea
            value={formData.additionalInstructions}
            onChange={(v) => updateFormData({ additionalInstructions: v })}
          />

          {errors.length > 0 && (
            <ul className="rounded-md border border-red-200 bg-red-50 p-3 text-[12px] text-red-700 space-y-0.5">
              {errors.map((e, i) => (
                <li key={i}>• {e}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer buttons */}
        <div className="max-w-3xl mx-auto mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-white border border-line text-[13.5px] font-medium text-ink hover:bg-surface-subtle"
            disabled={submitting}
          >
            <ArrowLeft size={15} />
            Previous
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-ink text-[13.5px] font-medium text-white hover:bg-black disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Generating…' : 'Next'}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
