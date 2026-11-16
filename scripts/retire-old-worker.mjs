// One-off maintenance, run during Workers Builds (see "cf:build").
//
// Detaches the legacy "zuronix" Worker (the pre-2026 site) from the internet:
//   1. deletes every zone route that points at it (e.g. http://zuronix.com/*,
//      which was still answering plain-HTTP visits with the old site),
//   2. deletes any Custom Domain attached to it,
//   3. turns off its workers.dev address and preview URLs.
// The new site Worker ("zur") is never touched. The old Worker's code is kept
// (not deleted), so this is reversible from the dashboard.
//
// A short report is written to the D1 table _ops_log so the result can be
// checked without access to the build logs. The script never fails the build.

const OLD = "zuronix";
const KEEP = "zur";
const ZONE_NAME = "zuronix.com";
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || "2397bf70a1714e2f434ba940aa6f3cba";
const DB_ID = "b38b39b7-c0a3-4e6b-b65f-142ac2cf1f33";
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const API = "https://api.cloudflare.com/client/v4";

const log = [];
function note(step, detail) {
  const text = typeof detail === "string" ? detail : JSON.stringify(detail);
  log.push({ step, detail: text.slice(0, 2000) });
  console.log(`[retire-old-worker] ${step}: ${text.slice(0, 500)}`);
}

async function cf(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const json = await res.json().catch(() => ({}));
  const errors = (json.errors || []).map((e) => `${e.code}:${e.message}`).join("; ");
  return { status: res.status, ok: res.ok && json.success !== false, json, errors };
}

async function report() {
  try {
    await cf("POST", `/accounts/${ACCOUNT}/d1/database/${DB_ID}/query`, {
      sql: "CREATE TABLE IF NOT EXISTS _ops_log (ts TEXT, run TEXT, task TEXT, detail TEXT)",
    });
    const r = await cf("POST", `/accounts/${ACCOUNT}/d1/database/${DB_ID}/query`, {
      sql: "INSERT INTO _ops_log (ts, run, task, detail) VALUES (?, ?, ?, ?)",
      params: [
        new Date().toISOString(),
        process.env.WORKERS_CI_COMMIT_SHA || "local",
        "retire-old-worker",
        JSON.stringify(log),
      ],
    });
    console.log(`[retire-old-worker] report: ${r.status} ${r.errors}`);
  } catch (e) {
    console.log(`[retire-old-worker] report failed: ${e}`);
  }
}

async function main() {
  if (!process.env.WORKERS_CI) {
    console.log("[retire-old-worker] not running on Workers Builds; skipped.");
    return;
  }
  if (!TOKEN) {
    console.log("[retire-old-worker] no CLOUDFLARE_API_TOKEN in the build step; skipped.");
    return;
  }

  // 1. Zone routes pointing at the old Worker.
  try {
    const z = await cf("GET", `/zones?name=${ZONE_NAME}`);
    const zoneId = z.json?.result?.[0]?.id;
    note("zone", zoneId ? `found ${zoneId}` : `not found (${z.status} ${z.errors})`);
    if (zoneId) {
      const r = await cf("GET", `/zones/${zoneId}/workers/routes`);
      const routes = r.json?.result || [];
      note("routes-before", r.ok ? routes.map((x) => `${x.pattern} -> ${x.script || "(none)"}`) : `${r.status} ${r.errors}`);
      for (const route of routes) {
        if (route.script !== OLD || route.script === KEEP) continue;
        const d = await cf("DELETE", `/zones/${zoneId}/workers/routes/${route.id}`);
        note("route-deleted", `${route.pattern}: ${d.ok ? "ok" : `${d.status} ${d.errors}`}`);
      }
    }
  } catch (e) {
    note("routes-error", String(e));
  }

  // 2. Custom Domains attached to the old Worker.
  try {
    const r = await cf("GET", `/accounts/${ACCOUNT}/workers/domains`);
    const domains = r.json?.result || [];
    note("domains-before", r.ok ? domains.map((x) => `${x.hostname} -> ${x.service}`) : `${r.status} ${r.errors}`);
    for (const domain of domains) {
      if (domain.service !== OLD || domain.service === KEEP) continue;
      const d = await cf("DELETE", `/accounts/${ACCOUNT}/workers/domains/${domain.id}`);
      note("domain-deleted", `${domain.hostname}: ${d.ok ? "ok" : `${d.status} ${d.errors}`}`);
    }
  } catch (e) {
    note("domains-error", String(e));
  }

  // 3. workers.dev address and preview URLs of the old Worker.
  try {
    const s = await cf("POST", `/accounts/${ACCOUNT}/workers/scripts/${OLD}/subdomain`, {
      enabled: false,
      previews_enabled: false,
    });
    note("workers-dev-disabled", s.ok ? "ok" : `${s.status} ${s.errors}`);
    const check = await cf("GET", `/accounts/${ACCOUNT}/workers/scripts/${OLD}/subdomain`);
    note("workers-dev-state", check.ok ? check.json?.result : `${check.status} ${check.errors}`);
  } catch (e) {
    note("workers-dev-error", String(e));
  }

  await report();
}

main().catch((e) => console.log(`[retire-old-worker] unexpected: ${e}`));
