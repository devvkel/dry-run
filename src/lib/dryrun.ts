import { readFileSync } from "node:fs";
import path from "node:path";

// Read at runtime (not `import`) so TypeScript doesn't type-check a 3 MB JSON file.
const dataset = JSON.parse(readFileSync(path.join(process.cwd(), "data", "launches.json"), "utf8")) as {
  builtAt: string;
  snapshotBlock?: string;
  source: string;
  rows: unknown[];
};

/** One compact row from data/launches.json (see scripts/build-dataset.mts). */
type Row = [
  token: string,
  name: string,
  symbol: string,
  pair: string,
  pairLabel: string,
  created: number,
  graduatedAt: number,
  buyBps: number,
  taxBps: number,
  routing: string,
  airdrop: number,
  holders: number,
  vol24h: number,
  progressBps: number,
];

const ROWS = dataset.rows as Row[];
export const SMALL_SAMPLE = 25;
export const DATASET_META = {
  builtAt: dataset.builtAt,
  count: ROWS.length,
  snapshotBlock: dataset.snapshotBlock ?? "",
  source: dataset.source,
};

export const SITE = "https://testnet.vibevibe.fun";
export const EXPLORER = "https://explorer.testnet.chain.robinhood.com";

/** Launches younger than this are left out of rates so they've had time to graduate. */
const MATURE_SECONDS = 3 * 86400;
const MIN_SAMPLE = 25; // keep in sync with SMALL_SAMPLE

import { BUYS, PAIRS, labelOf, setupChips, type Query } from "./options";
import { personalityFor } from "./personality";
export { parseQuery, queryString, setupChips } from "./options";
export type { Query } from "./options";

const BUY_TEST: Record<string, (b: number) => boolean> = {
  none: (b) => b === 0,
  lt1: (b) => b > 0 && b < 100,
  "1-3": (b) => b >= 100 && b < 300,
  "3-10": (b) => b >= 300 && b < 1000,
  "10-25": (b) => b >= 1000 && b < 2500,
  "25+": (b) => b >= 2500,
};

function matcher(q: Query) {
  const buy = BUY_TEST[q.buy];
  return (r: Row) =>
    r[3] === q.pair &&
    buy(r[7]) &&
    (q.tax === "any" || r[8] === Number(q.tax) * 100) &&
    (q.route === "any" || r[9] === q.route) &&
    (q.airdrop === "any" || r[10] === (q.airdrop === "yes" ? 1 : 0));
}

const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const quantile = (xs: number[], p: number) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
};

function nowSec() {
  // Measure "maturity" against the dataset snapshot, not the wall clock,
  // so results stay stable between dataset refreshes.
  return Math.floor(Date.parse(DATASET_META.builtAt) / 1000);
}

function statsFor(rows: Row[]) {
  const now = nowSec();
  const mature = rows.filter((r) => now - r[5] >= MATURE_SECONDS);
  const grads = mature.filter((r) => r[6] > 0);
  const hours = rows.filter((r) => r[6] > 0).map((r) => (r[6] - r[5]) / 3600);
  return {
    n: mature.length,
    graduated: grads.length,
    rate: mature.length ? grads.length / mature.length : 0,
    medianHours: median(hours),
    p25Hours: quantile(hours, 0.25),
    p75Hours: quantile(hours, 0.75),
    medianHoldersGrad: median(rows.filter((r) => r[6] > 0).map((r) => r[11])),
    medianHoldersAll: median(mature.map((r) => r[11])),
    medianProgressStuck: median(mature.filter((r) => r[6] === 0).map((r) => r[13])) / 100,
  };
}

export type Example = {
  token: string;
  name: string;
  symbol: string;
  pairLabel: string;
  graduated: boolean;
  hours: number | null;
  holders: number;
  buyPct: number;
  taxPct: number;
  progressPct: number;
  url: string;
  explorer: string;
};

const toExample = (r: Row): Example => ({
  token: r[0],
  name: r[1],
  symbol: r[2],
  pairLabel: r[4],
  graduated: r[6] > 0,
  hours: r[6] > 0 ? (r[6] - r[5]) / 3600 : null,
  holders: r[11],
  buyPct: r[7] / 100,
  taxPct: r[8] / 100,
  progressPct: r[13] / 100,
  url: `${SITE}/token/${r[0]}`,
  explorer: `${EXPLORER}/token/${r[0]}`,
});

