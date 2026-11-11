import { LOGO_LOCKUP } from "@/lib/brand";
import { updatedLabel } from "@/lib/token";

/** Footer for /check and /guess, matching the home page footer. */
export default function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-line pt-6 text-xs leading-relaxed text-mute">
      <div className="mb-3 flex items-center justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_LOCKUP} alt="Dry Run" className="h-6 w-auto opacity-80" />
        <span>
          Built by{" "}
          <a className="text-white underline" href="https://x.com/kelcrown" target="_blank" rel="noopener noreferrer">
            @kelcrown
          </a>
        </span>
      </div>
      <p>
        Independent tool, not affiliated with vibe/vibe or Robinhood. Data: official vibe/vibe testnet API, updated {updatedLabel()} (refreshed
        weekly). Testnet only, and test assets have no value. History, not a prediction. Not financial advice, and no rewards implied.
      </p>
    </footer>
  );
}
