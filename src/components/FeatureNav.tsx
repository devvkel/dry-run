import Link from "next/link";

export type Feature = "rehearse" | "check" | "guess";

const ICONS: Record<Feature, React.ReactNode> = {
  rehearse: (
    <path d="M4 18c5 0 7-11 13-12M17 6l3-1-1 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  check: (
    <>
      <circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M15 15l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  guess: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="9" r="1.4" fill="currentColor" />
      <circle cx="15" cy="15" r="1.4" fill="currentColor" />
      <circle cx="15" cy="9" r="1.4" fill="currentColor" />
      <circle cx="9" cy="15" r="1.4" fill="currentColor" />
    </>
  ),
};

export function FeatureIcon({ f, className = "h-4 w-4" }: { f: Feature; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {ICONS[f]}
    </svg>
  );
}

const ITEMS: { f: Feature; href: string; label: string; short: string }[] = [
  { f: "rehearse", href: "/#build", label: "Rehearse a launch", short: "Rehearse" },
  { f: "check", href: "/check", label: "Check a token", short: "Check" },
  { f: "guess", href: "/guess", label: "Guess the graduation", short: "Guess" },
];

/** Big, always-visible switcher between the three tools. Sticky so it never hides. */
export default function FeatureNav({ active }: { active?: Feature }) {
  return (
    <nav aria-label="Dry Run tools" className="sticky top-3 z-30 mx-auto mb-8 w-full max-w-xl">
      <div className="dr-glass grid grid-cols-3 gap-1 rounded-full p-1.5">
        {ITEMS.map((it) => {
          const on = it.f === active;
          return (
            <Link
              key={it.f}
              href={it.href}
              aria-current={on ? "page" : undefined}
              className={`press group flex items-center justify-center gap-1.5 rounded-full px-2 py-2.5 text-[13px] font-semibold transition sm:gap-2 sm:text-sm ${
                on ? "bg-lime text-ink shadow-[0_0_24px_-4px_rgba(198,255,61,0.6)]" : "text-[#c9cddb] hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <FeatureIcon f={it.f} className={`h-4 w-4 shrink-0 ${on ? "" : "text-lime"}`} />
              <span className="sm:hidden">{it.short}</span>
              <span className="hidden sm:inline">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
