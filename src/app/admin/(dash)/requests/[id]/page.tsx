import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileDown,
  Hash,
  Link2,
  Mail,
  MapPin,
  Phone,
  StickyNote,
} from "lucide-react";
import { db } from "@/lib/db";
import { updateLead } from "@/app/admin/actions";
import { REQUEST_STATUSES, REQUEST_STATUS_LABELS, REQUEST_TYPE_LABELS, CONDITIONS } from "@/lib/site";
import { humanFileSize } from "@/lib/form-schemas";
import { LeadUpdateForm } from "@/components/admin/lead-update-form";

export const dynamic = "force-dynamic";

function Row({ label, value, mono = false }: { label: string; value?: React.ReactNode; mono?: boolean }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="grid grid-cols-[minmax(110px,30%)_1fr] gap-3 border-b border-border/60 py-3 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={`text-sm ${mono ? "text-part" : ""}`}>{value}</dd>
    </div>
  );
}

export default async function AdminLeadDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const leadId = Number(id);
  if (!Number.isInteger(leadId)) notFound();

  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead) notFound();

  const isSourcing = lead.type === "SOURCING";
  const isList = lead.type === "SURPLUS_LIST";

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All requests
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-part text-2xl font-semibold">{lead.reference}</h1>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {REQUEST_TYPE_LABELS[lead.type]}
        </span>
      </div>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Received {lead.createdAt.toLocaleString("en-US")}
        </span>
        <span aria-hidden="true">·</span>
        <span>Updated {lead.updatedAt.toLocaleString("en-US")}</span>
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Request content */}
        <div className="space-y-6">
          <section aria-labelledby="req-heading" className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 id="req-heading" className="mb-2 font-semibold">
              {isSourcing ? "Equipment requested" : isList ? "Inventory list" : "Equipment offered"}
            </h2>
            <dl>
              {isSourcing && (
                <>
                  <Row label="Requirement" value={lead.equipment} />
                  <Row label="Manufacturer" value={lead.manufacturer} />
                  <Row label="Model / part" value={lead.model} mono />
                  <Row label="Quantity" value={lead.quantity ? String(lead.quantity) : undefined} />
                  <Row label="Configuration" value={lead.configuration} />
                  <Row label="Needed by" value={lead.neededBy} />
                  <Row label="Budget" value={lead.budget} />
                  <Row label="Delivery to" value={lead.deliveryLocation} />
                </>
              )}
              {!isSourcing && !isList && (
                <>
                  <Row label="Manufacturer" value={lead.manufacturer} />
                  <Row label="Model" value={lead.model} mono />
                  <Row label="Quantity" value={lead.quantity ? String(lead.quantity) : undefined} />
                  <Row label="Condition" value={lead.condition ? CONDITIONS[lead.condition]?.label ?? lead.condition : undefined} />
                  <Row label="Year" value={lead.year} />
                  <Row label="Location" value={lead.itemLocation} />
                  <Row label="Configuration" value={lead.configuration} />
                  <Row label="Asking price" value={lead.askingPrice} />
                </>
              )}
              {isList && (
                <>
                  <Row label="List summary" value={lead.listSummary} />
                  <Row label="Location(s)" value={lead.itemLocation} />
                  {lead.pastedList && (
                    <div className="border-b border-border/60 py-3 last:border-0">
                      <dt className="text-sm text-muted-foreground">Pasted list</dt>
                      <dd>
                        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-secondary/60 p-3 text-part text-xs leading-relaxed">
                          {lead.pastedList}
                        </pre>
                      </dd>
                    </div>
                  )}
                </>
              )}
              <Row label="Notes" value={lead.notes} />
              {lead.relatedRef && (
                <Row
                  label="From listing"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <Link2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
                      <span className="text-part font-semibold">{lead.relatedRef}</span>
                    </span>
                  }
                />
              )}
            </dl>
          </section>

          {lead.attachmentName && (
            <section aria-labelledby="att-heading" className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 id="att-heading" className="font-semibold">
                Attachment
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {lead.attachmentName} · {lead.attachmentSize ? humanFileSize(lead.attachmentSize) : ""}
              </p>
              <a
                href={`/api/admin/attachments/${lead.id}`}
                className="mt-3 inline-flex items-center gap-2 rounded-md border border-input bg-background px-3.5 py-2 text-sm font-medium shadow-sm hover:bg-accent"
              >
                <FileDown className="size-4 text-primary" aria-hidden="true" />
                Download file
              </a>
              <p className="mt-2 text-xs text-muted-foreground">
                Stored privately on the server — this link works only for signed-in team members.
              </p>
            </section>
          )}
        </div>

        {/* Contact + workflow */}
        <div className="space-y-6">
          <section aria-labelledby="contact-heading" className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 id="contact-heading" className="mb-2 font-semibold">
              Customer
            </h2>
            <dl>
              <Row label="Company" value={lead.company} />
              <Row label="Contact" value={lead.contactName} />
              <Row
                label="Email"
                value={
                  <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    <Mail className="size-3.5" aria-hidden="true" />
                    {lead.email}
                  </a>
                }
              />
              {lead.phone && (
                <Row
                  label="Phone"
                  value={
                    <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                      <Phone className="size-3.5" aria-hidden="true" />
                      <span className="text-part">{lead.phone}</span>
                    </a>
                  }
                />
              )}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`mailto:${lead.email}?subject=${encodeURIComponent(`Zuronix — your request ${lead.reference}`)}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Mail className="size-3.5" aria-hidden="true" />
                Email customer
              </a>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">
                <Hash className="size-3.5" aria-hidden="true" />
                <span className="text-part">{lead.reference}</span>
              </span>
            </div>
          </section>

          <LeadUpdateForm
            leadId={lead.id}
            status={lead.status}
            adminNotes={lead.adminNotes ?? ""}
          />

          {lead.adminNotes && (
            <section className="rounded-xl border border-border bg-secondary/40 p-5">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <StickyNote className="size-4 text-primary" aria-hidden="true" />
                Internal notes
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {lead.adminNotes}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
