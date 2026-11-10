import type { Query } from "./options";

export type Personality = { key: string; title: string; emoji: string; tagline: string };

export const PERSONALITIES: Personality[] = [
  { key: "pioneer", title: "Uncharted Pioneer", emoji: "🧭", tagline: "Nobody's tried this setup. You'd be first." },
  { key: "santa", title: "Airdrop Santa", emoji: "🎅", tagline: "Gifts first, questions later." },
  { key: "monk", title: "Burn Monk", emoji: "🔥", tagline: "Less supply, more peace." },
  { key: "degen", title: "Diamond Degen", emoji: "💎", tagline: "All in before the first candle." },
  { key: "purist", title: "Fair-Launch Purist", emoji: "🕊️", tagline: "Zero bag. Pure vibes." },
  { key: "sprinter", title: "Curve Sprinter", emoji: "⚡", tagline: "Blink and it graduated." },
  { key: "whisperer", title: "Holder Whisperer", emoji: "🫶", tagline: "Your holders eat first." },
  { key: "suit", title: "Wall Street Viber", emoji: "📈", tagline: "Stocks on the curve, suits optional." },
  { key: "prophet", title: "Pre-IPO Prophet", emoji: "🔮", tagline: "Trading tomorrow's giants on today's curve." },
  { key: "builder", title: "Treasury Builder", emoji: "🏗️", tagline: "Stacking a war chest, brick by brick." },
  { key: "underdog", title: "Underdog Energy", emoji: "🐺", tagline: "Low odds. Loud meme." },
  { key: "stacker", title: "Steady Stacker", emoji: "🧱", tagline: "Slow curve, steady hands." },
];

const P = Object.fromEntries(PERSONALITIES.map((p) => [p.key, p])) as Record<string, Personality>;

/** Deterministic: same setup + same result always gives the same title. */
export function personalityFor(q: Query, s: { n: number; rate: number; medianHours: number }): Personality {
  if (s.n === 0) return P.pioneer;
  if (q.airdrop === "yes") return P.santa;
  if (q.route === "burn") return P.monk;
  if (q.buy === "25+") return P.degen;
  if (q.buy === "none") return P.purist;
  if (s.rate >= 0.4 && s.medianHours > 0 && s.medianHours < 6) return P.sprinter;
  if (q.route === "holders" && s.rate >= 0.35) return P.whisperer;
  if (["nvda", "spcx", "aapl"].includes(q.pair)) return P.suit;
  if (["openai", "anthropic"].includes(q.pair)) return P.prophet;
  if (q.route === "treasury") return P.builder;
  if (s.rate < 0.25) return P.underdog;
  return P.stacker;
}
