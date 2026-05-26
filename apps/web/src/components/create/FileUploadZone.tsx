'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ReferenceStatus = 'idle' | 'extracting' | 'ready' | 'unsupported' | 'error';

interface FileUploadZoneProps {
  file: File | null;
  onFile: (file: File | null) => void;
  status?: ReferenceStatus;
  pages?: number;
  truncated?: boolean;
  charCount?: number;
}

export function FileUploadZone({
  file,
  onFile,
  status = 'idle',
  pages,
  truncated,
  charCount,
}: FileUploadZoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0]);
    },
    [onFile],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'rounded-2xl border-[1.5px] border-dashed bg-white px-6 py-12 transition-colors text-center',
          isDragActive
            ? 'border-brand bg-brand-50/30'
            : 'border-line hover:border-ink-subtle',
        )}
      >
        <input {...getInputProps()} />

        {file ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-[13px] text-ink truncate max-w-[300px]">
              {file.name}
            </span>
            <button
              type="button"
              onClick={() => onFile(null)}
              className="h-6 w-6 rounded hover:bg-surface-subtle text-ink-muted flex items-center justify-center"
              aria-label="Remove file"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud
              size={26}
              className="mx-auto text-ink"
              strokeWidth={1.6}
            />
            <p className="mt-4 text-[15px] text-ink font-semibold">
              Choose a file or drag &amp; drop it here
            </p>
            <p className="mt-1.5 text-[12px] text-ink-muted">
              PDF, TXT, JPEG, PNG · upto 10MB
            </p>
            <button
              type="button"
              onClick={open}
              className="mt-5 inline-flex items-center justify-center h-9 px-5 rounded-full border border-line bg-white text-[13px] font-medium text-ink hover:bg-surface-subtle"
            >
              Browse Files
            </button>
          </>
        )}
      </div>

      {file && status !== 'idle' && (
        <StatusLine
          status={status}
          pages={pages}
          truncated={truncated}
          charCount={charCount}
        />
      )}

      {!file && (
        <p className="text-center text-[12.5px] text-ink-muted">
          Upload a chapter PDF or notes — questions will be based on its content.
        </p>
      )}
    </div>
  );
}

function StatusLine({
  status,
  pages,
  truncated,
  charCount,
}: {
  status: ReferenceStatus;
  pages?: number;
  truncated?: boolean;
  charCount?: number;
}) {
  if (status === 'extracting') {
    return (
      <p className="text-center text-[12.5px] text-ink-muted inline-flex items-center justify-center gap-1.5 w-full">
        <Loader2 size={12} className="animate-spin" />
        Reading file content…
      </p>
    );
  }

  if (status === 'ready') {
    return (
      <p className="text-center text-[12.5px] text-emerald-700 inline-flex items-center justify-center gap-1.5 w-full">
        <CheckCircle2 size={12} />
        Content extracted
        {pages ? ` (${pages} page${pages === 1 ? '' : 's'})` : ''}
        {charCount ? ` · ${charCount.toLocaleString()} chars` : ''}
        {truncated ? ' · truncated to first 50,000 chars' : ''}
        {' — will be used to generate questions.'}
      </p>
    );
  }

  if (status === 'unsupported') {
    return (
      <p className="text-center text-[12.5px] text-amber-700 inline-flex items-center justify-center gap-1.5 w-full">
        <AlertTriangle size={12} />
        Images can&apos;t be read automatically. Use a PDF or TXT for content-aware questions.
      </p>
    );
  }

  if (status === 'error') {
    return (
      <p className="text-center text-[12.5px] text-red-600 inline-flex items-center justify-center gap-1.5 w-full">
        <AlertTriangle size={12} />
        Couldn&apos;t read this file — questions will use the title only.
      </p>
    );
  }

  return null;
}
