"use client";

import { useState } from "react";

export default function ShareBar({ shareUrl, ogUrl, tweet }: { shareUrl: string; ogUrl: string; tweet: string }) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const intent = `https://x.com/intent/post?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(shareUrl)}`;

  async function download() {
    setBusy(true);
    try {
      const res = await fetch(ogUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "dry-run-card.png";
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={intent}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink transition hover:brightness-110"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </a>
      <button
        onClick={download}
        disabled={busy}
        className="rounded-full border border-line bg-white/[0.04] px-4 py-2 text-sm font-medium transition hover:border-lime/60"
      >
        {busy ? "Rendering…" : "Download card"}
      </button>
      <button
        onClick={copy}
        className="rounded-full border border-line bg-white/[0.04] px-4 py-2 text-sm font-medium transition hover:border-lime/60"
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
