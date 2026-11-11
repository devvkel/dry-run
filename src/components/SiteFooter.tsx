import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { VIBEVIBE_SITE } from "@/lib/options";
import { updatedLabel } from "@/lib/token";

const link = "transition hover:text-lime";

/** Footer shared by every page. */
export default function SiteFooter() {
  return (
    <footer className="relative mt-16 overflow-hidden rounded-[2rem] border border-line bg-panel/60 p-6 text-xs leading-relaxed text-mute sm:p-8">
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-lime/10 blur-3xl" />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Wordmark className="text-[36px]" />
          <p className="mt-3 text-sm text-[#c9cddb]">
            Rehearse it. Then <span className="font-semibold text-lime">run it.</span>
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-line px-2.5 py-1 text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" /> Built on Robinhood Chain testnet
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
          <div className="space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mute">Tools</div>
            <Link href="/#build" className={`block text-[#c9cddb] ${link}`}>Rehearse</Link>
            <Link href="/check" className={`block text-[#c9cddb] ${link}`}>Check a token</Link>
            <Link href="/guess" className={`block text-[#c9cddb] ${link}`}>Guess game</Link>
          </div>
          <div className="space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mute">Elsewhere</div>
            <a href="https://x.com/DryRunVibe" target="_blank" rel="noopener noreferrer" className={`block text-[#c9cddb] ${link}`}>@DryRunVibe</a>
            <a href="https://x.com/kelcrown" target="_blank" rel="noopener noreferrer" className={`block text-[#c9cddb] ${link}`}>Built by @kelcrown</a>
            <a href={VIBEVIBE_SITE} target="_blank" rel="noopener noreferrer" className={`block text-[#c9cddb] ${link}`}>vibe/vibe ↗</a>
          </div>
        </div>
      </div>
      <p className="mt-6 border-t border-line pt-5">
        Independent tool, not affiliated with vibe/vibe or Robinhood. Data: official vibe/vibe testnet API, updated {updatedLabel()} (refreshed
        weekly). Testnet only, and test assets have no value. History, not a prediction. Not financial advice, and no rewards implied.
      </p>
    </footer>
  );
}
