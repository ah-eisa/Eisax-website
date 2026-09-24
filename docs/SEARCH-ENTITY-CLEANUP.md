# EISAX search and entity cleanup — 2026-09-24

Scope: the Git-connected Cloudflare Pages corporate website at `eisax.com`. The approved portfolio architecture and product applications are unchanged.

## Source of truth

EISAX is the brand of EISAX FZ-LLC, a UAE technology company. Financial technology is its primary current focus. The corporate site is `https://eisax.com/`. Products have independent identities. Digital Assets and EISAX Lab remain future research without an MVP.

The two homepage Organization JSON-LD blocks share `https://eisax.com/#organization`, the verified company name and legal name, UAE country, corporate URL and the existing official logo. `sameAs` is intentionally absent: no social account is linked from the current first-party corporate site or otherwise sufficiently verified as official. Public search results show a similarly named LinkedIn account with older claims; it has not been asserted as the same entity.

## Search Console snapshot and search results

The domain property Pages report showed **7 indexed URLs and 12 not indexed** at its last update on **2026-09-21**. This is a dated Search Console snapshot, not a real-time claim about today's index.

| URL Search Console listed as indexed | Action / canonical target |
| --- | --- |
| `https://eisax.com/` | Update current homepage; self-canonical `/` |
| `https://eisax.com/ar/` | Update current Arabic homepage; self-canonical `/ar/` |
| `https://quiz.eisax.com/` | Separate product site; outside corporate cleanup |
| `https://eisax.com/partnerships.html` | 301 to `/#partnerships`; canonical `/` |
| `https://eisax.com/legal` | 301 to `/terms`; canonical `/terms` |
| `https://eisax.com/ar-partnerships` | 301 to `/ar/#partnerships`; canonical `/ar/` |
| `https://eisax.com/ar` | Already redirects to `/ar/`; canonical `/ar/` |

Search Console's excluded examples included `http://eisax.com/`, `http://www.eisax.com/`, `https://www.eisax.com/index.html`, `/partnerships`, `/index.html`, `/legal.html`, `/ar-partnerships.html` as redirects; `https://www.eisax.com/` as an alternate canonical; `/ar.html`, `/cdn-cgi/l/email-protection`, and `https://www.eisax.com/v1/export/html-pdf` as 404; and `https://agent.eisax.com/` as 401. The last two 404 paths have no equivalent corporate content and remain unavailable; the protected Agent 401 is expected.

Public search results still displayed older cached copy for `/`, `/ar/`, `/ar`, `/products`, `/ar-products`, `/platform`, `/ar-platform`, `/wealthgate-ai`, `/eisax-agent`, `/eisax-planner`, `/eisax-lab`, `/solutions`, `/partnerships` and `/insights`. These result snippets are evidence of stale search presentation, **not** proof that every URL remains indexed in Search Console. The live corporate pages and redirects were checked separately. Notably, `/products` already resolves to the current `/products/` directory even though a search snippet described the old five-product page.

## Redirect and canonical map

The complete deployable map is `_redirects`. Cloudflare Pages applies its rules even when a static asset exists at the old path, so a mistakenly recommitted legacy HTML file at a covered path cannot present old content.

| Legacy paths | 301 destination | Canonical page |
| --- | --- | --- |
| `/products`, `/products.html` | `/products/` | `/products/` |
| `/ar-products`, `/ar-products/`, `/ar-products.html` | `/ar/products/` | `/ar/products/` |
| `/ar.html` | `/ar/` | `/ar/` |
| `/platform`, `/platform/`, `/platform.html` | `/#ecosystem` | `/` |
| `/ar-platform`, `/ar-platform/`, `/ar-platform.html` | `/ar/#ecosystem` | `/ar/` |
| `/solutions`, `/solutions/`, `/solutions.html` | `/#solutions` | `/` |
| `/eisax-agent`, `/eisax-intelligence`, `/wealthgate-ai`, `/eisax-planner` and listed slash/HTML variants | matching card anchor under `/products/` | `/products/` |
| `/eisax-lab` and listed slash/HTML variants | `/products/#future` | `/products/` |
| `/ar-eisax-agent`, `/ar-wealthgate-ai`, `/ar-eisax-planner`, `/ar-eisax-lab` | matching card or research anchor under `/ar/products/` | `/ar/products/` |
| `/partnerships`, `/partnerships/`, `/partnerships.html` | `/#partnerships` | `/` |
| `/ar-partnerships`, `/ar-partnerships/`, `/ar-partnerships.html` | `/ar/#partnerships` | `/ar/` |
| `/legal`, `/legal.html` | `/terms` | `/terms` |
| `/insights`, `/insights.html`, `/insights/*` | `/#company` | `/` |
| Other retired `/blog`, `/about`, `/contact`, `/projects`, `/cv`, `/experience`, `/certifications` paths | relevant homepage or product-directory section per `_redirects` | `/` or `/products/` |

Homepage anchors serve navigation. Search canonical URLs omit fragments. No old five-product/platform HTML page is tracked by the current repository. The sitemap lists only the ten current indexable English and Arabic corporate pages. `robots.txt` permits crawling and references the sitemap. Existing pages have self-canonical tags and reciprocal `en`/`ar`/`x-default` hreflang.

## Search Console follow-up

1. After the production deployment, confirm the Pages report and use URL Inspection on `/`, `/ar/`, `/products/`, `/ar/products/`, `/partnerships.html`, `/legal`, and `/ar-partnerships` to observe Google's selected canonical and redirect crawl. Search Console counts can lag deployment.
2. Submit `https://eisax.com/sitemap.xml` in the domain property's Sitemaps report, then confirm **Success** and 10 discovered canonical URLs.
3. Request indexing for the two home pages and two product directories if URL Inspection still shows the old cached copy after recrawl. Do not submit retired URLs in the sitemap.
4. Review the dated indexed-URL report again after crawling. Old `EisaX` snippets should disappear as redirects and updated canonical pages are processed.
5. Investigate the separate Search Console **Security issues → Deceptive pages** warning. It currently displays no sample URLs; do not request a security review until the affected location and cause are established.
