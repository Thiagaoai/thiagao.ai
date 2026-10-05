'use client';

import { useId } from 'react';

export const BRAND_NAME = 'Thiagao Ai';
export const BRAND_LOGO_SRC = '/brand/thigaoai-logo-512.webp';

type BrandMarkProps = {
  className?: string;
  title?: string;
};

// Two strokes reaching for each other, human in white and machine in the brand
// gradient, with the touch point as a spark above the gap: the "A" of Ai.
// Source files for print and other uses live in docs/brand/.
export function BrandMark({ className = 'h-8 w-8', title = BRAND_NAME }: BrandMarkProps) {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label={title}
      className={`${className} shrink-0`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fcd34d" />
          <stop offset="0.5" stopColor="#a5f3fc" />
          <stop offset="1" stopColor="#93c5fd" />
        </linearGradient>
      </defs>
      <path d="M14 52 L25 23" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
      <path d="M50 52 L39 23" stroke={`url(#${gradientId})`} strokeWidth="8" strokeLinecap="round" />
      <circle cx="32" cy="12" r="3.6" fill="#ffffff" />
    </svg>
  );
}

export function BrandWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline tracking-[-0.04em] ${className}`}>
      <span>Thiagao</span>
      <span className="ml-1 bg-gradient-to-r from-amber-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
        Ai
      </span>
    </span>
  );
}
