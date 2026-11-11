import { ImageResponse } from "next/og";
import { BG, LIME, Logo, MUTE, OG_OPTS, host } from "@/lib/ogkit";

const int = (v: string | null) => {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, 9999) : null;
};

/** Score card for /guess: /api/og/guess?score=7&played=10&best=4 (1200×630 PNG). */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const score = int(sp.get("score"));
  const played = int(sp.get("played"));
  const valid = score != null && played != null && played > 0 && score <= played;
  const best = Math.min(int(sp.get("best")) ?? 0, played ?? 0);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "52px 64px 40px", background: BG, color: "#eef0f6", fontFamily: "Geist" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 22, color: MUTE, textTransform: "uppercase", letterSpacing: 3 }}>Guess the graduation</div>
          <Logo h={46} />
        </div>
        {valid ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 210, fontWeight: 700, lineHeight: 1, letterSpacing: -9, color: LIME }}>{`${score}/${played}`}</div>
              <div style={{ display: "flex", fontSize: 32, color: "#c9cddb", marginTop: 8 }}>real vibe/vibe launches called right</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ display: "flex", fontSize: 76 }}>🔥</div>
              <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#07080c", background: LIME, borderRadius: 18, padding: "8px 22px", marginTop: 8 }}>{`Best streak ${best}`}</div>
              <div style={{ display: "flex", fontSize: 26, color: "#c9cddb", marginTop: 14 }}>{`${Math.round((score! / played!) * 100)}% accuracy`}</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>Graduated or not?</div>
            <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3, color: LIME }}>Call real launches.</div>
            <div style={{ fontSize: 30, color: MUTE, marginTop: 22 }}>Real vibe/vibe settings. Keep your streak. No wallet needed.</div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 20, color: MUTE, borderTop: "1px solid #1d2130", paddingTop: 18 }}>
          <div style={{ display: "flex", color: "#eef0f6", fontWeight: 700 }}>{`beat it → ${host()}/guess`}</div>
          <div style={{ display: "flex" }}>Real vibe/vibe testnet launches · just for fun</div>
        </div>
      </div>
    ),
    OG_OPTS,
  );
}
