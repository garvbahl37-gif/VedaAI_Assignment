'use client';

export interface ExtractionResult {
  text: string;
  pages?: number;
  truncated?: boolean;
}

const MAX_CHARS = 50_000;

/**
 * Extracts text content from an uploaded file so it can be fed into the
 * generation prompt under a REFERENCE MATERIAL block.
 *
 * Supported:
 *   - text/plain (.txt) — read directly as UTF-8
 *   - application/pdf  — extracted via pdfjs-dist in the browser
 *
 * Anything else (images, etc.) returns an empty string + skipped flag.
 * Caller decides what to do with the result; nothing is sent to the API
 * automatically.
 */
export async function extractTextFromFile(file: File): Promise<ExtractionResult> {
  if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
    const text = await file.text();
    return clamp(text);
  }

  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return extractPdf(file);
  }

  // Images and unsupported types — no OCR, return empty.
  return { text: '' };
}

async function extractPdf(file: File): Promise<ExtractionResult> {
  // Dynamic import keeps pdfjs out of the SSR bundle.
  const pdfjs = await import('pdfjs-dist');

  // Use the matching CDN-hosted worker so we don't have to configure the
  // bundler to copy pdf.worker.min.mjs into /public.
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    const version = pdfjs.version;
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
  }

  const buf = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: buf });
  const pdf = await loadingTask.promise;

  const parts: string[] = [];
  let totalChars = 0;
  let truncated = false;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .filter(Boolean)
      .join(' ');

    parts.push(pageText);
    totalChars += pageText.length;

    if (totalChars >= MAX_CHARS) {
      truncated = true;
      break;
    }
  }

  const merged = parts.join('\n\n').replace(/\s+\n/g, '\n').trim();
  const final = merged.length > MAX_CHARS ? merged.slice(0, MAX_CHARS) : merged;

  return {
    text: final,
    pages: pdf.numPages,
    truncated: truncated || merged.length > MAX_CHARS,
  };
}

function clamp(text: string): ExtractionResult {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_CHARS) return { text: trimmed };
  return { text: trimmed.slice(0, MAX_CHARS), truncated: true };
}
