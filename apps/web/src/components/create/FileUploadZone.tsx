'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface FileUploadZoneProps {
  file: File | null;
  onFile: (file: File | null) => void;
}

export function FileUploadZone({ file, onFile }: FileUploadZoneProps) {
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
      <p className="text-center text-[12.5px] text-ink-muted">
        Upload images of your preferred document/image
      </p>
    </div>
  );
}
