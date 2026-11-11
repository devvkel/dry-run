import Link from "next/link";
import FeatureNav, { type Feature } from "@/components/FeatureNav";
import Wordmark from "@/components/Wordmark";
import { VIBEVIBE_SITE } from "@/lib/options";

/** Header used on every page: bold wordmark, a launch link, then the big tool switcher. */
export default function SiteHeader({ active, showMark = true, nav = true }: { active?: Feature; showMark?: boolean; nav?: boolean }) {
  return (
    <>
      <header className="mb-6 flex items-center justify-between gap-3">
        {showMark ? (
          <Link href="/" aria-label="Dry Run home" className="press rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
            <Wordmark className="text-[40px] sm:text-[48px]" />
          </Link>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-[11px] text-mute">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
            </span>
            Robinhood Chain testnet
          </div>
        )}
        <a
          href={VIBEVIBE_SITE}
          target="_blank"
          rel="noopener noreferrer"
          className="press whitespace-nowrap rounded-full border border-line bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-[#c9cddb] transition hover:border-lime/60 hover:text-white"
        >
          vibe/vibe ↗
        </a>
      </header>
      {nav && <FeatureNav active={active} />}
    </>
  );
}
