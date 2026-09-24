# EISAX corporate website

Static corporate website deployed by Cloudflare Pages. Production is connected to `main`; changes must be reviewed on a separate preview branch before merge.

## Architecture

- `/` and `/ar/`: bilingual company overview and anchor-based sections.
- `/products/` and `/ar/products/`: canonical portfolio directory.
- `/privacy`, `/terms`, `/disclaimer`: corporate legal pages.
- `product-registry.js`: corporate presentation source of truth for product maturity, access, audience and commercial model. It does not imply shared product infrastructure.
- `portfolio.js`: renders cards from the registry on home and portfolio pages. Product applications remain on their own domains and retain their own identity and authentication.
- `docs/PHASE1-AUDIT.md` and `docs/PHASE2-IA.md`: audit evidence and route decisions.

Digital Assets and EISAX Lab are future/R&D with no MVP. EISAX Lab is an innovation function, not a commercial product. E-Academy by EISAX is the approved Academy brand. No prices, clients, traction, licenses or partnerships are claimed.

## Local checks

Run `node tests/local-server.cjs`, then `node tests/preview.test.cjs` and `node tests/orbit.test.cjs`. The local server reproduces Cloudflare's clean legal URLs. The browser checks cover English/Arabic, desktop/mobile, registry counts, navigation anchors, orbit positions and interactions, logo/text containment, basic accessibility attributes, SEO metadata, JS errors and horizontal overflow. Screenshots are generated in ignored `screenshots/`.

No database or build pipeline is required for the corporate site. The corporate pages must not bypass protected product applications.
