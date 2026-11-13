#!/usr/bin/env python3
"""E2E test battery for the Zuronix site (runs against `next dev`).

Covers: new homepage design elements, security headers, robots, honeypot,
rate limiting, attachment magic-byte sniffing, admin equipment pages,
CSV export auth, and login rate limiting.
"""
import json
import re
import sqlite3
import urllib.request
import urllib.error
import uuid

BASE = "http://localhost:3200"
DB = "/home/z/my-project/db/custom.db"
PASSING = []
FAILING = []


def check(name: str, ok: bool, detail: str = ""):
    (PASSING if ok else FAILING).append((name, detail))
    print(f"  {'✓' if ok else '✗ FAIL'}  {name}" + (f" — {detail}" if detail and not ok else ""))


def get(path: str, headers: dict | None = None):
    req = urllib.request.Request(BASE + path, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            # Case-insensitive view of the response headers.
            return r.status, {k.lower(): v for k, v in r.headers.items()}, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, {k.lower(): v for k, v in e.headers.items()}, e.read().decode("utf-8", "replace")


def post_form(path: str, fields: dict, file: tuple | None = None, headers: dict | None = None):
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
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}", **(headers or {})},
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


print("── 1. Homepage (new design) ──")
status, headers, home = get("/")
check("homepage 200", status == 200)
check("hero background image", 'src="/images/hero-bg.jpg"' in home or "hero-bg" in home)
check("hero headline", "Source equipment." in home and "Sell your surplus." in home)
check("live listings panel", "Available now" in home)
check("price shown in hero panel", re.search(r"\$4,850|\$14,500", home) is not None)
check("offer CTA in hero panel", ">Offer<" in home)
check("ticker present", "Wafer probers" in home and "ticker-track" in home)
check("listings section", "Equipment for sale" in home)
check("Make offer on cards", "Make offer" in home)
check("condition standards", "How we state condition" in home)
check("sell band bg", "surplus-bg" in home)
check("privacy band copy", "Your data stays private" in home)
check("display font applied", "font-display" in home)
check("logo wordmark", "Zuronix" in home and "Industrial Sourcing" in home)

print("── 2. Security headers (middleware) ──")
check("X-Content-Type-Options", headers.get("x-content-type-options") == "nosniff")
check("X-Frame-Options", headers.get("x-frame-options") == "DENY")
check("Referrer-Policy", headers.get("referrer-policy") == "strict-origin-when-cross-origin")
check("Permissions-Policy", "camera=()" in (headers.get("permissions-policy") or ""))
check("HSTS", "max-age" in (headers.get("strict-transport-security") or ""))

print("── 3. robots & catalog ──")
status, _, robots = get("/robots.txt")
check("robots allows indexing", "Disallow: /admin" in robots and "Disallow: /" not in robots.replace("Disallow: /admin", "").replace("Disallow: /api/", ""))
status, _, equip = get("/equipment")
check("catalog 200", status == 200)
check("catalog cards with offer", "Make offer" in equip)

print("── 4. Form E2E + honeypot ──")
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
check("lead written to DB", after == before + 1, f"{before} → {after}")

# Honeypot
hp_payload = json.dumps({
    "equipment": "SPAM ITEM should never be saved anywhere", "quantity": 1,
    "company": "Bot Co", "contactName": "Bot", "email": "bot@spam.com",
    "website": "http://spam.example",
})
status, body = post_form("/api/requests", {"token": uuid.uuid4().hex, "type": "SOURCING", "payload": hp_payload})
check("honeypot returns fake success", status == 200 and json.loads(body).get("ok") is True)
check("honeypot wrote nothing", lead_count() == after)

print("── 5. Attachment magic-byte sniffing ──")
fake_pdf = ("#{\"type\":\"SURPLUS_SINGLE\",\"manufacturer\":\"X\",\"model\":\"Y\"}").encode()
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

real_pdf = b"%PDF-1.4\n%FakeButValidHeader\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
status, body = post_form(
    "/api/requests",
    {"token": uuid.uuid4().hex, "type": "SURPLUS_SINGLE", "payload": payload_single},
    file=("report.pdf", real_pdf, "application/pdf"),
)
check("real .pdf accepted", status == 200 and json.loads(body)["ok"] is True, body[:120])

print("── 6. Rate limiting (8/hour for submissions) ──")
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

print("── 7. Admin auth & equipment pages ──")
status, _, login_page = get("/admin/login")
check("login page 200", status == 200)
status, body, = post_form("/api/admin/login", {})
# post_form is multipart; use JSON instead:
req = urllib.request.Request(
    BASE + "/api/admin/login",
    data=json.dumps({"password": "ZuronixOps-2026!"}).encode(),
    headers={"Content-Type": "application/json"},
)
with urllib.request.urlopen(req, timeout=60) as r:
    cookie = r.headers.get("Set-Cookie", "")
    check("login ok", r.status == 200)
admin_headers = {"Cookie": cookie.split(";")[0]}

status, _, eq_admin = get("/admin/equipment", headers=admin_headers)
check("admin equipment list", status == 200 and "Equipment listings" in eq_admin)
check("equipment rows listed", "EQ-0001" in eq_admin and "Publish" in eq_admin or "Unpublish" in eq_admin)
status, _, eq_new = get("/admin/equipment/new", headers=admin_headers)
check("new listing form", status == 200 and "New listing" in eq_new and "Manufacturer" in eq_new)
status, _, eq_edit = get("/admin/equipment/1", headers=admin_headers)
check("edit listing form", status == 200 and "Save changes" in eq_edit)
status, _, export_noauth = get("/admin/export")
check("export blocked without auth", status == 401)
status, exp_headers, export = get("/admin/export", headers=admin_headers)
check("export CSV with auth", status == 200 and "Reference,Type,Status" in export and "text/csv" in exp_headers.get("content-type", ""))
check("export contains our test lead", "REQ-" in export)

status, _, admin_dash = get("/admin", headers=admin_headers)
check("admin dashboard", status == 200 and "Requests" in admin_dash)

print("── 8. Login rate limiting ──")
login_limited = False
for i in range(12):
    req = urllib.request.Request(
        BASE + "/api/admin/login",
        data=json.dumps({"password": "wrong-password"}).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            pass
    except urllib.error.HTTPError as e:
        if e.code == 429:
            login_limited = True
            break
check("login rate limit (429 after ~10 fails)", login_limited)

print()
print(f"═══ RESULT: {len(PASSING)} passed, {len(FAILING)} failed ═══")
for name, detail in FAILING:
    print(f"  FAILED: {name} — {detail}")