export type Result = ReturnType<typeof runDryRun>;

export function runDryRun(input: Query) {
  // Relax the optional filters (least important first) until the sample is big enough.
  const order: (keyof Query)[] = ["route", "airdrop", "tax"];
  const q = { ...input };
  const relaxed: string[] = [];
  let rows = ROWS.filter(matcher(q));
  for (const k of order) {
    if (statsFor(rows).n >= MIN_SAMPLE || q[k] === "any") continue;
    q[k] = "any";
    relaxed.push(k);
    rows = ROWS.filter(matcher(q));
  }
  const s = statsFor(rows);

  // Baseline: everything on vibe/vibe V6.
  const base = statsFor(ROWS);
  const pairBase = statsFor(ROWS.filter((r) => r[3] === q.pair));

  // "Try instead": best opening-buy bucket for the same pair + other filters.
  const tweaks = BUYS.map((b) => {
    const st = statsFor(ROWS.filter(matcher({ ...q, buy: b.key })));
    return { key: b.key, label: b.label, rate: st.rate, n: st.n, medianHours: st.medianHours };
  }).filter((t) => t.n >= MIN_SAMPLE || (t.key === q.buy && t.n > 0));

  const taxTweaks = (["1", "2", "3"] as const).map((key) => ({ key, label: `${key}%` })).map((t) => {
    const st = statsFor(ROWS.filter(matcher({ ...q, tax: t.key })));
    return { key: t.key, label: t.label, rate: st.rate, n: st.n };
  }).filter((t) => t.n >= MIN_SAMPLE);

  // Examples: fastest graduates + biggest communities + a few that stalled.
  const grads = rows.filter((r) => r[6] > 0);
  const fastest = [...grads].sort((a, b) => a[6] - a[5] - (b[6] - b[5])).filter((r) => r[11] >= 50).slice(0, 2);
  const biggest = [...grads].sort((a, b) => b[11] - a[11]).filter((r) => !fastest.includes(r)).slice(0, 2);
  const now = nowSec();
  const stalled = rows
    .filter((r) => r[6] === 0 && now - r[5] >= MATURE_SECONDS)
    .sort((a, b) => b[13] - a[13])
    .slice(0, 2);
  const examples = [...fastest, ...biggest, ...stalled].map(toExample);

  return {
    query: q,
    requested: input,
    relaxed,
    stats: s,
    baseRate: base.rate,
    pairRate: pairBase.rate,
    lift: base.rate ? s.rate / base.rate : 0,
    tweaks,
    taxTweaks,
    examples,
    meta: DATASET_META,
    lowSample: s.n < MIN_SAMPLE,
    personality: personalityFor(input, s),
  };
}

export function fmtHours(h: number): string {
  if (!h) return "—";
  if (h < 1) return `${Math.max(1, Math.round(h * 60))}\u00a0min`;
  if (h < 48) return `${h < 10 ? h.toFixed(1) : Math.round(h)}\u00a0h`;
  return `${(h / 24).toFixed(1)}\u00a0days`;
}

export function headline(r: Result) {
  const { n, graduated } = r.stats;
  if (!n) return { big: "No twins yet", line: "No real launches match this setup yet. You'd be first." };
  const tenths = Math.round((graduated / n) * 10);
  return {
    big: `${Math.round(r.stats.rate * 100)}%`,
    line: `Launches like yours graduated ${graduated.toLocaleString("en-US")} of ${n.toLocaleString("en-US")} times${
      graduated ? `, median ${fmtHours(r.stats.medianHours)}` : ""
    }.`,
    simple: `About ${tenths} in 10 graduated`,
  };
}

export function setupLabel(q: Query) {
  return setupChips(q).join(" · ");
}

export const pairLabel = (k: string) => labelOf(PAIRS, k);

/** Whole-dataset numbers for the landing page. */
export function globalStats() {
  const s = statsFor(ROWS);
  return { launches: ROWS.length, graduated: ROWS.filter((r) => r[6] > 0).length, rate: s.rate, medianHours: s.medianHours };
}

// ---- Real-data setup rankings (pair + opening buy + tax) ------------------
export type SetupStat = { pair: string; buy: string; tax: string; n: number; rate: number; medianHours: number; medianHolders: number };
export const BEST_MIN = 50;

function buyKey(b: number) {
  return Object.keys(BUY_TEST).find((k) => BUY_TEST[k](b)) ?? "none";
}

