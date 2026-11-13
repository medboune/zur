"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { saveEquipment } from "@/app/admin/actions";
import type { Equipment } from "@prisma/client";

const SECTORS = [
  { value: "SEMICONDUCTOR", label: "Semiconductor" },
  { value: "DATACENTER", label: "Data center" },
  { value: "INDUSTRIAL", label: "Industrial" },
];

const CONDITIONS = [
  { value: "NEW", label: "New / unused" },
  { value: "USED_TESTED", label: "Used — tested working" },
  { value: "USED_UNTESTED", label: "Used — untested" },
  { value: "REFURBISHED", label: "Refurbished" },
  { value: "AS_IS", label: "As-is" },
  { value: "FOR_PARTS", label: "For parts" },
];

const PRICE_TYPES = [
  { value: "QUOTE", label: "Quote on request" },
  { value: "UNIT", label: "Price per unit" },
  { value: "LOT", label: "Price for the lot" },
];

// Images shipped with the site (public/images) — selectable in the form,
// any other /images/*.jpg path can also be typed in.
const IMAGE_CHOICES = [
  "/images/sample-dicing.jpg",
  "/images/sample-prober.jpg",
  "/images/sample-diebonder.jpg",
  "/images/sample-server.jpg",
  "/images/sample-switch.jpg",
  "/images/sample-vmc.jpg",
  "/images/sample-lathe.jpg",
  "/images/sample-chiller.jpg",
  "/images/sector-semiconductor.jpg",
  "/images/sector-datacenter.jpg",
  "/images/sector-industrial.jpg",
];

const inputCls =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30";

function specsToText(json: string): string {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return "";
    return parsed
      .filter((s) => s && typeof s.label === "string")
      .map((s) => `${s.label}: ${s.value ?? ""}`)
      .join("\n");
  } catch {
    return "";
  }
}

