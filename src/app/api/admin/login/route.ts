import { NextRequest, NextResponse } from "next/server";
import { adminPassword, setAdminCookie, clearAdminCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  let password = "";
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    password = String(body?.password ?? "");
  } else {
    const form = await req.formData().catch(() => null);
    password = String(form?.get("password") ?? "");
  }

  if (!password || password !== adminPassword()) {
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }

  await setAdminCookie();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
