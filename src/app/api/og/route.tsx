import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { fmtHours, headline, parseQuery, runDryRun, setupLabel } from "@/lib/dryrun";

// Geist (SIL OFL) so the card has real bold weights.
const font = (f: string) => readFileSync(path.join(process.cwd(), "assets", f));
const FONTS = [
  { name: "Geist", data: font("Geist-Regular.ttf"), weight: 400 as const, style: "normal" as const },
  { name: "Geist", data: font("Geist-Bold.ttf"), weight: 700 as const, style: "normal" as const },
];

/** Share card for a dry run: /api/og?pair=eth&buy=1-3 (1200×630 PNG). */
export async function GET(req: Request) {
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const r = runDryRun(parseQuery(sp));
  const h = headline(r);
  const tone = r.stats.rate >= 0.5 ? "#c6ff3d" : r.stats.rate >= 0.3 ? "#fcd34d" : "#fb7185";
  const stats: [string, string][] = [
    ["Median time to graduate", fmtHours(r.stats.medianHours)],
    ["Median holders (graduates)", r.stats.medianHoldersGrad ? String(Math.round(r.stats.medianHoldersGrad)) : "—"],
    ["vs. vibe/vibe average", r.baseRate ? `${r.lift.toFixed(1)}×` : "—"],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: "linear-gradient(135deg, #07080c 0%, #0f1220 60%, #1a1638 100%)",
          color: "#eef0f6",
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "#c6ff3d",
                color: "#07080c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              DR
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>Dry Run</div>
              <div style={{ fontSize: 18, color: "#8a90a6" }}>rehearse your vibe/vibe launch</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: "#8a90a6",
              border: "1px solid #2a2f44",
              borderRadius: 999,
              padding: "8px 18px",
            }}
          >
            Robinhood Chain testnet
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 24, color: "#8a90a6", display: "flex" }}>{setupLabel(r.query)}</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 8 }}>
            <div style={{ fontSize: 190, fontWeight: 700, lineHeight: 1, letterSpacing: -8, color: tone }}>{h.big}</div>
            <div style={{ fontSize: 40, color: "#c9cddb", paddingBottom: 28 }}>graduated</div>
          </div>
          <div style={{ fontSize: 31, fontWeight: 700, marginTop: 8, display: "flex" }}>{h.line}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 40 }}>
            {stats.map(([k, v]) => (
              <div key={k} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 16, color: "#8a90a6", textTransform: "uppercase", letterSpacing: 2 }}>{k}</div>
                <div style={{ fontSize: 36, fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 16, color: "#6b7089", display: "flex", textAlign: "right", maxWidth: 260 }}>
            {`Based on ${r.stats.n.toLocaleString("en-US")} real launches · not a guarantee`}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: FONTS,
      headers: { "cache-control": "public, max-age=3600, s-maxage=86400" },
    },
  );
}
