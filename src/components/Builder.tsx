"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AIRDROPS,
  BUYS,
  PAIRS,
  ROUTES,
  TAXES,
  cleanHandle,
  cleanName,
  cleanTicker,
  queryString,
  type Persona,
  type Query,
} from "@/lib/options";

type Opt = { key: string; label: string; hint?: string };

function Chips({ opts, value, onPick }: { opts: readonly Opt[]; value: string; onPick: (k: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => (
        <button
          key={o.key}
          type="button"
          data-on={o.key === value}
          onClick={() => onPick(o.key)}
          className="chip rounded-full border border-line bg-white/[0.03] px-3.5 py-2 text-sm transition active:scale-95 hover:border-lime/60"
        >
          {o.label}
          {o.hint && <span className="ml-1.5 text-[10px] opacity-60">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

function Step({ n, title, sub, children }: { n: number; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div data-focus className="relative rounded-3xl border border-line bg-panel/80 p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-lime text-xs font-bold text-ink">{n}</span>
        <div>
          <div className="font-semibold leading-tight">{title}</div>
          {sub && <div className="text-xs text-mute">{sub}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

const input =
  "w-full rounded-2xl border border-line bg-ink/60 px-4 py-3 text-base outline-none transition placeholder:text-mute/50 focus:border-lime/70";

export default function Builder({ query, persona }: { query: Query; persona: Persona }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [q, setQ] = useState<Query>(query);
  const [p, setP] = useState<Persona>(persona);
  const set = (k: keyof Query) => (v: string) => setQ((s) => ({ ...s, [k]: v }));

  function run() {
    const qs = queryString(q, p);
    start(() => {
      router.push(`/?${qs}&t=${Date.now().toString(36)}#result`, { scroll: false });
    });
    setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 450);
  }

  return (
    <div className="space-y-3">
      <Step n={1} title="Name your pretend token" sub="Just for your card. Nothing gets launched.">
        <div className="grid gap-2 sm:grid-cols-[2fr_1fr]">
          <input
            className={input}
            placeholder="Token name, e.g. Moon Cat"
            value={p.name}
            maxLength={24}
            onChange={(e) => setP({ ...p, name: e.target.value.slice(0, 24) })}
            onBlur={() => setP((s) => ({ ...s, name: cleanName(s.name) }))}
          />
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute">$</span>
            <input
              className={`${input} pl-8 uppercase`}
              placeholder="TICKER"
              value={p.ticker}
              maxLength={10}
              onChange={(e) => setP({ ...p, ticker: cleanTicker(e.target.value) })}
            />
          </div>
        </div>
      </Step>

      <Step n={2} title="Pick a pair" sub="What buyers pay with. Test stocks have no real value.">
        <Chips opts={PAIRS} value={q.pair} onPick={set("pair")} />
      </Step>

      <Step n={3} title="Your opening buy" sub="How much of the supply you buy at launch.">
        <Chips opts={BUYS} value={q.buy} onPick={set("buy")} />
      </Step>

      <Step n={4} title="Tax and where it goes" sub="Tax on every trade, and who gets it.">
        <div className="space-y-3">
          <Chips opts={TAXES} value={q.tax} onPick={set("tax")} />
          <Chips opts={ROUTES} value={q.route} onPick={set("route")} />
        </div>
      </Step>

      <Step n={5} title="Airdrop to a list?" sub="Gift tokens to wallets at launch.">
        <Chips opts={AIRDROPS} value={q.airdrop} onPick={set("airdrop")} />
      </Step>

      <Step n={6} title="Your X handle" sub="Optional. Puts your face on the share card.">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute">@</span>
          <input
            className={`${input} pl-9`}
            placeholder="yourhandle"
            value={p.handle}
            maxLength={15}
            autoCapitalize="none"
            autoCorrect="off"
            onChange={(e) => setP({ ...p, handle: cleanHandle(e.target.value) })}
          />
        </div>
      </Step>

      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="group relative mt-2 w-full overflow-hidden rounded-3xl bg-lime px-6 py-5 text-xl font-bold text-ink shadow-[0_0_40px_rgba(198,255,61,0.25)] transition active:scale-[0.98] disabled:opacity-80"
      >
        <span className="relative z-10">{pending ? "Rehearsing your launch…" : "Dry Run it →"}</span>
        <span className="absolute inset-0 -translate-x-full bg-white/30 transition duration-700 group-hover:translate-x-full" />
      </button>
      <p className="text-center text-xs text-mute">Rehearsal only. No token is created and nothing touches your wallet.</p>
    </div>
  );
}
