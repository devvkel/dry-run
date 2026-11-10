import type { Metadata } from "next";
import SetupForm from "@/components/SetupForm";
import ShareBar from "@/components/ShareBar";
import {
  AIRDROPS,
  BUYS,
  PAIRS,
  ROUTES,
  TAXES,
  fmtHours,
  headline,
  labelOf,
  parseQuery,
  queryString,
  runDryRun,
  setupLabel,
} from "@/lib/dryrun";
import { siteUrl } from "@/lib/site";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = parseQuery(await searchParams);
  const r = runDryRun(q);
  const h = headline(r);
  const qs = queryString(q);
  const title = `Dry Run: ${h.big} of launches like mine graduated`;
  const description = `${setupLabel(r.query)}. ${h.line} Rehearse your vibe/vibe launch before settings lock.`;
  const image = { url: `/api/og?${qs}`, width: 1200, height: 630, alt: title };
  return {
    title,
    description,
    alternates: { canonical: `/?${qs}` },
    openGraph: { title, description, url: `/?${qs}`, siteName: "Dry Run", images: [image], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
      <div className="text-[11px] uppercase tracking-[0.16em] text-mute">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-mute">{sub}</div>}
    </div>
  );
}

const pct = (x: number) => `${Math.round(x * 100)}%`;

