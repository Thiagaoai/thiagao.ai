export type IconProps = {
  className?: string;
};

export function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.81-5.96 6.81H1.69l7.73-8.83L1.27 2.25h6.82l4.7 6.22 5.45-6.22Zm-1.16 17.52h1.83L7.09 4.13H5.12l11.96 15.64Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <rect width="16" height="16" x="4" y="4" rx="4.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.7" cy="7.3" r="1" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M14.2 8.1V6.7c0-.7.48-.9.82-.9h2.1V2.15L14.23 2.13c-3.2 0-3.93 2.4-3.93 3.93v2.04H7.78v3.76h2.52V22h3.9V11.86h2.64l.36-3.76h-3Z" />
    </svg>
  );
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M6.94 8.98H3.55V20h3.39V8.98ZM5.24 4A1.96 1.96 0 1 0 5.2 7.92 1.96 1.96 0 0 0 5.24 4Zm15.2 9.68c0-3.34-1.79-4.9-4.18-4.9-1.92 0-2.78 1.05-3.26 1.8v-1.6H9.75c.04 1.03 0 11.02 0 11.02h3.39v-6.16c0-.33.02-.66.12-.9.27-.66.88-1.35 1.9-1.35 1.35 0 1.89 1.03 1.89 2.53V20h3.39v-6.32Z" />
    </svg>
  );
}
