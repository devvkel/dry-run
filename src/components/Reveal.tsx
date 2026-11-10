"use client";

import { useEffect, useRef, useState } from "react";

/** Counts the big % up from 0 and fires light confetti on good outcomes. */
export default function Reveal({ pct, tone, celebrate, runKey }: { pct: number; tone: string; celebrate: boolean; runKey: string }) {
  const [v, setV] = useState(0);
  const fired = useRef("");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const t0 = performance.now();
    const dur = reduce ? 1 : 1400;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      setV(Math.round(pct * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
      else if (celebrate && !reduce && fired.current !== runKey) {
        fired.current = runKey;
        import("canvas-confetti").then(({ default: confetti }) => {
          const colors = ["#c6ff3d", "#7c5cff", "#eef0f6"];
          confetti({ particleCount: 90, spread: 75, startVelocity: 38, origin: { y: 0.35 }, colors, scalar: 0.9 });
          setTimeout(() => confetti({ particleCount: 50, spread: 110, origin: { y: 0.3 }, colors, scalar: 0.8 }), 250);
        });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pct, celebrate, runKey]);

  return (
    <span className={`tabular-nums ${tone}`} aria-label={`${pct}%`}>
      {v}%
    </span>
  );
}
