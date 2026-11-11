import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import { LOGO_LOCKUP } from "@/lib/brand";
import { VIBEVIBE_SITE } from "@/lib/options";

/** Same header as the home page, used on /check and /guess. */
export default function SiteHeader({ active }: { active?: "check" | "guess" }) {
  return (
    <header className="mb-8 flex items-center justify-between gap-3">
      <Link href="/" aria-label="Dry Run home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_LOCKUP} alt="Dry Run" className="h-8 w-auto sm:h-9" />
      </Link>
      <nav className="flex items-center gap-1.5 sm:gap-2">
        <NavLinks active={active} />
        <a href={VIBEVIBE_SITE} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-xs text-mute transition hover:border-lime/60 hover:text-white">
          vibe/vibe ↗
        </a>
      </nav>
    </header>
  );
}
