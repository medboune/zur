#!/usr/bin/env python3
"""E2E test battery for the Zuronix site (runs against `next dev` on :3000).

Covers: homepage, security headers, robots, honeypot, rate limiting,
attachment magic-byte sniffing, new username+password auth, account
settings page, pagination, SEO assets (favicon/manifest/sitemap/JSON-LD),
and login rate limiting.
"""
import json
import re
import sqlite3
import urllib.request
import urllib.error
import uuid

BASE = "http://localhost:3000"
DB = "/home/z/my-project/db/custom.db"
PASSING = []
FAILING = []


def check(name: str, ok: bool, detail: str = ""):
    (PASSING if ok else FAILING).append((name, detail))
    print(f"  {'OK ' if ok else 'FAIL'}  {name}" + (f" — {detail}" if detail and not ok else ""))


def get(path: str, headers: dict | None = None):
    req = urllib.request.Request(BASE + path, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, {k.lower(): v for k, v in r.headers.items()}, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, {k.lower(): v for k, v in e.headers.items()}, e.read().decode("utf-8", "replace")


def post_json(path: str, data: dict, headers: dict | None = None):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(data).encode(),
        headers={"Content-Type": "application/json", **(headers or {})},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, {k.lower(): v for k, v in r.headers.items()}, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, {k.lower(): v for k, v in e.headers.items()}, e.read().decode("utf-8", "replace")


def post_form(path: str, fields: dict, file: tuple | None = None):
    boundary = uuid.uuid4().hex
    parts = []
    for k, v in fields.items():
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    if file:
        fname, fdata, ftype = file
        parts.append(
            f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{fname}"\r\n'
            f"Content-Type: {ftype}\r\n\r\n".encode() + fdata + b"\r\n"
        )
    parts.append(f"--{boundary}--\r\n".encode())
    body = b"".join(parts)
    req = urllib.request.Request(
        BASE + path,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


def lead_count():
    con = sqlite3.connect(DB)
    n = con.execute("SELECT COUNT(*) FROM Lead").fetchone()[0]
    con.close()
    return n


print("-- 1. Homepage --")
status, headers, home = get("/")
check("homepage 200", status == 200)
check("hero headline", "Source equipment." in home and "List yours for sale." in home)
check("live listings panel", "Available now" in home)
check("ticker present", "ticker-track" in home)
check("listings section", "Equipment for sale" in home)
check("display font applied", "font-display" in home)
check("logo wordmark", "Zuronix" in home and "Industrial Sourcing" in home)
check("Organization JSON-LD", '"@type":"Organization"' in home.replace(" ", ""))
check("WebSite JSON-LD", '"@type":"WebSite"' in home.replace(" ", ""))
check("OG tags", 'property="og:title"' in home)
check("Twitter card", 'name="twitter:card"' in home)

print("-- 2. Security headers (middleware) --")
check("X-Content-Type-Options", headers.get("x-content-type-options") == "nosniff")
check("X-Frame-Options", headers.get("x-frame-options") == "DENY")
check("Referrer-Policy", headers.get("referrer-policy") == "strict-origin-when-cross-origin")
check("Permissions-Policy", "camera=()" in (headers.get("permissions-policy") or ""))
check("HSTS", "max-age" in (headers.get("strict-transport-security") or ""))

print("-- 3. SEO assets --")
status, _, robots = get("/robots.txt")
check("robots allows indexing, blocks admin+api", "Disallow: /admin" in robots and "Disallow: /api/" in robots)
status, _, sitemap = get("/sitemap.xml")
check("sitemap 200", status == 200)
check("sitemap has equipment pages", "/equipment/" in sitemap)
check("sitemap has FAQ", "/faq" in sitemap)
for asset, kind in [
    ("/favicon.svg", "svg"),
    ("/favicon.ico", "ico"),
    ("/apple-touch-icon.png", "png"),
    ("/icon-192.png", "png"),
    ("/icon-512.png", "png"),
    ("/site.webmanifest", "json"),
]:
    status, ah, _ = get(asset)
    check(f"{asset} served ({kind})", status == 200 and kind in (ah.get("content-type") or ""))
check("manifest linked", 'href="/site.webmanifest"' in home)
check("favicon linked", "/favicon.svg" in home and "apple-touch-icon" in home)

status, _, faq = get("/faq")
check("FAQ page 200", status == 200)
check("FAQPage JSON-LD", '"@type":"FAQPage"' in faq.replace(" ", ""))

status, _, equip = get("/equipment")
check("catalog 200", status == 200)
check("catalog pagination control", "Per page" in equip)
check("ItemList JSON-LD", '"@type":"ItemList"' in equip.replace(" ", ""))
status, _, detail = get("/equipment/disco-dfd6361-dicing-saw")
check("listing page 200", status == 200)
check("Product JSON-LD", '"@type":"Product"' in detail.replace(" ", ""))
check("BreadcrumbList JSON-LD", '"@type":"BreadcrumbList"' in detail.replace(" ", ""))
check("canonical on listing", 'rel="canonical"' in detail)

print("-- 4. Form E2E + honeypot --")
before = lead_count()
payload = json.dumps({
    "equipment": "DISCO DFD6361 dicing saw for 8-inch wafers",
    "manufacturer": "DISCO", "model": "DFD6361", "quantity": 2,
    "configuration": "Two-chuck", "company": "Test Labs Inc", "contactName": "Jane Doe",
    "email": "jane@testlabs.com", "phone": "", "notes": "E2E test",
})
status, body = post_form("/api/requests", {"token": uuid.uuid4().hex, "type": "SOURCING", "payload": payload})
check("valid submission accepted", status == 200 and json.loads(body)["ok"] is True, body[:120])
after = lead_count()
check("lead written to DB", after == before + 1, f"{before} -> {after}")

hp_payload = json.dumps({
    "equipment": "SPAM ITEM should never be saved anywhere", "quantity": 1,
    "company": "Bot Co", "contactName": "Bot", "email": "bot@spam.com",
    "website": "http://spam.example",
})
status, body = post_form("/api/requests", {"token": uuid.uuid4().hex, "type": "SOURCING", "payload": hp_payload})
check("honeypot returns fake success", status == 200 and json.loads(body).get("ok") is True)
check("honeypot wrote nothing", lead_count() == after)

print("-- 5. Attachment magic-byte sniffing --")
fake_pdf = ('{"type":"SURPLUS_SINGLE","manufacturer":"X","model":"Y"}').encode()
payload_single = json.dumps({
    "manufacturer": "TestMfr", "model": "TM-100", "quantity": 1, "condition": "USED_TESTED",
    "itemLocation": "Austin, TX", "company": "Test Labs", "contactName": "Jane",
    "email": "jane@testlabs.com",
})
status, body = post_form(
    "/api/requests",
    {"token": uuid.uuid4().hex, "type": "SURPLUS_SINGLE", "payload": payload_single},
    file=("evil.pdf", fake_pdf, "application/pdf"),
)
check("fake .pdf rejected", status == 400 and "does not look like" in body, body[:120])

print("-- 6. Submission rate limiting --")
limited = False
for i in range(8):
    status, body = post_form(
        "/api/requests",
        {"token": uuid.uuid4().hex, "type": "SOURCING", "payload": payload},
    )
    if status == 429:
        limited = True
        break
check("rate limit kicks in (429)", limited, f"last status={status}")

print("-- 7. Admin auth (username + password) --")
status, _, login_page = get("/admin/login")
check("login page 200", status == 200)
check("login asks for username", 'name="username"' in login_page and 'name="password"' in login_page)

status, _, _ = post_json("/api/admin/login", {"password": "zuronix-admin"})
check("password-only login rejected", status == 401, f"status={status}")

status, resp_headers, _ = post_json("/api/admin/login", {"username": "admin", "password": "zuronix-admin"})
set_cookie = resp_headers.get("set-cookie", "")
check("login with username+password ok", status == 200 and "znx_admin" in set_cookie)
check("cookie is HttpOnly", "HttpOnly" in set_cookie)
admin_headers = {"Cookie": set_cookie.split(";")[0]}

status, _, eq_admin = get("/admin/equipment", headers=admin_headers)
check("admin equipment list", status == 200 and "Equipment listings" in eq_admin)
check("admin equipment pagination", "Per page" in eq_admin)
check("admin search box", "Search listings" in eq_admin)
status, _, eq_new = get("/admin/equipment/new", headers=admin_headers)
check("new listing form", status == 200 and "New listing" in eq_new and "Manufacturer" in eq_new)
check("SEO fields in form", 'name="seoTitle"' in eq_new and 'name="seoDescription"' in eq_new)
m = re.search(r'href="/admin/equipment/(\d+)"', eq_admin)
first_id = m.group(1) if m else "2"
status, _, eq_edit = get(f"/admin/equipment/{first_id}", headers=admin_headers)
check("edit listing form", status == 200 and "Save changes" in eq_edit)
status, _, admin_dash = get("/admin", headers=admin_headers)
check("admin dashboard", status == 200 and "Requests" in admin_dash)

status, _, _ = get("/admin/settings", headers=admin_headers)
check("settings page with auth", status == 200)
status, _, _ = get("/admin/export")
check("export blocked without auth", status == 401)
status, exp_headers, export = get("/admin/export", headers=admin_headers)
check("export CSV with auth", status == 200 and "Reference,Type,Status" in export and "text/csv" in exp_headers.get("content-type", ""))

status, _, noauth_dash = get("/admin")
check("admin redirects without auth", status in (307, 200) and (status == 307 or "Sign in" in noauth_dash))

print("-- 8. Password hashes are not plain text --")
con = sqlite3.connect(DB)
row = con.execute("SELECT passwordHash FROM AdminUser LIMIT 1").fetchone()
con.close()
check("stored hash is pbkdf2", row and row[0].startswith("pbkdf2$"), str(row)[:60])

print("-- 9. Login rate limiting (last: consumes the bucket) --")
login_limited = False
for i in range(12):
    status, _, _ = post_json("/api/admin/login", {"username": "admin", "password": "totally-wrong"})
    if status == 429:
        login_limited = True
        break
check("login rate limit (429 after repeated fails)", login_limited, f"last status={status}")

print()
print(f"=== RESULT: {len(PASSING)} passed, {len(FAILING)} failed ===")
for name, detail in FAILING:
    print(f"  FAILED: {name} — {detail}")
