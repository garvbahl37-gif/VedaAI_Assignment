'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';

type LogoVariant = 'gradient' | 'black';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: number;
  variant?: LogoVariant;
}

export function Logo({
  className,
  iconOnly = false,
  size = 32,
  variant = 'gradient',
}: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={size} variant={variant} />
      {!iconOnly && (
        <span className="text-[18px] font-bold tracking-tight text-ink">
          VedaAI
        </span>
      )}
    </div>
  );
}

export function LogoMark({
  size = 32,
  variant = 'gradient',
}: {
  size?: number;
  variant?: LogoVariant;
}) {
  const id = useId().replace(/[:]/g, '');
  const isBlack = variant === 'black';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="VedaAI"
      style={{ flexShrink: 0 }}
    >
      {!isBlack && (
        <defs>
          <linearGradient
            id={`veda-${id}`}
            x1="14"
            y1="4"
            x2="50"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FF9A40" />
            <stop offset="50%" stopColor="#E25A12" />
            <stop offset="100%" stopColor="#2A1208" />
          </linearGradient>
        </defs>
      )}

      {/* Rounded-square background */}
      <rect
        width="64"
        height="64"
        rx="14"
        fill={isBlack ? '#1F1F1F' : `url(#veda-${id})`}
      />

      {/*
        Chunky filled V with rounded top corners and a soft notch at the
        bottom where the two strokes meet. Designed as two parallelograms
        sharing the bottom point — left stroke + right stroke.
      */}
      <path
        d="
          M 13 16
          Q 13 13.5 15.5 13.5
          L 23.5 13.5
          Q 25.7 13.5 26.6 15.7
          L 32 32
          L 37.4 15.7
          Q 38.3 13.5 40.5 13.5
          L 48.5 13.5
          Q 51 13.5 51 16
          L 51 16.5
          L 36.3 48.6
          Q 34.5 52.5 32 52.5
          Q 29.5 52.5 27.7 48.6
          L 13 16.5
          Z
        "
        fill="white"
      />
    </svg>
  );
}
