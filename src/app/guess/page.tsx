import type { Metadata } from "next";
import DataBadge from "@/components/DataBadge";
import GuessGame from "@/components/GuessGame";
import HeroCurve from "@/components/HeroCurve";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { guessPool } from "@/lib/dryrun";
import type { SP } from "@/lib/options";
import { siteUrl } from "@/lib/site";

type Props = { searchParams: Promise<SP> };
const int = (v: SP[string], max = 9999) => {
  const n = Number.parseInt(String(Array.isArray(v) ? v[0] : (v ?? "")), 10);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : null;
};

/** A shared score, if the link has one (score must be ≤ played). */
function challengeOf(sp: SP) {
  const score = int(sp.score);
  const played = int(sp.played);
  const best = int(sp.best) ?? 0;
  return score != null && played != null && played > 0 && score <= played ? { score, played, best: Math.min(best, played) } : null;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const c = challengeOf(await searchParams);
  const title = c ? `I called ${c.score} of ${c.played} vibe/vibe launches right. Beat me?` : "Guess the Graduation · Dry Run";
  const description = "Real vibe/vibe launches. Did they graduate? Guess, keep your streak, share your score. No wallet needed.";
  const image = { url: c ? `/api/og/guess?score=${c.score}&played=${c.played}&best=${c.best}` : "/api/og/guess", width: 1200, height: 630, alt: title };
  return { title, description, openGraph: { title, description, images: [image], siteName: "Dry Run" }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

export default async function GuessPage({ searchParams }: Props) {
  const c = challengeOf(await searchParams);
  const { grads, rest } = guessPool();
  return (
    <main className="relative mx-auto w-full max-w-3xl flex-1 px-4 pb-10 pt-5 sm:px-6 sm:pt-8">
      <HeroCurve />
      <SiteHeader active="guess" />
      <section className="mb-6">
        <DataBadge className="mb-5" extra={`${(grads.length + rest.length).toLocaleString("en-US")} launches in play`} />
        <h1 className="text-[2.4rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl">
          Guess the <span className="dr-text-glow text-lime">graduation.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-mute">A real vibe/vibe launch, its real settings. Did it fill its curve and graduate? Call it, keep your streak, share your score.</p>
      </section>
      <GuessGame base={siteUrl()} challenge={c ? { score: c.score, played: c.played } : null} />
      <p className="mt-4 text-[11px] leading-relaxed text-mute">
        Every round is a real V6 launch, 3+ days old, from the official vibe/vibe testnet API. Half the rounds graduated and half didn&apos;t, so guessing the same
        answer every time won&apos;t win. Answers are checked live against vibe/vibe. No wallet, nothing signed.
      </p>
      <SiteFooter />
    </main>
  );
}
