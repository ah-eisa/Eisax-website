# Phase 2 — portfolio source of truth and information architecture

`product-registry.js` is the corporate presentation registry. It records four independent dimensions for each entry: maturity, access, audience and commercial model. It is not evidence of shared technical infrastructure. Product teams keep their own branding and app logic.

## Route decision

| Route | Purpose | Decision |
| --- | --- | --- |
| `/`, `/ar/` | Corporate overview, financial-technology priority, sector context, company and contact | Keep existing anchor sections and interaction model |
| `/products/`, `/ar/products/` | Canonical, indexable portfolio directory with accurate separate status/access/audience/model and protected-app front doors | Add: existing cards are too dense and conflated stages, and anchors cannot serve a durable portfolio URL |
| `/solutions`, `/company`, `/innovation`, `/partnerships` | Existing home sections | Keep as anchor redirects; no standalone page justified yet |
| `/privacy`, `/terms`, `/disclaimer` | Corporate legal pages | Keep; align brand and technology-provider wording |

The parent brand is `EISAX`; product names retain independent identities. Corporate links to protected products explain access rather than imply an open trial. Digital Assets and EISAX Lab are not marketed as available products. The registry is reviewed against owner-provided facts and observed public routes, not speculative pricing or traction.

Do not merge or deploy to production until owner reviews the Phase 4 preview.
