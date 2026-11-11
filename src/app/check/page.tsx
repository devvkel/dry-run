import type { Metadata } from "next";
import Link from "next/link";
import FocusFx from "@/components/FocusFx";
import Reveal from "@/components/Reveal";
import ShareBar from "@/components/ShareBar";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { BEST_MIN, fmtHours, guessPool } from "@/lib/dryrun";
import { ROUTES, VIBEVIBE_X, labelOf, queryString, type SP } from "@/lib/options";
import { siteUrl } from "@/lib/site";
import { checkToken, fmtPct, lookupToken, parseAddress, updatedLabel, type TokenInfo } from "@/lib/token";

type Props = { searchParams: Promise<SP> };
const pct = (x: number) => `${Math.round(x * 100)}%`;
const one = (v: SP[string]) => (Array.isArray(v) ? v[0] : v) ?? "";
/** Server-rendered per request, so wall-clock age is fine here. */
function daysSince(t: number) {
  return Math.max(0, (Date.now() / 1000 - t) / 86400);
}
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

function chips(i: TokenInfo) {
  return [
    `${i.pairLabel} pair`,
    i.buyBps ? `${fmtPct(i.buyBps)} opening buy` : "No opening buy",
    `${i.taxBps / 100}% tax`,
    `To ${labelOf(ROUTES, i.routing).toLowerCase()}`,
    i.airdrop ? "Airdrop" : "No airdrop",
  ];
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const addr = parseAddress(one((await searchParams).token));
  const base = { title: "Check a token · Dry Run", description: "Paste any vibe/vibe launch and see how its real setup ranks against every launch like it." };
  if (!addr) {
    const image = { url: "/api/og/check", width: 1200, height: 630, alt: base.title };
    return { ...base, openGraph: { ...base, images: [image], siteName: "Dry Run" }, twitter: { card: "summary_large_image", ...base, images: [image] } };
  }
  const l = await lookupToken(addr);
  if (l.kind !== "ok") return base;
  const { r } = checkToken(l.info);
  const title = `$${l.info.symbol} setup check: ${pct(r.stats.rate)} of ${r.stats.n.toLocaleString("en-US")} launches like it graduated`;
  const description = "Real vibe/vibe testnet data. Check any token's setup on Dry Run.";
  const image = { url: `/api/og/check?token=${addr}`, width: 1200, height: 630, alt: title };
  return { title, description, openGraph: { title, description, images: [image], siteName: "Dry Run", url: `/check?token=${addr}` }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white/[0.02] p-3.5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-mute">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] leading-snug text-mute">{sub}</div>}
    </div>
  );
}

/** A few real tokens to try, straight from the dataset. */
function samples() {
  const { grads, rest } = guessPool();
  const big = [...grads].sort((a, b) => b[11] - a[11]).find((r) => r[3] === "eth");
  const fast = [...grads].filter((r) => r[11] >= 50 && r[0] !== big?.[0]).sort((a, b) => a[6] - a[5] - (b[6] - b[5]))[0];
  const close = [...rest].sort((a, b) => b[13] - a[13] || b[5] - a[5])[0];
  return [big, fast, close].filter(Boolean).map((r) => ({ token: r![0], label: `$${r![2]}` }));
}

function Notice({ tone, title, body }: { tone: "warn" | "err"; title: string; body: string }) {
  return (
    <div className={`dr-pop mt-6 rounded-3xl border p-5 ${tone === "warn" ? "border-amber-300/40 bg-amber-300/[0.06]" : "border-rose-400/40 bg-rose-400/[0.06]"}`}>
      <div className="font-semibold">{title}</div>
      <p className="mt-1 text-sm text-mute">{body}</p>
    </div>
  );
}

