'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Download } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import type { GeneratedPaper } from '@vedaai/shared';
import { PaperPdfDocument } from './PaperPdfDocument';

interface PdfLinkProps {
  document: ReactNode;
  fileName?: string;
  className?: string;
  children: (state: { loading: boolean }) => ReactNode;
}

// @react-pdf/renderer must run client-side only. next/dynamic strips the
// render-prop child type, so we re-cast here.
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFDownloadLink),
  { ssr: false },
) as unknown as ComponentType<PdfLinkProps>;

interface DownloadPdfButtonProps {
  paper: GeneratedPaper;
}

const BTN =
  'inline-flex items-center justify-center h-9 px-4 rounded-full bg-white text-ink text-[13px] font-semibold gap-2 hover:bg-white/90 transition shadow-sm';

export function DownloadPdfButton({ paper }: DownloadPdfButtonProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button type="button" className={BTN} disabled>
        <Download size={14} strokeWidth={2.2} />
        Download as PDF
      </button>
    );
  }

  const fileName = `${slug(paper.subject)}_${slug(paper.className)}_${new Date()
    .toISOString()
    .slice(0, 10)}_question_paper.pdf`;

  return (
    <PDFDownloadLink
      document={<PaperPdfDocument paper={paper} />}
      fileName={fileName}
      className={BTN}
    >
      {({ loading }) => (
        <>
          <Download size={14} strokeWidth={2.2} />
          {loading ? 'Preparing PDF…' : 'Download as PDF'}
        </>
      )}
    </PDFDownloadLink>
  );
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
