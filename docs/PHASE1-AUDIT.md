# Phase 1 — repository and deployment audit (2026-09-24)

Scope: read-only audit of the corporate Pages site and public product entry points. No production deployment or application code was changed. Product maturity statements below are owner-confirmed; technical/access observations were checked against running sites and deployment configuration.

## Production source and deployment

| Property | Verified state |
| --- | --- |
| Corporate Git source | `ah-eisa/Eisax-website`, local copy `C:/Users/ahmed/server3/Eisax-website` |
| Production branch/commit | `main` / `83fe490631985f3582dfcde83a487f8f8510fce5` |
| Production deployment | Cloudflare Pages project `eisax`; Git-connected automatic production builds from `main`; static root, no build command |
| Domains | `eisax.com`, `www.eisax.com` active on Cloudflare Pages |
| Recovery baseline | Pages deployment `4bf57cea-4592-4885-bd79-f8df85ca7cdb` (`https://4bf57cea.eisax.pages.dev`) plus Git commit above |

The checked-out preview branch is `codex/eisax-portfolio-preview`. It does not modify `main`.

## Repository and domain map

| Product | Observed source / branch | Deployment / domain | Public access observed |
| --- | --- | --- | --- |
| EISAX corporate | Git source above | Cloudflare Pages / `eisax.com` | Public |
| EISAX Intelligence / Agent | `/home/ubuntu/eisax-agent-staging` UI; `/home/ubuntu/investwise` Python API, Git `main` `adf7aa2`, dirty | Nginx + Gunicorn / `agent.eisax.com` (129.151.148.2) | Site-wide HTTP Basic Auth, 401 anonymously |
| WealthGate AI | `/opt/emcoin/app`, Git `production` `33ec4fc` | Nginx + PM2 / `wealthgateai.com` (141.145.144.119) | `/` redirects to `/login` |
| EISAX Planner | `/opt/apps/planner`, deployed copy without Git; local candidate `C:/Users/ahmed/planner` not proven identical | Nginx static + Docker API / `planner.eisax.com` (141.145.144.119) | Public calculator; admin API authenticated |
| SaveBuddy AI | `/opt/apps/savebuddy`, deployed copy without Git | Nginx static + FastAPI service / `savebuddy.eisax.com` (141.145.144.119) | Public landing/demo |
| E-Quiz | `/opt/apps/equiz-staging`, deployed copy without Git | Nginx + Docker Compose / `quiz.eisax.com` (141.145.144.119) | Public entry, free usage limit shown |
| E-Academy by EISAX | `/home/ubuntu/ainvest-academy`, deployed copy without Git; local `C:/Users/ahmed/academy` is separate Git working tree | Nginx + Docker Compose / `academy.eisax.com` (145.241.123.201) | Public entry; admin API authenticated |
| Brevoya | `/home/ubuntu/projects/brevoya`, Git `release/0.6.0-rc1` `7b12a94` | Nginx + Docker Compose / `brevoya.com` (141.145.144.119) | Public entry |
| Digital Assets | Owner-confirmed future concept, no MVP | No verified product deployment | None |
| EISAX Lab | Owner-confirmed future R&D function, no MVP | No verified product deployment | None |

These are distinct deployment stacks. No shared account, AI layer, database or infrastructure claim is established.

## Corporate route and SEO/legal inventory

- Public content: `/`, `/ar/`, `/privacy`, `/terms`, `/disclaimer`. `/products`, `/solutions`, `/platform`, `/partnerships` are redirects to homepage anchors. Historic portfolio/blog paths redirect to `/`.
- Home pages have canonical, hreflang and Open Graph metadata. Sitemap lists only the two home pages and three legal pages; robots exists. Organization structured data is absent.
- Current homepage emphasizes an undifferentiated “eight solutions”, omits Academy, includes Future Digital Assets and Lab as product cards, and uses mixed `EisaX`/`EISAX` branding. This conflicts with the approved portfolio facts and makes product maturity/access unclear.
- Legal pages exist, but corporate copy needs technology-provider wording; marketing must not imply EISAX provides regulated investment advice, brokerage, custody, discretionary management, lending approval or exchange services.
- Existing anchor-based home navigation is functional. Only a portfolio detail page is currently justified as an additional canonical route; the other proposed corporate sections can remain meaningful home anchors until user research supports separate pages.

## Product entry and exposure checks

- Agent: `/`, `/app`, `/login` returned 401 anonymously. Any public product front door must be separate from the protected app.
- WealthGate: `/` redirects to `/login`; public `/privacy` and `/terms` returned 404. Preserve login and add public product introduction later.
- Planner: anonymous `/admin` renders the public calculator app shell and exposes an “operations/admin” heading in the UI. `/api/v1/admin/overview`, `/leads`, `/banks`, `/ops/status` returned 401; a scan of public static files found no common hard-coded API key or credential patterns. Hide public admin navigation in later product work without weakening the API guard. `/robots.txt` and `/sitemap.xml` return app HTML.
- Academy: anonymous `/#/admin` shows an access-denied state but discloses an admin heading. `/api/admin/users`, `/payments`, `/audit` returned 401; a scan of built assets found no common hard-coded key patterns. Privacy and Terms pages state they are drafts awaiting owner approval. Current visible brand is A-Invest Academy, not final approved E-Academy by EISAX.
- SaveBuddy, E-Quiz and Brevoya have public app entry points. Brevoya has distinct `/legal/terms`, `/legal/privacy`, `/legal/community-guidelines`; E-Quiz's generic legal paths return the app shell despite legacy legal HTML files in the source. Common robots/sitemap paths on product apps mostly return app HTML. These need product-by-product remediation only after corporate approval.

## Confirmed risk and rollback

Phase 1–4 work is limited to this corporate preview branch. Production `main`, Cloudflare production and all product sites remain unchanged. If preview is rejected, remove or abandon the preview deployment/branch; no production rollback is needed. If a later approved merge is deployed, revert the merge or redeploy the baseline Pages deployment above. There is no corporate database migration. Before any later product-site change, snapshot Git-less deployed trees and database/container state; the Agent API tree has existing uncommitted changes.
