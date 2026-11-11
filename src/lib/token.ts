// Server-only helpers for /check and /guess: look up one launch's real settings
// and outcome (live vibe/vibe API first, then the cached dataset).
import { DATASET_META, EXPLORER, SITE, buyBucket, findRow, runDryRun, setupRank, type DatasetRow } from "./dryrun";
import type { Query } from "./options";

const API = "https://testnet.vibevibe.fun/api/v1/chains/46630";
const TOTAL_SUPPLY = 1_000_000_000n * 10n ** 18n;

// Same pair registry as scripts/build-dataset.mts (keep in sync).
const KNOWN_PAIRS: Record<string, { key: string; label: string }> = {
  "0x0000000000000000000000000000000000000000": { key: "eth", label: "ETH" },
  "0x3ab049897b0697bda766d8730fe1f955c9c103f0": { key: "nvda", label: "NVDA" },
  "0xba163e9887d54a854323b41fca9cf64a1c275ac9": { key: "spcx", label: "SPCX" },
  "0x438820dcfe62a21e306614a4b54383cd8a36acf2": { key: "aapl", label: "AAPL" },
  "0x1b14321750b38f7ed66a363d07a921a668521a5f": { key: "openai", label: "OPENAI" },
  "0x92dce70b18df47ac643af6377621d74abe3c868c": { key: "anthropic", label: "ANTHROPIC" },
  "0x102154e70d8485ff466bab229be90a763bf33264": { key: "usdg", label: "USDG" },
  "0xf1f6b050550531226ee0257fec4a1e575ff4c341": { key: "vibevibe", label: "VIBEVIBE" },
  "0x2a9f3d3d8e5bb7b39fbfb2826833693be5daca38": { key: "vibevibe", label: "VIBEVIBE" },
};

export type TokenInfo = {
  token: string;
  name: string;
  symbol: string;
  image: string | null;
  pairKey: string;
  pairLabel: string;
  created: number; // unix s
  graduatedAt: number; // unix s, 0 = not graduated
  buyBps: number;
  taxBps: number;
  routing: string;
  airdrop: boolean;
  holders: number | null;
  progressPct: number;
  source: "live" | "snapshot";
  url: string;
  explorer: string;
};

/** Pull a 0x address out of whatever was pasted (address, vibe/vibe link, explorer link). */
export function parseAddress(input: unknown): string | null {
  const m = String(input ?? "").match(/0x[a-fA-F0-9]{40}/);
  return m ? m[0].toLowerCase() : null;
}

type V6 = {
  tokenAddress: string;
  name: string;
  symbol: string;
  content?: { image?: { uri?: string } };
  pairCurrencyAddress: string;
  pairSymbol: string | null;
  targetPairUnits: string;
  taxBps: number;
  weights: { cashBps: number; holdersBps: number; burnBps: number; holdersPairBps?: number };
  initialNetPersonalUnits: string;
  gifts: { count: string };
  graduated: boolean;
  graduation: { at: string | null } | null;
  curve: { pairReserveUnits: string };
  createdAt: string;
};

function routing(w: V6["weights"]): string {
  const holders = w.holdersBps + (w.holdersPairBps ?? 0);
  const max = Math.max(w.cashBps, holders, w.burnBps);
  if (max === holders) return "holders";
  if (max === w.cashBps) return "treasury";
  return "burn";
}

const sec = (iso: string | null | undefined) => (iso ? Math.floor(Date.parse(iso) / 1000) : 0);

/**
 * vibe/vibe serves launch images from /media/<cid>.<size>.webp (same as its own frontend),
 * but only to its own origin, so we show them through our /api/img proxy.
 */
