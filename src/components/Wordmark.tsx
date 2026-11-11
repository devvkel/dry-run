/**
 * The Dry Run wordmark: an oversized custom "D" whose counter holds the Ghost Curve
 * mark (dotted bonding curve + glowing head dot), followed by "ry Run" set in Geist.
 * Everything is sized in em, so set the D's height with a font-size class
 * (e.g. `text-[104px] sm:text-[150px]`) or the `size` prop.
 */
export function BigD({ animated = false, className = "" }: { animated?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 100 120" aria-hidden="true" className={`h-[1em] w-[0.8333em] shrink-0 overflow-visible ${className}`}>
      <defs>
        <linearGradient id="dr-d-body" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#e2ff8a" />
          <stop offset="0.45" stopColor="#c6ff3d" />
          <stop offset="1" stopColor="#8fd10f" />
        </linearGradient>
        <radialGradient id="dr-d-counter" cx="0.55" cy="0.4" r="0.75">
          <stop offset="0" stopColor="#c6ff3d" stopOpacity="0.16" />
          <stop offset="1" stopColor="#c6ff3d" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Custom-cut D: chamfered top-left (the curve's climb), a concave launch-pad
          bite at the stem foot, and a squared counter with a rounded bowl echoing the logo tile. */}
      <path
        fillRule="evenodd"
        fill="url(#dr-d-body)"
        d="M15 0 H48 C81 0 100 25 100 60 C100 95 81 120 48 120 H12 A12 12 0 0 0 0 108 V15 Z M30 23 H59 Q75 23 75 39 V81 Q75 97 59 97 H30 Q25 97 25 92 V28 Q25 23 30 23 Z"
      />
      {/* soft lime light inside the counter + an inner rim */}
      <path d="M30 23 H59 Q75 23 75 39 V81 Q75 97 59 97 H30 Q25 97 25 92 V28 Q25 23 30 23 Z" fill="url(#dr-d-counter)" stroke="#07080c" strokeOpacity="0.35" strokeWidth="1.5" />
      {/* top-edge highlight */}
      <path d="M16.5 2.2 H48 C66 2.2 80 9 89 20" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M33 87 C 46 87, 50 47, 62 41"
        fill="none"
        stroke="#c6ff3d"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeDasharray="0.1 7.6"
        className={animated ? "dr-flow" : undefined}
      />
      <circle cx="64.5" cy="39.5" r="5.6" fill="#c6ff3d" className={`dr-glow-dot ${animated ? "dr-head" : ""}`} />
    </svg>
  );
}

export default function Wordmark({ size, animated = false, className = "" }: { size?: number; animated?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-end leading-none ${className}`} style={size ? { fontSize: size } : undefined}>
      <BigD animated={animated} />
      <span aria-hidden="true" className="ml-[0.06em] mb-[-0.035em] text-[0.62em] font-extrabold leading-none tracking-[-0.045em] text-[#eef0f6]">
        ry&nbsp;Run
      </span>
      <span className="sr-only">Dry Run</span>
    </span>
  );
}
