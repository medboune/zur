import type { Lead } from "@prisma/client";
import { SITE, conditionLabel, REQUEST_TYPE_LABELS } from "@/lib/site";
import { humanFileSize } from "@/lib/form-schemas";

// ── Team email notifications ─────────────────────────────────────────────────
// Every NEW lead (sourcing request or equipment listing submission) triggers one email
// to the team through the Resend HTTP API — no extra dependency, plain fetch.
//
// Environment (see .env.example):
//   RESEND_API_KEY    API key. Empty/missing → email skipped, request still saved.
//   RESEND_API_URL    Endpoint override for tests (default https://api.resend.com/emails).
//   NOTIFY_EMAIL_TO   Recipient (default: info@zuronix.com).
//   NOTIFY_EMAIL_FROM Verified Resend sender (default: the shared onboarding address).
//   APP_URL           Public base URL for console links (default http://localhost:3000).
//
// Contract: notifyTeamOfNewLead NEVER throws. A mail outage must never
// block or fail a customer submission — the database is the source of truth.

const DEFAULT_API_URL = "https://api.resend.com/emails";
const REQUEST_TIMEOUT_MS = 5000;

function appUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}

function typeLabel(type: string): string {
  return REQUEST_TYPE_LABELS[type] ?? type;
}

/** One padded "label: value" line; empty string when the value is absent. */
function line(label: string, value: string | number | null | undefined): string {
  const v = value === null || value === undefined ? "" : String(value).trim();
  if (!v) return "";
  return `${label.padEnd(14, " ")}${v}\n`;
}

export function composeNotificationEmail(lead: Lead): { subject: string; text: string } {
  const subject = `New ${typeLabel(lead.type).toLowerCase()} ${lead.reference} — ${lead.company}`;
  const received = `${lead.createdAt.toISOString().replace("T", " ").slice(0, 16)} UTC`;

  const parts: string[] = [
    "A new form was submitted on zuronix.com.\n\n" +
      line("Reference:", lead.reference) +
      line("Type:", typeLabel(lead.type)) +
      line("Received:", received),
  ];

  // Contact block — always present.
  parts.push(
    "CONTACT\n" +
      line("Company:", lead.company) +
      line("Contact:", lead.contactName) +
      line("Email:", lead.email) +
      line("Phone:", lead.phone)
  );

  // Request-specific block.
  if (lead.type === "SOURCING") {
    parts.push(
      "REQUEST\n" +
        line("Equipment:", lead.equipment) +
        line("Manufacturer:", lead.manufacturer) +
        line("Model:", lead.model) +
        line("Quantity:", lead.quantity) +
        line("Configuration:", lead.configuration) +
        line("Delivery to:", lead.deliveryLocation) +
        line("Needed by:", lead.neededBy) +
        line("Budget:", lead.budget) +
        line("Notes:", lead.notes) +
        line("Listing ref:", lead.relatedRef)
    );
  } else if (lead.type === "SURPLUS_SINGLE") {
    parts.push(
      "EQUIPMENT\n" +
        line("Manufacturer:", lead.manufacturer) +
        line("Model:", lead.model) +
        line("Quantity:", lead.quantity) +
        line("Condition:", lead.condition ? conditionLabel(lead.condition) : "") +
        line("Year:", lead.year) +
        line("Location:", lead.itemLocation) +
        line("Asking price:", lead.askingPrice) +
        line("Configuration:", lead.configuration) +
        line("Notes:", lead.notes)
    );
  } else {
    let block =
      "EQUIPMENT LIST\n" +
      line("Summary:", lead.listSummary) +
      line("Location:", lead.itemLocation);
    if (lead.pastedList) {
      const rows = lead.pastedList.split("\n");
      const preview = rows.slice(0, 15).join("\n");
      block += `Pasted rows (first 15 of ${rows.length}):\n${preview}\n`;
    }
    block += line("Notes:", lead.notes);
    parts.push(block);
  }

  // Attachment block — file stays private; the team downloads it from the console.
  if (lead.attachmentName) {
    const size = lead.attachmentSize ? ` (${humanFileSize(lead.attachmentSize)})` : "";
    parts.push("ATTACHMENT\n" + line("File:", lead.attachmentName + size));
  }

  const footer =
    `\nOpen in the requests console:\n${appUrl()}/admin/requests/${lead.id}\n\n` +
    `Reply to this email to answer the contact directly.\n` +
    `You received this because a form was submitted at zuronix.com.`;

  return { subject, text: parts.filter((p) => p.trim().length > 0).join("\n") + footer };
}

export interface NotifyResult {
  sent: boolean;
  reason?: "no-api-key" | "disabled" | "http-error" | "error";
}

/** Shared Resend sender. Never throws — callers decide how to log. */
async function sendViaResend(fields: {
  to: string;
  from: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<{ ok: true } | { ok: false; status?: number; detail?: string }> {
  const endpoint = process.env.RESEND_API_URL?.trim() || DEFAULT_API_URL;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY?.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fields.from,
      to: fields.to,
      subject: fields.subject,
      text: fields.text,
      ...(fields.replyTo ? { reply_to: fields.replyTo } : {}),
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, status: res.status, detail: body.slice(0, 200) };
  }
  return { ok: true };
}

