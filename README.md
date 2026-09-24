# EISAX corporate website

Static corporate website deployed by Cloudflare Pages. Production is connected to `main`; changes must be reviewed on a separate preview branch before merge.

## Architecture

- `/` and `/ar/`: bilingual company overview and anchor-based sections.
- `/products/` and `/ar/products/`: canonical portfolio directory.
- `/privacy`, `/terms`, `/disclaimer`: corporate legal pages.
- `product-registry.js`: corporate presentation source of truth for product maturity, access, audience and commercial model. It does not imply shared product infrastructure.
- `scripts/render-pages.cjs`: pre-renders registry content into the English and Arabic HTML and keeps visible translations synchronized. The public pages contain the correct positioning even when JavaScript is disabled.
- Product applications remain on their own domains and retain their own identity and authentication.
- `docs/PHASE1-AUDIT.md` and `docs/PHASE2-IA.md`: audit evidence and route decisions.

Digital Assets and EISAX Lab are future/R&D with no MVP. EISAX Lab is an innovation function, not a commercial product. E-Academy by EISAX is the approved Academy brand. No prices, clients, traction, licenses or partnerships are claimed.

## Local checks

Run `npm ci`, then `npx playwright install chromium`. Start `npm run serve` in one terminal and run `npm test` in another. The local server reproduces Cloudflare's clean legal URLs. The browser checks use standard Chromium and cover English/Arabic, desktop/mobile, JavaScript-on/off rendering, registry counts, navigation anchors, orbit positions and interactions, logo/text containment, basic accessibility attributes, SEO metadata, JS errors and horizontal overflow. Screenshots are generated in ignored `screenshots/`. Set `PREVIEW_BASE` to a preview deployment URL to repeat the browser tests against that deployment.

After changing `product-registry.js` or a visible translation in `main.js`, run `npm run render` and commit the generated HTML with the source. `npm test` rejects stale generated content.

No database or build pipeline is required for the corporate site. The corporate pages must not bypass protected product applications.