export function imageUrl(uri: string | undefined, size: "thumb" | "sq410" | "card" = "sq410"): string | null {
  const cid = uri?.replace(/^ipfs:\/\//, "");
  return cid && /^[a-z0-9]{8,200}$/.test(cid) ? `/api/img?cid=${cid}&s=${size}` : null;
}

type Live = { status: "ok"; launch: V6 } | { status: "notfound" } | { status: "error" };

async function fetchLive(addr: string, timeoutMs = 6000): Promise<Live> {
  try {
    const res = await fetch(`${API}/v6/launches/${addr}`, {
      headers: { "user-agent": "dry-run/1.0" },
      signal: AbortSignal.timeout(timeoutMs),
      next: { revalidate: 120 },
    });
    if (res.status === 404) return { status: "notfound" };
    if (!res.ok) return { status: "error" };
    const j = (await res.json()) as { data?: { launch?: V6 } };
    return j.data?.launch ? { status: "ok", launch: j.data.launch } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

function fromLive(l: V6, row: DatasetRow | null): TokenInfo {
  const pair = KNOWN_PAIRS[l.pairCurrencyAddress.toLowerCase()] ?? { key: "launch", label: l.pairSymbol ?? "TOKEN" };
  const target = BigInt(l.targetPairUnits || "0");
  const reserve = BigInt(l.curve?.pairReserveUnits || "0");
  const progressBps = l.graduated ? 10000 : target > 0n ? Number((reserve * 10000n) / target) : 0;
  const token = l.tokenAddress.toLowerCase();
  return {
    token,
    name: l.name,
    symbol: l.symbol,
    image: imageUrl(l.content?.image?.uri),
    pairKey: pair.key,
    pairLabel: pair.label,
    created: sec(l.createdAt),
    graduatedAt: l.graduated ? sec(l.graduation?.at) || sec(l.createdAt) : 0,
    buyBps: Number((BigInt(l.initialNetPersonalUnits || "0") * 1_000_000n) / TOTAL_SUPPLY) / 100,
    taxBps: l.taxBps,
    routing: routing(l.weights),
    airdrop: Number(l.gifts?.count ?? 0) > 0,
    holders: row ? row[11] : null, // the single-launch endpoint has no holder count
    progressPct: Math.min(progressBps, 10000) / 100,
    source: "live",
    url: `${SITE}/token/${token}`,
    explorer: `${EXPLORER}/token/${token}`,
  };
}

function fromRow(r: DatasetRow): TokenInfo {
  return {
    token: r[0],
    name: r[1],
    symbol: r[2],
    image: null,
    pairKey: r[3],
    pairLabel: r[4],
    created: r[5],
    graduatedAt: r[6],
    buyBps: r[7],
    taxBps: r[8],
    routing: r[9],
    airdrop: r[10] === 1,
    holders: r[11],
    progressPct: r[13] / 100,
    source: "snapshot",
    url: `${SITE}/token/${r[0]}`,
    explorer: `${EXPLORER}/token/${r[0]}`,
  };
}

export type Lookup = { kind: "ok"; info: TokenInfo } | { kind: "notfound" } | { kind: "error" };

/** Real settings + outcome for one launch. Live API first (fresh progress), dataset as fallback. */
export async function lookupToken(addr: string, timeoutMs?: number): Promise<Lookup> {
  const row = findRow(addr);
  const live = await fetchLive(addr, timeoutMs);
  if (live.status === "ok") return { kind: "ok", info: fromLive(live.launch, row) };
  if (row) return { kind: "ok", info: fromRow(row) };
  return { kind: live.status === "notfound" ? "notfound" : "error" };
}

/** The Dry Run query that matches a real launch's settings exactly. */
export function queryFor(info: TokenInfo): Query {
  const tax = [100, 200, 300].includes(info.taxBps) ? String(info.taxBps / 100) : "any";
  return { pair: info.pairKey, buy: buyBucket(info.buyBps), tax, route: info.routing, airdrop: info.airdrop ? "yes" : "no" };
}

/** How this token's setup did historically, and where it ranks. */
export function checkToken(info: TokenInfo) {
  const q = queryFor(info);
  const r = runDryRun(q);
  const rank = setupRank(q.pair, q.buy, q.tax);
  return { q, r, rank, meta: DATASET_META };
}

export const fmtPct = (bps: number) => `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : bps < 100 ? 2 : 1)}%`;

/** "Nov 10, 2026" from the dataset's builtAt. */
export function updatedLabel(iso = DATASET_META.builtAt) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
