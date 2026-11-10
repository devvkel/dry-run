import type { Metadata } from "next";
import Link from "next/link";
import Builder from "@/components/Builder";
import FocusFx from "@/components/FocusFx";
import Reveal from "@/components/Reveal";
import ShareBar from "@/components/ShareBar";
import { LOGO_LOCKUP } from "@/lib/brand";
import { BEST_MIN, bestForPair, fmtHours, globalStats, headline, pairLabel, runDryRun, setupRankings, type SetupStat } from "@/lib/dryrun";
import { BUYS, VIBEVIBE_SITE, VIBEVIBE_X, labelOf, parsePersona, parseQuery, queryString, setupChips, type SP } from "@/lib/options";
import { siteUrl } from "@/lib/site";

type Props = { searchParams: Promise<SP> };

const pct = (x: number) => `${Math.round(x * 100)}%`;
const hasRun = (sp: SP) => typeof sp.pair === "string" && !sp.pre;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  if (!hasRun(sp)) {
    const title = "Dry Run: rehearse your vibe/vibe launch before it's real";
    const description = "Launch settings lock forever. Dry Run shows how real vibe/vibe launches like yours actually did. Free, testnet, no wallet needed.";
    const image = { url: "/api/og", width: 1200, height: 630, alt: title };
    return { title, description, openGraph: { title, description, images: [image], siteName: "Dry Run" }, twitter: { card: "summary_large_image", title, description, images: [image] } };
  }
  const q = parseQuery(sp);
  const who = parsePersona(sp);
  const r = runDryRun(q);
  const qs = queryString(q, who);
  const subject = who.ticker ? `$${who.ticker}` : who.name || "my launch";
  const title = `${who.handle ? `@${who.handle}` : "I"} dry-ran ${subject}: ${r.personality.title} ${r.personality.emoji}`;
  const description = `${pct(r.stats.rate)} of ${r.stats.n.toLocaleString("en-US")} real vibe/vibe launches like this graduated. Rehearse yours before settings lock.`;
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
    <div className="rounded-2xl border border-line bg-white/[0.02] p-3.5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-mute">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] leading-snug text-mute">{sub}</div>}
    </div>
  );
}

const setupName = (x: SetupStat) => `${pairLabel(x.pair)} · ${x.buy === "none" ? "no buy" : `${labelOf(BUYS, x.buy)} buy`} · ${x.tax}% tax`;
const setupHref = (x: SetupStat, extra = "") => `/?${new URLSearchParams({ pair: x.pair, buy: x.buy, tax: x.tax })}${extra}`;

function SetupRow({ x, rank, badge }: { x: SetupStat; rank: number; badge: string }) {
  return (
    <Link data-focus href={setupHref(x, "&pre=1#build")} className="flex items-center gap-3 rounded-2xl border border-line bg-panel/80 p-3.5 transition hover:border-lime/50 active:scale-[0.99]">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.06] text-xs font-bold text-mute">{rank}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{setupName(x)}</div>
        <div className="text-[11px] text-mute">
          {x.n.toLocaleString("en-US")} launches · {badge}
        </div>
      </div>
      <div className="text-right">
        <div className={`text-lg font-bold tabular-nums ${x.rate >= 0.5 ? "text-lime" : x.rate >= 0.3 ? "text-amber-300" : "text-rose-400"}`}>{pct(x.rate)}</div>
        <div className="text-[10px] text-mute">graduated</div>
      </div>
    </Link>
  );
}

function LaunchForReal({ className = "" }: { className?: string }) {
  return (
    <a
      href={VIBEVIBE_SITE}
      target="_blank"
      rel="noopener noreferrer"
      className={`press inline-flex items-center justify-center gap-2 rounded-full border border-lime/60 px-5 py-3 text-sm font-semibold text-lime transition hover:bg-lime hover:text-ink ${className}`}
    >
      Ready for real? Launch on vibe/vibe ↗
    </a>
  );
}

