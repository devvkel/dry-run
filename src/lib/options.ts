// Client-safe option lists and URL helpers (no Node APIs here).

export const PAIRS = [
  { key: "eth", label: "ETH", hint: "native" },
  { key: "nvda", label: "NVDA", hint: "test stock" },
  { key: "spcx", label: "SPCX", hint: "test stock" },
  { key: "aapl", label: "AAPL", hint: "test stock" },
  { key: "openai", label: "OPENAI", hint: "test pre-IPO" },
  { key: "anthropic", label: "ANTHROPIC", hint: "test pre-IPO" },
  { key: "usdg", label: "USDG", hint: "test dollar" },
  { key: "vibevibe", label: "VIBEVIBE", hint: "token" },
  { key: "launch", label: "Another launch", hint: "vibe/vibe token" },
] as const;

export const BUYS = [
  { key: "none", label: "None", hint: "fair launch" },
  { key: "lt1", label: "Under 1%", hint: "a nibble" },
  { key: "1-3", label: "1–3%", hint: "a bite" },
  { key: "3-10", label: "3–10%", hint: "a bag" },
  { key: "10-25", label: "10–25%", hint: "a big bag" },
  { key: "25+", label: "25%+", hint: "whale mode" },
] as const;

export const TAXES = [
  { key: "any", label: "Not sure" },
  { key: "1", label: "1%" },
  { key: "2", label: "2%" },
  { key: "3", label: "3%" },
] as const;

export const ROUTES = [
  { key: "any", label: "Not sure" },
  { key: "treasury", label: "Treasury", hint: "fund the project" },
  { key: "holders", label: "Holders", hint: "reward holders" },
  { key: "burn", label: "Burn", hint: "shrink supply" },
] as const;

export const AIRDROPS = [
  { key: "any", label: "Not sure" },
  { key: "yes", label: "Yes", hint: "gift a list" },
  { key: "no", label: "No" },
] as const;

export type Query = { pair: string; buy: string; tax: string; route: string; airdrop: string };
export type Persona = { name: string; ticker: string; handle: string };
export const DEFAULT_QUERY: Query = { pair: "eth", buy: "1-3", tax: "any", route: "any", airdrop: "any" };

type Opt = { key: string; label: string };
const pick = (list: readonly Opt[], v: unknown, d: string) =>
  typeof v === "string" && list.some((o) => o.key === v) ? v : d;

export type SP = Record<string, string | string[] | undefined>;
const one = (sp: SP, k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]);

export function parseQuery(sp: SP): Query {
  return {
    pair: pick(PAIRS, one(sp, "pair"), DEFAULT_QUERY.pair),
    buy: pick(BUYS, one(sp, "buy"), DEFAULT_QUERY.buy),
    tax: pick(TAXES, one(sp, "tax"), DEFAULT_QUERY.tax),
    route: pick(ROUTES, one(sp, "route"), DEFAULT_QUERY.route),
    airdrop: pick(AIRDROPS, one(sp, "airdrop"), DEFAULT_QUERY.airdrop),
  };
}

// ---- Input sanitizing (used on both client and server) --------------------
export const cleanHandle = (s: unknown) =>
  String(s ?? "")
    .trim()
    .replace(/^@+/, "")
    .replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "")
    .replace(/[^A-Za-z0-9_]/g, "")
    .slice(0, 15);

export const cleanName = (s: unknown) =>
  String(s ?? "")
    .replace(/[^A-Za-z0-9 .\-'&!?]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);

export const cleanTicker = (s: unknown) =>
  String(s ?? "")
    .replace(/^\$+/, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);

export function parsePersona(sp: SP): Persona {
  return { name: cleanName(one(sp, "name")), ticker: cleanTicker(one(sp, "ticker")), handle: cleanHandle(one(sp, "x")) };
}

export function queryString(q: Query, p?: Partial<Persona>): string {
  const u = new URLSearchParams({ pair: q.pair, buy: q.buy });
  if (q.tax !== "any") u.set("tax", q.tax);
  if (q.route !== "any") u.set("route", q.route);
  if (q.airdrop !== "any") u.set("airdrop", q.airdrop);
  const name = cleanName(p?.name);
  const ticker = cleanTicker(p?.ticker);
  const handle = cleanHandle(p?.handle);
  if (name) u.set("name", name);
  if (ticker) u.set("ticker", ticker);
  if (handle) u.set("x", handle);
  return u.toString();
}

export const labelOf = (list: readonly Opt[], key: string) => list.find((o) => o.key === key)?.label ?? key;

/** Short chips describing a setup, e.g. ["ETH pair", "1–3% buy", "2% tax"]. */
export function setupChips(q: Query): string[] {
  const c = [`${labelOf(PAIRS, q.pair)} pair`, q.buy === "none" ? "No opening buy" : `${labelOf(BUYS, q.buy)} buy`];
  if (q.tax !== "any") c.push(`${q.tax}% tax`);
  if (q.route !== "any") c.push(`To ${labelOf(ROUTES, q.route).toLowerCase()}`);
  if (q.airdrop !== "any") c.push(q.airdrop === "yes" ? "Airdrop" : "No airdrop");
  return c;
}

export const VIBEVIBE_X = "vibevibefun"; // official, verified account linked from testnet.vibevibe.fun
export const VIBEVIBE_SITE = "https://testnet.vibevibe.fun";