function Field({
  label,
  children,
  hint,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="block text-sm font-medium">{label}</span>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function EquipmentForm({ item }: { item: Equipment | null }) {
  const [state, formAction, pending] = useActionState(saveEquipment, null);
  const d = item ?? null;
  const dateValue = d?.lastVerifiedAt
    ? new Date(d.lastVerifiedAt).toISOString().slice(0, 10)
    : "";

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={d?.id ?? ""} />
      <input type="hidden" name="reference" value={d?.reference ?? ""} />

      {/* Identity */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold">Item</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Manufacturer *">
            <input name="manufacturer" required defaultValue={d?.manufacturer ?? ""} className={inputCls} placeholder="DISCO" />
          </Field>
          <Field label="Model *">
            <input name="model" required defaultValue={d?.model ?? ""} className={inputCls} placeholder="DFD6361" />
          </Field>
          <Field label="Part number">
            <input name="partNumber" defaultValue={d?.partNumber ?? ""} className={inputCls} placeholder="Optional" />
          </Field>
          <Field label="Category" hint="Shown next to the condition badge, e.g. Dicing &amp; grinding.">
            <input name="category" defaultValue={d?.category ?? ""} className={inputCls} placeholder="Dicing &amp; grinding" />
          </Field>
          <Field label="Sector *">
            <select name="sector" required defaultValue={d?.sector ?? "SEMICONDUCTOR"} className={inputCls}>
              {SECTORS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Quantity *">
            <input name="quantity" type="number" min={1} defaultValue={d?.quantity ?? 1} className={inputCls} />
          </Field>
          <Field label="Description *" className="sm:col-span-2" hint="2–4 sentences: what it is, where it came from, what is included.">
            <textarea name="description" required rows={4} defaultValue={d?.description ?? ""} className={inputCls} />
          </Field>
        </div>
      </section>

      {/* Condition */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold">Condition</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Condition *">
            <select name="conditionKey" required defaultValue={d?.conditionKey ?? "USED_TESTED"} className={inputCls}>
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Condition note" hint="Source and date of the condition statement.">
            <input name="conditionNote" defaultValue={d?.conditionNote ?? ""} className={inputCls} />
          </Field>
          <Field label="Test summary" className="sm:col-span-2" hint="What was powered on or tested, by whom.">
            <textarea name="testSummary" rows={2} defaultValue={d?.testSummary ?? ""} className={inputCls} />
          </Field>
          <Field label="Availability last verified" hint="Shown on the listing as “Availability checked”.">
            <input name="lastVerifiedAt" type="date" defaultValue={dateValue} className={inputCls} />
          </Field>
        </div>
      </section>

      {/* Price & logistics */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold">Price &amp; logistics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Price type *">
            <select name="priceType" required defaultValue={d?.priceType ?? "QUOTE"} className={inputCls}>
              {PRICE_TYPES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Price" hint="Plain number, e.g. 4850. Leave empty for quote-on-request.">
            <input name="price" inputMode="decimal" defaultValue={d?.price ?? ""} className={inputCls} placeholder="4850" />
          </Field>
          <Field label="Currency">
            <input name="currency" defaultValue={d?.currency ?? "USD"} className={inputCls} />
          </Field>
          <Field label="Location *">
            <input name="location" required defaultValue={d?.location ?? ""} className={inputCls} placeholder="Hillsboro, OR, USA" />
          </Field>
          <label className="flex items-center gap-2.5 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="includesShipping"
              defaultChecked={d?.includesShipping ?? false}
              className="size-4 accent-[var(--primary)]"
            />
            Price includes shipping
          </label>
        </div>
      </section>

      {/* Image & specs */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold">Image &amp; specifications</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Image" hint="Pick a bundled photo or type any /images/… path already uploaded to the site.">
            <input
              name="image"
              list="image-choices"
              defaultValue={d?.image ?? ""}
              className={inputCls}
              placeholder="/images/sample-dicing.jpg"
            />
            <datalist id="image-choices">
              {IMAGE_CHOICES.map((src) => (
                <option key={src} value={src} />
              ))}
            </datalist>
          </Field>
          <Field label="Image caption" hint="Shown under the photo — say if it is representative, not the actual asset.">
            <input name="imageCaption" defaultValue={d?.imageCaption ?? ""} className={inputCls} />
          </Field>
          <Field
            label="Specifications"
            className="sm:col-span-2"
            hint="One per line, format “Label: value”. Example: Wafer size: 6 in / 8 in"
          >
            <textarea name="specs" rows={6} defaultValue={specsToText(d?.specs ?? "[]")} className={`${inputCls} font-mono text-xs`} />
          </Field>
        </div>
      </section>

      {/* Visibility */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold">Visibility</h2>
        <div className="mt-4 space-y-3">
          <label className="flex items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={d?.isPublished ?? false}
              className="mt-0.5 size-4 accent-[var(--primary)]"
            />
            <span>
              <span className="font-medium">Published</span>
              <span className="block text-xs text-muted-foreground">
                Visible in the public catalog and on the homepage.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              name="isSample"
              defaultChecked={d?.isSample ?? false}
              className="mt-0.5 size-4 accent-[var(--primary)]"
            />
            <span>
              <span className="font-medium">Demo listing</span>
              <span className="block text-xs text-muted-foreground">
                Marked “Demo” and automatically hidden when the site runs in launch mode
                (SHOW_SAMPLE_LISTINGS=false).
              </span>
            </span>
          </label>
        </div>
      </section>

      {state && !state.ok && (
        <p role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "Saving…" : d ? "Save changes" : "Create listing"}
        </button>
        <Link href="/admin/equipment" className="text-sm text-muted-foreground hover:text-foreground">
          Cancel
        </Link>
        {state?.ok && (
          <span role="status" className="flex items-center gap-1.5 text-sm text-primary">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Saved.
          </span>
        )}
      </div>
    </form>
  );
}