const FAQ: [string, string][] = [
  ["Does this launch a token?", "No. Dry Run is a rehearsal. Nothing is created, no wallet is connected and nothing is signed. When you're ready, you launch on vibe/vibe yourself."],
  ["Where do the numbers come from?", "Every V6 launch on the official vibe/vibe testnet API (about 24,000 of them). We group the ones with the same pair, opening buy, tax, routing and airdrop as yours and count what happened."],
  ["Is it a prediction?", "No. It's history: how launches like yours did. Your meme, community and timing matter more than any setting. Not a guarantee and not financial advice."],
  ["Why only launches 3+ days old?", "Brand-new launches haven't had time to graduate yet, so counting them would make every setup look worse than it is."],
  ["What does “graduated” mean?", "The bonding curve filled up and liquidity moved to a locked Uniswap v4 pool on vibe/vibe."],
  ["What's the personality title?", "Just for fun. It's picked from your setup and your result, so the same setup always gets the same title."],
];

export default async function Home({ searchParams }: Props) {
  const sp = await searchParams;
  const ran = hasRun(sp);
  const q = parseQuery(sp);
  const who = parsePersona(sp);
  const g = globalStats();
  const r = runDryRun(q);
  const h = headline(r);
  const qs = queryString(q, who);
  const base = siteUrl();
  const shareUrl = `${base}/?${qs}`;
  const runKey = typeof sp.t === "string" ? sp.t : qs;
  const P = r.personality;
  const subject = who.ticker ? `$${who.ticker}` : who.name ? who.name : "my launch";
  const article = /^[AEIOU]/.test(P.title) ? "an" : "a";
  const tweet = r.stats.n
    ? `I dry-ran ${subject} on @${VIBEVIBE_X}: I'm ${article} ${P.title} ${P.emoji} (${pct(r.stats.rate)} of launches like mine graduated). Dry run yours 👇`
    : `I dry-ran ${subject} on @${VIBEVIBE_X}: I'm ${article} ${P.title} ${P.emoji}. Nobody's tried my setup yet. Dry run yours 👇`;
  const best = [...r.tweaks].filter((t) => t.n >= 25).sort((a, b) => b.rate - a.rate)[0];
  const rate = Math.round(r.stats.rate * 100);
  const tone = r.lowSample ? "text-mute" : r.stats.rate >= 0.5 ? "text-lime" : r.stats.rate >= 0.3 ? "text-amber-300" : "text-rose-400";
  const rankings = setupRankings();
  const top = bestForPair(r.query.pair);
  const sameAsTop = !!top && top.buy === r.query.buy && top.tax === r.query.tax;
  const persona = queryString(q, who).split("&").filter((kv) => /^(name|ticker|x)=/.test(kv)).join("&");

  const result = ran && (
    <section id="result" className="scroll-mt-4">
      <div data-focus className="relative overflow-hidden rounded-[2rem] border border-lime/25 bg-gradient-to-b from-[#121626] to-panel p-5 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lime/10 blur-3xl" />
        <div className="flex items-center gap-3">
          {who.handle ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`https://unavatar.io/x/${who.handle}`} alt="" width={44} height={44} className="h-11 w-11 rounded-full border border-line object-cover" />
          ) : (
            <div className="grid h-11 w-11 place-items-center rounded-full bg-violet-500/30 font-bold">{(who.name || "D")[0].toUpperCase()}</div>
          )}
          <div className="min-w-0">
            <div className="truncate font-semibold">
              {who.name || "Your pretend launch"} {who.ticker && <span className="text-lime">${who.ticker}</span>}
            </div>
            <div className="text-xs text-mute">{who.handle ? `@${who.handle} · ` : ""}rehearsal, nothing launched</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {setupChips(r.requested).map((c) => (
            <span key={c} className="rounded-full border border-line bg-white/[0.04] px-2.5 py-1 text-[11px] text-mute">
              {c}
            </span>
          ))}
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-lime px-4 py-1.5 text-sm font-bold text-ink">
          <span>{P.emoji}</span> {P.title}
        </div>
        <p className="mt-2 text-sm italic text-mute">“{P.tagline}”</p>

        <div className="mt-5 flex items-end gap-3">
          <div className="text-[5.5rem] font-bold leading-none tracking-tighter sm:text-[8rem]">
            <Reveal pct={rate} tone={tone} celebrate={!r.lowSample && r.stats.rate >= 0.45} runKey={runKey} />
          </div>
          <div className="pb-3 text-sm text-mute">
            of launches
            <br />
            like yours graduated
          </div>
        </div>
        {r.lowSample && r.stats.n > 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
            ⚠️ Small sample: {r.stats.n} launches
          </div>
        )}
        <p className="mt-3 text-lg font-medium leading-snug sm:text-2xl">{h.line}</p>
        {r.stats.n > 0 && (
          <p className="mt-1.5 text-sm text-mute">
            {r.lift >= 1 ? (
              <>
                That&apos;s <span className="text-lime">{r.lift.toFixed(1)}×</span> the vibe/vibe average ({pct(r.baseRate)}).
              </>
            ) : (
              <>Below the vibe/vibe average of {pct(r.baseRate)}. Underdogs win too, but plan your community push.</>
            )}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Stat label="Median time" value={fmtHours(r.stats.medianHours)} sub="to graduate" />
          <Stat label="Middle half" value={r.stats.graduated ? fmtHours(r.stats.p25Hours) : "—"} sub={r.stats.graduated ? `to ${fmtHours(r.stats.p75Hours)}` : undefined} />
          <Stat label="Holders" value={r.stats.medianHoldersGrad ? `${Math.round(r.stats.medianHoldersGrad).toLocaleString("en-US")}` : "—"} sub="median, graduates" />
          <Stat label="The rest stalled" value={r.stats.n - r.stats.graduated ? `${Math.round(r.stats.medianProgressStuck)}%` : "—"} sub="median curve filled" />
        </div>

        {best && best.key !== r.query.buy && best.rate > r.stats.rate + 0.03 && (
          <div className="mt-4 rounded-2xl border border-lime/30 bg-lime/[0.06] p-4 text-sm">
            💡 <span className="font-semibold text-lime">Try instead:</span>{" "}
            {best.key === "none" ? "no opening buy" : <>a <b>{best.label}</b> opening buy</>}. {pct(best.rate)} of similar launches graduated (
            {best.n.toLocaleString("en-US")} launches).
          </div>
        )}
        {r.lowSample && r.stats.n > 0 && (
          <p className="mt-3 text-xs text-amber-300/90">Small sample: only {r.stats.n} launches match. Treat it as a rough signal.</p>
        )}
        {r.relaxed.length > 0 && (
          <p className="mt-3 text-xs text-amber-300/90">
            Too few exact matches, so we widened {r.relaxed.map((k) => (k === "route" ? "routing" : k)).join(", ")} to “any”.
          </p>
        )}

        <div className="mt-6">
          <ShareBar shareUrl={shareUrl} ogUrl={`/api/og?${qs}`} tweet={tweet} filename={`dry-run-${(who.ticker || "card").toLowerCase()}.png`} />
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-mute">
          Based on {r.stats.n.toLocaleString("en-US")} real launches (3+ days old). This is a rehearsal: no token was launched. Past results,
          not a guarantee.
        </p>
      </div>

      <div data-focus className="mt-4 rounded-3xl border border-dashed border-lime/30 p-5 text-center">
        <div className="text-sm text-mute">Liked your dry run?</div>
        <LaunchForReal className="mt-3 w-full sm:w-auto" />
      </div>

      {top && (
        <div data-focus className="mt-4 rounded-3xl border border-line bg-panel/80 p-5 sm:p-7">
          <h3 className="font-semibold">Compare · best {pairLabel(r.query.pair)} setup</h3>
          <p className="mt-1 text-xs text-mute">Highest graduation rate for this pair among setups with {BEST_MIN}+ real launches (pair + opening buy + tax).</p>
          {sameAsTop ? (
            <p className="mt-4 rounded-2xl border border-lime/30 bg-lime/[0.06] p-4 text-sm">🏆 You&apos;re already on the top setup for this pair.</p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-2 text-sm">
                <div />
                <div className="rounded-xl bg-white/[0.04] px-3 py-2 text-center text-xs font-semibold text-mute">Yours</div>
                <div className="rounded-xl bg-lime/10 px-3 py-2 text-center text-xs font-semibold text-lime">Best</div>
                <div className="self-center text-xs text-mute">Setup</div>
                <div className="text-center text-xs">{setupChips(r.query).slice(1).join(" · ") || "Any"}</div>
                <div className="text-center text-xs">{setupName(top).split(" · ").slice(1).join(" · ")}</div>
                {(
                  [
                    ["Graduated", pct(r.stats.rate), pct(top.rate)],
                    ["Median time", fmtHours(r.stats.medianHours), fmtHours(top.medianHours)],
                    ["Holders", r.stats.medianHoldersGrad ? Math.round(r.stats.medianHoldersGrad).toLocaleString("en-US") : "—", top.medianHolders ? Math.round(top.medianHolders).toLocaleString("en-US") : "—"],
                    ["Launches", r.stats.n.toLocaleString("en-US"), top.n.toLocaleString("en-US")],
                  ] as const
                ).map(([k, a, b]) => (
                  <div key={k} className="contents">
                    <div className="self-center text-xs text-mute">{k}</div>
                    <div className="text-center text-lg font-semibold tabular-nums">{a}</div>
                    <div className="text-center text-lg font-semibold tabular-nums text-lime">{b}</div>
                  </div>
                ))}
              </div>
              <Link
                href={`${setupHref(top)}${persona ? `&${persona}` : ""}#result`}
                className="press mt-5 flex w-full items-center justify-center rounded-full bg-lime px-5 py-3 text-sm font-bold text-ink transition active:scale-95"
              >
                Try that setup →
              </Link>
            </>
          )}
        </div>
      )}

      {r.tweaks.length > 1 && (
        <div data-focus className="mt-4 rounded-3xl border border-line bg-panel/80 p-5 sm:p-7">
          <h3 className="font-semibold">Opening buy vs. graduation · {pairLabel(r.query.pair)} pair</h3>
          <div className="mt-4 space-y-2.5">
            {r.tweaks.map((t) => (
              <div key={t.key} className="flex items-center gap-3 text-sm">
                <div className={`w-20 shrink-0 sm:w-28 ${t.key === r.query.buy ? "font-semibold text-lime" : "text-mute"}`}>{t.label}</div>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <div className={`h-full rounded-full ${t.key === r.query.buy ? "bg-lime" : "bg-white/25"}`} style={{ width: `${Math.max(2, t.rate * 100)}%` }} />
                </div>
                <div className="w-10 text-right tabular-nums">{pct(t.rate)}</div>
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
        </div>
      )}

      {r.examples.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-3 font-semibold">Real launches like yours</h3>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {r.examples.map((e) => (
              <a data-focus key={e.token} href={e.url} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-line bg-panel/80 p-4 transition hover:border-lime/50">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold group-hover:text-lime">{e.name || e.symbol}</div>
                    <div className="text-xs text-mute">
                      ${e.symbol} · {e.pairLabel} pair
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${e.graduated ? "bg-lime/15 text-lime" : "bg-white/5 text-mute"}`}>
                    {e.graduated ? `🎓 ${fmtHours(e.hours ?? 0)}` : `Stalled ${Math.round(e.progressPct)}%`}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mute">
                  <span>{e.holders.toLocaleString("en-US")} holders</span>
                  <span>{e.buyPct ? `${e.buyPct.toFixed(1)}% opening buy` : "no opening buy"}</span>
                  <span>{e.taxPct}% tax</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );

  const how = (
    <section className="grid gap-3 sm:grid-cols-3">
      {[
        ["🧪", "Build a pretend launch", "Name, ticker, pair, opening buy, tax, routing and airdrop. Takes 30 seconds."],
        ["📊", "We replay real history", `We match your setup against ${g.launches.toLocaleString("en-US")} real vibe/vibe launches and count what happened.`],
        ["🃏", "Get your card", "Your odds, your launch personality and a card made to share. Then launch for real if you like it."],
      ].map(([icon, t, d], i) => (
        <div data-focus key={t} className="rounded-3xl border border-line bg-panel/80 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-mute">
            <span className="text-lime">0{i + 1}</span> · {icon}
          </div>
          <div className="mt-2 text-lg font-semibold">{t}</div>
          <p className="mt-1 text-sm text-mute">{d}</p>
        </div>
      ))}
    </section>
  );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-10 pt-5 sm:px-6 sm:pt-8 lg:max-w-5xl">
      <header className="mb-8 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Dry Run home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_LOCKUP} alt="Dry Run" className="h-8 w-auto sm:h-9" />
        </Link>
        <a href={VIBEVIBE_SITE} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-3 py-1.5 text-xs text-mute transition hover:border-lime/60 hover:text-white">
          vibe/vibe ↗
        </a>
      </header>

      <section data-focus className={`rounded-[2rem] border border-transparent ${ran ? "mb-6" : "-mx-2 mb-10 px-2 pt-4 sm:pt-10"}`}>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[11px] text-mute">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" /> Robinhood Chain testnet · {g.launches.toLocaleString("en-US")} real launches
        </div>
        <h1 className={`font-semibold leading-[1.02] tracking-tight ${ran ? "text-3xl sm:text-5xl" : "text-[2.75rem] sm:text-7xl"}`}>
          Rehearse your launch
          <br />
          <span className="text-lime">before it&apos;s real.</span>
        </h1>
        {!ran && (
          <>
            <p className="mt-5 max-w-xl text-base text-mute sm:text-lg">
              On vibe/vibe, your launch settings lock forever. Dry Run lets you try them first against real past launches, then hands you a card to
              brag about.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href="#build" className="press rounded-full bg-lime px-6 py-4 text-center text-base font-bold text-ink shadow-[0_0_40px_rgba(198,255,61,0.25)] transition active:scale-95">
                Start my dry run ↓
              </a>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-2 text-center">
              {[
                [g.launches.toLocaleString("en-US"), "real launches"],
                [g.graduated.toLocaleString("en-US"), "graduated"],
                [pct(g.rate), "graduation rate"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl border border-line bg-panel/60 px-2 py-3">
                  <div className="text-lg font-semibold tabular-nums sm:text-2xl">{v}</div>
                  <div className="text-[10px] text-mute sm:text-xs">{l}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {result}

      {!ran && <div className="mb-10">{how}</div>}

      {!ran && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold tracking-tight">What real vibe/vibe creators launched</h2>
          <p className="mb-4 mt-1 text-sm text-mute">From the official API, not made up. Tap one to load it into the builder.</p>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-mute">🔥 Most popular setups</div>
              <div className="space-y-2">
                {rankings.popular.map((x, i) => (
                  <SetupRow key={`p${i}`} x={x} rank={i + 1} badge="most launched" />
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-mute">🏆 Best performing (min {BEST_MIN} launches)</div>
              <div className="space-y-2">
                {rankings.best.map((x, i) => (
                  <SetupRow key={`b${i}`} x={x} rank={i + 1} badge={`median ${fmtHours(x.medianHours)}`} />
                ))}
              </div>
              <p className="mt-2 text-[11px] text-mute">Launches 3+ days old. Past results, not a guarantee.</p>
            </div>
          </div>
        </section>
      )}

      <section id="build" className={`scroll-mt-4 ${ran ? "mt-12" : ""}`}>
        <h2 className="mb-1 text-2xl font-semibold tracking-tight sm:text-3xl">{ran ? "Try another setup" : "Your pretend launch"}</h2>
        <p className="mb-4 text-sm text-mute">Six quick picks. Skip anything you&apos;re unsure about.</p>
        <Builder key={qs} query={r.requested} persona={who} />
      </section>

      {ran && <div className="mt-12">{how}</div>}

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">Straight answers</h2>
        <div className="space-y-2">
          {FAQ.map(([qq, a]) => (
            <details data-focus key={qq} className="group rounded-2xl border border-line bg-panel/70 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium">
                {qq} <span className="text-lime transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-mute">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section data-focus className="mt-12 rounded-[2rem] border border-line bg-gradient-to-br from-panel to-[#17142e] p-6 text-center sm:p-10">
        <div className="text-2xl font-semibold tracking-tight sm:text-3xl">Rehearsed enough?</div>
        <p className="mt-2 text-sm text-mute">Settings lock the moment you launch. Make them count.</p>
        <LaunchForReal className="mt-5 w-full sm:w-auto" />
      </section>

      <FocusFx key={`fx-${runKey}-${ran}`} />
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
          Independent tool, not affiliated with vibe/vibe or Robinhood. Data: official vibe/vibe testnet API, snapshot{" "}
          {new Date(r.meta.builtAt).toUTCString().slice(5, 22)} UTC. Testnet only, and test assets have no value. History, not a prediction. Not
          financial advice, and no rewards implied.
        </p>
      </footer>
    </main>
  );
}
