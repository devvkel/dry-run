import { lookupToken, parseAddress } from "@/lib/token";

export const dynamic = "force-dynamic";

/** The real outcome for a round: GET /api/guess/reveal?token=0x… */
export async function GET(req: Request) {
  const addr = parseAddress(new URL(req.url).searchParams.get("token"));
  if (!addr) return Response.json({ error: "bad token" }, { status: 400 });
  const l = await lookupToken(addr, 4000);
  if (l.kind !== "ok") return Response.json({ error: l.kind }, { status: l.kind === "notfound" ? 404 : 502 });
  const i = l.info;
  return Response.json(
    {
      token: i.token,
      graduated: i.graduatedAt > 0,
      hours: i.graduatedAt > 0 ? (i.graduatedAt - i.created) / 3600 : null,
      progressPct: i.progressPct,
      holders: i.holders,
      url: i.url,
      source: i.source,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