let SETUPS: SetupStat[] | null = null;
function allSetups(): SetupStat[] {
  if (SETUPS) return SETUPS;
  const groups = new Map<string, Row[]>();
  for (const r of ROWS) {
    const k = `${r[3]}|${buyKey(r[7])}|${r[8] / 100}`;
    let g = groups.get(k);
    if (!g) groups.set(k, (g = []));
    g.push(r);
  }
  SETUPS = [...groups.entries()].map(([k, rows]) => {
    const [pair, buy, tax] = k.split("|");
    const st = statsFor(rows);
    return { pair, buy, tax, n: st.n, rate: st.rate, medianHours: st.medianHours, medianHolders: st.medianHoldersGrad };
  });
  return SETUPS;
}

/** Most common real setups, and the best graduation rates with a decent sample. */
export function setupRankings() {
  const all = allSetups();
  const popular = [...all].sort((a, b) => b.n - a.n).slice(0, 6);
  const best = all.filter((s) => s.n >= BEST_MIN).sort((a, b) => b.rate - a.rate).slice(0, 5);
  return { popular, best };
}

/** Best-performing setup for one pair (min sample), for the Compare view. */
export function bestForPair(pair: string): SetupStat | null {
  return allSetups().filter((s) => s.pair === pair && s.n >= BEST_MIN).sort((a, b) => b.rate - a.rate)[0] ?? null;
}

// ---- Added for /check and /guess (read-only helpers over the same dataset) --

/** Opening-buy bucket key ("none", "lt1", "1-3", …) for a buy size in bps of supply. */
export const buyBucket = (bps: number) => buyKey(bps);

/** The compact dataset row for one token, if it's in the snapshot. */
export function findRow(token: string): Row | null {
  const t = token.toLowerCase();
  return ROWS.find((r) => r[0] === t) ?? null;
}

/**
 * Where a pair + opening buy + tax setup ranks by graduation rate among all
 * real setups with BEST_MIN+ launches. Null if this setup is below that sample.
 */
export function setupRank(pair: string, buy: string, tax: string) {
  const ranked = allSetups().filter((s) => s.n >= BEST_MIN).sort((a, b) => b.rate - a.rate);
  const i = ranked.findIndex((s) => s.pair === pair && s.buy === buy && s.tax === tax);
  const self = allSetups().find((s) => s.pair === pair && s.buy === buy && s.tax === tax) ?? null;
  return { rank: i >= 0 ? i + 1 : null, total: ranked.length, setup: self };
}

/** Mature launches (3+ days old at snapshot) split by outcome, for the guessing game. */
let POOL: { grads: Row[]; rest: Row[] } | null = null;
export function guessPool() {
  if (POOL) return POOL;
  const now = nowSec();
  const mature = ROWS.filter((r) => now - r[5] >= MATURE_SECONDS);
  POOL = { grads: mature.filter((r) => r[6] > 0), rest: mature.filter((r) => r[6] === 0) };
  return POOL;
}

export type DatasetRow = Row;

// ---- Display-only highlights for the landing page (read-only, no scoring) ----
export type Highlight = { token: string; name: string; symbol: string; pairLabel: string; graduated: boolean; hours: number; progressPct: number; holders: number };
const toHighlight = (r: Row): Highlight => ({
  token: r[0],
  name: r[1],
  symbol: r[2],
  pairLabel: r[4],
  graduated: r[6] > 0,
  hours: r[6] > 0 ? (r[6] - r[5]) / 3600 : 0,
  progressPct: r[6] > 0 ? 100 : r[13] / 100,
  holders: r[11],
});

/** The newest launches in the snapshot, newest first. */
export function latestLaunches(n = 18): Highlight[] {
  return [...ROWS].sort((a, b) => b[5] - a[5]).slice(0, n).map(toHighlight);
}

/** Most-held graduate among launches created in the 7 days before the snapshot. */
export function topRecentGraduate(): Highlight | null {
  const end = Date.parse(DATASET_META.builtAt) / 1000;
  const best = ROWS.filter((r) => r[6] > 0 && r[5] >= end - 7 * 86400).sort((a, b) => b[11] - a[11])[0];
  return best ? toHighlight(best) : null;
}

/** Most recent graduations in the snapshot, newest first. */
export function latestGraduates(n = 6): Highlight[] {
  return ROWS.filter((r) => r[6] > 0).sort((a, b) => b[6] - a[6]).slice(0, n).map(toHighlight);
}
