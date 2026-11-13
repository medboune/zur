import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createLeadWithReference, saveAttachment, SubmissionError, LeadType } from "@/lib/requests";
import { notifyTeamOfNewLead, sendCustomerAcknowledgment } from "@/lib/notify";
import { sourcingSchema, surplusSingleSchema, surplusListSchema, surplusListBaseSchema } from "@/lib/form-schemas";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const TYPES: LeadType[] = ["SOURCING", "SURPLUS_SINGLE", "SURPLUS_LIST"];

// Public form abuse limits: generous enough for a shared office IP behind
// one NAT, tight enough to stop scripted flooding.
const SUBMIT_LIMIT = 8;
const SUBMIT_WINDOW_SECONDS = 3600;

export async function POST(req: NextRequest) {
  try {
    // Layer 1 — per-IP rate limit (fails open; see lib/rate-limit.ts).
    const limiter = await rateLimit(
      "submit",
      clientIp(req.headers),
      SUBMIT_LIMIT,
      SUBMIT_WINDOW_SECONDS
    );
    if (!limiter.allowed) {
      return NextResponse.json(
        { ok: false, error: "You have sent several requests just now — please wait a bit or email info@zuronix.com." },
        { status: 429, headers: { "Retry-After": "600" } }
      );
    }

    const formData = await req.formData();
    const token = String(formData.get("token") ?? "");
    const type = String(formData.get("type") ?? "") as LeadType;
    const payloadRaw = String(formData.get("payload") ?? "{}");

    if (!TYPES.includes(type)) {
      return NextResponse.json({ ok: false, error: "Unknown request type." }, { status: 400 });
    }

    let values: Record<string, unknown>;
    try {
      values = JSON.parse(payloadRaw);
    } catch {
      return NextResponse.json({ ok: false, error: "Malformed request payload." }, { status: 400 });
    }

    // Layer 2 — honeypot. The forms render a hidden "website" field that
    // humans never see; bots that fill it get a fake success and no DB write.
    const honeypot = String(values.website ?? "").trim();
    if (honeypot) {
      console.warn("[api/requests] honeypot tripped — silently accepting");
      return NextResponse.json({ ok: true, reference: "REQ-0000", duplicate: true });
    }

    // Authoritative server-side validation, independent of the client.
    // For surplus lists, an uploaded file substitutes for pasted rows.
    const maybeFile = formData.get("file");
    const hasFile = maybeFile instanceof File && maybeFile.size > 0;
    const schema =
      type === "SOURCING"
        ? sourcingSchema
        : type === "SURPLUS_SINGLE"
          ? surplusSingleSchema
          : hasFile
            ? surplusListBaseSchema
            : surplusListSchema;
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "_";
        if (!fieldErrs[key]) fieldErrs[key] = issue.message;
      }
      return NextResponse.json(
        {
          ok: false,
          error: "Some fields need attention — check the highlighted fields and send again.",
          fieldErrors: fieldErrs,
        },
        { status: 400 }
      );
    }

    const data = parsed.data as Record<string, unknown>;
    const clean = <T,>(v: T | undefined | null): T | undefined =>
      v === null || v === undefined || v === "" ? undefined : (v as T);

    // Attachment (optional)
    const file = formData.get("file");
    let attachment: { name: string; storedPath: string; size: number; contentType: string } | null = null;
    if (file instanceof File && file.size > 0) {
      attachment = await saveAttachment(file, type);
    }

    const leadData = {
      company: data.company,
      contactName: data.contactName,
      email: data.email,
      phone: clean(data.phone) ?? null,
      // Sourcing
      equipment: clean(data.equipment) ?? null,
      manufacturer: clean(data.manufacturer) ?? null,
      model: clean(data.model) ?? null,
      quantity: clean(data.quantity) ?? null,
      configuration: clean(data.configuration) ?? null,
      deliveryLocation: clean(data.deliveryLocation) ?? null,
      neededBy: clean(data.neededBy) ?? null,
      budget: clean(data.budget) ?? null,
      notes: clean(data.notes) ?? null,
      // Cross-reference to a listing (EQ-0001) — strictly validated:
      // free-form strings never reach the admin console unvetted.
      relatedRef: (() => {
        const raw = String((values as Record<string, unknown>).relatedRef ?? "").trim();
        return /^[A-Za-z0-9-]{2,20}$/.test(raw) ? raw.toUpperCase() : null;
      })(),
      // Surplus single
      condition: clean(data.condition) ?? null,
      itemLocation: clean(data.itemLocation) ?? null,
      year: clean(data.year) ?? null,
      askingPrice: clean(data.askingPrice) ?? null,
      // Surplus list
      listSummary: clean(data.listSummary) ?? null,
      pastedList: clean(data.pastedList) ?? null,
      // Attachment
      attachmentName: attachment?.name ?? null,
      attachmentType: attachment?.contentType ?? null,
      attachmentSize: attachment?.size ?? null,
      attachmentPath: attachment?.storedPath ?? null,
    };

    const { reference, duplicate, lead } = await createLeadWithReference(token, type, leadData);

    // One notification per new request. Idempotent replays (a retry or a
    // double-click landing on the same token) never trigger a second email.
    // `after` runs once the response is sent, so mail latency never delays
    // the buyer's confirmation page — and both senders never throw.
    // Team email: always on when RESEND_API_KEY is set.
    // Customer acknowledgment: gated by AUTO_ACK_EMAIL_ENABLED (default off).
    if (!duplicate) {
      after(async () => {
        await notifyTeamOfNewLead(lead);
        await sendCustomerAcknowledgment(lead);
      });
    }

    return NextResponse.json({ ok: true, reference, duplicate });
  } catch (err) {
    if (err instanceof SubmissionError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[api/requests] failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Something went wrong on our side — nothing was lost. Please try again, or email info@zuronix.com.",
      },
      { status: 500 }
    );
  }
}
