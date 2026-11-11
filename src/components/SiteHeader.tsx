import Link from "next/link";
import FeatureNav, { type Feature } from "@/components/FeatureNav";
import { LOGO_MARK } from "@/lib/brand";
import { VIBEVIBE_SITE } from "@/lib/options";

/** Header used on every page: the real logo, testnet pill, a launch link, then the big tool switcher. */
export default function SiteHeader({ active, nav = true }: { active?: Feature; nav?: boolean }) {
  return (
    <>
      <header className="mb-6 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Dry Run home" className="press group flex items-center gap-2.5 rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_MARK} alt="" width={36} height={36} className="h-8 w-8 rounded-[10px] shadow-[0_0_20px_-4px_rgba(198,255,61,0.55)] transition group-hover:shadow-[0_0_28px_-2px_rgba(198,255,61,0.7)] sm:h-9 sm:w-9" />
          <span className="text-[15px] font-bold tracking-tight text-white sm:text-base">Dry Run</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-white/[0.03] px-2.5 py-2 text-[11px] text-mute sm:gap-2 sm:px-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
            </span>
            <span className="sm:hidden">Testnet</span>
            <span className="hidden sm:inline">Robinhood Chain testnet</span>
          </div>
        <a
          href={VIBEVIBE_SITE}
          target="_blank"
          rel="noopener noreferrer"
          className="press whitespace-nowrap rounded-full border border-line bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-[#c9cddb] transition hover:border-lime/60 hover:text-white"
        >
          vibe/vibe ↗
        </a>
        </div>
      </header>
      {nav && <FeatureNav active={active} />}
    </>
  );
}
