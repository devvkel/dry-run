"use client";

import { useEffect, useState } from "react";

/** Next scheduled data refresh: Mondays 05:17 UTC (see .github/workflows/refresh-data.yml). */
function nextRefresh(now: Date) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 5, 17));
  const add = (1 - d.getUTCDay() + 7) % 7;
  d.setUTCDate(d.getUTCDate() + add);
  if (d.getTime() <= now.getTime()) d.setUTCDate(d.getUTCDate() + 7);
  return d;
}

function left(ms: number) {
  const m = Math.max(0, Math.floor(ms / 60000));
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const mm = m % 60;
  return d ? `${d}d ${h}h` : `${h}h ${mm}m`;
}

export default function RefreshCountdown() {
  const [txt, setTxt] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setTxt(left(nextRefresh(new Date()).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{txt ?? "Monday"}</span>;
}
