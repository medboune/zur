"use client";

import { useState } from "react";
import { FieldShell, TextInput, TextArea, FileField, FormErrorBanner, PrivacyNote, SubmitButton, useFieldIds } from "@/components/site/form/fields";
import { useLeadSubmission } from "@/components/site/form/use-lead-submission";
import { Confirmation } from "@/components/site/form/confirmation";
import { sourcingSchema, fieldErrors } from "@/lib/form-schemas";

export interface RequestFormPrefill {
  model?: string;
  ref?: string;
  qty?: string;
  note?: string;
}

export function RequestForm({ prefill }: { prefill: RequestFormPrefill }) {
  const ids = useFieldIds("req");
  const { pending, error, result, submit } = useLeadSubmission("SOURCING");

  const [form, setForm] = useState({
    equipment: prefill.model ? `${prefill.model} — please confirm availability, condition and price.` : "",
    manufacturer: "",
    model: prefill.model ?? "",
    quantity: prefill.qty ?? "1",
    configuration: "",
    deliveryLocation: "",
    neededBy: "",
    budget: "",
    notes: prefill.note ?? "",
    company: "",
    contactName: "",
    email: "",
    phone: "",
    website: "", // honeypot — humans never see this field
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (result) {
    return <Confirmation result={result} kind="sourcing" />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = sourcingSchema.safeParse({ ...form, quantity: Number(form.quantity) });
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      if (firstKey) {
        document.getElementById(ids(firstKey))?.focus();
      }
      return;
    }
    setErrors({});
    await submit(
      { ...parsed.data, website: form.website, relatedRef: prefill.ref || undefined },
      file
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/* Honeypot: invisible to humans, attractive to bots. Server rejects silently. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor={ids("website")}>Website</label>
        <input
          id={ids("website")}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={set("website")}
        />
      </div>
      {prefill.ref && (
        <div className="rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
          About <span className="text-part font-semibold">{prefill.ref}</span>
          {prefill.model ? (
            <>
              {" "}
              — <span className="font-medium">{prefill.model}</span>
            </>
          ) : null}
          . We&apos;ll attach this reference to your request automatically.
        </div>
      )}

      <FormErrorBanner message={error} />

      <fieldset className="space-y-5" disabled={pending}>
        <legend className="mb-1 text-base font-semibold">What you need</legend>

        <FieldShell
          label="Equipment you need"
          htmlFor={ids("equipment")}
          required
          error={errors.equipment}
          hint="A model or part number is enough to start. If you're not sure, describe the job and we'll identify suitable equipment."
        >
          <TextArea
            id={ids("equipment")}
            value={form.equipment}
            onChange={set("equipment")}
            placeholder="e.g., DISCO DFD6361 dicing saw — or describe what the tool needs to do"
            error={Boolean(errors.equipment)}
            aria-describedby={errors.equipment ? ids("equipment") + "-error" : undefined}
          />
        </FieldShell>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldShell label="Manufacturer" htmlFor={ids("manufacturer")} error={errors.manufacturer} hint="e.g., DISCO, Advantest, Dell, Haas">
            <TextInput id={ids("manufacturer")} value={form.manufacturer} onChange={set("manufacturer")} error={Boolean(errors.manufacturer)} />
          </FieldShell>
          <FieldShell label="Model / part number" htmlFor={ids("model")} error={errors.model} hint="Exact model, part number, or configuration code">
            <TextInput id={ids("model")} value={form.model} onChange={set("model")} className="text-part" error={Boolean(errors.model)} />
          </FieldShell>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldShell label="Quantity" htmlFor={ids("quantity")} required error={errors.quantity}>
            <TextInput id={ids("quantity")} type="number" min={1} step={1} value={form.quantity} onChange={set("quantity")} error={Boolean(errors.quantity)} />
          </FieldShell>
          <FieldShell label="Needed by" htmlFor={ids("neededBy")} error={errors.neededBy} hint="A date or 'ASAP' — helps us prioritize">
            <TextInput id={ids("neededBy")} value={form.neededBy} onChange={set("neededBy")} placeholder="e.g., Dec 15, 2026" error={Boolean(errors.neededBy)} />
          </FieldShell>
        </div>

        <FieldShell
          label="Configuration / specifications"
          htmlFor={ids("configuration")}
          error={errors.configuration}
          hint="Options that decide fit: memory, ports, spindle, chuck size, voltage, firmware…"
        >
          <TextArea id={ids("configuration")} value={form.configuration} onChange={set("configuration")} className="min-h-20" error={Boolean(errors.configuration)} />
        </FieldShell>

        <FileField
          id={ids("file")}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp"
          label="Spec sheet or drawing"
          hint="PDF, Office, or an image — up to 10 MB."
          file={file}
          onFile={setFile}
          error={errors.file}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldShell label="Delivery location" htmlFor={ids("deliveryLocation")} error={errors.deliveryLocation} hint="City, state / country">
            <TextInput id={ids("deliveryLocation")} value={form.deliveryLocation} onChange={set("deliveryLocation")} placeholder="e.g., Hillsboro, OR" error={Boolean(errors.deliveryLocation)} />
          </FieldShell>
          <FieldShell label="Target budget" htmlFor={ids("budget")} error={errors.budget} hint="Optional — we'll tell you if the market differs">
            <TextInput id={ids("budget")} value={form.budget} onChange={set("budget")} placeholder="e.g., $40k–50k" error={Boolean(errors.budget)} />
          </FieldShell>
        </div>

        <FieldShell label="Notes" htmlFor={ids("notes")} error={errors.notes}>
          <TextArea id={ids("notes")} value={form.notes} onChange={set("notes")} className="min-h-20" placeholder="Anything else that matters — inspection needs, freight, timelines." error={Boolean(errors.notes)} />
        </FieldShell>
      </fieldset>

      <fieldset className="space-y-5 border-t border-border pt-6" disabled={pending}>
        <legend className="mb-1 text-base font-semibold">How we reach you</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldShell label="Company" htmlFor={ids("company")} required error={errors.company}>
            <TextInput id={ids("company")} value={form.company} onChange={set("company")} autoComplete="organization" error={Boolean(errors.company)} />
          </FieldShell>
          <FieldShell label="Your name" htmlFor={ids("contactName")} required error={errors.contactName}>
            <TextInput id={ids("contactName")} value={form.contactName} onChange={set("contactName")} autoComplete="name" error={Boolean(errors.contactName)} />
          </FieldShell>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldShell label="Work email" htmlFor={ids("email")} required error={errors.email}>
            <TextInput id={ids("email")} type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@company.com" error={Boolean(errors.email)} />
          </FieldShell>
          <FieldShell label="Phone" htmlFor={ids("phone")} error={errors.phone}>
            <TextInput id={ids("phone")} type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="+1 555 000 0000" error={Boolean(errors.phone)} />
          </FieldShell>
        </div>
      </fieldset>

      <PrivacyNote>
        We review your request, confirm specifications and availability with the asset owner,
        and reply by email with an offer or next steps. Your contact details stay private and
        are used only for this request.
      </PrivacyNote>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton pending={pending} label="Send request" />
        <p className="text-xs text-muted-foreground sm:ml-1">
          No account needed. You&apos;ll get a reference number to track this request.
        </p>
      </div>
    </form>
  );
}
