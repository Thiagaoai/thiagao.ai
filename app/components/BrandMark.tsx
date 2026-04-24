import Image from 'next/image';

export const BRAND_NAME = 'ThigaoA.i';
export const BRAND_LOGO_SRC = '/brand/thigaoai-logo-512.webp';

type BrandMarkProps = {
  className?: string;
  title?: string;
};

export function BrandMark({ className = 'h-8 w-8', title = BRAND_NAME }: BrandMarkProps) {
  return (
    <Image
      src={BRAND_LOGO_SRC}
      alt={title}
      width={512}
      height={512}
      sizes="64px"
      className={`${className} shrink-0 object-contain`}
      draggable={false}
    />
  );
}

export function BrandWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline tracking-[-0.04em] ${className}`}>
      <span>ThigaoA</span>
      <span className="ml-0.5 bg-gradient-to-r from-amber-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
        .i
      </span>
    </span>
  );
}