export default async function Home({ searchParams }: Props) {
  const q = parseQuery(await searchParams);
  const r = runDryRun(q);
  const h = headline(r);
  const qs = queryString(q);
  const base = siteUrl();
  const shareUrl = `${base}/?${qs}`;
  const tweet = r.stats.n
    ? `I dry-ran my vibe/vibe launch: ${h.big} of real launches like mine graduated (${r.stats.graduated}/${r.stats.n}). Rehearse yours before settings lock 👇`
    : `I dry-ran my vibe/vibe launch and nobody has tried this setup yet. Rehearse yours before settings lock 👇`;
  const best = [...r.tweaks].sort((a, b) => b.rate - a.rate)[0];
  const rateTone = r.stats.rate >= 0.5 ? "text-lime" : r.stats.rate >= 0.3 ? "text-amber-300" : "text-rose-400";

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:py-12">
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-lime font-black text-ink">DR</div>
          <div>
            <div className="text-lg font-semibold leading-none tracking-tight">Dry Run</div>
            <div className="text-[11px] text-mute">for vibe/vibe creators</div>
          </div>
        </div>
        <span className="rounded-full border border-line px-3 py-1 text-[11px] text-mute">Robinhood Chain testnet</span>
      </header>

      <section className="mb-10 max-w-3xl">
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Your launch settings lock forever.
          <br />
          <span className="text-lime">Rehearse first.</span>
        </h1>
        <p className="mt-4 text-base text-mute sm:text-lg">
          Pick your setup. Dry Run shows how real vibe/vibe launches with the same setup actually did.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section className="rounded-3xl border border-line bg-panel/80 p-5 sm:p-6">
          <SetupForm query={r.requested} pairs={PAIRS} buys={BUYS.map(({ key, label }) => ({ key, label }))} taxes={TAXES} routes={ROUTES} airdrops={AIRDROPS} />
        </section>

        <section className="rounded-3xl border border-line bg-panel/80 p-5 sm:p-7">
          <div className="text-xs uppercase tracking-[0.18em] text-mute">Your dry run</div>
          <div className="mt-1 text-sm text-mute">{setupLabel(r.query)}</div>

          <div className="mt-5 flex items-end gap-4">
            <div className={`text-7xl font-bold leading-none tracking-tighter tabular-nums sm:text-8xl ${rateTone}`}>{h.big}</div>
            <div className="pb-2 text-sm text-mute">graduated</div>
          </div>
          <p className="mt-4 text-xl font-medium leading-snug sm:text-2xl">{h.line}</p>
          {r.stats.n > 0 && (
            <p className="mt-2 text-sm text-mute">
              {r.lift >= 1 ? (
                <>
                  That&apos;s <span className="text-lime">{r.lift.toFixed(1)}×</span> the vibe/vibe average ({pct(r.baseRate)}).
                </>
              ) : (
                <>
                  That&apos;s below the vibe/vibe average of {pct(r.baseRate)} ({r.lift.toFixed(1)}×).
                </>
              )}
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Median time" value={fmtHours(r.stats.medianHours)} sub="to graduate" />
            <Stat
              label="Fast / slow"
              value={r.stats.graduated ? `${fmtHours(r.stats.p25Hours)}` : "—"}
              sub={r.stats.graduated ? `to ${fmtHours(r.stats.p75Hours)} (middle half)` : undefined}
            />
            <Stat label="Holders" value={r.stats.medianHoldersGrad ? `${Math.round(r.stats.medianHoldersGrad)}` : "—"} sub="median, graduates" />
            <Stat label="Stalled at" value={r.stats.n - r.stats.graduated ? `${Math.round(r.stats.medianProgressStuck)}%` : "—"} sub="median curve, the rest" />
          </div>

          {best && best.key !== r.query.buy && best.rate > r.stats.rate + 0.03 && (
            <div className="mt-5 rounded-2xl border border-lime/30 bg-lime/[0.06] p-4 text-sm">
              <span className="font-semibold text-lime">Try instead:</span> with a <b>{best.label}</b> opening buy, {pct(best.rate)} of
              similar launches graduated ({best.n.toLocaleString("en-US")} launches).
            </div>
          )}

          {r.lowSample && r.stats.n > 0 && (
            <p className="mt-4 text-xs text-amber-300/90">
              Small sample: only {r.stats.n} mature launches match. Treat this as a rough signal.
            </p>
          )}

          {r.relaxed.length > 0 && (
            <p className="mt-4 text-xs text-amber-300/90">
              Too few exact matches, so we widened: {r.relaxed.map((k) => (k === "route" ? "routing" : k)).join(", ")} set to “any”.
            </p>
          )}

          <div className="mt-6">
            <ShareBar shareUrl={shareUrl} ogUrl={`/api/og?${qs}`} tweet={tweet} />
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-mute">
            Based on {r.stats.n.toLocaleString("en-US")} real launches (3+ days old) from the official vibe/vibe API. Past results, not a
            prediction or a guarantee.
          </p>
        </section>
      </div>

      {r.tweaks.length > 1 && (
        <section className="mt-6 rounded-3xl border border-line bg-panel/80 p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Opening buy vs. graduation · {labelOf(PAIRS, r.query.pair)} pair</h2>
          <div className="mt-4 space-y-2.5">
            {r.tweaks.map((t) => (
              <div key={t.key} className="flex items-center gap-3 text-sm">
                <div className={`w-32 shrink-0 ${t.key === r.query.buy ? "font-semibold text-lime" : "text-mute"}`}>{t.label}</div>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className={`h-full rounded-full ${t.key === r.query.buy ? "bg-lime" : "bg-white/25"}`}
                    style={{ width: `${Math.max(2, t.rate * 100)}%` }}
                  />
                </div>
                <div className="w-12 text-right tabular-nums">{pct(t.rate)}</div>
                <div className="hidden w-24 text-right text-xs text-mute sm:block">{t.n.toLocaleString("en-US")} launches</div>
              </div>
            ))}
          </div>
          {r.taxTweaks.length > 1 && (
            <p className="mt-4 text-sm text-mute">
              By tax:{" "}
              {r.taxTweaks.map((t, i) => (
                <span key={t.key}>
                  {i > 0 && " · "}
                  <span className="text-white">{t.label}</span> {pct(t.rate)}
                </span>
              ))}
            </p>
          )}
        </section>
      )}

      {r.examples.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Real launches like yours</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {r.examples.map((e) => (
              <a
                key={e.token}
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-line bg-panel/80 p-4 transition hover:border-lime/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold group-hover:text-lime">{e.name || e.symbol}</div>
                    <div className="text-xs text-mute">
                      ${e.symbol} · {e.pairLabel} pair
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      e.graduated ? "bg-lime/15 text-lime" : "bg-white/5 text-mute"
                    }`}
                  >
                    {e.graduated ? `Graduated · ${fmtHours(e.hours ?? 0)}` : `Stalled · ${Math.round(e.progressPct)}%`}
                  </span>
                </div>
                <div className="mt-3 flex gap-4 text-xs text-mute">
                  <span>{e.holders.toLocaleString("en-US")} holders</span>
                  <span>{e.buyPct ? `${e.buyPct.toFixed(1)}% opening buy` : "no opening buy"}</span>
                  <span>{e.taxPct}% tax</span>
                </div>
                <div className="mt-2 text-[11px] text-mute/70">
                  vibe/vibe page ↗ ·{" "}
                  <span className="underline decoration-dotted">{e.token.slice(0, 6)}…{e.token.slice(-4)}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-12 border-t border-line pt-6 text-xs leading-relaxed text-mute">
        <p>
          <b className="text-white">About.</b> Dry Run is an independent tool for vibe/vibe creators on Robinhood Chain testnet. It reads{" "}
          {r.meta.count.toLocaleString("en-US")} real V6 launches from the official vibe/vibe API (snapshot{" "}
          {new Date(r.meta.builtAt).toUTCString().slice(5, 22)} UTC) and compares them by pair, opening buy, tax, tax routing and
          airdrop. Graduation = the bonding curve filled and liquidity moved to a locked pool. Rates only count launches at least 3 days
          old. History shows what happened, not what will happen. Not financial advice, no rewards implied. Built by{" "}
          <a className="underline" href="https://x.com/kelcrown" target="_blank" rel="noopener noreferrer">
            @kelcrown
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
