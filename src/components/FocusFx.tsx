"use client";

import { useEffect } from "react";

/**
 * Scroll "focus" effect: the [data-focus] block closest to the viewport centre gets
 * data-active (scale, glow, full opacity); the rest settle back. Also handles a one-time
 * fade/slide-up reveal (data-seen). CSS lives in globals.css under html.fx.
 */
export default function FocusFx() {
  useEffect(() => {
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-focus]"));
    if (!els.length) return;

    // Anything already on screen counts as seen, so there's no flash on load.
    const vh = window.innerHeight;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.dataset.seen = "";
    }
    root.classList.add("fx");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.seen = "";
            io.unobserve(e.target);
          }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    els.forEach((el) => el.dataset.seen === undefined && io.observe(el));

    let current: HTMLElement | null = null;
    let raf = 0;
    const pick = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let best: HTMLElement | null = null;
      // Keep the block being typed in active, so forms never dim mid-edit.
      const typing = document.activeElement?.closest<HTMLElement>("[data-focus]");
      if (typing && /INPUT|TEXTAREA/.test(document.activeElement!.tagName)) best = typing;
      else {
        let bestD = Infinity;
        for (const el of els) {
          const r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) continue;
          const d = mid >= r.top && mid <= r.bottom ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
          // Prefer the smaller block when several contain the centre line.
          const score = d * 10 + (d === 0 ? r.height / 1000 : 0);
          if (score < bestD) {
            bestD = score;
            best = el;
          }
        }
      }
      if (best !== current) {
        current?.removeAttribute("data-active");
        best?.setAttribute("data-active", "");
        current = best;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(pick);
    };
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("focusin", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("focusin", onScroll);
      current?.removeAttribute("data-active");
    };
  }, []);
  return null;
}
