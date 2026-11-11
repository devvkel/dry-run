/** Decorative bonding curve behind the hero: dotted lime line that slowly flows, with a glowing head. */
export default function HeroCurve() {
  return (
    <div aria-hidden="true" className="dr-hero-mask pointer-events-none absolute left-1/2 top-0 -z-10 h-[560px] w-screen -translate-x-1/2 overflow-hidden sm:h-[680px]">
      <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <filter id="hc-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="hc-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c6ff3d" stopOpacity="0" />
            <stop offset="0.45" stopColor="#c6ff3d" stopOpacity="0.22" />
            <stop offset="1" stopColor="#c6ff3d" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="hc-spot" cx="0.5" cy="0.3" r="0.6">
            <stop offset="0" stopColor="#c6ff3d" stopOpacity="0.12" />
            <stop offset="1" stopColor="#c6ff3d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1200" height="600" fill="url(#hc-spot)" />
        <path
          className="dr-flow-slow"
          d="M-20 560 C 420 560, 640 520, 860 330 S 1120 70, 1180 50"
          fill="none"
          stroke="url(#hc-fade)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="0.1 22"
          filter="url(#hc-glow)"
        />
        <circle className="dr-head" cx="1180" cy="50" r="10" fill="#c6ff3d" filter="url(#hc-glow)" />
      </svg>
    </div>
  );
}
