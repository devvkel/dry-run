/**
 * Launch-image proxy: vibe/vibe serves /media/* with Cross-Origin-Resource-Policy:
 * same-origin, so browsers won't show those images on another site. IPFS CIDs are
 * content-addressed, so the bytes never change and can be cached for a long time.
 *   GET /api/img?cid=bafk…&s=sq410
 */
const SIZES = new Set(["thumb", "sq410", "card"]);

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const cid = sp.get("cid") ?? "";
  const size = sp.get("s") ?? "sq410";
  if (!/^[a-z0-9]{8,200}$/.test(cid) || !SIZES.has(size)) return new Response("bad request", { status: 400 });
  try {
    const res = await fetch(`https://testnet.vibevibe.fun/media/${cid}.${size}.webp`, { signal: AbortSignal.timeout(6000) });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return new Response("not found", { status: 404 });
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 3_000_000) return new Response("too large", { status: 413 });
    return new Response(buf, { headers: { "content-type": type, "cache-control": "public, max-age=86400, s-maxage=31536000, immutable" } });
  } catch {
    return new Response("upstream error", { status: 502 });
  }
}
