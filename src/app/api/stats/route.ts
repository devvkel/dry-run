import { parseQuery, runDryRun, headline } from "@/lib/dryrun";

/** JSON version of a dry run: /api/stats?pair=eth&buy=1-3&tax=2 */
export async function GET(req: Request) {
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const r = runDryRun(parseQuery(sp));
  return Response.json({ headline: headline(r), ...r });
}
