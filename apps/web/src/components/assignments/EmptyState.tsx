import Link from 'next/link';
import { Plus } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center px-6 py-12 lg:py-16 max-w-md mx-auto">
      <EmptyIllustration />
      <h2 className="mt-6 text-[16px] font-semibold text-ink">
        No assignments yet
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-muted max-w-[340px]">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>
      <Link
        href="/assignments/create"
        className="inline-flex items-center justify-center gap-2 mt-7 h-11 px-6 rounded-full bg-ink text-white text-[13px] font-medium hover:bg-black"
      >
        <Plus size={15} strokeWidth={2.5} />
        Create Your First Assignment
      </Link>
    </div>
  );
}

function EmptyIllustration() {
  return (
    <svg
      width="260"
      height="200"
      viewBox="0 0 260 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="emptyBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EDEDED" />
        </radialGradient>
      </defs>

      {/* Soft circular background */}
      <circle cx="130" cy="100" r="92" fill="url(#emptyBg)" />

      {/* Scribble flourish (top-left of composition) */}
      <path
        d="M58 50
           q4 -10 12 -8
           q9 2 4 11
           q-5 8 -12 4
           q-7 -4 -1 -10"
        stroke="#1F2937"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Tiny dot top-right area */}
      <circle cx="192" cy="62" r="1.6" fill="#1F2937" />

      {/* Floating note card (top-right of paper) */}
      <g transform="translate(170 50)">
        <rect
          x="0"
          y="0"
          width="34"
          height="16"
          rx="2.5"
          fill="#FFFFFF"
          stroke="#D1D5DB"
          strokeWidth="1.1"
        />
        <rect x="5" y="5.5" width="22" height="2.4" rx="1.2" fill="#D1D5DB" />
        <rect x="5" y="10" width="15" height="2.4" rx="1.2" fill="#D1D5DB" />
      </g>

      {/* Paper sheet */}
      <g transform="translate(86 44)">
        <rect
          x="0"
          y="0"
          width="80"
          height="104"
          rx="4"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="1.4"
        />
        {/* Dark header pill */}
        <rect x="10" y="14" width="38" height="6.5" rx="2" fill="#1F2937" />
        {/* Text lines */}
        <rect x="10" y="30" width="58" height="3.6" rx="1.8" fill="#D1D5DB" />
        <rect x="10" y="40" width="46" height="3.6" rx="1.8" fill="#D1D5DB" />
        <rect x="10" y="50" width="60" height="3.6" rx="1.8" fill="#D1D5DB" />
        <rect x="10" y="60" width="40" height="3.6" rx="1.8" fill="#D1D5DB" />
        <rect x="10" y="70" width="54" height="3.6" rx="1.8" fill="#D1D5DB" />
        <rect x="10" y="80" width="34" height="3.6" rx="1.8" fill="#D1D5DB" />
      </g>

      {/* Red X (over paper) */}
      <g
        transform="translate(150 100)"
        stroke="#E11D48"
        strokeWidth="6.5"
        strokeLinecap="round"
      >
        <line x1="-11" y1="-11" x2="11" y2="11" />
        <line x1="11" y1="-11" x2="-11" y2="11" />
      </g>

      {/* Magnifying glass — lavender ring with dark outline + handle */}
      <g transform="translate(168 122)">
        {/* Lavender thick ring */}
        <circle cx="0" cy="0" r="23" fill="#FFFFFF" stroke="#B4B0D6" strokeWidth="5.5" />
        {/* Dark thin outline */}
        <circle cx="0" cy="0" r="25.7" fill="none" stroke="#1F2937" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="20.3" fill="none" stroke="#1F2937" strokeWidth="1.1" />
        {/* Handle */}
        <line
          x1="17"
          y1="17"
          x2="34"
          y2="34"
          stroke="#B4B0D6"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <line
          x1="17"
          y1="17"
          x2="34"
          y2="34"
          stroke="#1F2937"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>

      {/* Dark navy 4-point sparkle (bottom-left) */}
      <g transform="translate(86 152)">
        <path
          d="M0 -8 L1.8 -1.8 L8 0 L1.8 1.8 L0 8 L-1.8 1.8 L-8 0 L-1.8 -1.8 Z"
          fill="#1F2937"
        />
      </g>

      {/* Small navy dot (lower-left near paper) */}
      <circle cx="72" cy="142" r="1.6" fill="#1F2937" />

      {/* Small orange dot (right) */}
      <circle cx="218" cy="120" r="2.6" fill="#F4A024" />
    </svg>
  );
}