export default async function CheckPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = one(sp.token).trim();
  const addr = parseAddress(raw);
  const lookup = addr ? await lookupToken(addr) : null;
  const base = siteUrl();

  let result: React.ReactNode = null;
  if (raw && !addr) {
    result = <Notice tone="warn" title="That doesn't look like a token address" body="Paste a 0x… address (42 characters) or a vibe/vibe token link like testnet.vibevibe.fun/token/0x…" />;
  } else if (lookup?.kind === "notfound") {
    result = <Notice tone="warn" title="No vibe/vibe launch at that address" body="We couldn't find a V6 launch with this address on Robinhood Chain testnet. Double-check it's the token address, not a wallet or a transaction." />;
  } else if (lookup?.kind === "error") {
    result = <Notice tone="err" title="Couldn't reach vibe/vibe right now" body="The vibe/vibe API didn't answer and this token isn't in our snapshot yet. Try again in a minute." />;
  } else if (lookup?.kind === "ok") {
    const i = lookup.info;
    const { q, r, rank } = checkToken(i);
    const rate = Math.round(r.stats.rate * 100);
    const tone = r.lowSample ? "text-mute" : r.stats.rate >= 0.5 ? "text-lime" : r.stats.rate >= 0.3 ? "text-amber-300" : "text-rose-400";
    const grad = i.graduatedAt > 0;
    const ageDays = daysSince(i.created);
    const shareUrl = `${base}/check?token=${i.token}`;
    const tweet = `I checked $${i.symbol} on Dry Run: ${pct(r.stats.rate)} of ${r.stats.n.toLocaleString("en-US")} real @${VIBEVIBE_X} launches with the same setup graduated${grad ? ", and this one did 🎓" : ""}. Check any token 👇`;
    result = (
      <section id="result" className="mt-6 scroll-mt-4">
        <div data-focus className="relative overflow-hidden rounded-[2rem] border border-lime/25 bg-gradient-to-b from-[#121626] to-panel p-5 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lime/10 blur-3xl" />
          <div className="flex items-center gap-3">
            {i.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={i.image} alt="" width={48} height={48} className="h-12 w-12 rounded-xl border border-line object-cover" />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-violet-500/30 font-bold">{(i.symbol || "?")[0]}</div>
            )}
            <div className="min-w-0">
              <div className="truncate font-semibold">
                {i.name} <span className="text-lime">${i.symbol}</span>
              </div>
              <div className="text-xs text-mute">
                <a href={i.url} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  vibe/vibe ↗
                </a>{" "}
                ·{" "}
                <a href={i.explorer} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  {short(i.token)} ↗
                </a>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {chips(i).map((c) => (
              <span key={c} className="rounded-full border border-line bg-white/[0.04] px-2.5 py-1 text-[11px] text-mute">
                {c}
              </span>
            ))}
          </div>

          {/* This token's own outcome */}
          <div className={`mt-5 rounded-2xl border p-4 ${grad ? "border-lime/40 bg-lime/[0.07]" : "border-line bg-white/[0.02]"}`}>
            <div className="text-[10px] uppercase tracking-[0.16em] text-mute">This token</div>
            {grad ? (
              <div className="mt-1 text-lg font-semibold">
                🎓 Graduated <span className="text-lime">in {fmtHours((i.graduatedAt - i.created) / 3600)}</span>
              </div>
            ) : (
              <>
                <div className="mt-1 text-lg font-semibold">
                  Not graduated yet · <span className="tabular-nums">{Math.round(i.progressPct)}%</span> <span className="text-sm font-normal text-mute">of the curve filled</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="dr-grow h-full rounded-full bg-lime" style={{ width: `${Math.max(2, i.progressPct)}%` }} />
                </div>
              </>
            )}
            <div className="mt-1.5 text-xs text-mute">
              Launched {ageDays < 1 ? `${Math.max(1, Math.round(ageDays * 24))} h` : `${ageDays.toFixed(ageDays < 10 ? 1 : 0)} days`} ago
              {i.holders != null ? ` · ${i.holders.toLocaleString("en-US")} holders (as of ${updatedLabel()})` : ""}
              {i.source === "snapshot" ? ` · from our ${updatedLabel()} snapshot` : " · live from vibe/vibe"}
            </div>
          </div>

          {/* How the same setup did */}
          <div className="mt-6 text-[10px] uppercase tracking-[0.16em] text-mute">Launches with this setup</div>
          <div className="mt-1 flex items-end gap-3">
            <div className="text-[5rem] font-bold leading-none tracking-tighter sm:text-[7rem]">
              {r.stats.n ? <Reveal pct={rate} tone={tone} celebrate={false} runKey={i.token} /> : <span className="text-mute">—</span>}
            </div>
            <div className="pb-3 text-sm text-mute">
              graduated
              <br />
              {r.stats.graduated.toLocaleString("en-US")} of {r.stats.n.toLocaleString("en-US")}
            </div>
          </div>
          {r.lowSample && r.stats.n > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">⚠️ Small sample: {r.stats.n} launches</div>
          )}
          {r.stats.n > 0 && (
            <p className="mt-2 text-sm text-mute">
              {r.lift >= 1 ? (
                <>
                  That&apos;s <span className="text-lime">{r.lift.toFixed(1)}×</span> the vibe/vibe average ({pct(r.baseRate)}).
                </>
              ) : (
                <>Below the vibe/vibe average of {pct(r.baseRate)}.</>
              )}
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Stat
              label="Setup rank"
              value={rank.rank ? `#${rank.rank}` : "—"}
              sub={rank.rank ? `of ${rank.total} setups (${BEST_MIN}+ launches)` : `fewer than ${BEST_MIN} launches, not ranked`}
            />
            <Stat label="Median time" value={fmtHours(r.stats.medianHours)} sub="to graduate" />
            <Stat label="Holders" value={r.stats.medianHoldersGrad ? Math.round(r.stats.medianHoldersGrad).toLocaleString("en-US") : "—"} sub="median, graduates" />
            <Stat label="The rest stalled" value={r.stats.n - r.stats.graduated ? `${Math.round(r.stats.medianProgressStuck)}%` : "—"} sub="median curve filled" />
          </div>
          <p className="mt-3 text-[11px] text-mute">Rank compares pair + opening-buy range + tax across all real setups.</p>
          {r.relaxed.length > 0 && (
            <p className="mt-2 text-xs text-amber-300/90">Too few exact matches, so we widened {r.relaxed.map((k) => (k === "route" ? "routing" : k)).join(", ")} to “any”.</p>
          )}

          <div className="mt-6">
            <ShareBar shareUrl={shareUrl} ogUrl={`/api/og/check?token=${i.token}`} tweet={tweet} filename={`dry-run-check-${i.symbol.toLowerCase().replace(/[^a-z0-9]/g, "") || "token"}.png`} />
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-mute">
            Based on {r.stats.n.toLocaleString("en-US")} real launches (3+ days old), data updated {updatedLabel()}. Past results, not a guarantee.
          </p>
        </div>

        <Link
          data-focus
          href={`/?${queryString(q)}#result`}
          className="press mt-4 flex w-full items-center justify-center rounded-full border border-lime/60 px-5 py-3 text-sm font-semibold text-lime transition hover:bg-lime hover:text-ink"
        >
          Rehearse a variation of this setup →
        </Link>
      </section>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-10 pt-5 sm:px-6 sm:pt-8">
      <SiteHeader active="check" />
      <section>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[11px] text-mute">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" /> Data updated {updatedLabel()}
        </div>
        <h1 className="text-[2.4rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl">
          Check a token.
          <br />
          <span className="text-lime">See how its setup really did.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-mute">Paste any vibe/vibe launch. We pull its real settings and stack them against every launch with the same setup.</p>
        <form action="/check" method="get" className="mt-6 flex flex-col gap-2 sm:flex-row">
          <input
            name="token"
            defaultValue={raw}
            placeholder="0x… or testnet.vibevibe.fun/token/0x…"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-full border border-line bg-panel px-5 py-3.5 font-mono text-sm outline-none transition placeholder:text-mute/70 focus:border-lime/70"
          />
          <button type="submit" className="rounded-full bg-lime px-6 py-3.5 text-sm font-bold text-ink shadow-[0_0_40px_rgba(198,255,61,0.2)]">
            Check it →
          </button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-mute">
          Try a real one:
          {samples().map((s) => (
            <Link key={s.token} href={`/check?token=${s.token}#result`} className="rounded-full border border-line px-2.5 py-1 transition hover:border-lime/60 hover:text-white">
              {s.label}
            </Link>
          ))}
        </div>
      </section>

      {result}

      <FocusFx key={`fx-${addr ?? "none"}`} />
      <SiteFooter />
    </main>
  );
}
