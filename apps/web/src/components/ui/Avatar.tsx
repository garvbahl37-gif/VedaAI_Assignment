'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

interface AvatarProps {
  name?: string;
  photoUrl?: string;
  size?: number;
  className?: string;
}

/**
 * Round avatar. Shows the user's photo when `photoUrl` is provided and loads
 * successfully; otherwise falls back to an initials avatar on a warm gradient
 * background. The fallback path is also taken if the image fails to load
 * (broken URL, CORS, offline), so the UI never shows a broken-image icon.
 */
export function Avatar({ name = '', photoUrl, size = 32, className }: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPhoto = !!photoUrl && !imgFailed;

  const initials = getInitials(name);

  return (
    <div
      className={cn(
        'rounded-full shrink-0 overflow-hidden ring-2 ring-white relative',
        !showPhoto &&
          'bg-gradient-to-br from-amber-200 via-orange-300 to-rose-300 flex items-center justify-center',
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={name ? `${name} avatar` : 'User avatar'}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={name ? `${name} avatar` : 'User avatar'}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span
          className="font-semibold text-ink select-none"
          style={{ fontSize: Math.max(11, Math.round(size * 0.38)) }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
