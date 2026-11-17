# Zuronix platform — briefing for the technical agent

This file is loaded automatically by every Claude session opened on this
repository. It is the source of truth for how the platform is built, deployed
and operated. Keep it current: when you change infrastructure, update the
relevant section in the same commit.

> **This repository is PUBLIC.** Never write passwords, API keys, tokens,
> session secrets, personal emails, customer data, supplier names, prices or
> deal details into any file here — including this one.

## 1. Who you work for and what this session is for

- **Zuronix** is a B2B supplier of data center hardware, semiconductor
  equipment and industrial machinery, based in Vancouver, Washington, USA.
  The site is the company's storefront and request-intake system.
- The owner writes in **Arabic**. Reply in Arabic, short and phone-friendly
  (he often reads on mobile). Code, commit messages and all site copy stay in
  **English** (US audience).
- **This session is technical only:** code, the website, admin console,
  Cloudflare, DNS, email infrastructure, SEO, backups, performance, security.
  Sales work (finding deals, pricing, writing offers to customers) happens in
  a separate planning conversation. If asked for sales work here, say it
  belongs to the planning conversation.
- The owner prefers fast execution: do the work, verify it, then report in a
  few lines. Ask first only for decisions that are expensive or irreversible
  (see §8).

## 2. Stack and architecture

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn-style components (`src/components/ui`) |
| Runtime | Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`) |
| Database | Cloudflare D1 (`zuronix-db`, binding `DB`) through Prisma + `@prisma/adapter-d1`; SQLite locally |
| File storage | Cloudflare R2 (`zuronix-uploads`, binding `BUCKET`) — private attachments |
| Outgoing site email | Resend (team notifications; customer auto-ack prepared but off) |
| Source / CI | GitHub `medboune/zur`, branch `main` → Cloudflare Workers Builds |

Frontend and backend are the same Worker: pages render server-side, API
routes live under `src/app/api`, static assets are served from
`.open-next/assets` with headers from `public/_headers`.

## 3. Repository map

- `src/app/(site)/` — public pages: `/`, `/equipment`, `/equipment/[slug]`,
  `/request-equipment`, `/sell`, `/sell/single`, `/sell/list`,
  `/sectors/[slug]`, `/about`, `/contact`, `/faq`, `/track`.
- `src/app/admin/` — admin console (`/admin`): requests, equipment CRUD,
  settings, CSV export (`/admin/export`). Login at `/admin/login`.
- `src/app/api/` — `requests` (form intake), `admin/login`,
  `admin/attachments/[id]` (authenticated download), `admin/media/import`.
- `src/app/media/[...key]` — serves public media from R2.
- `src/app/robots.ts`, `src/app/sitemap.ts` — dynamic, per environment.
- `src/middleware.ts` — HTTP→HTTPS redirect for `*.zuronix.com` and security
  headers on every dynamic response.
- `src/lib/` — `site.ts` (company constants, sector copy — edit text here),
  `seo.ts` (metadata + JSON-LD), `db.ts`, `auth.ts`, `password.ts`
  (PBKDF2-SHA256), `rate-limit.ts`, `requests.ts`, `equipment.ts`,
  `storage.ts`, `notify.ts` (Resend), `reference.ts` (public reference codes).
- `prisma/schema.prisma` — models `Lead`, `Equipment`, `AdminUser`, `RateLimit`.
- `migrations/` — D1 SQL migrations `0001`–`0004`, applied automatically on deploy.
- `scripts/` — `e2e-security-test.py`, `reset-admin-password.mjs`,
  `seed-d1.sql`, `seed-local.mjs`, image/favicon generators.
- `public/` — static assets. **Do not delete** these (they are referenced
  externally): `googleec5cae1a320e7fcd.html` (Google Search Console
  verification), `0f6aa536030ba9e266fb8a5dabc5c917.txt` (IndexNow key),
  `email/zuronix-mark.png` (used by the Zoho email signature),
  `email/zuronix-avatar.png`.
- Arabic owner docs: `HANDOVER-ar.md` (features), `DEPLOY-ar.md`,
  `DOMAIN-GO-LIVE-ar.md`, `STAGING-BACKUP-ar.md`.

## 4. Deploy pipeline — every push to `main` is production

- Workers Builds watches `main` on the Worker **`zur`** (serves zuronix.com).
  - Build command: `npm run cf:build`
  - Deploy command: `npx wrangler d1 migrations apply zuronix-db --remote && npx wrangler deploy`
  - A deploy takes roughly 1–3 minutes after the push.
- **There is no live staging.** `wrangler.staging.jsonc` is prepared but the
  staging D1/R2/Worker were never provisioned and there is no `staging`
  branch. Until it exists, treat every push as a production release.
- Before pushing: `npm run lint` and a build must pass. Keep commits small
  and single-purpose so a bad one can be reverted cleanly.
- After pushing: wait for the deploy, then verify the live result (fetch the
  page or check it in the browser). Do not report success before verifying.
- Schema changes: add the next numbered file in `migrations/`
  (`0005_description.sql`), mirror it in `prisma/schema.prisma`, keep it
  additive. Destructive changes (drop/rename columns or tables, data deletes)
  need the owner's explicit approval and a fresh backup first.
- Commit messages end with the attribution lines the session provides.

## 5. Runtime configuration

- Non-secret vars live in `wrangler.jsonc` → `vars`: `SHOW_SAMPLE_LISTINGS`
  (`"false"` in production — request-driven mode), `NOTIFY_EMAIL_TO`,
  `NOTIFY_EMAIL_FROM`, `ACK_EMAIL_FROM`, `AUTO_ACK_EMAIL_ENABLED` (`"false"`),
  `APP_URL` (`https://zuronix.com`, single source for canonical/sitemap/email
  links). `ALLOW_INDEXING="false"` blocks indexing (used for staging only).
