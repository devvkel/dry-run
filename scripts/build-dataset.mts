/**
 * Dry Run dataset builder.
 * Pulls every V6 launch from the official vibe/vibe testnet API and writes a
 * compact cached dataset to data/launches.json that the app reads.
 *
 *   npm run data
 *
 * Runs on Node 22.6+ (native TypeScript type stripping). No API key needed.
 */
import { writeFileSync, mkdirSync } from "node:fs";

const API = "https://testnet.vibevibe.fun/api/v1/chains/46630";
const PAGE = 50; // the V6 list endpoint rejects limit > 50
const TOTAL_SUPPLY = 1_000_000_000n * 10n ** 18n; // 1B tokens, 18 decimals

// Pair registry, mirrored from the official vibe/vibe frontend.
// Anything not listed here (and not ETH) is another vibe/vibe launch token.
const KNOWN_PAIRS: Record<string, { key: string; label: string; kind: string }> = {
  "0x0000000000000000000000000000000000000000": { key: "eth", label: "ETH", kind: "native" },
  "0x3ab049897b0697bda766d8730fe1f955c9c103f0": { key: "nvda", label: "NVDA", kind: "test stock" },
  "0xba163e9887d54a854323b41fca9cf64a1c275ac9": { key: "spcx", label: "SPCX", kind: "test stock" },
  "0x438820dcfe62a21e306614a4b54383cd8a36acf2": { key: "aapl", label: "AAPL", kind: "test stock" },
  "0x1b14321750b38f7ed66a363d07a921a668521a5f": { key: "openai", label: "OPENAI", kind: "test pre-IPO" },
  "0x92dce70b18df47ac643af6377621d74abe3c868c": { key: "anthropic", label: "ANTHROPIC", kind: "test pre-IPO" },
  "0x102154e70d8485ff466bab229be90a763bf33264": { key: "usdg", label: "USDG", kind: "test dollar" },
  "0xf1f6b050550531226ee0257fec4a1e575ff4c341": { key: "vibevibe", label: "VIBEVIBE", kind: "token" },
  "0x2a9f3d3d8e5bb7b39fbfb2826833693be5daca38": { key: "vibevibe", label: "VIBEVIBE", kind: "token" },
};

type V6Launch = {
  tokenAddress: string;
  name: string;
  symbol: string;
  createdAt: string;
  pairCurrencyAddress: string;
  pairSymbol: string | null;
  targetPairUnits: string;
  taxBps: number;
  weights: { cashBps: number; holdersBps: number; burnBps: number; holdersPairBps?: number };
  initialNetPersonalUnits: string;
  gifts: { count: string };
  lifecycle: string;
  graduated: boolean;
  graduation: { at: string | null } | null;
  curve: { pairReserveUnits: string };
  market: { volume24hPairUnits: string | null; holderCount: number | null } | null;
};

async function getJson(url: string, tries = 4): Promise<{ data: { items: V6Launch[]; page: { hasMore: boolean; nextCursor?: string; snapshotBlock?: string } } }> {
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(url, { headers: { "user-agent": "dry-run-dataset/1.0" } });
      if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
      return await r.json();
    } catch (e) {
      if (i >= tries - 1) throw e;
      await new Promise((res) => setTimeout(res, 1500 * (i + 1)));
    }
  }
}

function routing(w: V6Launch["weights"]): string {
  const cash = w.cashBps;
  const holders = w.holdersBps + (w.holdersPairBps ?? 0);
  const burn = w.burnBps;
  const max = Math.max(cash, holders, burn);
  if (max === holders) return "holders";
  if (max === cash) return "treasury";
  return "burn";
}

const sec = (iso: string | null | undefined) => (iso ? Math.floor(Date.parse(iso) / 1000) : 0);

async function main() {
  const all: V6Launch[] = [];
  let cursor: string | undefined;
  let snapshotBlock = "";
  for (;;) {
    const url = `${API}/v6/launches?limit=${PAGE}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const { data } = await getJson(url);
    all.push(...data.items);
    snapshotBlock ||= data.page.snapshotBlock ?? (data.items[0] as unknown as { asOfBlock?: string })?.asOfBlock ?? "";
    if (all.length % 2000 < PAGE) process.stdout.write(`  ${all.length} launches...\n`);
    if (!data.page.hasMore || !data.page.nextCursor) break;
    cursor = data.page.nextCursor;
  }

  // Columnar-ish compact rows keep the file small.
  const rows = all.map((l) => {
    const pair = KNOWN_PAIRS[l.pairCurrencyAddress.toLowerCase()] ?? { key: "launch", label: l.pairSymbol ?? "TOKEN", kind: "launch token" };
    const target = BigInt(l.targetPairUnits || "0");
    const reserve = BigInt(l.curve?.pairReserveUnits || "0");
    const progressBps = l.graduated ? 10000 : target > 0n ? Number((reserve * 10000n) / target) : 0;
    const buyBps = Number((BigInt(l.initialNetPersonalUnits || "0") * 1_000_000n) / TOTAL_SUPPLY) / 100; // bps, 2dp
    return [
      l.tokenAddress.toLowerCase(), // 0 token
      l.name.slice(0, 40), // 1 name
      l.symbol.slice(0, 16), // 2 symbol
      pair.key, // 3 pair key
      pair.label, // 4 pair label (actual symbol for launch-token pairs)
      sec(l.createdAt), // 5 created (unix s)
      l.graduated ? sec(l.graduation?.at) || sec(l.createdAt) : 0, // 6 graduated at (unix s), 0 = not yet
      buyBps, // 7 creator opening buy, bps of supply
      l.taxBps, // 8 tax bps
      routing(l.weights), // 9 dominant tax routing
      Number(l.gifts?.count ?? 0) > 0 ? 1 : 0, // 10 airdrop list attached
      l.market?.holderCount ?? 0, // 11 holders
      Number(BigInt(l.market?.volume24hPairUnits || "0") / 10n ** 12n) / 1e6, // 12 24h volume, pair units
      Math.min(progressBps, 10000), // 13 curve progress bps
    ];
  });

  mkdirSync("data", { recursive: true });
  const out = {
    source: `${API}/v6/launches`,
    builtAt: new Date().toISOString(),
    snapshotBlock,
    count: rows.length,
    fields: ["token", "name", "symbol", "pair", "pairLabel", "created", "graduatedAt", "buyBps", "taxBps", "routing", "airdrop", "holders", "vol24h", "progressBps"],
    rows,
  };
  writeFileSync("data/launches.json", JSON.stringify(out));
  const grad = rows.filter((r) => (r[6] as number) > 0).length;
  console.log(`Wrote ${rows.length} launches (${grad} graduated) at block ${snapshotBlock}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
