// Shared bits for the /check and /guess share cards (same look as /api/og).
import { readFileSync } from "node:fs";
import path from "node:path";
import { LOGO_LOCKUP } from "@/lib/brand";
import { siteUrl } from "@/lib/site";

// Statically scoped paths so the bundler doesn't trace the whole project.
export const FONTS = [
  { name: "Geist", data: readFileSync(path.join(process.cwd(), "assets", "Geist-Regular.ttf")), weight: 400 as const, style: "normal" as const },
  { name: "Geist", data: readFileSync(path.join(process.cwd(), "assets", "Geist-Bold.ttf")), weight: 700 as const, style: "normal" as const },
];
const LOGO_SVG = readFileSync(path.join(process.cwd(), "public", "brand", path.basename(LOGO_LOCKUP))).toString("utf8");
const LOGO_SRC = `data:image/svg+xml;base64,${Buffer.from(LOGO_SVG).toString("base64")}`;
const [LOGO_W, LOGO_H] = (LOGO_SVG.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/) ?? ["", "300", "64"]).slice(1).map(Number);

export const INK = "#07080c";
export const LIME = "#c6ff3d";
export const MUTE = "#8a90a6";
export const BG = `linear-gradient(135deg, ${INK} 0%, #0f1220 55%, #1a1638 100%)`;
export const host = () => siteUrl().replace(/^https?:\/\//, "");
export const OG_OPTS = { width: 1200, height: 630, fonts: FONTS, headers: { "cache-control": "public, max-age=600, s-maxage=3600" } };

export function Logo({ h = 44 }: { h?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={LOGO_SRC} width={Math.round((LOGO_W / LOGO_H) * h)} height={h} alt="" />;
}

export function Chip({ children }: { children: string }) {
  return <div style={{ display: "flex", fontSize: 20, color: "#c9cddb", border: "1px solid #2a2f44", background: "rgba(255,255,255,0.04)", borderRadius: 999, padding: "6px 16px" }}>{children}</div>;
}
