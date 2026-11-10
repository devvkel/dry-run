# Dry Run

**Rehearse your vibe/vibe launch before the settings lock forever.**

On [vibe/vibe](https://testnet.vibevibe.fun) (Robinhood Chain testnet), the pair, tax, routing, opening buy and airdrop are fixed the moment you launch. Dry Run lets a creator pick their setup first and see how **real past launches with the same setup** actually did:

> *Launches like yours graduated 1,180 of 1,986 times, median 21 h.*

- **Graduation rate** for your setup, and how it compares to the vibe/vibe average
- **Time to graduate** (median, plus the fast/slow middle half)
- **Holders** on launches that graduated, and where the rest stalled on the curve
- **"Try instead"**: how other opening-buy sizes and tax tiers did for the same pair
- **Real example launches**, linked to their vibe/vibe pages
- **Shareable result**: every result has its own URL, an Open Graph / X card image, a *Share on X* button and *Download card* (PNG)

## v2: guided flow + personal cards

- **Landing**: a hero ("Rehearse your launch before it's real"), live dataset stats, and 3 steps showing how it works.
- **Pretend-launch builder** (6 steps): token name, $TICKER, pair, opening buy, tax and routing, airdrop, and an optional X handle. Then **Dry Run it →** reveals the result with a count-up and light confetti on good outcomes.
- **Launch personality**: a fun title picked deterministically from your setup and result (see `src/lib/personality.ts`).
- **Personal share card** (`/api/og`): avatar (via unavatar.io, with an initial as fallback), @handle, token name/$TICKER, setup chips, big %, personality, logo and site URL. Handle, name and ticker are part of the share URL (`x`, `name`, `ticker`), so the X preview shows *your* card. Inputs are sanitized: handle `[A-Za-z0-9_]` up to 15 characters, name up to 24 Latin characters, ticker `A-Z0-9` up to 10.
- **Share on X** tags the official [@vibevibefun](https://x.com/vibevibefun) account. A **Ready for real? Launch on vibe/vibe** button sits under every result.
- **FAQ / honesty** section: what's rehearsal vs. real, where the data comes from, and why it's not a guarantee.

### Logo

There are 4 concepts in `brand/` (and `public/brand/`), plus a side-by-side sheet at `logo-options.png`. Regenerate them with `node scripts/build-logos.mjs`. The live one is set in `src/lib/brand.ts` (`LOGO_OPTION`). To swap, change that number and run `cp public/brand/logo-N-mark.svg src/app/icon.svg`.

## How it works

1. `scripts/build-dataset.mts` pages through every V6 launch on the official vibe/vibe API and writes a compact cache to `data/launches.json` (about 24k launches, ~3 MB).
2. The app (Next.js App Router, server components) reads that file and filters it by your setup:
   - **Pair**: ETH, the test stocks (NVDA, SPCX, AAPL), test pre-IPO assets (OPENAI, ANTHROPIC), USDG, VIBEVIBE, or another launch token
   - **Opening buy**: the creator's initial buy as a % of the 1B supply (from `initialNetPersonalUnits`)
   - **Optional**: tax tier (1/2/3%), dominant tax routing (treasury, holders or burn), airdrop list attached or not
3. If fewer than 25 launches match, the optional filters are widened (routing, then airdrop, then tax) and the page says so.
4. Graduation rates only count launches that are **at least 3 days old** at snapshot time, so brand-new launches don't drag the rate down.

### Routes

| Route | What |
| --- | --- |
| `/?pair=eth&buy=1-3&tax=2&route=holders&airdrop=no&name=Moon%20Cat&ticker=MCAT&x=handle` | The tool. The URL *is* the result, so it can be shared. Without `pair` you get the landing page. |
| `/api/og?…same params…` | 1200×630 PNG share card (used for `og:image` / `twitter:image` and *Download card*) |
| `/api/stats?…same params…` | The same result as JSON |

`buy` values are `none`, `lt1`, `1-3`, `3-10`, `10-25` and `25+`.

## Data sources

- Official vibe/vibe API: `https://testnet.vibevibe.fun/api/v1/chains/46630/v6/launches` (paged, 50 per page) and `/config`
- Test-asset pair list: mirrored from the official vibe/vibe frontend, and checked against the Robinhood Chain testnet explorer
- Links: `https://testnet.vibevibe.fun/token/<address>`

## Honest limits

- **History, not a prediction.** Correlation isn't causation, and nothing here is a guarantee of graduation, volume or rewards.
- Testnet behaviour (farming, bots, quests) shapes these numbers. Expect mainnet to differ.
- Covers **V6 launches only** (factories `0xe794…fea0` and `0xac13…31f7`). Older V1/V5 launches from the earlier API aren't mixed in, because their settings aren't comparable.
- The API doesn't expose sniper-tax outcomes or who bought early, so Dry Run doesn't model them.
- Opening buy is measured in tokens (% of supply), not ETH spent.
- Volume is only available as a 24h window, so it isn't used for comparisons.
- The dataset is a snapshot. Run `npm run data` to refresh it.

## Run locally

```bash
npm install
npm run data      # refresh data/launches.json from the live API (~75 s)
npm run dev       # http://localhost:3000
# or
npm run build && npm start
```

Requires Node 22.6+ (the data script uses native TypeScript type stripping).

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import it in Vercel. The framework is auto-detected as Next.js, and no env vars are required.
3. Optional: set `NEXT_PUBLIC_SITE_URL=https://your-domain` so share links and card URLs use your domain. Otherwise Vercel's production URL is used.
4. To refresh data, run `npm run data`, then commit and push. A scheduled GitHub Action could automate this.

---

Built by [@kelcrown](https://x.com/kelcrown), an independent builder based in Africa, for the vibe/vibe Builder Foundry. Not affiliated with vibe/vibe or Robinhood. Testnet only, and testnet tokens have no value.
