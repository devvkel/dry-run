import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { LOGO_LOCKUP } from "@/lib/brand";
import { fmtHours, globalStats, runDryRun } from "@/lib/dryrun";
import { parsePersona, parseQuery, setupChips } from "@/lib/options";
import { siteUrl } from "@/lib/site";

// Geist (SIL OFL) so the card has real bold weights.
const read = (...p: string[]) => readFileSync(path.join(process.cwd(), ...p));
const FONTS = [
  { name: "Geist", data: read("assets", "Geist-Regular.ttf"), weight: 400 as const, style: "normal" as const },
  { name: "Geist", data: read("assets", "Geist-Bold.ttf"), weight: 700 as const, style: "normal" as const },
];
const LOGO_SVG = read("public", LOGO_LOCKUP).toString("utf8");
const LOGO_SRC = `data:image/svg+xml;base64,${Buffer.from(LOGO_SVG).toString("base64")}`;
const [LOGO_W, LOGO_H] = (LOGO_SVG.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/) ?? ["", "300", "64"]).slice(1).map(Number);

const INK = "#07080c";
const LIME = "#c6ff3d";
const MUTE = "#8a90a6";

/** Profile picture via unavatar.io, as a data URI. Null if it fails or is slow. */
async function avatar(handle: string): Promise<string | null> {
  if (!handle) return null;
  try {
    const res = await fetch(`https://unavatar.io/x/${handle}?fallback=false`, { signal: AbortSignal.timeout(3500) });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !/image\/(png|jpe?g|gif)/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 200 || buf.length > 2_000_000) return null;
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

const host = () => siteUrl().replace(/^https?:\/\//, "");

function Logo({ h = 44 }: { h?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={LOGO_SRC} width={Math.round((LOGO_W / LOGO_H) * h)} height={h} alt="" />;
}

function promoCard() {
  const g = globalStats();
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 68px", background: `linear-gradient(135deg, ${INK} 0%, #0f1220 60%, #1a1638 100%)`, color: "#eef0f6", fontFamily: "Geist" }}>
      <Logo h={56} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 86, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>Rehearse your launch</div>
        <div style={{ fontSize: 86, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3, color: LIME }}>before it&apos;s real.</div>
        <div style={{ fontSize: 30, color: MUTE, marginTop: 22 }}>{`Test your vibe/vibe setup against ${g.launches.toLocaleString("en-US")} real launches.`}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: MUTE }}>
        <div style={{ display: "flex" }}>{host()}</div>
        <div style={{ display: "flex" }}>Robinhood Chain testnet · history, not a guarantee</div>
      </div>
    </div>
  );
}

/** Share card: /api/og?pair=eth&buy=1-3&name=Moon%20Cat&ticker=MCAT&x=kelcrown (1200×630 PNG). */
export async function GET(req: Request) {
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const opts = { width: 1200, height: 630, fonts: FONTS, headers: { "cache-control": "public, max-age=3600, s-maxage=86400" } };
  if (!sp.pair) return new ImageResponse(promoCard(), opts);

  const q = parseQuery(sp);
  const who = parsePersona(sp);
  const r = runDryRun(q);
  const P = r.personality;
  const av = await avatar(who.handle);
  const rate = Math.round(r.stats.rate * 100);
  const small = r.lowSample && r.stats.n > 0;
  const tone = small ? "#9aa0b4" : r.stats.rate >= 0.5 ? LIME : r.stats.rate >= 0.3 ? "#fcd34d" : "#fb7185";
  const initial = (who.handle || who.name || "D")[0].toUpperCase();
  const title = who.name || (who.ticker ? `$${who.ticker}` : "My pretend launch");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "48px 60px 40px", background: `linear-gradient(135deg, ${INK} 0%, #0f1220 55%, #1a1638 100%)`, color: "#eef0f6", fontFamily: "Geist" }}>
        {/* top: who + logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {av ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={av} width={88} height={88} style={{ borderRadius: 999, border: `3px solid ${LIME}`, objectFit: "cover" }} alt="" />
            ) : (
              <div style={{ width: 88, height: 88, borderRadius: 999, background: "#3b2f7a", border: `3px solid ${LIME}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 700 }}>{initial}</div>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1, display: "flex" }}>{title}</div>
                {who.ticker && who.name && <div style={{ fontSize: 32, fontWeight: 700, color: LIME, display: "flex" }}>{`$${who.ticker}`}</div>}
              </div>
              <div style={{ fontSize: 22, color: MUTE, display: "flex" }}>{who.handle ? `@${who.handle} · dry run, nothing launched` : "dry run, nothing launched"}</div>
            </div>
          </div>
          <Logo h={46} />
        </div>

        {/* chips */}
        <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
          {setupChips(r.requested).map((c) => (
            <div key={c} style={{ display: "flex", fontSize: 20, color: "#c9cddb", border: "1px solid #2a2f44", background: "rgba(255,255,255,0.04)", borderRadius: 999, padding: "6px 16px" }}>
              {c}
            </div>
          ))}
          {small && (
            <div style={{ display: "flex", fontSize: 20, fontWeight: 700, color: "#fde68a", border: "2px solid #fcd34d", background: "rgba(252,211,77,0.12)", borderRadius: 999, padding: "5px 16px" }}>
              {`⚠️ Small sample: ${r.stats.n} launches`}
            </div>
          )}
        </div>

        {/* middle: big % + personality */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 200, fontWeight: 700, lineHeight: 1, letterSpacing: -9, color: tone, display: "flex" }}>{r.stats.n ? `${rate}%` : "1st"}</div>
            <div style={{ fontSize: 28, color: "#c9cddb", display: "flex", marginTop: 4 }}>
              {r.stats.n
                ? `of ${r.stats.n.toLocaleString("en-US")} launches like mine graduated${r.stats.graduated ? ` · median ${fmtHours(r.stats.medianHours)}` : ""}`
                : "nobody has tried this setup yet"}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", maxWidth: 420 }}>
            <div style={{ fontSize: 18, color: MUTE, textTransform: "uppercase", letterSpacing: 3, display: "flex" }}>Launch personality</div>
            <div style={{ fontSize: 76, display: "flex", marginTop: 6 }}>{P.emoji}</div>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: INK, background: LIME, borderRadius: 18, padding: "8px 20px", marginTop: 8, textAlign: "right" }}>{P.title}</div>
            <div style={{ display: "flex", fontSize: 22, color: "#c9cddb", marginTop: 12, textAlign: "right" }}>{`“${P.tagline}”`}</div>
          </div>
        </div>

        {/* footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 20, color: MUTE, borderTop: "1px solid #1d2130", paddingTop: 18 }}>
          <div style={{ display: "flex", color: "#eef0f6", fontWeight: 700 }}>{`dry run yours → ${host()}`}</div>
          <div style={{ display: "flex" }}>{`Real vibe/vibe testnet data · ${r.baseRate ? `avg ${Math.round(r.baseRate * 100)}%` : ""} · not a guarantee`}</div>
        </div>
      </div>
    ),
    opts,
  );
}
