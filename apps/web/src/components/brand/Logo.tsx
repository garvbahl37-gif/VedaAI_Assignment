'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: number;
}

export function Logo({ className, iconOnly = false, size = 32 }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      {!iconOnly && (
        <span className="text-[18px] font-bold tracking-tight text-ink">
          VedaAI
        </span>
      )}
    </div>
  );
}

export function LogoMark({ size = 32 }: { size?: number }) {
  const id = useId().replace(/[:]/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="VedaAI"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`veda-${id}`} x1="6" y1="2" x2="26" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF8A3D" />
          <stop offset="45%" stopColor="#E25A12" />
          <stop offset="100%" stopColor="#2A1208" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7.5" fill={`url(#veda-${id})`} />
      <path
        d="M8 10 L16 24 L24 10"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
