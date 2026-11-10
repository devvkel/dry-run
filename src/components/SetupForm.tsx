"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Opt = { key: string; label: string; hint?: string };
type Q = { pair: string; buy: string; tax: string; route: string; airdrop: string };

function toQs(q: Q) {
  const p = new URLSearchParams({ pair: q.pair, buy: q.buy });
  if (q.tax !== "any") p.set("tax", q.tax);
  if (q.route !== "any") p.set("route", q.route);
  if (q.airdrop !== "any") p.set("airdrop", q.airdrop);
  return p.toString();
}

function Group({
  title,
  sub,
  opts,
  value,
  onPick,
}: {
  title: string;
  sub?: string;
  opts: readonly Opt[];
  value: string;
  onPick: (k: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mute">{title}</span>
        {sub && <span className="text-[11px] text-mute/70">{sub}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <button
            key={o.key}
            type="button"
            data-on={o.key === value}
            onClick={() => onPick(o.key)}
            className="chip rounded-full border border-line bg-white/[0.03] px-3.5 py-1.5 text-sm transition hover:border-lime/60"
          >
            {o.label}
            {o.hint && <span className="ml-1 text-[10px] opacity-60">{o.hint}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SetupForm({
  query,
  pairs,
  buys,
  taxes,
  routes,
  airdrops,
}: {
  query: Q;
  pairs: readonly Opt[];
  buys: readonly Opt[];
  taxes: readonly Opt[];
  routes: readonly Opt[];
  airdrops: readonly Opt[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const set = (k: keyof Q) => (v: string) =>
    start(() => router.replace(`/?${toQs({ ...query, [k]: v })}`, { scroll: false }));

  return (
    <div className={`space-y-5 transition ${pending ? "opacity-60" : ""}`}>
      <Group title="Pair" sub="what buyers pay with" opts={pairs} value={query.pair} onPick={set("pair")} />
      <Group title="Opening buy" sub="% of supply you buy at launch" opts={buys} value={query.buy} onPick={set("buy")} />
      <details className="group rounded-2xl border border-line/70 bg-white/[0.02] p-4">
        <summary className="cursor-pointer list-none text-sm text-mute group-open:mb-4">
          <span className="text-lime">+</span> Fine-tune: tax, routing, airdrop
        </summary>
        <div className="space-y-4">
          <Group title="Tax" opts={taxes} value={query.tax} onPick={set("tax")} />
          <Group title="Tax routing" opts={routes} value={query.route} onPick={set("route")} />
          <Group title="Airdrop list" opts={airdrops} value={query.airdrop} onPick={set("airdrop")} />
        </div>
      </details>
    </div>
  );
}
