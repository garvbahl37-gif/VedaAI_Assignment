'use client';

import Image from 'next/image';
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
  // Static PNG assets in apps/web/public/ — DesktopLogo and MobileLogo provided
  // by the user. Gradient = orange→dark rounded square (desktop sidebar / wide
  // surfaces); black = solid dark rounded square (mobile header).
  const src = variant === 'black' ? '/mobile-logo.png' : '/desktop-logo.png';

  return (
    <Image
      src={src}
      width={size}
      height={size}
      alt="VedaAI"
      style={{ flexShrink: 0, width: size, height: size }}
      priority
      unoptimized
    />
  );
}