- Secrets (set with `wrangler secret put`, never in files): `ADMIN_PASSWORD`,
  `ADMIN_SESSION_SECRET`, `RESEND_API_KEY` (optional).
- Admin accounts are stored hashed in D1; credentials are changed from
  `/admin/settings`. `scripts/reset-admin-password.mjs` is the recovery path.
- Local dev: copy `.env.example` to `.env`, `npx prisma db push`, `npm run dev`.

## 6. Tooling and access — what actually works

- **The sandbox shell cannot reach `zuronix.com` or `api.cloudflare.com`**
  (outbound allowlist). Do not retry with curl/wget/python. Instead:
  - Public pages: use WebFetch (works for `https://zuronix.com`), or the
    browser.
  - Cloudflare resources: use the Cloudflare MCP connector if connected
    (Workers, D1 queries, R2). The old "Workers Bindings" MCP is deprecated;
    the Cloudflare API MCP (`https://mcp.cloudflare.com/mcp`) covers the full
    API including DNS and zone settings — suggest connecting it if missing.
  - Dashboards (Cloudflare, Zoho, Google Search Console, GitHub settings):
    use Claude in Chrome, which runs in the owner's signed-in browser. The
    owner types any password or one-time code himself — never enter
    credentials.
  - Last-resort pattern (used once, then removed): a temporary script added
    to `cf:build` runs inside Workers Builds with the build token
    (Workers Scripts edit, Workers Routes edit, D1). Use only for small,
    reviewed one-off changes, log the result to a temporary D1 table, then
    revert `cf:build` and drop the table in the next commit.
- `gh`: the GraphQL API is blocked here; use `gh api repos/medboune/zur/...` (REST).

## 7. Current infrastructure state (verify before acting — it may have changed)

**Cloudflare**
- Worker `zur` = production for `zuronix.com` and `www.zuronix.com`.
- Legacy Worker `zuronix` (old "Digital Solutions" site) is retired: routes
  removed, workers.dev and previews disabled. Not deleted yet — owner decision.
- A stray route `ww.zuronix.com/*` → `zur` exists (typo, harmless). Remove
  only with the owner's OK.
- Zone setting "Always Use HTTPS" is off; the middleware performs the
  redirect instead.
- Daily backup workflow `.github/workflows/backup.yml` (D1 export → R2
  `zuronix-backups`) exists; whether its repository secrets and bucket are
  configured is **unverified** — check the Actions tab before relying on it.

**Domain and email**
- `zuronix.com` DNS is on Cloudflare. Registration expires **2026-12-13** and
  the domain is not on Cloudflare Registrar — renewal/transfer is pending and
  needs the owner (payment).
- Mailbox: Zoho Mail (US) for `info@zuronix.com`. SPF includes
  `zohomail.com`; DKIM selector `zuronix` (2048-bit); DMARC `p=quarantine`
  with Cloudflare DMARC reporting. Deliverability tested 10/10.
- Pending DNS cleanup, owner approval needed: stale SRV `_autodiscover._tcp`,
  unused DKIM selector `zmail`.
- Zoho: sender display name "Zuronix"; default signature "Zuronix Sales"
  loads its logo from `https://zuronix.com/email/zuronix-mark.png`.
- Site notification email (Resend) still uses the sender
  `onboarding@resend.dev`; zuronix.com is not verified in Resend; customer
  auto-acknowledgement is off.
- Gmail blue checkmark (BIMI + VMC) needs a registered trademark; a CMC needs
  the logo in public use for 12 months. Not feasible yet — do not fake it.

**Search**
- Google Search Console: URL-prefix property `https://zuronix.com/`,
  verified by the HTML file in `public/`. Sitemap submitted 2026-11-15
  (40 URLs, success). Homepage re-indexing requested to replace the old
  "Zuronix | Digital Solutions" result. `/equipment` was "Discovered –
  currently not indexed".
- IndexNow key file is live; all sitemap URLs were pinged once.
- Bing Webmaster Tools not set up yet (can import from Search Console).

## 8. Rules

- **Ask the owner first** before: deleting Workers, routes, DNS records,
  buckets, databases or data; changing zone/account settings; anything that
  costs money; making the repo private/public; sending email to anyone other
  than the owner.
- **Content honesty** (the site must survive scrutiny by professional
  buyers): no claims of OEM partnership or authorized-reseller status, no
  OEM logos without written permission (plain-text brand names are fine), no
  invented statistics, testimonials, certifications, warehouses or stock.
  Condition claims must say who tested what; representative photos must be
  labelled as such. Keep `SHOW_SAMPLE_LISTINGS` off in production.
- Never put secrets or private data in the repo, logs, commit messages or
  URLs. Dates in D1 are stored as ISO text.
- Verify every change on the live site before saying it is done.

## 9. Backlog (owner-approved ideas, not started unless noted)

1. Renew or transfer the domain before 2026-12-13 (owner pays).
2. Bing Webmaster Tools + recheck Google indexing of `/equipment` and the
   homepage title.
3. Confirm the daily D1 → R2 backup actually runs; activate it if not.
4. Verify zuronix.com in Resend, switch `NOTIFY_EMAIL_FROM` to a
   zuronix.com sender, then consider enabling the customer auto-ack.
5. Quote / pro-forma invoice generator inside `/admin`.
6. Stand up the staging environment described in `STAGING-BACKUP-ar.md`.
7. DNS and Worker cleanup listed in §7 (with approval).
