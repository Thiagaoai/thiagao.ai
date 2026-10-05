// Line-art lighthouse for the footer shoreline, with a slow sweeping beam.
// Matches the lighthouse in the hero video; the lamp uses the --glow accent.
export default function Lighthouse({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <div className="lighthouse-beam left-1/2 top-[13%] -translate-x-1/2 -translate-y-1/2" />
      <svg viewBox="0 0 120 300" fill="none" className="relative h-auto w-full">
        <defs>
          <radialGradient id="lamp-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="hsl(var(--glow))" stopOpacity="0.9" />
            <stop offset="1" stopColor="hsl(var(--glow))" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="40" r="34" fill="url(#lamp-glow)" />
        {/* roof */}
        <path d="M60 10 L44 28 H76 Z" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinejoin="round" />
        {/* lamp room */}
        <rect x="47" y="28" width="26" height="22" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" />
        <rect x="52" y="33" width="16" height="12" fill="hsl(var(--glow))" fillOpacity="0.95" />
        {/* gallery */}
        <rect x="38" y="50" width="44" height="6" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" />
        <path d="M42 50 V44 M50 50 V44 M58 50 V44 M66 50 V44 M74 50 V44" stroke="white" strokeOpacity="0.45" strokeWidth="1.2" />
        {/* tower */}
        <path d="M44 56 L34 290 H86 L76 56 Z" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M42 112 H78 M40 168 H80 M37 226 H83" stroke="white" strokeOpacity="0.3" strokeWidth="1.2" />
        <rect x="55" y="130" width="10" height="14" rx="5" stroke="white" strokeOpacity="0.5" strokeWidth="1.2" />
        <rect x="52" y="250" width="16" height="40" rx="8" stroke="white" strokeOpacity="0.5" strokeWidth="1.2" />
        {/* ground */}
        <path d="M14 292 H106" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
