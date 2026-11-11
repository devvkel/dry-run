import { ImageResponse } from "next/og";
import { BEST_MIN, fmtHours } from "@/lib/dryrun";
import { ROUTES, labelOf } from "@/lib/options";
import { BG, Chip, LIME, Logo, MUTE, OG_OPTS, host } from "@/lib/ogkit";
import { checkToken, fmtPct, lookupToken, parseAddress, updatedLabel } from "@/lib/token";

function Promo() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 68px", background: BG, color: "#eef0f6", fontFamily: "Geist" }}>
      <Logo h={56} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 86, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>Check any token.</div>
        <div style={{ fontSize: 86, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3, color: LIME }}>See how its setup did.</div>
        <div style={{ fontSize: 30, color: MUTE, marginTop: 22 }}>Paste a vibe/vibe launch, get its real setup ranked.</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: MUTE }}>
        <div style={{ display: "flex" }}>{`${host()}/check`}</div>
        <div style={{ display: "flex" }}>Robinhood Chain testnet · history, not a guarantee</div>
      </div>
    </div>
  );
}

/** Share card for /check: /api/og/check?token=0x… (1200×630 PNG). */
export async function GET(req: Request) {
  const addr = parseAddress(new URL(req.url).searchParams.get("token"));
  if (!addr) return new ImageResponse(<Promo />, OG_OPTS);
  const l = await lookupToken(addr, 4000);
  if (l.kind !== "ok") return new ImageResponse(<Promo />, OG_OPTS);
  const i = l.info;
  const { r, rank } = checkToken(i);
  const tone = r.lowSample ? "#9aa0b4" : r.stats.rate >= 0.5 ? LIME : r.stats.rate >= 0.3 ? "#fcd34d" : "#fb7185";
  const grad = i.graduatedAt > 0;
  const chips = [`${i.pairLabel} pair`, i.buyBps ? `${fmtPct(i.buyBps)} buy` : "No opening buy", `${i.taxBps / 100}% tax`, `To ${labelOf(ROUTES, i.routing).toLowerCase()}`, i.airdrop ? "Airdrop" : "No airdrop"];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "48px 60px 40px", background: BG, color: "#eef0f6", fontFamily: "Geist" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 20, color: MUTE, textTransform: "uppercase", letterSpacing: 3, display: "flex" }}>Token check</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 6 }}>
              <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1, display: "flex", maxWidth: 640, overflow: "hidden" }}>{i.name.slice(0, 26)}</div>
              <div style={{ fontSize: 34, fontWeight: 700, color: LIME, display: "flex" }}>{`$${i.symbol.slice(0, 12)}`}</div>
            </div>
          </div>
          <Logo h={46} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
          {chips.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 180, fontWeight: 700, lineHeight: 1, letterSpacing: -8, color: tone, display: "flex" }}>{r.stats.n ? `${Math.round(r.stats.rate * 100)}%` : "—"}</div>
            <div style={{ fontSize: 28, color: "#c9cddb", display: "flex", marginTop: 4 }}>{`of ${r.stats.n.toLocaleString("en-US")} launches with this setup graduated`}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
            <div style={{ display: "flex", fontSize: 36, fontWeight: 700, color: grad ? "#07080c" : "#eef0f6", background: grad ? LIME : "rgba(255,255,255,0.08)", borderRadius: 18, padding: "10px 22px" }}>
              {grad ? `🎓 Graduated in ${fmtHours((i.graduatedAt - i.created) / 3600).replace(/\u00a0/g, " ")}` : `${Math.round(i.progressPct)}% of curve filled`}
            </div>
            <div style={{ display: "flex", fontSize: 26, color: "#c9cddb" }}>{rank.rank ? `Setup rank #${rank.rank} of ${rank.total}` : `Setup has < ${BEST_MIN} launches`}</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 20, color: MUTE, borderTop: "1px solid #1d2130", paddingTop: 18 }}>
          <div style={{ display: "flex", color: "#eef0f6", fontWeight: 700 }}>{`check any token → ${host()}/check`}</div>
          <div style={{ display: "flex" }}>{`Real vibe/vibe testnet data · ${updatedLabel()} · not a guarantee`}</div>
        </div>
      </div>
    ),
    OG_OPTS,
  );
}
