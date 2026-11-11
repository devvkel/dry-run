"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ShareBar from "@/components/ShareBar";

type Round = { token: string; name: string; symbol: string; image: string | null; chips: string[]; launched: string; hint: { rate: number; n: number } };
type Outcome = { graduated: boolean; hours: number | null; progressPct: number; holders: number | null; url: string };
type Score = { score: number; played: number; streak: number; best: number };

const KEY = "dryrun-guess-v1";
const ZERO: Score = { score: 0, played: 0, streak: 0, best: 0 };

function fmtHours(h: number) {
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`;
  if (h < 48) return `${h < 10 ? h.toFixed(1) : Math.round(h)} h`;
  return `${(h / 24).toFixed(1)} days`;
}
const ago = (iso: string) => {
  const d = (Date.now() - Date.parse(iso)) / 86400000;
  return d < 1 ? "today" : `${Math.round(d)} day${Math.round(d) === 1 ? "" : "s"} ago`;
};

export default function GuessGame({ base, challenge }: { base: string; challenge: { score: number; played: number } | null }) {
  const [round, setRound] = useState<Round | null>(null);
  const [next, setNext] = useState<Round | null>(null);
  const [pick, setPick] = useState<boolean | null>(null);
  const [out, setOut] = useState<Outcome | null>(null);
  const [err, setErr] = useState("");
  const [s, setS] = useState<Score>(ZERO);
  const [showHint, setShowHint] = useState(false);
  const busy = useRef(false);

  const fetchRound = useCallback(async (): Promise<Round> => {
    const r = await fetch("/api/guess", { cache: "no-store" });
    if (!r.ok) throw new Error("round");
    return r.json();
  }, []);

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- load saved score once on mount
      if (v && typeof v.score === "number") setS({ ...ZERO, ...v });
    } catch {}
    fetchRound().then(setRound, () => setErr("Couldn't load a launch. Refresh to try again."));
    fetchRound().then(setNext, () => {});
  }, [fetchRound]);

  const save = (v: Score) => {
    setS(v);
    try {
      localStorage.setItem(KEY, JSON.stringify(v));
    } catch {}
  };

  async function guess(g: boolean) {
    if (!round || pick !== null || busy.current) return;
    busy.current = true;
    setPick(g);
    try {
      const r = await fetch(`/api/guess/reveal?token=${round.token}`, { cache: "no-store" });
      if (!r.ok) throw new Error("reveal");
      const o: Outcome = await r.json();
      setOut(o);
      const right = o.graduated === g;
      const streak = right ? s.streak + 1 : 0;
      save({ score: s.score + (right ? 1 : 0), played: s.played + 1, streak, best: Math.max(s.best, streak) });
    } catch {
      setPick(null);
      setErr("Couldn't check the answer. Try again.");
    } finally {
      busy.current = false;
    }
  }

  async function nextRound() {
    setErr("");
    setPick(null);
    setOut(null);
    setShowHint(false);
    if (next) {
      setRound(next);
      setNext(null);
      fetchRound().then(setNext, () => {});
    } else {
      setRound(null);
      fetchRound().then(setRound, () => setErr("Couldn't load a launch. Try again."));
    }
  }

  const right = out && pick !== null ? out.graduated === pick : null;
  const shareQs = new URLSearchParams({ score: String(s.score), played: String(s.played), best: String(s.best) }).toString();
  const tweet = `I called ${s.score} of ${s.played} real @vibevibefun launches right in Guess the Graduation on Dry Run${s.best > 1 ? ` (best streak ${s.best} 🔥)` : ""}. Think you can beat me? 👇`;

  return (
    <div>
      {challenge && (
        <div className="dr-pop mb-4 rounded-2xl border border-violet-400/40 bg-violet-500/10 p-3.5 text-sm">
          🎯 A friend called <b>{challenge.score}</b> of <b>{challenge.played}</b> right. Can you beat that?
        </div>
      )}

      {/* scoreboard */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {(
          [
            ["Score", `${s.score}/${s.played}`],
            ["Streak", `${s.streak}${s.streak >= 3 ? " 🔥" : ""}`],
            ["Best streak", String(s.best)],
          ] as const
        ).map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-line bg-panel/60 px-2 py-3">
            <div key={v} className="dr-bump text-lg font-semibold tabular-nums sm:text-2xl">
              {v}
            </div>
            <div className="text-[10px] text-mute sm:text-xs">{l}</div>
          </div>
        ))}
      </div>

      {/* round card */}
      <div
        key={round?.token ?? "loading"}
        className={`relative mt-4 overflow-hidden rounded-[2rem] border bg-gradient-to-b from-[#121626] to-panel p-5 sm:p-8 ${round ? "dr-pop" : ""} ${
          right === true ? "border-lime/60" : right === false ? "dr-shake border-rose-400/60" : "border-lime/25"
        }`}
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lime/10 blur-3xl" />
        {!round ? (
          <div className="py-16 text-center text-sm text-mute">{err || "Picking a real launch…"}</div>
        ) : (
          <>
            <div className="text-[10px] uppercase tracking-[0.16em] text-mute">A real vibe/vibe launch · {ago(round.launched)}</div>
            <div className="mt-3 flex items-center gap-4">
              {round.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={round.image} alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-2xl border border-line object-cover" />
              ) : (
                <div className="grid h-[72px] w-[72px] place-items-center rounded-2xl bg-violet-500/30 text-2xl font-bold">{(round.symbol || "?")[0]}</div>
              )}
              <div className="min-w-0">
                <div className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">{round.name}</div>
                <div className="text-sm font-semibold text-lime">${round.symbol}</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {round.chips.map((c) => (
                <span key={c} className="rounded-full border border-line bg-white/[0.04] px-2.5 py-1 text-[11px] text-mute">
                  {c}
                </span>
              ))}
            </div>

            <div className="mt-4 text-sm text-mute">
              {showHint || out ? (
                <span className="dr-pop inline-block">
                  💡 {Math.round(round.hint.rate * 100)}% of {round.hint.n.toLocaleString("en-US")} launches with this setup graduated.
                </span>
              ) : (
                <button onClick={() => setShowHint(true)} className="underline decoration-dotted underline-offset-4 hover:text-white">
                  Need a hint? See how this setup usually does
                </button>
              )}
            </div>

            {!out ? (
              <>
                <div className="mt-6 text-lg font-semibold">Did it graduate?</div>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => guess(true)}
                    disabled={pick !== null}
                    className={`rounded-2xl bg-lime px-4 py-4 text-base font-bold text-ink transition hover:brightness-110 disabled:opacity-60 ${pick === true ? "ring-2 ring-white/60" : ""}`}
                  >
                    🎓 Graduated
                  </button>
                  <button
                    onClick={() => guess(false)}
                    disabled={pick !== null}
                    className={`rounded-2xl border border-line bg-white/[0.04] px-4 py-4 text-base font-bold transition hover:border-rose-400/60 disabled:opacity-60 ${pick === false ? "ring-2 ring-white/60" : ""}`}
                  >
                    💤 Didn&apos;t
                  </button>
                </div>
                {pick !== null && <div className="mt-3 text-center text-xs text-mute">Checking the chain…</div>}
              </>
            ) : (
              <div className="dr-pop mt-6">
                <div className={`text-2xl font-bold sm:text-3xl ${right ? "text-lime" : "text-rose-400"}`}>{right ? "✅ Called it!" : "❌ Not this time"}</div>
                <p className="mt-1.5 text-base">
                  {out.graduated ? (
                    <>
                      ${round.symbol} <b className="text-lime">graduated</b>
                      {out.hours != null ? ` in ${fmtHours(out.hours)}` : ""}.
                    </>
                  ) : (
                    <>
                      ${round.symbol} <b>didn&apos;t graduate</b>. It filled {Math.round(out.progressPct)}% of its curve.
                    </>
                  )}
                </p>
                {!out.graduated && (
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="dr-grow h-full rounded-full bg-white/40" style={{ width: `${Math.max(2, out.progressPct)}%` }} />
                  </div>
                )}
                <div className="mt-2 text-xs text-mute">
                  {out.holders != null ? `${out.holders.toLocaleString("en-US")} holders · ` : ""}
                  <a href={out.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                    see it on vibe/vibe ↗
                  </a>{" "}
                  ·{" "}
                  <a href={`/check?token=${round.token}#result`} className="underline hover:text-white">
                    check its setup
                  </a>
                </div>
                <button onClick={nextRound} className="press mt-5 w-full rounded-full bg-lime px-5 py-3.5 text-sm font-bold text-ink transition hover:brightness-110">
                  Next launch →
                </button>
              </div>
            )}
            {err && round && <p className="mt-3 text-xs text-rose-300">{err}</p>}
          </>
        )}
      </div>

      {s.played > 0 && (
        <div className="dr-pop mt-4 rounded-3xl border border-line bg-panel/80 p-5">
          <div className="font-semibold">Brag about it</div>
          <p className="mb-4 mt-1 text-xs text-mute">Your score lives on this device only.</p>
          <ShareBar shareUrl={`${base}/guess?${shareQs}`} ogUrl={`/api/og/guess?${shareQs}`} tweet={tweet} filename="dry-run-guess-score.png" label="Share my score on X" />
          <button
            onClick={() => save(ZERO)}
            className="mt-3 text-xs text-mute underline decoration-dotted underline-offset-4 hover:text-white"
          >
            Reset score
          </button>
        </div>
      )}
    </div>
  );
}
