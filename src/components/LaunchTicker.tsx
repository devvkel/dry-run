import Link from "next/link";
import { latestGraduates, latestLaunches, type Highlight } from "@/lib/dryrun";

function Item({ h }: { h: Highlight }) {
  return (
    <Link
      href={`/check?token=${h.token}#result`}
      className="group flex shrink-0 items-center gap-2 rounded-full border border-line bg-panel/70 px-3 py-1.5 text-xs transition hover:border-lime/50"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${h.graduated ? "bg-lime shadow-[0_0_8px_#c6ff3d]" : "bg-white/30"}`} />
      <span className="max-w-[9rem] truncate font-semibold text-white group-hover:text-lime">${h.symbol}</span>
      <span className="text-mute">{h.pairLabel}</span>
      <span className={h.graduated ? "font-semibold text-lime" : "tabular-nums text-mute"}>{h.graduated ? "graduated" : `${Math.round(h.progressPct)}% curve`}</span>
    </Link>
  );
}

/** Marquee of real launches from the snapshot: the newest ones, mixed with the latest graduations. */
export default function LaunchTicker() {
  const fresh = latestLaunches(14);
  const grads = latestGraduates(6);
  const items: Highlight[] = [];
  for (let i = 0; i < fresh.length; i++) {
    items.push(fresh[i]);
    if (i % 2 === 1 && grads[i >> 1]) items.push(grads[i >> 1]);
  }
  return (
    <section aria-label="Latest real vibe/vibe launches" className="dr-ticker relative -mx-4 overflow-hidden py-1 sm:-mx-6">
      <div className="dr-ticker-track flex w-max gap-2">
        {[0, 1].map((k) => (
          <div key={k} className="flex gap-2 pr-2" aria-hidden={k === 1 ? true : undefined}>
            {items.map((h) => (
              <Item key={`${k}-${h.token}`} h={h} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
