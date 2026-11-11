import { DATASET_META, guessPool, runDryRun } from "@/lib/dryrun";
import { ROUTES, labelOf } from "@/lib/options";
import { fmtPct, lookupToken, queryFor, updatedLabel } from "@/lib/token";

export const dynamic = "force-dynamic";

/**
 * One round of "Guess the graduation": a random real launch (3+ days old at
 * snapshot) with its settings, but not its outcome. Half the rounds are
 * graduates and half are not, so neither answer is a free win.
 *   GET /api/guess
 */
export async function GET() {
  const { grads, rest } = guessPool();
  const list = Math.random() < 0.5 ? grads : rest;
  const row = list[Math.floor(Math.random() * list.length)];
  // Live lookup only for the image (best effort, short timeout).
  const live = await lookupToken(row[0], 2500);
  const image = live.kind === "ok" ? live.info.image : null;
  const info = {
    token: row[0], name: row[1], symbol: row[2], image: null, pairKey: row[3], pairLabel: row[4], created: row[5], graduatedAt: row[6],
    buyBps: row[7], taxBps: row[8], routing: row[9], airdrop: row[10] === 1, holders: row[11], progressPct: row[13] / 100,
    source: "snapshot" as const, url: "", explorer: "",
  };
  const s = runDryRun(queryFor(info)).stats;
  return Response.json(
    {
      token: row[0],
      name: row[1],
      symbol: row[2],
      image,
      chips: [
        `${row[4]} pair`,
        row[7] ? `${fmtPct(row[7])} opening buy` : "No opening buy",
        `${row[8] / 100}% tax`,
        `To ${labelOf(ROUTES, row[9]).toLowerCase()}`,
        row[10] ? "Airdrop" : "No airdrop",
      ],
      launched: new Date(row[5] * 1000).toISOString(),
      hint: { rate: s.rate, n: s.n },
      updated: updatedLabel(),
      snapshot: DATASET_META.builtAt,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
