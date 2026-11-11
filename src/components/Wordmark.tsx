/**
 * The Dry Run wordmark: an oversized custom "D" whose counter holds the Ghost Curve
 * mark (dotted bonding curve + glowing head dot), followed by "ry Run" set in Geist.
 * Everything is sized in em, so set the D's height with a font-size class
 * (e.g. `text-[104px] sm:text-[150px]`) or the `size` prop.
 */
export function BigD({ animated = false, className = "" }: { animated?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 100 120" aria-hidden="true" className={`h-[1em] w-[0.8333em] shrink-0 overflow-visible ${className}`}>
      <path
        fillRule="evenodd"
        fill="#c6ff3d"
        d="M0 6 Q0 0 6 0 H46 C80 0 100 25 100 60 C100 95 80 120 46 120 H6 Q0 120 0 114 Z M25 23 V97 H45 C64 97 75 83 75 60 C75 37 64 23 45 23 Z"
      />
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