export async function notifyTeamOfNewLead(lead: Lead): Promise<NotifyResult> {
  try {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      console.log(
        `[notify] RESEND_API_KEY not set — email skipped for ${lead.reference}. ` +
          `The request is saved and visible in /admin.`
      );
      return { sent: false, reason: "no-api-key" };
    }

    const to = process.env.NOTIFY_EMAIL_TO?.trim() || SITE.email;
    const from =
      process.env.NOTIFY_EMAIL_FROM?.trim() || "Zuronix Website <onboarding@resend.dev>";
    const { subject, text } = composeNotificationEmail(lead);

    const result = await sendViaResend({ to, from, subject, text, replyTo: lead.email });
    if (!result.ok) {
      console.error(
        `[notify] email for ${lead.reference} failed: ${result.status ?? ""} ${result.detail ?? ""}`.trim()
      );
      return { sent: false, reason: "http-error" };
    }

    console.log(`[notify] email for ${lead.reference} sent to ${to}`);
    return { sent: true };
  } catch (err) {
    console.error(`[notify] email for ${lead.reference} errored — request is safe:`, err);
    return { sent: false, reason: "error" };
  }
}

// ── Customer acknowledgment email ────────────────────────────────────────────
// Professional confirmation sent to the CUSTOMER after we receive their
// request. DISABLED BY DEFAULT: set AUTO_ACK_EMAIL_ENABLED="true" in .env to
// activate. Sending it from your own address (ACK_EMAIL_FROM, default
// info@zuronix.com) requires the zuronix.com domain to be verified in Resend.
// Like the team notification, it never throws and never blocks a submission.

function ackRequestPhrase(type: string): string {
  if (type === "SOURCING") return "equipment request";
  if (type === "SURPLUS_SINGLE") return "equipment listing submission";
  return "equipment list submission";
}

export function composeCustomerAcknowledgment(lead: Lead): { subject: string; text: string } {
  const phrase = ackRequestPhrase(lead.type);
  const subject = `We received your ${phrase} — ${lead.reference}`;

  const text =
    `Hello ${lead.contactName},\n\n` +
    `Thank you for contacting Zuronix. We received your ${phrase} and it is now with our team.\n\n` +
    `Your reference number: ${lead.reference}\n` +
    `Please keep this number for any follow-up — it lets us find your request immediately.\n` +
    `Track its status any time: ${(process.env.APP_URL || "https://zuronix.com").replace(/\/$/, "")}/track\n\n` +
    `What happens next:\n` +
    `- A team member reviews your request, usually within one business day.\n` +
    `- We confirm specifications, availability, and condition with the asset owner or our supply network.\n` +
    `- You receive a clear, itemized offer or a status update.\n\n` +
    `Need it sooner? Reply to this email or call us at ${SITE.phone}.\n\n` +
    `Best regards,\n` +
    `The Zuronix Team\n` +
    `${SITE.name} — ${SITE.tagline}\n` +
    `${SITE.email} · ${SITE.phone}\n` +
    `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.state} ${SITE.address.zip}, ${SITE.address.country}`;

  return { subject, text };
}

export async function sendCustomerAcknowledgment(lead: Lead): Promise<NotifyResult> {
  try {
    // Master switch — off until the company is ready to email customers.
    if (process.env.AUTO_ACK_EMAIL_ENABLED?.trim() !== "true") {
      console.log(
        `[notify-ack] disabled — AUTO_ACK_EMAIL_ENABLED is not "true". ` +
          `No confirmation email was sent to ${lead.email}.`
      );
      return { sent: false, reason: "disabled" };
    }

    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      console.log(
        `[notify-ack] RESEND_API_KEY not set — confirmation email skipped for ${lead.reference}.`
      );
      return { sent: false, reason: "no-api-key" };
    }

    const from = process.env.ACK_EMAIL_FROM?.trim() || `Zuronix <${SITE.email}>`;
    const { subject, text } = composeCustomerAcknowledgment(lead);

    // reply_to = the team inbox, so a customer's reply reaches the team.
    const result = await sendViaResend({
      to: lead.email,
      from,
      subject,
      text,
      replyTo: SITE.email,
    });
    if (!result.ok) {
      console.error(
        `[notify-ack] confirmation for ${lead.reference} failed: ${result.status ?? ""} ${result.detail ?? ""}`.trim()
      );
      return { sent: false, reason: "http-error" };
    }

    console.log(`[notify-ack] confirmation email for ${lead.reference} sent to ${lead.email}`);
    return { sent: true };
  } catch (err) {
    console.error(`[notify-ack] confirmation for ${lead.reference} errored — request is safe:`, err);
    return { sent: false, reason: "error" };
  }
}
