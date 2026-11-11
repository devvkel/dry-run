import Link from "next/link";

const pill = "whitespace-nowrap rounded-full border border-line px-2.5 py-1.5 sm:px-3 text-xs text-mute transition hover:border-lime/60 hover:text-white";

/** Discreet links to the extra tools. Sits next to the existing header link. */
export default function NavLinks({ active }: { active?: "check" | "guess" }) {
  return (
    <>
      <Link href="/check" className={`${pill} ${active === "check" ? "border-lime/60 text-white" : ""}`}>
        Check<span className="hidden sm:inline"> a token</span>
      </Link>
      <Link href="/guess" className={`${pill} ${active === "guess" ? "border-lime/60 text-white" : ""}`}>
        Guess<span className="hidden sm:inline"> game</span>
      </Link>
    </>
  );
}
